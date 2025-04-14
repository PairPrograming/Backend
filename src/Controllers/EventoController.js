const { Salones, Eventos } = require("../DbIndex");

const getEventosGridController = async () => {
  try {
    const result = await Eventos.findAll({
      attributes: ["nombre", "fecha", "duraccion", "activo"],
    });
    return { success: true, data: result };
  } catch (error) {
    throw new Error(
      `Error al obtener la información de los eventos: ${error.message}`
    );
  }
};

const getEventoController = async (id) => {
  try {
    const result = await Eventos.findByPk(id, {
      attributes: ["nombre", "fecha", "duraccion", "activo"],
    });
    if (!result) {
      throw new Error("Evento no encontrado");
    }
    return {success: true, data: result};
  } catch (error) {
    throw new Error(`Error al obtener informacion ${error.message}`);
  }
};

const addEventoController = async (data) => {
  try {
    const [existingEvento, created] = await Eventos.findOrCreate({
      where: { nombre: data.nombre },
      defaults: data,
    });
    if (!created) {
      throw new Error("El evento ya existe");
    }
    return { success: true, message: "Eventoo creado con exito" };
  } catch (error) {
    throw new Error(`${error.message}`);
  }
};

const modEventoController = async (id, data) => {
  try {
    const [updateRows] = await Eventos.update(data, { where: { id: id } });
    if (updateRows === 0) {
      throw new Error("No se encontro el evento o no hubo cambios");
    }
    return { success: true, message: "Informacion actualizada correctamente" };
  } catch (error) {
    throw new Error(
      `Error al actualizar la información del evento, ${error.message}`
    );
  }
};

module.exports = {
  addEventoController,
  modEventoController,
  getEventoController,
  getEventosGridController,
};
