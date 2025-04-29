const {
  addEventoController,
  modEventoController,
  getEventoController,
  getEventosGridController,
  deleteEventoLogicoController, // Nuevo controller para borrado lógico
  deleteEventoFisicoController, // Nuevo controller para borrado físico
  addSalonEventoController,
  deleteSalonEventoController
} = require("../Controllers/EventoController");

const getEventoGridHandler = async (req, res) => {
  try {
    const eventos = await getEventosGridController();
    return res.status(200).json(eventos);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const getEventoHandler = async (req, res) => {
  const { id } = req.params;
  try {
    const evento = await getEventoController(id);
    return res.status(200).json(evento);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const addEventoHandler = async (req, res) => {
  const data = req.body;
  try {
    const result = await addEventoController(data);
    return res.status(201).json(result);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const modEventoHandler = async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  try {
    const result = await modEventoController(id, data);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// Nuevo handler para borrado lógico
const deleteEventoLogicHandler = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await deleteEventoLogicoController(id);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// Nuevo handler para borrado físico
const deleteEventoFisicoHandler = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await deleteEventoFisicoController(id);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
const addSalonEventoHandler = async (req, res) => {
  const {eventoId, salonId} = req.body
  try {
      const result = await addSalonEventoController(salonId, eventoId);
      return res.status(201).json(result);
  } catch (error) {
      return res.status(400).json({success:false, message: `Error interno del servidor: ${error.message}`});
  }
}
const deleteSalonEventoHandler = async (req, res) => {
  const { eventoId, salonId } = req.params
  try {
      const result = await deleteSalonEventoController(salonId, eventoId);
      return res.status(201).json(result);
  } catch (error) {
      return res.status(400).json({success:false, message: `Error interno del servidor: ${error.message}`});
  }
}

module.exports = {
  getEventoHandler,
  getEventoGridHandler,
  addEventoHandler,
  modEventoHandler,
  deleteEventoLogicHandler,
  deleteEventoFisicoHandler,
  addSalonEventoHandler,
  deleteSalonEventoHandler
};
