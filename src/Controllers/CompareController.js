const { Orden, DetalleDeOrden, Eventos, Contrato, Entrada, SubtipoEntrada } = require("../DbIndex");
const {obtenerContratoController} = require('../Controllers/ContratoController');
const { Op } = require("sequelize");

const normalize = (str) =>
  (str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const isCena = (nombre) => {
  const n = normalize(nombre);
  return n.includes("cena") || n === "menor" || n === "mayor";
};
const isBrindis = (nombre) => normalize(nombre).includes("brindis");

const compareContratoController = async (data) => {
  try {
    if (!data) throw new Error('No pueden haber campos nulos');
    const { eventoId } = data;

    const evento = await Eventos.findByPk(eventoId, {
      include: [
        {
          model: Entrada,
          attributes: ["tipo_entrada", "cantidad_total", "cantidad_real"],
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

    // Sumar ventas de subtipos
    let cantidadCenas_vendidas = 0;
    let cantidadBrindis_vendidas = 0;
    let flatData = [];

    for (const entrada of evento.Entradas) {
      // Sumar ventas de subtipos
      if (entrada.subtipos && entrada.subtipos.length > 0) {
        flatData.push(
          ...entrada.subtipos.map(subtipo => ({
            subtipoNombre: subtipo.nombre,
            cantidad_disponible: subtipo.cantidad_disponible,
            cantidad_vendida: subtipo.cantidad_vendida
          }))
        );
        cantidadCenas_vendidas += entrada.subtipos
          .filter(s => isCena(s.nombre))
          .reduce((sum, s) => sum + s.cantidad_vendida, 0);
        cantidadBrindis_vendidas += entrada.subtipos
          .filter(s => isBrindis(s.nombre))
          .reduce((sum, s) => sum + s.cantidad_vendida, 0);
      } else {
        // Sumar ventas de la entrada principal si es "cena" o "brindis"
        flatData.push({
          subtipoNombre: entrada.tipo_entrada,
          cantidad_disponible: entrada.cantidad_real,
          cantidad_vendida: entrada.cantidad_total - entrada.cantidad_real
        });
        if (isCena(entrada.tipo_entrada)) {
          cantidadCenas_vendidas += entrada.cantidad_total - entrada.cantidad_real;
        }
        if (isBrindis(entrada.tipo_entrada)) {
          cantidadBrindis_vendidas += entrada.cantidad_total - entrada.cantidad_real;
        }
      }
    }

    const contrato = await obtenerContratoController(eventoId);
    if (!contrato.success) {
      return { success: false, message: "Error al obtener el contrato" };
    }

    const { minimoCenas, minimoBrindis } = contrato.data[0];

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

    const contratoCompleto = comparacionCenas.cumple_minimo && comparacionBrindis.cumple_minimo;

    return {
      success: true,
      data: {
        evento: {
          id: evento.id,
          // puedes mostrar otros datos si quieres
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