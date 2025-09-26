const { Pago, Orden, DetalleDeOrden, Entrada, MetodoDePago, SubtipoEntrada, NotaDebito, Eventos, conn } = require("../DbIndex");
const { Op } = require('sequelize');

const crearNotaDebitoController = async (data) => {
    const t = await conn.transaction();
    try {
        if (!data) throw new Error(`Error: Falta información`);

        const { pagoId, ordenId, metodoDeCobroId, cuotas, cambios } = data;
        if (!pagoId) throw new Error(`El campo pagoId es requerido`);
        if (!ordenId) throw new Error(`El campo ordenId es requerido`);
        if (!metodoDeCobroId) throw new Error(`El campo metodoDeCobroId es requerido`);
        if (!cambios || !Array.isArray(cambios) || cambios.length === 0) {
            throw new Error(`El campo cambios es requerido y debe ser un array no vacío`);
        }

        const pago = await Pago.findByPk(pagoId, { transaction: t });
        if (!pago) throw new Error('Pago no encontrado');

        const orden = await Orden.findByPk(ordenId, {
            include: {
                model: DetalleDeOrden,
                include: [SubtipoEntrada]
            },
            transaction: t
        });

        if (!orden) throw new Error('Orden no encontrada');

        if (pago.estatus !== "completado" || orden.estado !== "pagado") {
            throw new Error(`Error: los estados deben ser 'pagado' en orden y 'completado' en pagos`);
        }
        const notaExistente = await NotaDebito.findOne({
            include: {
                model: Pago,
                where: {
                    id: pagoId,
                    ordenId: ordenId
                }
            },
            where: {
                status: true
            },
            transaction: t
        });

        if (notaExistente) {
            throw new Error(`Ya existe una nota de débito para la orden ${ordenId} y pago ${pagoId}`);
        }
        let detalleNota = [];
        let totalAgregar = 0;
        let totalQuitar = 0;

        for (const cambio of cambios) {
            const { entradaId, quitar, agregar } = cambio;

            if (!entradaId) {
                throw new Error('El campo entradaId es requerido en cada cambio');
            }

            const detalle = orden.DetalleDeOrdens.find(d => d.entradaId === entradaId);
            if (!detalle) {
                throw new Error(`No se encontró detalle de orden para entradaId: ${entradaId}`);
            }

            const subtipos = detalle.SubtipoEntrada
                ? (Array.isArray(detalle.SubtipoEntrada) ? detalle.SubtipoEntrada : [detalle.SubtipoEntrada])
                : [];

            if (quitar && Array.isArray(quitar) && quitar.length > 0) {
                for (const q of quitar) {
                    const { subtipoId, cantidad, precio_unitario } = q;

                    if (!subtipoId || !cantidad || cantidad <= 0 || !precio_unitario) {
                        throw new Error('Los campos subtipoId, cantidad y precio_unitario son requeridos para quitar');
                    }
                    const detalleComprado = orden.DetalleDeOrdens.find(d =>
                        d.entradaId === entradaId && d.subtipoEntradaId === subtipoId
                    );

                    if (!detalleComprado) {
                        throw new Error(`El subtipo ${subtipoId} no fue comprado en esta orden para la entrada ${entradaId}`);
                    }

                    if (cantidad > detalleComprado.cantidad) {
                        throw new Error(`No se puede quitar ${cantidad} unidades del subtipo ${subtipoId}. Solo se compraron ${detalleComprado.cantidad} unidades en esta orden`);
                    }

                    const subtipoEnBD = await SubtipoEntrada.findByPk(subtipoId, { transaction: t });
                    if (!subtipoEnBD) {
                        throw new Error(`Subtipo ${subtipoId} no encontrado en la base de datos`);
                    }

                    await SubtipoEntrada.increment(
                        {
                            cantidad_disponible: cantidad,
                            cantidad_vendida: -cantidad
                        },
                        { where: { id: subtipoId }, transaction: t }
                    );

                    const nombreSubtipo = subtipoEnBD.nombre || `ID ${subtipoId}`;
                    detalleNota.push(
                        `Se quitaron ${cantidad} unidades del subtipo ${nombreSubtipo} (valor unitario: $${precio_unitario})`
                    );

                    totalQuitar += precio_unitario * cantidad;
                }
            }
            if (agregar && Array.isArray(agregar) && agregar.length > 0) {
                for (const a of agregar) {
                    const { subtipoId, cantidad, precio_unitario } = a;

                    if (!subtipoId || !cantidad || cantidad <= 0 || !precio_unitario) {
                        throw new Error('Los campos subtipoId, cantidad y precio_unitario son requeridos para agregar');
                    }

                    const subtipoEnBD = await SubtipoEntrada.findByPk(subtipoId, { transaction: t });
                    if (!subtipoEnBD) {
                        throw new Error(`Subtipo ${subtipoId} no encontrado en la base de datos`);
                    }

                    if (subtipoEnBD.cantidad_disponible < cantidad) {
                        throw new Error(`Cantidad a agregar (${cantidad}) es mayor a la cantidad disponible (${subtipoEnBD.cantidad_disponible}) en subtipo ${subtipoId}`);
                    }

                    await SubtipoEntrada.increment(
                        {
                            cantidad_disponible: -cantidad,
                            cantidad_vendida: cantidad
                        },
                        { where: { id: subtipoId }, transaction: t }
                    );

                    detalleNota.push(
                        `Se agregaron ${cantidad} unidades al subtipo ${subtipoEnBD.nombre} (valor unitario: $${precio_unitario})`
                    );

                    totalAgregar += precio_unitario * cantidad;
                }
            }
        }
        if (detalleNota.length === 0) {
            throw new Error('No se procesaron cambios válidos');
        }

        if (totalAgregar < totalQuitar) {
            throw new Error(
                `No se puede generar la nota de débito: el valor a agregar ($${totalAgregar}) es menor que el valor a quitar ($${totalQuitar})`
            );
        }

        const diferencia = totalAgregar - totalQuitar;

        const metodo = await MetodoDePago.findByPk(metodoDeCobroId, { transaction: t });
        if (!metodo) throw new Error('Método de cobro no encontrado');

        const impuestoPercent = metodo.impuesto ? parseFloat(metodo.impuesto[cuotas] || 0) : 0;
        const valorImpuesto = (diferencia * impuestoPercent) / 100;
        const comisionPercent = parseFloat(metodo.comision || 0);
        const comision = (diferencia * comisionPercent) / 100;

        const nota = await NotaDebito.create({
            pagoId,
            cuotas,
            metodoDeCobroId,
            numeroNota: Math.floor(Math.random() * 1000000),
            tipoNota: 'CAMBIO',
            concepto: 'Ajuste de subtipo de entrada',
            ValorNeto: diferencia,
            valorImpuesto,
            comision,
            valorTotal: diferencia + valorImpuesto + comision,
            detalle: detalleNota.join('; '),
            status: true
        }, { transaction: t });

        await t.commit();

        return {
            success: true,
            data: {
                ...nota.toJSON(),
                resumen: {
                    totalAgregar,
                    totalQuitar,
                    diferencia,
                    valorImpuesto,
                    comision,
                    valorTotal: diferencia + valorImpuesto + comision
                }
            }
        };

    } catch (error) {
        await t.rollback();
        console.error('Error en crearNotaDebitoController:', error);
        return {
            success: false,
            message: error.message,
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        };
    }
};

const obtenerNotaDebitoIdController = async (notaId) => {
    try {
        if (!notaId) {
            if (!notaId) throw new Error(`Id de la nota de debito faltante`);
        }
        const result = await NotaDebito.findByPk(notaId, {
            include: [{ model: MetodoDePago }]
        })
        return { success: true, data: result }
    } catch (error) {
        return { success: false, message: error.message };
    }
}
module.exports = {
    crearNotaDebitoController,
    obtenerNotaDebitoIdController
}