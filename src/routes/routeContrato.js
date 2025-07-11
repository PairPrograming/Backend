const { Router } = require("express");

const {
    obtenerTodosContratoHandler
  } = require('../Handlers/ContratoHandler')
const routeContrato = Router();

routeContrato.get("/", obtenerTodosContratoHandler);

module.exports = routeContrato;
