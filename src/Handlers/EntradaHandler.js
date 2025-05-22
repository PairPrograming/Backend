const {
  agregarEntradasController,
  obtenerEntradasController,
  deleteEntradaController,
  actualizarEntradaController, // Agrega el controlador para PUT
} = require("../Controllers/EntradaController");
const { genericHandler } = require("../utils//Handler");

const agregarEntradasHandler = genericHandler(agregarEntradasController);
const obtenerEntradasHandler = genericHandler((eventoId) =>
  obtenerEntradasController(eventoId)
);
const deleteEntradashandler = genericHandler((id) =>
  deleteEntradaController(id)
);
const actualizarEntradaHandler = genericHandler(actualizarEntradaController); // Handler para PUT

module.exports = {
  agregarEntradasHandler,
  obtenerEntradasHandler,
  deleteEntradashandler,
  actualizarEntradaHandler, // Exporta el nuevo handler
};
