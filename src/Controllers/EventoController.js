const { Salones, Eventos, SalonesEventos, Users } = require("../DbIndex");
const { Op } = require("sequelize");

// Common attributes for reuse
const EVENT_ATTRIBUTES = [
  "id",
  "nombre",
  "fecha",
  "duracion",
  "capacidad",
  "activo",
  "salonId",
  "salonNombre", // Nuevo campo agregado
  "descripcion",
  "image",
];

// Error handler wrapper
const errorHandler =
  (fn) =>
  async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      const message = error.message || "Error en la operación";
      throw new Error(message);
    }
  };

const getEventosGridController = errorHandler(async (filters = {}) => {
  const where = {};

  // Apply filters if provided
  if (filters.activo !== undefined) {
    where.activo = filters.activo;
  }

  if (filters.fecha) {
    where.fecha = {
      [Op.gte]: new Date(filters.fecha),
    };
  }

  const result = await Eventos.findAll({
    attributes: EVENT_ATTRIBUTES,
    where,
    order: [["fecha", "ASC"]], // Default order by date ascending
  });

  return { success: true, data: result };
});

const getEventoController = errorHandler(async (id) => {
  const result = await Eventos.findByPk(id, {
    attributes: EVENT_ATTRIBUTES /*
    include: [
      {
        model: Salones,
        through: { attributes: [] },
        attributes: ["Id", "salonId", "capacidad", "nombre"], // Incluye el nombre del salón
      },
    ],*/,
  });

  if (!result) {
    throw new Error("Evento no encontrado");
  }

  return { success: true, data: result };
});

const addEventoController = errorHandler(async (data) => {
  const { salonId, salonNombre, ...eventoData } = data;

  // Verificar si el salón existe
  if (salonId) {
    const salonExistente = await Salones.findByPk(salonId);
    if (!salonExistente) {
      throw new Error("No se encontró el salón especificado");
    }

    if (eventoData.capacidad > salonExistente.capacidad) {
      throw new Error("La capacidad del evento no puede superar la del salón");
    }
  }

  // Crear el evento
  const [existingEvento, created] = await Eventos.findOrCreate({
    where: { nombre: eventoData.nombre },
    defaults: { ...eventoData, salonId, salonNombre },
  });

  if (!created) {
    throw new Error("El evento ya existe");
  }

  return {
    success: true,
    message: "Evento creado con éxito",
    evento: existingEvento,
  };
});

const modEventoController = errorHandler(async (id, data) => {
  const evento = await Eventos.findByPk(id);
  if (!evento) {
    throw new Error("Evento no encontrado");
  }

  const { salonId, salonNombre, ...eventoData } = data;

  // Verificar si el salón existe si se está actualizando
  if (salonId) {
    const salonExistente = await Salones.findByPk(salonId);
    if (!salonExistente) {
      throw new Error("No se encontró el salón especificado");
    }

    // Validar la capacidad si se está actualizando
    if (
      eventoData.capacidad &&
      eventoData.capacidad > salonExistente.capacidad
    ) {
      throw new Error("La capacidad del evento no puede superar la del salón");
    }
  }

  // Actualizar los datos del evento
  await evento.update({ ...eventoData, salonId, salonNombre });

  return { success: true, message: "Información actualizada correctamente" };
});

const deleteEventoLogicoController = errorHandler(async (id) => {
  const evento = await Eventos.findByPk(id);
  if (!evento) {
    throw new Error("Evento no encontrado");
  }

  await evento.update({ activo: false });

  return {
    success: true,
    message: "Evento desactivado correctamente",
  };
});

const deleteEventoFisicoController = errorHandler(async (id) => {
  const evento = await Eventos.findByPk(id);
  if (!evento) {
    throw new Error("Evento no encontrado");
  }

  // Transaction to ensure all operations succeed or fail together
  const transaction = await Eventos.sequelize.transaction();

  try {
    // Delete related records in junction table
    await SalonesEventos.destroy({
      where: { eventoId: id },
      transaction,
    });

    // Delete event
    await evento.destroy({ transaction });

    // Commit transaction
    await transaction.commit();

    return {
      success: true,
      message: "Evento eliminado permanentemente",
    };
  } catch (error) {
    // Rollback on error
    await transaction.rollback();
    throw error;
  }
});

const addSalonEventoController = errorHandler(
  async (salonId, eventoId, salonNombre) => {
    const [salon, evento] = await Promise.all([
      Salones.findByPk(salonId),
      Eventos.findByPk(eventoId),
    ]);

    if (!salon || !evento) {
      throw new Error("No se encontró el evento o el salón");
    }

    const [_, created] = await SalonesEventos.findOrCreate({
      where: { salonId, eventoId },
      defaults: { salonId, eventoId, salonNombre },
    });

    if (!created) {
      throw new Error("El evento ya está asociado a este salón");
    }

    return { success: true, message: "Salón agregado al evento exitosamente" };
  }
);

const deleteSalonEventoController = errorHandler(async (salonId, eventoId) => {
  const [salon, evento] = await Promise.all([
    Salones.findByPk(salonId),
    Eventos.findByPk(eventoId),
  ]);

  if (!salon || !evento) {
    throw new Error("No se encontró el evento o el salón");
  }

  const deleted = await SalonesEventos.destroy({
    where: {
      salonId,
      eventoId,
    },
  });

  if (deleted === 0) {
    throw new Error("No existe asociación entre este salón y evento");
  }

  return {
    success: true,
    message: "Salón eliminado del evento exitosamente",
  };
});

/* Graduados */

const addUserToEventController = async(userId, eventoId) => {
    try {
        const user = await Users.findByPk(userId, {
            include: [{
                model: Rols,
                attributes: ['rol']
            }],
            raw:true
        });
        const punto = await Eventos.findByPk(eventoId);
        if (!user) {
            throw new Error(`Usuario no encontrado`);
        }
        if (!user['Rol.rol'] || user['Rol.rol']?.toLowerCase() !== 'graduado') {
            throw new Error(`El usuario debe tener el rol de graduado para ser asignado al evento`);
        }
        if (!punto) {
            throw new Error(`Evento no encontrado`);
        }
        const [existingUserPunto, created] = await UsuariosEventos.findOrCreate({
            where: { userId, eventoId },
            defaults: { userId, eventoId }
        });
        if (!created) {
            throw new Error('El graduado ya está asociado a este evento');
        }

        return { success: true, message: 'Graduado agregado al evento exitosamente' };

    } catch (error) {
        throw new Error(`Error al agregar el graduado al evento: ${error.message}`);
    }
}

const removeUserFromEventController = async (userId, eventoId) => {
  try {
    const user = await Users.findByPk(userId, {
      include: [{ model: Rols, attributes: ['rol'] }],
    });
    if (!user) {
      throw new Error(`Usuario no encontrado`);
    }

    const evento = await Eventos.findByPk(eventoId);
    if (!evento) {
      throw new Error(`Evento no encontrado`);
    }

    const existingRelation = await UsuariosEventos.findOne({
      where: { userId, eventoId },
    });

    if (!existingRelation) {
      throw new Error(`El usuario no está asociado a este evento`);
    }

    await existingRelation.destroy();

    return {
      success: true,
      message: 'Usuario eliminado del evento exitosamente',
      data: { userId, eventoId },
    };

  } catch (error) {
    throw new Error(`Error al eliminar el usuario del evento: ${error.message}`);
  }
};

const getUsersByEventController = async (eventoId) => {
  try {
    const evento = await Eventos.findByPk(eventoId, {
      include: [
        {
          model: Users,
          attributes: ["id", "nombre", "apellido", "dni", "email", "rol"],
          through: { attributes: [] },/*
          include: [
            {
              model: Rols,
              attributes: ["rol"],
            },
          ],*/
        },
      ],
    });

    if (!evento) {
      throw new Error(`Evento no encontrado`);
    }

    return {
      success: true,
      message: "Usuarios asociados al evento",
      data: evento.Users,
    };
  } catch (error) {
    throw new Error(
      `Error al obtener los usuarios del evento: ${error.message}`
    );
  }
};


module.exports = {
  addEventoController,
  modEventoController,
  getEventoController,
  getEventosGridController,
  deleteEventoLogicoController,
  deleteEventoFisicoController,
  addSalonEventoController,
  deleteSalonEventoController,
  addUserToEventController,
  removeUserFromEventController,
  getUsersByEventController,
};
