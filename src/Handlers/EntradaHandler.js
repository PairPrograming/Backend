const {
  agregarEntradasController,
  obtenerEntradasController,
  deleteEntradaController,
  obtenerEntradaByIdController,
  actualizarEntradaController,
  agregarSubtipoController,
  actualizarSubtipoController,
  deleteSubtipoController,
} = require("../Controllers/EntradaController");
const { genericHandler } = require("../utils/Handler");

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
const actualizarEntradaHandler = genericHandler(actualizarEntradaController);
const agregarSubtipoHandler = genericHandler(agregarSubtipoController);
const actualizarSubtipoHandler = genericHandler(actualizarSubtipoController);
const deleteSubtipoHandler = genericHandler((id) =>
  deleteSubtipoController(id)
);

module.exports = {
  agregarEntradasHandler,
  obtenerEntradasHandler,
  obtenerEntradaByIdHandler,
  deleteEntradashandler,
  actualizarEntradaHandler,
  agregarSubtipoHandler,
  actualizarSubtipoHandler,
  deleteSubtipoHandler,
};
