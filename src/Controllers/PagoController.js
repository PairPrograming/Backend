const { Pago, MetodoDePago, Orden, conn } = require("../DbIndex");

const crearPago = async (data) => {
  const { ordenId, metodoDeCobroId, estatus, referencia, descripcion } = data;
  const t = await conn.transaction();

  try {
    const metodoDePago = await MetodoDePago.findByPk(metodoDeCobroId);
    if (!metodoDePago) {
      return { success: false, message: "Método de cobro no encontrado" };
    }
    const { comision, impuesto } = metodoDePago;

    const orden = await Orden.findByPk(ordenId);
    if (!orden) {
      return { success: false, message: "Orden no encontrada" };
    }
    const montoBase = parseFloat(orden.total);
    const comisionPorcentaje = parseFloat(comision);
    const impuestoPorcentaje = parseFloat(impuesto);
    const comisionMonto = montoBase * (comisionPorcentaje / 100);
    const impuestoMonto =
      (montoBase + comisionMonto) * (impuestoPorcentaje / 100);
    const total = montoBase + comisionMonto + impuestoMonto;
    const [pago, creado] = await Pago.findOrCreate({
        where: { ordenId },
        defaults: {
          monto: montoBase,
          comision: comisionMonto,
          impuestos: impuestoMonto,
          total,
          estatus,
          fecha_pago: new Date(),
          referencia,
          descripcion,
          ordenId,
          metodoDeCobroId,
        },
        transaction: t,
      });
      orden.estado = "pagado";
      orden.fecha_pago = new Date();
      await orden.save({ transaction: t });
      await t.commit();
      if (!creado) {
        return {
          success: false,
          message: "El pago ya ha sido registrado previamente para esta orden.",
        };
      }
      return { success: true, pago };
  } catch (error) {
    await t.rollback();
    return { success: false, message: error.message };
  }
};

module.exports = { crearPago };
