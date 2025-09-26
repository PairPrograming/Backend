const { Orden, DetalleDeOrden, Eventos, Contrato, Entrada, SubtipoEntrada } = require("../DbIndex");
const {obtenerContratoController} = require('../Controllers/ContratoController');
const { Op } = require("sequelize");

const compareContratoController = async (data) => {
    try {
        if (!data) throw new Error('No pueden haber campos nulos');
        const { eventoId } = data;

        const evento = await Eventos.findByPk(eventoId, {
            include: [
                {
                    model: Entrada,
                    attributes: ["cantidad_total", "cantidad_real"],
                    include: [
                        {
                            model: SubtipoEntrada,
                            as: "subtipos",
                            attributes: ["nombre", "cantidad_disponible", "cantidad_vendida"]
                        }
                    ]
                }
            ]
        });

        if (!evento) {
            return { success: false, message: "Evento no encontrado" };
        }

        // Suponiendo que solo hay una entrada principal que queremos mostrar
        const entrada = evento.Entradas[0]; 

        const flatData = entrada.subtipos.map(subtipo => ({
            subtipoNombre: subtipo.nombre,
            cantidad_disponible: subtipo.cantidad_disponible,
            cantidad_vendida: subtipo.cantidad_vendida
        }));
        const contrato = await obtenerContratoController(eventoId);
        const { minimoCenas, minimoBrindis } = contrato.data[0];
        const cantidadCenas_vendidas = entrada.subtipos
            .filter(s => s.nombre === "Cena Menor" || s.nombre === "Cena Mayor")
            .reduce((sum, s) => sum + s.cantidad_vendida, 0);
            const cantidadBrindis_vendidas = entrada.subtipos
            .filter(s => s.nombre === "Brindis")
            .reduce((sum, s) => sum + s.cantidad_vendida, 0);
        return {
            success: true,
            data: {
                 cantidad_total: entrada.cantidad_total,
                cantidad_real: entrada.cantidad_real,
                eventoId: evento.id,
                subtipos: flatData
            },
            cantidadCenas_vendidas,
            cantidadBrindis_vendidas,
            minimoCenas,minimoBrindis
        };

    } catch (error) {
        return { success: false, message: error.message };
    }
};

module.exports = compareContratoController;