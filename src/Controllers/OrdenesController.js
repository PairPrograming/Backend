const {
  Orden,
  MetodoDePago,
  Pago,
  DetalleDeOrden,
  Entrada,
  Eventos,
  Salones,
  Punto_de_venta,
  Users,
  conn,
} = require("../DbIndex");
const { Op } = require("sequelize");

const crearOrdenConDetalles = async (data) => {
  const {
    estado,
    detalles,
    userId,
    dni_cliente,
    nombre_cliente,
    email_cliente,
    telefono_cliente,
  } = data;
  if (!detalles || detalles.length === 0) {
    return { success: false, message: "Debe incluir al menos un detalle" };
  }

  if (!userId && (!nombre_cliente || !email_cliente || !dni_cliente)) {
    return {
      success: false,
      message:
        "Se requiere un usuario registrado o datos de contacto (nombre y correo).",
    };
  }

  const t = await conn.transaction();

  try {
    const orden = await Orden.create(
      {
        estado,
        total: 0,
        userId: userId || null,
        dni_cliente: dni_cliente || null,
        nombre_cliente: nombre_cliente || null,
        email_cliente: email_cliente || null,
        telefono_cliente: telefono_cliente || null,
      },
      { transaction: t }
    );

    let totalOrden = 0;
    for (const detalle of detalles) {
      const totalDetalle = detalle.cantidad * detalle.precio_unitario;
      totalOrden += totalDetalle;

      await DetalleDeOrden.findOrCreate({
        where: {
          ordenId: orden.id,
          entradaId: detalle.entradaId,
        },
        defaults: {
          cantidad: detalle.cantidad,
          precio_unitario: detalle.precio_unitario,
          total: totalDetalle,
          ordenId: orden.id,
          entradaId: detalle.entradaId,
        },
        transaction: t,
      });
    }

    orden.total = totalOrden;
    await orden.save({ transaction: t });

    await t.commit();
    return { success: true, data: orden };
  } catch (error) {
    await t.rollback();
    return { success: false, message: error.message };
  }
};

const getOrdenesController = async (id) => {
  if (!id) {
    return { success: false, message: "Falta id" };
  }
  try {
    const detalles = await DetalleDeOrden.findAll({
      where: { ordenId: id }, // Filtramos por la orden específica
      include: [
        {
          model: Entrada,
          include: [
            {
              model: Eventos,
              attributes: ["nombre", "salonId"],
            },
          ],
        },
        {
          model: Orden,
          include: [
            {
              model: Users,
              attributes: ["nombre", "email"], // Ajusta según los campos que quieras
            },
          ],
        },
      ],
    });

    if (!detalles.length) {
      return null;
    }

    const orden = detalles[0].Orden;
    const detallesCompactados = detalles.map((detalle) => ({
      id: detalle.id,
      cantidad: detalle.cantidad,
      precio_unitario: detalle.precio_unitario,
      total: detalle.total,
      entrada: {
        id: detalle.Entrada.id,
        tipo_entrada: detalle.Entrada.tipo_entrada,
        precio: detalle.Entrada.precio,
        cantidad: detalle.Entrada.cantidad,
        estatus: detalle.Entrada.estatus,
        evento: {
          nombre: detalle.Entrada.Evento.nombre,
          salonId: detalle.Entrada.Evento.salonId,
        },
      },
    }));
    const salonId = detallesCompactados[0].entrada.evento.salonId;
    const salon = await Salones.findByPk(salonId, {
      include: {
        model: Punto_de_venta,
        through: { attributes: [] },
        attributes: ["id", "razon", "direccion", "telefono", "cuit"], // ajusta según tus columnas
      },
    });
    const ordenCompactada = {
      id: orden.id,
      nombre_cliente: orden.nombre_cliente,
      email_cliente: orden.email_cliente,
      telefono_cliente: orden.telefono_cliente,
      dni_cliente: orden.dni_cliente,
      total: orden.total,
      estado: orden.estado,
      fecha_creacion: orden.fecha_creacion,
      user: orden.User
        ? { nombre: orden.User.nombre, email: orden.User.email }
        : null,
      detalles: detallesCompactados,
      salon,
    };
    return { success: true, data: ordenCompactada };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

const getGridOrdenesController = async (filtros = {}) => {
  try {
    const {
      estado,
      fechaDesde,
      fechaHasta,
      userId,
      evento,
      salon,
      metodoDePago,
      limit = 50,
      offset = 0,
      orderBy = "fecha_creacion",
      orderDirection = "DESC",
    } = filtros;

    const condiciones = {};

    if (estado) {
      condiciones.estado = {
        [Op.like]: `%${estado}%`,
      };
    }

    if (userId) {
      condiciones.userId = userId;
    }

    if (fechaDesde || fechaHasta) {
      condiciones.fecha_creacion = {};

      if (fechaDesde) {
        condiciones.fecha_creacion[Op.gte] = new Date(fechaDesde);
      }

      if (fechaHasta) {
        const fechaFin = new Date(fechaHasta);
        fechaFin.setHours(23, 59, 59, 999);
        condiciones.fecha_creacion[Op.lte] = fechaFin;
      }
    }

    const includeArray = [
      {
        model: Users,
        attributes: ["nombre", "email"],
      },
      {
        model: DetalleDeOrden,
        include: [
          {
            model: Entrada,
            include: [
              {
                model: Eventos,
                attributes: ["nombre", "salonNombre"],
                where: {
                  ...(evento && {
                    nombre: {
                      [Op.iLike]: `%${evento}%`
                    }
                  }),
                  ...(salon && {
                    salonNombre: {
                      [Op.iLike]: `%${salon}%`
                    }
                  })
                },
                required: !!(evento || salon)
              },
            ],
            required: !!(evento || salon)
          },
        ],
        required: !!(evento || salon)
      },
      {
        model: Pago,
        include: [
          {
            model: MetodoDePago,
            where: metodoDePago ? {
              [Op.or]: [
                { id: metodoDePago },
                { 
                  nombre: {
                    [Op.iLike]: `%${metodoDePago}%`
                  }
                }
              ]
            } : undefined
          },
        ],
        required: !!metodoDePago
      },
    ];

    const allowedFields = [
      "id",
      "fecha_creacion",
      "estado",
      "total",
      "nombre_cliente",
      "email_cliente",
      "fecha_pago",
      "createdAt",
      "updatedAt",
    ];
    const allowedDirections = ["ASC", "DESC"];

    const sortField = allowedFields.includes(orderBy)
      ? orderBy
      : "fecha_creacion";
    const sortDirection = allowedDirections.includes(
      orderDirection?.toUpperCase()
    )
      ? orderDirection.toUpperCase()
      : "DESC";

    const safeLimit =
      Number.isInteger(parseInt(limit)) && parseInt(limit) > 0
        ? parseInt(limit)
        : 50;
    const safeOffset =
      Number.isInteger(parseInt(offset)) && parseInt(offset) >= 0
        ? parseInt(offset)
        : 0;

    const { count, rows } = await Orden.findAndCountAll({
      where: condiciones,
      include: includeArray,
      order: [[sortField, sortDirection]],
      limit: safeLimit,
      offset: safeOffset,
      subQuery: false,
      distinct: true,
    });

    return {
      success: true,
      data: {
        ordenes: rows,
        pagination: {
          total: count,
          limit: safeLimit,
          offset: safeOffset,
          pages: Math.ceil(count / safeLimit),
          currentPage: Math.floor(safeOffset / safeLimit) + 1,
          hasMore: safeOffset + safeLimit < count,
        },
      },
    };
  } catch (error) {
    console.error("Error en getGridOrdenesController:", error);
    return { success: false, message: "Error al obtener las órdenes" };
  }
};

const deleteOrderController = async (ordenId) => {
  try {
    if (!ordenId) {
      return {
        success: false,
        message:
          "Se requiere una orden registrada o una id valida para poder eliminarla.",
      };
    }
    const ordenExistente = await Orden.findByPk(ordenId);
    if (!ordenExistente) {
      return {
        success: false,
        message: "La orden no existe o ya fue eliminada.",
      };
    }
    if (ordenExistente.estado === "pagado") {
      return {
        success: false,
        message: "No se pueden eliminar órdenes que ya han sido pagadas.",
      };
    }
    const count = await Orden.destroy({ where: { id: ordenId } });
    if (count === 0) {
      return {
        success: false,
        message: "No se pudo eliminar la orden.",
      };
    }
    return {
      success: true,
      message: "La orden se elimino correctamente",
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: "Error interno del servidor al eliminar la orden.",
    };
  }
};
module.exports = {
  crearOrdenConDetalles,
  getOrdenesController,
  getGridOrdenesController,
  deleteOrderController,
};
