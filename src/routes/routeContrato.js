const { Router } = require("express");

const {
    obtenerTodosContratoHandler
  } = require('../Handlers/ContratoHandler')
  const compareContratoHandler = require('../Handlers/CompareHandler')
const routeContrato = Router();

routeContrato.get("/", obtenerTodosContratoHandler);
routeContrato.post('/compare', compareContratoHandler)

module.exports = routeContrato;
