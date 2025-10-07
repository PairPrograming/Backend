const { Router } = require("express");
const {
  agregarEntradasHandler,
  obtenerEntradasHandler,
  deleteEntradashandler,
  obtenerEntradaByIdHandler,
  actualizarEntradaHandler,
  agregarSubtipoHandler,
  actualizarSubtipoHandler,
  deleteSubtipoHandler,
} = require("../Handlers/EntradaHandler");
const routeEntrada = Router();

routeEntrada.get("/:id", obtenerEntradasHandler);
routeEntrada.get("/:entradaid/entradas", obtenerEntradaByIdHandler);
routeEntrada.delete("/:id", deleteEntradashandler);
routeEntrada.post("/", agregarEntradasHandler);
routeEntrada.put("/", actualizarEntradaHandler);
routeEntrada.post("/subtipo/", agregarSubtipoHandler);
routeEntrada.put("/subtipo/:id", actualizarSubtipoHandler);
routeEntrada.delete("/subtipo/:id", deleteSubtipoHandler);

module.exports = routeEntrada;
