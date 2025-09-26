const { Entrada, SubtipoEntrada, Eventos } = require("../DbIndex");
const { Op } = require("sequelize");

const agregarEntradasController = async (data) => {
  try {
    // Validación básica
    const validate = ["eventoId", "tipo_entrada", "cantidad_total"];
    for (const valid of validate) {
      if (!data[valid]) {
        throw new Error(`El campo ${valid} es requerido`);
      }
    }

    // Validar subtipos solo si se proporcionan y no están vacíos
    let tieneSubtipos = data.subtipos && Array.isArray(data.subtipos) && data.subtipos.length > 0;

    if (tieneSubtipos) {
      // Validar estructura de subtipos
      for (const subtipo of data.subtipos) {
        if (
          !subtipo.nombre ||
          subtipo.precio === undefined ||
          subtipo.cantidad_disponible === undefined
        ) {
          throw new Error(
            "Cada subtipo debe tener: nombre, precio y cantidad_disponible"
          );
        }
      }

      // VALIDAR QUE LA SUMA DE SUBTIPOS NO EXCEDA CANTIDAD TOTAL
      const totalSubtipos = data.subtipos.reduce(
        (total, subtipo) => total + parseInt(subtipo.cantidad_disponible),
        0
      );

      if (totalSubtipos > data.cantidad_total) {
        throw new Error(
          `La suma de cantidades de subtipos (${totalSubtipos}) no puede exceder la cantidad total (${data.cantidad_total})`
        );
      }
    } else {
      // Si NO tiene subtipos, el precio de la entrada principal es obligatorio y debe ser mayor a cero
const precioNum = parseFloat(data.precio);

if (!data.precio || isNaN(precioNum) || precioNum <= 0) {
  throw new Error("El precio debe ser un número válido y mayor que cero si no hay subtipos");
}
    }

    // Obtener evento y su capacidad
    const evento = await Eventos.findByPk(data.eventoId);
    if (!evento) {
      throw new Error("Evento no encontrado");
    }

    const { capacidad } = evento;

    // VALIDAR CAPACIDAD DEL EVENTO
    if (!capacidad || capacidad <= 0) {
      throw new Error("El evento debe tener una capacidad válida definida");
    }

    // Obtener total de entradas ya creadas para este evento
    const entradasExistentes = await Entrada.findAll({
      where: { eventoId: data.eventoId },
    });

    const totalEntradasExistentes = entradasExistentes.reduce(
      (total, entrada) => total + entrada.cantidad_total,
      0
    );

    // Validar que no se exceda la capacidad
    if (totalEntradasExistentes + data.cantidad_total > capacidad) {
      throw new Error(
        `La cantidad total de entradas (${
          totalEntradasExistentes + data.cantidad_total
        }) excede la capacidad del evento (${capacidad}). Disponible: ${
          capacidad - totalEntradasExistentes
        }`
      );
    }

    // Verificar si ya existe entrada con ese tipo para el evento
    const entradaExistente = await Entrada.findOne({
      where: {
        tipo_entrada: data.tipo_entrada,
        eventoId: data.eventoId,
      },
    });

    if (entradaExistente) {
      return {
        success: false,
        message: "Ya existe una entrada con ese tipo para el evento",
      };
    }

    // Calcular cantidad_real según si tiene subtipos o no
    let cantidadReal;
    if (tieneSubtipos) {
      const totalSubtipos = data.subtipos.reduce(
        (total, subtipo) => total + parseInt(subtipo.cantidad_disponible),
        0
      );
      cantidadReal = data.cantidad_total - totalSubtipos;
    } else {
      cantidadReal = data.cantidad_total;
    }

    // Crear entrada principal
    const entrada = await Entrada.create({
      tipo_entrada: data.tipo_entrada,
      descripcion: data.descripcion || null,
      precio: tieneSubtipos ? null : parseFloat(data.precio),
      cantidad_total: data.cantidad_total,
      cantidad_real: cantidadReal,
      fecha_inicio_venta: data.fecha_inicio_venta || null,
      fecha_fin_venta: data.fecha_fin_venta || null,
      estatus: data.estatus || "disponible",
      eventoId: data.eventoId,
    });

    let subtipos = [];
    let numSubtipos = 0;

    // Crear subtipos asociados solo si se proporcionaron
    if (tieneSubtipos) {
      const subtipesData = data.subtipos.map((subtipo, index) => ({
        nombre: subtipo.nombre,
        descripcion: subtipo.descripcion || null,
        precio: parseFloat(subtipo.precio),
        cantidad_disponible: subtipo.cantidad_disponible,
        cantidad_vendida: 0,
        cantidad_reservada: 0,
        edad_minima: subtipo.edad_minima || null,
        edad_maxima: subtipo.edad_maxima || null,
        requiere_documentacion: subtipo.requiere_documentacion || false,
        orden_visualizacion: index + 1,
        estatus: "activo",
        EntradaId: entrada.id,
      }));

      subtipos = await SubtipoEntrada.bulkCreate(subtipesData);
      numSubtipos = subtipos.length;
    }

    return {
      success: true,
      message:
        tieneSubtipos
          ? "Entrada y subtipos creados exitosamente"
          : "Entrada creada exitosamente",
      entradaId: entrada.id,
      subtipos: numSubtipos,
      tiene_subtipos: numSubtipos > 0,
      cantidad_real_restante: entrada.cantidad_real,
      capacidad_evento: capacidad,
      total_entradas_evento: totalEntradasExistentes + data.cantidad_total,
      capacidad_restante:
        capacidad - (totalEntradasExistentes + data.cantidad_total),
    };
  } catch (error) {
    throw new Error(`${error.message}`);
  }
};


const obtenerEntradasController = async (eventoId) => {
  try {
    if (!eventoId) {
      throw new Error(`El campo eventoId es requerido`);
    }

    const entradas = await Entrada.findAll({
      where: { eventoId: eventoId },
      include: [
        {
          model: SubtipoEntrada,
          as: "subtipos",
          where: { estatus: ["activo", "agotado"] },
          required: false,
          order: [["orden_visualizacion", "ASC"]],
        },
      ],
      order: [["createdAt", "ASC"]],
    });

    // Calcular totales por entrada
    const entradasConResumen = entradas.map((entrada) => {
      const subtipos = entrada.subtipos || [];
      const totalVendidas = subtipos.reduce(
        (sum, s) => sum + s.cantidad_vendida,
        0
      );
      const totalDisponibles = subtipos.reduce(
        (sum, s) =>
          sum +
          (s.cantidad_disponible - s.cantidad_vendida - s.cantidad_reservada),
        0
      );
      const totalAsignados = subtipos.reduce(
        (sum, s) => sum + s.cantidad_disponible,
        0
      );
      const precios = subtipos.map((s) => parseFloat(s.precio));

      return {
        ...entrada.toJSON(),
        resumen: {
          total_vendidas: totalVendidas,
          total_disponibles: totalDisponibles,
          total_asignados_subtipos: totalAsignados,
          cantidad_real_restante: entrada.cantidad_total - totalAsignados,
          precio: parseFloat(entrada.precio),
          precio_minimo:
            precios.length > 0
              ? Math.min(...precios)
              : parseFloat(entrada.precio),
          precio_maximo:
            precios.length > 0
              ? Math.max(...precios)
              : parseFloat(entrada.precio),
          cantidad_subtipos: subtipos.length,
        },
      };
    });

    return {
      success: true,
      data: entradasConResumen,
    };
  } catch (error) {
    return {
      success: false,
      message: `Error al obtener entradas: ${error.message}`,
    };
  }
};

const deleteEntradaController = async (entradaId) => {
  try {
    if (!entradaId) {
      throw new Error(`El campo entradaId es requerido`);
    }

    // Verificar que existe la entrada
    const entrada = await Entrada.findByPk(entradaId, {
      include: [
        {
          model: SubtipoEntrada,
          as: "subtipos",
        },
      ],
    });

    if (!entrada) {
      return {
        success: false,
        message: `No se encontró ninguna entrada con id: ${entradaId}`,
      };
    }

    // Verificar si hay ventas
    const tieneVentas = entrada.subtipos?.some((s) => s.cantidad_vendida > 0);
    if (tieneVentas) {
      return {
        success: false,
        message: `No se puede eliminar la entrada porque ya tiene ventas registradas`,
      };
    }

    // Eliminar entrada (CASCADE eliminará subtipos automáticamente)
    const resultado = await Entrada.destroy({
      where: { id: entradaId },
    });

    return {
      success: true,
      message: `Entrada y subtipos eliminados correctamente`,
      deletedCount: resultado,
    };
  } catch (error) {
    return {
      success: false,
      message: `Error al eliminar entrada: ${error.message}`,
    };
  }
};

const actualizarEntradaController = async (data) => {
  try {
    if (!data.id) {
      throw new Error("El campo id es requerido para actualizar");
    }

    const entrada = await Entrada.findByPk(data.id, {
      include: [
        {
          model: SubtipoEntrada,
          as: "subtipos",
          where: { estatus: ["activo", "agotado"] },
          required: false,
        },
        {
          model: Eventos,
          as: "Evento",
          attributes: ["capacidad"],
        },
      ],
    });
    if (!entrada) {
      return {
        success: false,
        message: `No se encontró entrada con id: ${data.id}`,
      };
    }

    // VALIDAR PRECIO
    if (data.precio !== undefined && parseFloat(data.precio) <= 0) {
      throw new Error("El precio debe ser mayor que cero");
    }

    // VALIDAR CAPACIDAD DEL EVENTO si se actualiza cantidad_total
    if (data.cantidad_total !== undefined) {
      const capacidadEvento = entrada.Evento?.capacidad;

      if (!capacidadEvento || capacidadEvento <= 0) {
        throw new Error("El evento debe tener una capacidad válida definida");
      }

      // Obtener el total de entradas de otros tipos para el mismo evento
      const otrasEntradas = await Entrada.findAll({
        where: {
          eventoId: entrada.eventoId,
          id: { [Op.ne]: data.id },
        },
        attributes: ["cantidad_total"],
      });

      const totalOtrasEntradas = otrasEntradas.reduce(
        (total, entry) => total + (entry.cantidad_total || 0),
        0
      );

      const totalConNuevaEntrada = totalOtrasEntradas + data.cantidad_total;

      if (totalConNuevaEntrada > capacidadEvento) {
        throw new Error(
          `El total de entradas del evento (${totalConNuevaEntrada}) excede la capacidad del evento (${capacidadEvento}). Disponible: ${
            capacidadEvento - totalOtrasEntradas
          }`
        );
      }

      // Validar subtipos solo SI LA ENTRADA TIENE SUBTIPOS
      const totalSubtipos =
        entrada.subtipos?.reduce(
          (total, subtipo) => total + subtipo.cantidad_disponible,
          0
        ) || 0;

      // Solo validar si hay subtipos existentes
      if (totalSubtipos > 0 && data.cantidad_total < totalSubtipos) {
        throw new Error(
          `La nueva cantidad total (${data.cantidad_total}) no puede ser menor que la suma actual de subtipos (${totalSubtipos})`
        );
      }
    }

    // Campos actualizables de Entrada
    const camposActualizables = [
      "tipo_entrada",
      "descripcion",
      "precio",
      "cantidad_total",
      "fecha_inicio_venta",
      "fecha_fin_venta",
      "estatus",
    ];

    camposActualizables.forEach((campo) => {
      if (data[campo] !== undefined) {
        entrada[campo] =
          campo === "precio" ? parseFloat(data[campo]) : data[campo];
      }
    });

    // Recalcular cantidad_real si se actualiza cantidad_total
    if (data.cantidad_total !== undefined) {
      const totalSubtipos =
        entrada.subtipos?.reduce(
          (total, subtipo) => total + subtipo.cantidad_disponible,
          0
        ) || 0;

      if (totalSubtipos > 0) {
        // Si tiene subtipos: cantidad_real = cantidad_total - subtipos
        entrada.cantidad_real = data.cantidad_total - totalSubtipos;
      } else {
        // Si NO tiene subtipos: cantidad_real = cantidad_total
        entrada.cantidad_real = data.cantidad_total;
      }
    }

    await entrada.save();

    // Información adicional para la respuesta
    let infoAdicional = {};
    if (data.cantidad_total !== undefined) {
      const capacidadEvento = entrada.Evento?.capacidad;
      const totalEntradasEvento = await Entrada.sum("cantidad_total", {
        where: { eventoId: entrada.eventoId },
      });

      infoAdicional = {
        capacidad_evento: capacidadEvento,
        total_entradas_evento: totalEntradasEvento,
        capacidad_restante: capacidadEvento - totalEntradasEvento,
        tiene_subtipos: (entrada.subtipos?.length || 0) > 0,
        cantidad_subtipos: entrada.subtipos?.length || 0,
      };
    }

    return {
      success: true,
      message: "Entrada actualizada correctamente",
      entrada: entrada,
      ...infoAdicional,
    };
  } catch (error) {
    return {
      success: false,
      message: `Error al actualizar entrada: ${error.message}`,
    };
  }
};

const agregarSubtipoController = async (data) => {
  try {
    const validate = ["EntradaId", "nombre", "precio", "cantidad_disponible"];

    for (const valid of validate) {
      if (!data[valid]) {
        throw new Error(`El campo ${valid} es requerido`);
      }
    }

    // Verificar que la entrada existe y obtener subtipos actuales
    const entrada = await Entrada.findByPk(data.EntradaId, {
      include: [
        {
          model: SubtipoEntrada,
          as: "subtipos",
          where: { estatus: ["activo", "agotado"] },
          required: false,
        },
      ],
    });

    if (!entrada) {
      throw new Error("La entrada especificada no existe");
    }
    
if (entrada.precio != null) {
  throw new Error("Si la entrada tiene precio no es posible agregar un subtipo");
}
    // VALIDAR QUE NO SE EXCEDA LA CANTIDAD TOTAL
    const totalSubtiposActuales =
      entrada.subtipos?.reduce(
        (total, subtipo) => total + subtipo.cantidad_disponible,
        0
      ) || 0;

    const nuevaCantidadTotal =
      totalSubtiposActuales + parseInt(data.cantidad_disponible);

    if (nuevaCantidadTotal > entrada.cantidad_total) {
      throw new Error(
        `No se puede agregar el subtipo. Cantidad disponible en entrada: ${
          entrada.cantidad_total - totalSubtiposActuales
        }, solicitada: ${data.cantidad_disponible}`
      );
    }

    const subtipo = await SubtipoEntrada.create({
      ...data,
      precio: parseFloat(data.precio),
    });

    // Actualizar cantidad_real de la entrada
    entrada.cantidad_real = entrada.cantidad_total - totalSubtiposActuales - parseInt(data.cantidad_disponible);
    await entrada.save();
    return {
      success: true,
      message: "Subtipo creado exitosamente",
      subtipoId: subtipo.id,
      cantidad_real_restante: entrada.cantidad_real,
    };
  } catch (error) {
    return {
      success: false,
      message: `Error al crear subtipo: ${error.message}`,
    };
  }
};

const actualizarSubtipoController = async (data) => {
  try {
    if (!data.id) {
      throw new Error("El campo id es requerido");
    }

    // Obtener el subtipo con su entrada y todos los otros subtipos
    const subtipo = await SubtipoEntrada.findByPk(data.id);

    if (!subtipo) {
      return {
        success: false,
        message: `No se encontró subtipo con id: ${data.id}`,
      };
    }

    // Obtener la entrada con todos sus subtipos (excluyendo el actual)
    const entrada = await Entrada.findByPk(subtipo.EntradaId, {
      include: [
        {
          model: SubtipoEntrada,
          as: "subtipos",
          where: {
            estatus: ["activo", "agotado"],
            id: { [Op.ne]: data.id },
          },
          required: false,
        },
      ],
    });

    // VALIDAR CANTIDAD_DISPONIBLE SI SE ESTÁ ACTUALIZANDO
    if (data.cantidad_disponible !== undefined) {
      const totalOtrosSubtipos =
        entrada.subtipos?.reduce(
          (total, s) => total + s.cantidad_disponible,
          0
        ) || 0;

      const nuevaCantidadTotal =
        totalOtrosSubtipos + parseInt(data.cantidad_disponible);

      if (nuevaCantidadTotal > entrada.cantidad_total) {
        throw new Error(
          `No se puede actualizar. La suma de subtipos (${nuevaCantidadTotal}) excedería la cantidad total de la entrada (${
            entrada.cantidad_total
          }). Cantidad máxima permitida para este subtipo: ${
            entrada.cantidad_total - totalOtrosSubtipos
          }`
        );
      }

      // Validar que la nueva cantidad no sea menor que lo ya vendido/reservado
      const totalComprometido =
        subtipo.cantidad_vendida + subtipo.cantidad_reservada;
      if (parseInt(data.cantidad_disponible) < totalComprometido) {
        throw new Error(
          `No se puede reducir la cantidad disponible a ${data.cantidad_disponible}. Ya hay ${totalComprometido} entradas comprometidas (${subtipo.cantidad_vendida} vendidas + ${subtipo.cantidad_reservada} reservadas)`
        );
      }
    }

    const camposActualizables = [
      "nombre",
      "descripcion",
      "precio",
      "cantidad_disponible",
      "edad_minima",
      "edad_maxima",
      "requiere_documentacion",
      "estatus",
    ];

    const cantidadAnterior = subtipo.cantidad_disponible;

    camposActualizables.forEach((campo) => {
      if (data[campo] !== undefined) {
        subtipo[campo] =
          campo === "precio" ? parseFloat(data[campo]) : data[campo];
      }
    });

    await subtipo.save();

    // Si cambió la cantidad, actualizar cantidad_real de la entrada
    if (data.cantidad_disponible !== undefined) {
      const diferencia = parseInt(data.cantidad_disponible) - cantidadAnterior;
      entrada.cantidad_real =
        entrada.cantidad_total -
        (entrada.subtipos?.reduce(
          (total, s) => total + s.cantidad_disponible,
          0
        ) || 0) -
        parseInt(data.cantidad_disponible);
      await entrada.save();
    }

    return {
      success: true,
      message: "Subtipo actualizado correctamente",
      subtipo: subtipo,
      cantidad_real_restante: entrada.cantidad_real,
    };
  } catch (error) {
    return {
      success: false,
      message: `Error al actualizar subtipo: ${error.message}`,
    };
  }
};

const obtenerEntradaByIdController = async (id) => {
  try {
    const { entradaid } = id;
    if (!entradaid) {
      throw new Error("El campo id es requerido");
    }

    const result = await Entrada.findByPk(entradaid, {
      include: [
        {
          model: SubtipoEntrada,
          as: "subtipos",
          required: false,
          where: { estatus: ["activo", "agotado"] },
        },
      ],
    });

    if (!result) {
      return {
        success: false,
        message: `No se encontró entrada con id: ${entradaid}`,
      };
    }

    return {
      success: true,
      data: {
        ...result.toJSON(),
        precio: parseFloat(result.precio),
      },
    };
  } catch (error) {
    return {
      success: false,
      message: `Error al obtener la entrada: ${error.message}`,
    };
  }
};

const deleteSubtipoController = async (subtipoId) => {
  try {
    if (!subtipoId) {
      throw new Error(`El campo subtipoId es requerido`);
    }

    // Verificar que el subtipo existe
    const subtipo = await SubtipoEntrada.findByPk(subtipoId);

    if (!subtipo) {
      return {
        success: false,
        message: `No se encontró ningún subtipo con id: ${subtipoId}`,
      };
    }

    // Verificar si hay ventas o reservas
    if (subtipo.cantidad_vendida > 0 || subtipo.cantidad_reservada > 0) {
      return {
        success: false,
        message: `No se puede eliminar el subtipo porque tiene entradas vendidas (${subtipo.cantidad_vendida}) o reservadas (${subtipo.cantidad_reservada})`,
      };
    }

    // Obtener la entrada padre con todos los subtipos activos (excluyendo el que se va a eliminar)
    const entrada = await Entrada.findByPk(subtipo.EntradaId, {
      include: [
        {
          model: SubtipoEntrada,
          as: "subtipos",
          where: {
            estatus: ["activo", "agotado"],
            id: { [Op.ne]: subtipoId },
          },
          required: false,
        },
      ],
    });

    if (!entrada) {
      throw new Error("No se encontró la entrada asociada al subtipo");
    }

    // Eliminar el subtipo (borrado físico)
    const resultado = await SubtipoEntrada.destroy({
      where: { id: subtipoId },
    });

    // Calcular la nueva cantidad_real
    const totalSubtiposRestantes =
      entrada.subtipos?.reduce(
        (total, s) => total + s.cantidad_disponible,
        0
      ) || 0;

    entrada.cantidad_real = entrada.cantidad_total - totalSubtiposRestantes;
    await entrada.save();

    return {
      success: true,
      message: `Subtipo eliminado correctamente`,
      deletedCount: resultado,
      cantidad_real_actualizada: entrada.cantidad_real,
    };
  } catch (error) {
    return {
      success: false,
      message: `Error al eliminar subtipo: ${error.message}`,
    };
  }
};

module.exports = {
  agregarEntradasController,
  obtenerEntradasController,
  obtenerEntradaByIdController,
  deleteEntradaController,
  actualizarEntradaController,
  agregarSubtipoController,
  actualizarSubtipoController,
  deleteSubtipoController,
};
