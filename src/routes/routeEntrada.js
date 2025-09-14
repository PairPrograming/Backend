const { Router } = require("express");
const {
  agregarEntradasHandler,
  obtenerEntradasHandler,
  deleteEntradashandler,
  obtenerEntradaByIdHandler,
  actualizarEntradaHandler,
    agregarSubtipoHandler,
  actualizarSubtipoHandler,
} = require("../Handlers/EntradaHandler");
const routeEntrada = Router();

routeEntrada.get("/:id", obtenerEntradasHandler);
routeEntrada.get("/:entradaid/entradas", obtenerEntradaByIdHandler);
routeEntrada.delete("/:id", deleteEntradashandler);
routeEntrada.post("/", agregarEntradasHandler);
routeEntrada.put("/", actualizarEntradaHandler); // Ruta para actualizar
routeEntrada.post("/subtipo/", agregarSubtipoHandler);
routeEntrada.put("/subtipo/:id", actualizarSubtipoHandler); // Ruta para actualizar

module.exports = routeEntrada;
