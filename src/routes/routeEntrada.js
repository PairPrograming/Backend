const { Router } = require("express");
const {
  agregarEntradasHandler,
  obtenerEntradasHandler,
  deleteEntradashandler,
  actualizarEntradaHandler,
    agregarSubtipoHandler,
  actualizarSubtipoHandler,
} = require("../Handlers/EntradaHandler");
const routeEntrada = Router();

routeEntrada.get("/:id", obtenerEntradasHandler);
routeEntrada.delete("/:id", deleteEntradashandler);
routeEntrada.post("/", agregarEntradasHandler);
routeEntrada.put("/:id", actualizarEntradaHandler); // Ruta para actualizar
routeEntrada.post("/subtipo/", agregarSubtipoHandler);
routeEntrada.put("/subtipo/:id", actualizarSubtipoHandler); // Ruta para actualizar

module.exports = routeEntrada;
