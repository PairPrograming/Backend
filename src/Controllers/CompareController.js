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

        if (!entrada) {
            return { success: false, message: "No se encontraron entradas para este evento" };
        }

        const flatData = entrada.subtipos.map(subtipo => ({
            subtipoNombre: subtipo.nombre,
            cantidad_disponible: subtipo.cantidad_disponible,
            cantidad_vendida: subtipo.cantidad_vendida
        }));

        const contrato = await obtenerContratoController(eventoId);
        
        if (!contrato.success) {
            return { success: false, message: "Error al obtener el contrato" };
        }

        const { minimoCenas, minimoBrindis } = contrato.data[0];

        // Calcular cantidades vendidas
        const cantidadCenas_vendidas = entrada.subtipos
            .filter(s => s.nombre === "Cena Menor" || s.nombre === "Cena Mayor")
            .reduce((sum, s) => sum + s.cantidad_vendida, 0);

        const cantidadBrindis_vendidas = entrada.subtipos
            .filter(s => s.nombre === "Brindis")
            .reduce((sum, s) => sum + s.cantidad_vendida, 0);

        // Realizar comparaciones
        const comparacionCenas = {
            vendidas: cantidadCenas_vendidas,
            minimo_contratado: minimoCenas,
            diferencia: cantidadCenas_vendidas - minimoCenas,
            cumple_minimo: cantidadCenas_vendidas >= minimoCenas,
            porcentaje_cumplimiento: minimoCenas > 0 ? ((cantidadCenas_vendidas / minimoCenas) * 100).toFixed(2) : 0
        };

        const comparacionBrindis = {
            vendidas: cantidadBrindis_vendidas,
            minimo_contratado: minimoBrindis,
            diferencia: cantidadBrindis_vendidas - minimoBrindis,
            cumple_minimo: cantidadBrindis_vendidas >= minimoBrindis,
            porcentaje_cumplimiento: minimoBrindis > 0 ? ((cantidadBrindis_vendidas / minimoBrindis) * 100).toFixed(2) : 0
        };

        // Estado general del contrato
        const contratoCompleto = comparacionCenas.cumple_minimo && comparacionBrindis.cumple_minimo;

        return {
            success: true,
            data: {
                evento: {
                    id: evento.id,
                    cantidad_total: entrada.cantidad_total,
                    cantidad_real: entrada.cantidad_real
                },
                subtipos: flatData,
                comparacion: {
                    cenas: comparacionCenas,
                    brindis: comparacionBrindis,
                    contrato_completo: contratoCompleto,
                    resumen: {
                        total_vendidas: cantidadCenas_vendidas + cantidadBrindis_vendidas,
                        total_minimo: minimoCenas + minimoBrindis,
                        diferencia_total: (cantidadCenas_vendidas + cantidadBrindis_vendidas) - (minimoCenas + minimoBrindis)
                    }
                }
            }
        };

    } catch (error) {
        console.error('Error en compareContratoController:', error);
        return { success: false, message: error.message };
    }
};

module.exports = compareContratoController;