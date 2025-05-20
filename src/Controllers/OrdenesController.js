const { Orden, DetalleDeOrden, conn } = require('../DbIndex');
const { use } = require('../routes');

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

      await DetalleDeOrden.create(
        {
          cantidad: detalle.cantidad,
          precio_unitario: detalle.precio_unitario,
          total: totalDetalle,
          ordenId: orden.id,
          entradaId: detalle.entradaId,
        },
        { transaction: t }
      );
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

module.exports = {
  crearOrdenConDetalles
}