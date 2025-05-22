const { Entrada } = require("../DbIndex");

const agregarEntradasController = async (data) => {
  try {
    const validate = [
      "eventoId",
      "tipo_entrada",
      "precio",
      "cantidad",
      "estatus",
    ];
    for (const valid of validate) {
      if (!data[valid]) {
        throw new Error(`El campo ${valid} es requerido`);
      }
    }
    /* Validamos si se esta intentando agregar una entrada con un tipo ya creado para
        un mismo evento, "Created sera false" y arrojara que ya existe dicha entrada, y por otro lado
        si created es true y por ende entrada tendra valores donde en el return pasara con success!!   */
    const [entrada, created] = await Entrada.findOrCreate({
      where: { tipo_entrada: data.tipo_entrada, eventoId: data.eventoId },
      defaults: data,
    });
    if (!created) {
      return {
        success: false,
        message: "Ya existe una entrada con ese tipo para el evento",
      };
    }
    return {
      success: true,
      message: "Entrada creada exitosamente",
      entradaId: entrada.id,
    };
  } catch (error) {
    throw new Error(`${error.message}`);
  }
};

const obtenerEntradasController = async (eventoId) => {
  try {
    if (!eventoId) {
      throw new Error(`El campo id es requerido`);
    }
    const entradas = await Entrada.findAll({
      where: { eventoId },
    });
    return { success: true, data: entradas };
  } catch (error) {
    return {
      success: false,
      message: `Error al obtener la información de las entradas: ${error.message}`,
    };
  }
};

const deleteEntradaController = async (entradaId) => {
  try {
    console.log(entradaId, "Hola");
    if (!entradaId) {
      throw new Error(`Los campos eventoId y entradaId son requeridos`);
    }

    const resultado = await Entrada.destroy({
      where: { id: entradaId },
    });

    // Verificar si se eliminó algún registro
    if (resultado === 0) {
      return {
        success: false,
        message: `No se encontró ninguna entrada con id: ${entradaId}`,
      };
    }

    // Devolver respuesta de éxito
    return {
      success: true,
      message: `Entrada eliminada correctamente`,
      deletedCount: resultado,
    };
  } catch (error) {
    // Manejar el error y devolver una respuesta
    return {
      success: false,
      message: `Error al eliminar la entrada: ${error.message}`,
    };
  }
};

const actualizarEntradaController = async (data) => {
  try {
    // Validar que venga el id de la entrada a actualizar
    if (!data.id) {
      throw new Error("El campo id es requerido para actualizar la entrada");
    }

    // Buscar la entrada existente
    const entrada = await Entrada.findByPk(data.id);
    if (!entrada) {
      return {
        success: false,
        message: `No se encontró ninguna entrada con id: ${data.id}`,
      };
    }

    // Actualizar los campos permitidos
    const camposActualizables = [
      "tipo_entrada",
      "precio",
      "cantidad",
      "estatus",
    ];
    camposActualizables.forEach((campo) => {
      if (data[campo] !== undefined) {
        entrada[campo] = data[campo];
      }
    });

    await entrada.save();

    return {
      success: true,
      message: "Entrada actualizada correctamente",
      entrada: entrada,
    };
  } catch (error) {
    return {
      success: false,
      message: `Error al actualizar la entrada: ${error.message}`,
    };
  }
};

module.exports = {
  agregarEntradasController,
  obtenerEntradasController,
  deleteEntradaController,
  actualizarEntradaController, // Exporta el nuevo controller
};
