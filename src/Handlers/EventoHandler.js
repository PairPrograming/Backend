const {
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
} = require("../Controllers/EventoController");
const { genericHandler } = require("../utils//Handler");

const addUserToEventHandler = genericHandler(addUserToEventController);
const removeUserFromEventHandler = genericHandler( (id) => 
  removeUserFromEventController(id)
)
const getUsersByEventHandler = genericHandler((id) => getUsersByEventController(id))

// Common response handler
const responseHandler = (fn) => async (req, res) => {
  try {
    const result = await fn(req);
    return res.status(result.status || 200).json(result.data);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    return res.status(error.status || 400).json({
      success: false,
      message: error.message,
    });
  }
};

const getEventoGridHandler = responseHandler(async (req) => {
  const filters = {
    activo:
      req.query.activo === "true"
        ? true
        : req.query.activo === "false"
        ? false
        : undefined,
    fecha: req.query.fecha,
  };

  const result = await getEventosGridController(filters);
  return { data: result };
});

const getEventoHandler = responseHandler(async (req) => {
  const { id } = req.params;
  const result = await getEventoController(id);
  return { data: result };
});

const addEventoHandler = responseHandler(async (req) => {
  const {
    nombre,
    fecha,
    duracion,
    capacidad,
    activo,
    image,
    salonId,
    salonNombre, // Nuevo campo agregado
    descripcion,
  } = req.body;

  const result = await addEventoController({
    nombre,
    fecha,
    duracion,
    capacidad,
    activo,
    image,
    salonId,
    salonNombre, // Asegurarse de enviar el nombre del salón correctamente
    descripcion,
  });

  return { data: result, status: 201 };
});

const modEventoHandler = responseHandler(async (req) => {
  const { id } = req.params;
  const result = await modEventoController(id, req.body);
  return { data: result };
});

const deleteEventoLogicHandler = responseHandler(async (req) => {
  const { id } = req.params;
  const result = await deleteEventoLogicoController(id);
  return { data: result };
});

const deleteEventoFisicoHandler = responseHandler(async (req) => {
  const { id } = req.params;
  const result = await deleteEventoFisicoController(id);
  return { data: result };
});

const addSalonEventoHandler = responseHandler(async (req) => {
  const { eventoId, salonId, salonNombre } = req.body; // Incluye salonNombre
  const result = await addSalonEventoController(salonId, eventoId, salonNombre);
  return { data: result, status: 201 };
});

const deleteSalonEventoHandler = responseHandler(async (req) => {
  const { eventoId, salonId } = req.params;
  const result = await deleteSalonEventoController(salonId, eventoId);
  return { data: result };
});

module.exports = {
  getEventoHandler,
  getEventoGridHandler,
  addEventoHandler,
  modEventoHandler,
  deleteEventoLogicHandler,
  deleteEventoFisicoHandler,
  addSalonEventoHandler,
  deleteSalonEventoHandler,
  addUserToEventHandler,
  removeUserFromEventHandler,
  getUsersByEventHandler
};
