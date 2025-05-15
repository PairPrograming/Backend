const { Router } = require("express");
const {
    agregarEntradasHandler, obtenerEntradasHandler, deleteEntradashandler
} = require('../Handlers/EntradaHandler')
const routeEntrada = Router();

routeEntrada.get("/:id", obtenerEntradasHandler);
routeEntrada.delete("/:id", deleteEntradashandler);
routeEntrada.post("/", agregarEntradasHandler);

module.exports = routeEntrada;