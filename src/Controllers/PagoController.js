const { Pago, MetodoDePago, Orden, DetalleDeOrden, Entrada, conn } = require("../DbIndex");
const { Op } = require('sequelize');
const crearPagoController = async (data) => {
  console.log("[v1] crearPagoController received data:", JSON.stringify(data, null, 2));

  const {
    ordenId,
    metodoDeCobroId, // Puede ser null
    estatus,
    referencia,
    descripcion,
    montoRecibido,
    // Nuevos campos del modelo
    imagen,
    error_message,
    fecha_cancelacion,
    motivo_cancelacion,
    taxPercentage,
    taxAmount,
    baseAmount,
    installments,
  } = data;

  if (!ordenId) {
    return { success: false, message: "El ID de la orden es requerido" };
  }

  if (!estatus) {
    return { success: false, message: "El estatus del pago es requerido" };
  }

  const t = await conn.transaction();

  try {
    let metodoDePago = null;
    let comision = 0;
    let impuestoPorcentaje = Number.parseFloat(taxPercentage) || 0;

    // Buscar método de pago solo si se pasa ID
    if (metodoDeCobroId) {
      metodoDePago = await MetodoDePago.findByPk(metodoDeCobroId);
      if (!metodoDePago) {
        await t.rollback();
        return { success: false, message: "Método de cobro no encontrado" };
      }

      if (metodoDePago.activo === false) {
        await t.rollback();
        return { success: false, message: "El método de cobro no está disponible" };
      }

      comision = metodoDePago.comision || 0;
      if (impuestoPorcentaje === 0) {
        impuestoPorcentaje = metodoDePago.impuesto || 0;
      }
    }

    const orden = await Orden.findByPk(ordenId, {
      include: [
        {
          model: DetalleDeOrden,
          required: true,
        },
      ],
      transaction: t,
    });

    if (!orden) {
      await t.rollback();
      return { success: false, message: "Orden no encontrada" };
    }

    if (orden.estado === "pagado") {
      await t.rollback();
      return { success: false, message: "La orden ya ha sido pagada" };
    }

    if (orden.estado === "cancelado") {
      await t.rollback();
      return { success: false, message: "No se puede pagar una orden cancelada" };
    }

    if (!orden.DetalleDeOrdens || orden.DetalleDeOrdens.length === 0) {
      await t.rollback();
      return { success: false, message: "La orden no tiene detalles de compra" };
    }

    const pagoExistente = await Pago.findOne({
      where: { ordenId },
      transaction: t,
    });

    if (pagoExistente) {
      await t.rollback();
      return {
        success: false,
        message: "El pago ya ha sido registrado previamente para esta orden.",
      };
    }

    // Verificar referencia duplicada
    if (referencia && metodoDeCobroId) {
      const referenciaExistente = await Pago.findOne({
        where: { referencia, metodoDeCobroId },
        transaction: t,
      });

      if (referenciaExistente) {
        await t.rollback();
        return {
          success: false,
          message: "La referencia ya existe para este método de pago",
        };
      }
    }

    // -------------------------
    // 🔎 VALIDACIÓN DE STOCK
    // -------------------------
    const entradasIds = orden.DetalleDeOrdens.map((d) => d.entradaId);
    const entradas = await Entrada.findAll({
      where: { id: entradasIds },
      transaction: t,
    });

    if (entradas.length !== entradasIds.length) {
      await t.rollback();
      return { success: false, message: "Algunas entradas de la orden no fueron encontradas" };
    }

    const entradasMap = new Map(entradas.map((e) => [e.id, e]));
    const erroresStock = [];

    for (const detalle of orden.DetalleDeOrdens) {
      const entrada = entradasMap.get(detalle.entradaId);

      if (!entrada) {
        erroresStock.push(`Entrada con ID ${detalle.entradaId} no encontrada`);
        continue;
      }

      if (entrada.estatus !== "disponible") {
        erroresStock.push(`La entrada ${entrada.tipo_entrada} no está disponible para venta`);
        continue;
      }

      if (detalle.cantidad <= 0) {
        erroresStock.push(`La cantidad debe ser mayor a cero para ${entrada.tipo_entrada}`);
        continue;
      }

      if (entrada.cantidad < detalle.cantidad) {
        erroresStock.push(
          `Stock insuficiente para ${entrada.tipo_entrada}. Disponible: ${entrada.cantidad}, Solicitado: ${detalle.cantidad}`
        );
      }
    }

    if (erroresStock.length > 0) {
      await t.rollback();
      return {
        success: false,
        message: `Errores de stock: ${erroresStock.join("; ")}`,
      };
    }

    // -------------------------
    // 📊 CÁLCULO MONTOS (nuevo modelo)
    // -------------------------
    let montoBase, comisionMonto, impuestoMonto, total;
    const imagenUrl = imagen;

    if (baseAmount !== undefined && taxAmount !== undefined) {
      console.log("[v1] Using frontend calculations - baseAmount:", baseAmount, "taxAmount:", taxAmount);
      montoBase = Number.parseFloat(baseAmount);
      impuestoMonto = Number.parseFloat(taxAmount);
      comisionMonto = Math.round(montoBase * (Number.parseFloat(comision) / 100) * 100) / 100;
      total = Math.round((montoBase + comisionMonto + impuestoMonto) * 100) / 100;
    } else {
      console.log(
        "[v1] Using traditional calculation - orden.total:",
        orden.total,
        "impuestoPorcentaje:",
        impuestoPorcentaje
      );
      montoBase = Number.parseFloat(orden.total);
      const comisionPorcentaje = Number.parseFloat(comision) || 0;
      comisionMonto = Math.round(montoBase * (comisionPorcentaje / 100) * 100) / 100;
      impuestoMonto = Math.round((montoBase + comisionMonto) * (impuestoPorcentaje / 100) * 100) / 100;
      total = Math.round((montoBase + comisionMonto + impuestoMonto) * 100) / 100;
    }

    if (montoBase <= 0) {
      await t.rollback();
      return { success: false, message: "El monto de la orden debe ser mayor a cero" };
    }

    if (montoRecibido !== undefined && montoRecibido !== null) {
      const montoRecibidoNum = Number.parseFloat(montoRecibido);
      if (isNaN(montoRecibidoNum)) {
        await t.rollback();
        return { success: false, message: "El monto recibido debe ser un número válido" };
      }
    }

    // -------------------------
    // 💾 CREAR PAGO
    // -------------------------
    const pago = await Pago.create(
      {
        monto: montoBase,
        comision: comisionMonto,
        impuestos: impuestoMonto,
        total,
        estatus,
        fecha_pago: new Date(),
        referencia: referencia || null,
        descripcion: descripcion || null,
        ordenId,
        metodoDeCobroId,
        imagen: imagenUrl || null,
        error_message: error_message || null,
        fecha_cancelacion: fecha_cancelacion || null,
        motivo_cancelacion: motivo_cancelacion || null,
      },
      { transaction: t }
    );

    // -------------------------
    // 📦 ACTUALIZAR STOCK
    // -------------------------
    for (const detalle of orden.DetalleDeOrdens) {
      const entrada = entradasMap.get(detalle.entradaId);
      entrada.cantidad -= detalle.cantidad;

      if (entrada.cantidad === 0) {
        entrada.estatus = "agotado";
      }

      await entrada.save({ transaction: t });
    }

    // -------------------------
    // 🏷️ ACTUALIZAR ORDEN
    // -------------------------
    if (estatus === "completado" || estatus === "pagado") {
      await orden.update(
        {
          estado: "pagado",
          fecha_actualizacion: new Date(),
        },
        { transaction: t }
      );
      console.log("[v1] Order status updated to 'pagado'");
    }

    await t.commit();

    console.log("[v1] Payment created successfully with stock validation + tax calculation");

    return {
      success: true,
      data: {
        pago,
        resumen: {
          montoBase,
          comision: comisionMonto,
          impuestos: impuestoMonto,
          total,
          metodoPago: metodoDePago?.tipo_de_cobro || "N/A",
          imagenGuardada: imagenUrl ? "Sí" : "No",
          impuestoPorcentaje: impuestoPorcentaje,
          cuotas: installments || 1,
          calculoUsado: baseAmount !== undefined && taxAmount !== undefined ? "Frontend (cuotas)" : "Tradicional",
        },
      },
    };
  } catch (error) {
    if (!t.finished) {
      await t.rollback();
    }

    console.error(`❌ Error al crear pago - Orden: ${ordenId}:`, error.message);

    return {
      success: false,
      message: `Error interno: ${error.message}`,
    };
  }
};


const cancelarPagoController = async (pagoId, motivo) => {
  const t = await conn.transaction();
  
  try {
    const pago = await Pago.findByPk(pagoId, {
      include: [
        {
          model: Orden,
          include: [{ model: DetalleDeOrden }]
        }
      ],
      transaction: t
    });

    if (!pago) {
      await t.rollback();
      return { success: false, message: "Pago no encontrado" };
    }

    if (pago.estatus === 'cancelado') {
      await t.rollback();
      return { success: false, message: "El pago ya está cancelado" };
    }

    for (const detalle of pago.Orden.DetalleDeOrdens) {
      const entrada = await Entrada.findByPk(detalle.entradaId, { transaction: t });
      if (entrada) {
        entrada.cantidad += detalle.cantidad;
        if (entrada.estatus === 'agotado' && entrada.cantidad > 0) {
          entrada.estatus = 'disponible';
        }
        await entrada.save({ transaction: t });
      }
    }

    pago.estatus = 'cancelado';
    pago.fecha_cancelacion = new Date();
    pago.motivo_cancelacion = motivo;
    await pago.save({ transaction: t });

    pago.Orden.estado = 'cancelado';
    await pago.Orden.save({ transaction: t });

    await t.commit();
    
    console.log(`🔄 Pago cancelado - ID: ${pagoId}, Motivo: ${motivo}`);
    
    return { success: true, message: "Pago cancelado exitosamente" };
  } catch (error) {
    if (!t.finished) {
      await t.rollback();
    }
    return { success: false, message: error.message };
  }
};

const getGridPagosController = async (filtros = {}) => {
  try {
    const { 
      estado, 
      fechaDesde, 
      fechaHasta, 
      evento,
      metodoDePago,
      limit = 50, 
      offset = 0,
      orderBy = 'id',
      orderDirection = 'DESC'
    } = filtros;

    const condiciones = {};
    
    if (estado) {
      condiciones.estatus = {
        [Op.like]: `%${estado}%`
      };
    }
    
    if (fechaDesde || fechaHasta) {
      condiciones.createdAt = {};
      
      if (fechaDesde) {
        condiciones.createdAt[Op.gte] = new Date(fechaDesde);
      }
      
      if (fechaHasta) {
        const fechaFin = new Date(fechaHasta);
        fechaFin.setHours(23, 59, 59, 999);
        condiciones.createdAt[Op.lte] = fechaFin;
      }
    }
    
    if (evento) {
      condiciones.eventoNombre = {
        [Op.like]: `%${evento}%`
      };
    }
        const includeArray = [];
    
        if (metodoDePago) {
          includeArray.push({
            model: MetodoDePago,
            where: {
              [Op.or]: [
                { id: metodoDePago },
                { 
                  nombre: {
                    [Op.iLike]: `%${metodoDePago}%`
                  }
                }
              ]
            },
            required: true 
          });
        } else {
          includeArray.push({
            model: MetodoDePago,
            required: false
          });
        }
    
    const allowedFields = ['id', 'monto', 'estatus', 'fechaCreacion', 'eventoNombre', "metodoDePago"];
    const allowedDirections = ['ASC', 'DESC'];
    
    const sortField = allowedFields.includes(orderBy) ? orderBy : 'id';
    const sortDirection = allowedDirections.includes(orderDirection?.toUpperCase()) ? 
      orderDirection.toUpperCase() : 'DESC';
    
    const safeLimit = Number.isInteger(parseInt(limit)) && parseInt(limit) > 0 ? 
      parseInt(limit) : 50;
    const safeOffset = Number.isInteger(parseInt(offset)) && parseInt(offset) >= 0 ? 
      parseInt(offset) : 0;
    
    const result = await Pago.findAll({
      where: condiciones,
      include: includeArray,
      order: [[sortField, sortDirection]],
      limit: safeLimit,
      offset: safeOffset
    });

    const total = await Pago.count({ 
      where: condiciones,
      include: includeArray,
      distinct: true
    });

    return { 
      success: true, 
      data: result,
      pagination: {
        total,
        limit: safeLimit,
        offset: safeOffset,
        pages: Math.ceil(total / safeLimit),
        currentPage: Math.floor(safeOffset / safeLimit) + 1
      }
    };

  } catch (error) {
    throw new Error('Error al obtener los pagos');
  }
};

const obtenerPagoController = async (pagoId) => {
  try {
    const pago = await Pago.findByPk(pagoId, {
      include: [
        {
          model: Orden,
          include: [
            {
              model: DetalleDeOrden,
              include: [{ model: Entrada }]
            }
          ]
        },
        { model: MetodoDePago }
      ]
    });

    if (!pago) {
      return { success: false, message: "Pago no encontrado" };
    }

    return { success: true, data: pago };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

module.exports = { 
  crearPagoController,
  obtenerPagoController,
  cancelarPagoController,
  getGridPagosController
};
