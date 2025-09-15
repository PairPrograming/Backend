const { Pago, MetodoDePago, Orden, DetalleDeOrden, Entrada,SubtipoEntrada, conn } = require("../DbIndex");
const { Op } = require('sequelize');
const crearPagoController = async (data) => {
  const {
    ordenId,
    metodoDeCobroId,
    estatus,
    referencia,
    descripcion,
    montoRecibido,
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
    // Buscar método de pago
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
       if (impuestoPorcentaje === 0 || isNaN(impuestoPorcentaje)) {
    impuestoPorcentaje = Number.parseFloat(metodoDePago.impuesto) || 0;
  }
    }

    const orden = await Orden.findByPk(ordenId, {
      include: [
        {
          model: DetalleDeOrden,
          required: true,
          include: [
            { model: Entrada, required: false },
            { 
              model: SubtipoEntrada, 
              required: false,
              include: [{ model: Entrada, as: 'entrada', required: false }]
            }
          ]
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

    // VALIDACIÓN DE STOCK - CORREGIDA
    const erroresStock = [];

    for (const detalle of orden.DetalleDeOrdens) {
      // Caso 1: Subtipo de entrada
      if (detalle.subtipoEntradaId && detalle.SubtipoEntrada) {
        const subtipo = detalle.SubtipoEntrada;

        if (subtipo.estatus !== "activo") {
          erroresStock.push(`El subtipo ${subtipo.nombre} no está disponible para venta`);
          continue;
        }

        if (detalle.cantidad <= 0) {
          erroresStock.push(`La cantidad debe ser mayor a cero para ${subtipo.nombre}`);
          continue;
        }

        if (subtipo.cantidad_disponible < detalle.cantidad) {
          erroresStock.push(
            `Stock insuficiente para ${subtipo.nombre}. Disponible: ${subtipo.cantidad_disponible}, Solicitado: ${detalle.cantidad}`
          );
        }
      }
      // Caso 2: Entrada directa (sin subtipos) - CORREGIDO
      else if (detalle.entradaId && detalle.Entrada) {
        const entrada = detalle.Entrada;

        if (entrada.estatus !== "disponible") {
          erroresStock.push(`La entrada ${entrada.tipo_entrada} no está disponible para venta`);
          continue;
        }

        if (detalle.cantidad <= 0) {
          erroresStock.push(`La cantidad debe ser mayor a cero para ${entrada.tipo_entrada}`);
          continue;
        }

        // CORREGIDO: Usar cantidad_real en lugar de cantidad
        if (entrada.cantidad_real < detalle.cantidad) {
          erroresStock.push(
            `Stock insuficiente para ${entrada.tipo_entrada}. Disponible: ${entrada.cantidad_real}, Solicitado: ${detalle.cantidad}`
          );
        }
      }
      else {
        erroresStock.push(`Detalle de orden inválido: debe tener entradaId o subtipoEntradaId`);
      }
    }

    if (erroresStock.length > 0) {
      await t.rollback();
      return {
        success: false,
        message: `Errores de stock: ${erroresStock.join("; ")}`,
      };
    }

    // Cálculo de montos
    let montoBase, comisionMonto, impuestoMonto, total;
    const imagenUrl = imagen;

    if (baseAmount !== undefined && taxAmount !== undefined) {
      montoBase = Number.parseFloat(baseAmount);
      impuestoMonto = Number.parseFloat(taxAmount);
      comisionMonto = Math.round(montoBase * (Number.parseFloat(comision) / 100) * 100) / 100;
      total = Math.round((montoBase + comisionMonto + impuestoMonto) * 100) / 100;
    } else {
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

    // Crear pago
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
        cuotas: installments || 1,
        imagen: imagenUrl || null,
        error_message: error_message || null,
        fecha_cancelacion: fecha_cancelacion || null,
        motivo_cancelacion: motivo_cancelacion || null,
      },
      { transaction: t }
    );

    // ACTUALIZACIÓN DE STOCK - CORREGIDA
    for (const detalle of orden.DetalleDeOrdens) {
      // Caso 1: Subtipo de entrada
      if (detalle.subtipoEntradaId) {
        const subtipo = detalle.SubtipoEntrada || await SubtipoEntrada.findByPk(detalle.subtipoEntradaId, {
          include: [{ model: Entrada, as: 'entrada' }],
          transaction: t
        });
        
        if (subtipo) {
          // Actualizar subtipo
          subtipo.cantidad_disponible -= detalle.cantidad;
          subtipo.cantidad_vendida += detalle.cantidad;
          
          if (subtipo.cantidad_disponible <= 0) {
            subtipo.estatus = "agotado";
            subtipo.cantidad_disponible = 0; // Evitar negativos
          }
          
          await subtipo.save({ transaction: t });

          // Actualizar entrada padre si existe - CORREGIDO
          if (subtipo.entrada) {
            // CORREGIDO: Usar cantidad_real en lugar de cantidad
            subtipo.entrada.cantidad_real -= detalle.cantidad;
            
            if (subtipo.entrada.cantidad_real <= 0) {
              subtipo.entrada.estatus = "agotado";
              subtipo.entrada.cantidad_real = 0; // Evitar negativos
            }
            
            await subtipo.entrada.save({ transaction: t });
          }
        }
      } 
      // Caso 2: Entrada directa (sin subtipos) - CORREGIDO
      else if (detalle.entradaId) {
        const entrada = detalle.Entrada || await Entrada.findByPk(detalle.entradaId, { transaction: t });
        
        if (entrada) {
          // CORREGIDO: Usar cantidad_real en lugar de cantidad
          entrada.cantidad_real -= detalle.cantidad;
          
          if (entrada.cantidad_real <= 0) {
            entrada.estatus = "agotado";
            entrada.cantidad_real = 0; // Evitar negativos
          }
          
          await entrada.save({ transaction: t });
        }
      }
    }

    // Actualizar orden
    if (estatus === "completado" || estatus === "pagado") {
      await orden.update(
        {
          estado: "pagado",
          fecha_actualizacion: new Date(),
        },
        { transaction: t }
      );
    }

    await t.commit();

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
          include: [
            {
              model: DetalleDeOrden,
              include: [
                { model: Entrada, required: false },
                { 
                  model: SubtipoEntrada, 
                  required: false,
                  include: [{ model: Entrada, as: 'entrada', required: false }]
                }
              ]
            }
          ]
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

    // RESTAURAR STOCK - CORREGIDO
    for (const detalle of pago.Orden.DetalleDeOrdens) {
      // Caso 1: Subtipo de entrada
      if (detalle.subtipoEntradaId) {
        const subtipo = detalle.SubtipoEntrada || await SubtipoEntrada.findByPk(detalle.subtipoEntradaId, {
          include: [{ model: Entrada, as: 'entrada' }],
          transaction: t
        });
        
        if (subtipo) {
          // Restaurar stock del subtipo
          subtipo.cantidad_disponible += detalle.cantidad;
          subtipo.cantidad_vendida -= detalle.cantidad;
          
          // Prevenir que cantidad_vendida sea negativa
          if (subtipo.cantidad_vendida < 0) {
            subtipo.cantidad_vendida = 0;
          }
          
          // Cambiar estatus si ya no está agotado
          if (subtipo.estatus === 'agotado' && subtipo.cantidad_disponible > 0) {
            subtipo.estatus = 'activo';
          }
          
          await subtipo.save({ transaction: t });

          // Restaurar entrada padre si existe - CORREGIDO
          if (subtipo.entrada) {
            // CORREGIDO: Usar cantidad_real en lugar de cantidad
            subtipo.entrada.cantidad_real += detalle.cantidad;
            
            // CORREGIDO: Validar contra cantidad_real
            if (subtipo.entrada.estatus === 'agotado' && subtipo.entrada.cantidad_real > 0) {
              subtipo.entrada.estatus = 'disponible';
            }
            
            await subtipo.entrada.save({ transaction: t });
          }
        }
      }
      // Caso 2: Entrada directa (sin subtipos) - CORREGIDO
      else if (detalle.entradaId) {
        const entrada = detalle.Entrada || await Entrada.findByPk(detalle.entradaId, { transaction: t });
        
        if (entrada) {
          // CORREGIDO: Usar cantidad_real en lugar de cantidad
          entrada.cantidad_real += detalle.cantidad;
          
          // CORREGIDO: Validar contra cantidad_real
          if (entrada.estatus === 'agotado' && entrada.cantidad_real > 0) {
            entrada.estatus = 'disponible';
          }
          
          await entrada.save({ transaction: t });
        }
      }
    }

    // Actualizar pago y orden
    pago.estatus = 'cancelado';
    pago.fecha_cancelacion = new Date();
    pago.motivo_cancelacion = motivo;
    await pago.save({ transaction: t });

    // Cambiar estado de la orden a 'pendiente' en lugar de 'cancelado'
    // para permitir que se pueda intentar pagar nuevamente
    pago.Orden.estado = 'pendiente';
    pago.Orden.fecha_actualizacion = new Date();
    await pago.Orden.save({ transaction: t });

    await t.commit();
    
    return { 
      success: true, 
      message: "Pago cancelado exitosamente. El stock ha sido restaurado.",
      data: {
        pagoId: pago.id,
        ordenId: pago.Orden.id,
        stockRestaurado: true
      }
    };

  } catch (error) {
    if (!t.finished) {
      await t.rollback();
    }
    return { 
      success: false, 
      message: `Error al cancelar pago: ${error.message}` 
    };
  }
};

const getGridPagosController = async (filtros = {}) => {
  try {
    const { 
      estado, 
      fechaDesde, 
      fechaHasta, 
      evento,
      cuotas,
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
    if (cuotas) {
      if (cuotas === '1' || cuotas === 1) {
        condiciones.cuotas = {
          [Op.or]: [
            { [Op.is]: null },
            { [Op.eq]: 1 }
          ]
        };
      } else {
        condiciones.cuotas = parseInt(cuotas);
      }
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
