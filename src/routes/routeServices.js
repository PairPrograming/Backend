const { Router } = require("express");
const {
    procesarPagoHandler
} = require('../utils/servicePayment')
const { createPagoHandler } = require('../Handlers/PagoHandler')
const routeServices = Router();

routeServices.post("/", procesarPagoHandler);

routeServices.post("/pago", createPagoHandler);

module.exports = routeServices;