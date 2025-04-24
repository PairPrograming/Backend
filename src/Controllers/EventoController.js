const { Salones, Eventos, SalonesEventos } = require("../DbIndex");

const getEventosGridController = async () => {
  try {
    const result = await Eventos.findAll({
      attributes: ["id", "nombre", "fecha", "duracion", "capacidad", "activo"],
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
      attributes: ["nombre", "fecha", "duracion", "capacidad", "activo"],
      include: [{
        model: Salones,
        through: { attributes: [] },
        attributes: ["Id", "salon", "capacidad"]
      }],
      raw: true,
    });
    if (!result) {
      throw new Error("Evento no encontrado");
    }
    return { success: true, data: result };
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
    if (eventoData.capacidad > salon.capacidad) {
      throw new Error("No puedes superar la capacidad del salon");
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
      eventoId: existingEvento.id,
    });

    return {
      success: true,
      message: "Evento creado y asociado al salón con éxito",
      evento: existingEvento,
    };
  } catch (error) {
    throw new Error(`Error al crear el evento: ${error.message}`);
  }
};

const modEventoController = async (id, data) => {
  try {
    const [updateRows] = await Eventos.update(data, { where: { id } });
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

// Nuevo controller para borrado lógico
const deleteEventoLogicoController = async (id) => {
  try {
    const evento = await Eventos.findByPk(id);
    if (!evento) {
      throw new Error("Evento no encontrado");
    }

    // Update the 'activo' field to false
    const [updateRows] = await Eventos.update(
      { activo: false },
      { where: { id } }
    );

    if (updateRows === 0) {
      throw new Error("No se pudo desactivar el evento");
    }

    return {
      success: true,
      message: "Evento desactivado correctamente",
    };
  } catch (error) {
    throw new Error(`Error al desactivar el evento: ${error.message}`);
  }
};

// Nuevo controller para borrado físico
const deleteEventoFisicoController = async (id) => {
  try {
    // First, verify the event exists
    const evento = await Eventos.findByPk(id);
    if (!evento) {
      throw new Error("Evento no encontrado");
    }

    // Delete related records in the intermediate table first to maintain referential integrity
    await SalonesEventos.destroy({
      where: { eventoId: id },
    });

    // Then delete the event itself
    const deletedRows = await Eventos.destroy({
      where: { id },
    });

    if (deletedRows === 0) {
      throw new Error("No se pudo eliminar el evento");
    }

    return {
      success: true,
      message: "Evento eliminado permanentemente",
    };
  } catch (error) {
    throw new Error(`Error al eliminar el evento: ${error.message}`);
  }
};
const addSalonEventoController = async (salonId, eventoId) =>{
  try {
    const salon = await Salones.findByPk(salonId);
    const evento = await Eventos.findByPk(eventoId);
    
    if(!salon || !evento){
        throw new Error('No se encontro el evento o el salon');
    }
    
    const [existingEventoSalon, created] = await SalonesEventos.findOrCreate({
      where: {salonId, eventoId},
      defaults: {salonId, eventoId}
    });
    
    if(!created){
      throw new Error('El evento ya esta asociado en un salon');
    }
    
    return { success: true, message:'Salon agregado al evento exitosamente'};
  } catch (error) {
    throw new Error(`Error al agregar el salon al evento: ${error.message}`);
  }
}
const deleteSalonEventoController = async (salonId, eventoId) => {
  try {
    const salon = await Salones.findByPk(salonId);
    const evento = await Eventos.findByPk(eventoId);
    if(!salon || !evento){
      throw new Error('No se encontro el evento o el salon');
    }
    await SalonesEventos.destroy({
      where:{
        salonId: salonId,
        eventoId: eventoId
      }
    })
    return { success: true, message:'Salon eliminadodel evento exitosamente'};
  } catch (error) {
    throw new Error(`Error al eliminar el salon al evento: ${error.message}`);
  }
}

module.exports = {
  addEventoController,
  modEventoController,
  getEventoController,
  getEventosGridController,
  deleteEventoLogicoController,
  deleteEventoFisicoController,
  addSalonEventoController,
  deleteSalonEventoController
};
