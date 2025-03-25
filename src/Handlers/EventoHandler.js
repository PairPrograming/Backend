const {
  addEventoController,
  modEventoController,
  getEventoController,
  getEventosGridController,
} = require("../Controllers/EventoController");

const getEventoGridHandler = async (req, res) => {
  try {
    const eventos = await getEventosGridController();
    return res.status(201).json(eventos);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const getEventoHandler = async (req, res) => {
  const { id } = req.params;
  try {
    const evento = await getEventoController(id);
    return res.status(201).json(evento);
  } catch (error) {
    return res.status(400), json({ message: error.message });
  }
};

module.exports = {
    getEventoHandler,
    getEventoGridHandler,
}
