const {
  agregarEntradasController,
  obtenerEntradasController,
  deleteEntradaController,
  obtenerEntradaByIdController,
  actualizarEntradaController, 
  agregarSubtipoController,
  actualizarSubtipoController,
} = require("../Controllers/EntradaController");
const { genericHandler } = require("../utils//Handler");

const agregarEntradasHandler = genericHandler(agregarEntradasController);
const obtenerEntradasHandler = genericHandler((eventoId) =>
  obtenerEntradasController(eventoId)
);
const obtenerEntradaByIdHandler = genericHandler((id) =>
  obtenerEntradaByIdController(id)
);
const deleteEntradashandler = genericHandler((id) =>
  deleteEntradaController(id)
);
const actualizarEntradaHandler = genericHandler(actualizarEntradaController); // Handler para PUT
const agregarSubtipoHandler = genericHandler(agregarSubtipoController);
const actualizarSubtipoHandler = genericHandler(actualizarSubtipoController);

module.exports = {
  agregarEntradasHandler,
  obtenerEntradasHandler,
  obtenerEntradaByIdHandler,
  deleteEntradashandler,
  actualizarEntradaHandler, // Exporta el nuevo handler
  agregarSubtipoHandler,
  actualizarSubtipoHandler,
};
