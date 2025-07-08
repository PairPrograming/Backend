const { Router } = require("express");
const {
    createContratoHandler, eliminarContratoHandler, 
    obtenerContratoHandler, actContratoHandler
} = require('../Handlers/ContratoHandler')
const routeContrato = Router();

routeContrato.post("/", createContratoHandler);
routeContrato.get ("/:id", obtenerContratoHandler);
routeContrato.delete ("/:id", eliminarContratoHandler);
routeContrato.put("/:id", actContratoHandler)

module.exports = routeContrato;