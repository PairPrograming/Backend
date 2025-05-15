const { Orden, DetalleDeOrden, conn } = require('../DbIndex');

const  crearOrdenConDetalles = async(data) => {
  const { estado, detalles } = data;

  if (!detalles || detalles.length === 0) {
    return { success: false, message: 'Debe incluir al menos un detalle' };
  }
  const t = await conn.transaction();

  try {
    const orden = await Orden.create(
      { estado, total: 0 },
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
          entradaId: detalle.entradaId, // si lo tienes
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
}
module.exports = {
    crearOrdenConDetalles
}