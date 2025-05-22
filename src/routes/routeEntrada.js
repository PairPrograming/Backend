const { Router } = require("express");
const {
  agregarEntradasHandler,
  obtenerEntradasHandler,
  deleteEntradashandler,
  actualizarEntradaHandler, // Importa el handler PUT
} = require("../Handlers/EntradaHandler");
const routeEntrada = Router();

routeEntrada.get("/:id", obtenerEntradasHandler);
routeEntrada.delete("/:id", deleteEntradashandler);
routeEntrada.post("/", agregarEntradasHandler);
routeEntrada.put("/:id", actualizarEntradaHandler); // Ruta para actualizar

module.exports = routeEntrada;
