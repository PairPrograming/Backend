const { Orden, DetalleDeOrden, Entrada, Eventos, Salones, Punto_de_venta, Users, conn } = require('../DbIndex');

const crearOrdenConDetalles = async (data) => {
  const { estado, detalles, userId, dni_cliente,  nombre_cliente, email_cliente, telefono_cliente } = data;
  if (!detalles || detalles.length === 0) {
    return { success: false, message: 'Debe incluir al menos un detalle' };
  }

  if (!userId && (!nombre_cliente || !email_cliente || !dni_cliente)) {
    return {
      success: false,
      message: 'Se requiere un usuario registrado o datos de contacto (nombre y correo).'
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
        telefono_cliente: telefono_cliente || null
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
          entradaId: detalle.entradaId
        },
        defaults: {
          cantidad: detalle.cantidad,
          precio_unitario: detalle.precio_unitario,
          total: totalDetalle,
          ordenId: orden.id,
          entradaId: detalle.entradaId,
        },
        transaction: t 
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
              attributes: ['nombre', "salonId"],
            }
          ],
        },
        {
          model: Orden,
          include: [
            {
              model: Users,
              attributes: ['nombre', 'email'], // Ajusta según los campos que quieras
            }
          ],
        }
      ],
    });

    if (!detalles.length) {
      return null;
    }

    const orden = detalles[0].Orden;
    const detallesCompactados = detalles.map(detalle => ({
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
        }
      }
    }));
    const salonId = detallesCompactados[0].entrada.evento.salonId
    const salon = await Salones.findByPk(salonId, {
      include: {
        model: Punto_de_venta,
        through: { attributes: [] },
        attributes: ['id', 'razon', 'direccion', "telefono", "cuit"], // ajusta según tus columnas
      }
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
      user: orden.User ? { nombre: orden.User.nombre, email: orden.User.email } : null,
      detalles: detallesCompactados,
      salon
    };
    return { success: true, data: ordenCompactada };
  } catch (error) {
    return { success: false, message: error.message };
  }
};


module.exports = {
  crearOrdenConDetalles,
  getOrdenesController
}