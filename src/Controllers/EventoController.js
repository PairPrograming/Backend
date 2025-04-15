const { Salones, Eventos, SalonesEventos } = require("../DbIndex");

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
    // Extraemos el salonId de los datos
    const { salonId, ...eventoData } = data;
    
    // Verificamos que se haya proporcionado el salonId
    if (!salonId) {
      throw new Error("Es necesario seleccionar un salón para el evento");
    }
    
    // Verificamos que el salón exista
    const salon = await Salones.findByPk(salonId);
    if (!salon) {
      throw new Error("No se encontró el salón seleccionado");
    }
    if(eventoData.capacidad > salon.capacidad){
      throw new Error('No puedes superar la capacidad del salon')
    }
    // Creamos el evento
    const [existingEvento, created] = await Eventos.findOrCreate({
      where: { nombre: eventoData.nombre },
      defaults: eventoData,
    });
    
    if (!created) {
      throw new Error("El evento ya existe");
    }
    
    // Ahora creamos la asociación en la tabla intermedia
    await SalonesEventos.create({
      salonId: salonId,
      eventoId: existingEvento.id
    });
    
    return { 
      success: true, 
      message: "Evento creado y asociado al salón con éxito",
      evento: existingEvento 
    };
  } catch (error) {
    throw new Error(`Error al crear el evento: ${error.message}`);
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
