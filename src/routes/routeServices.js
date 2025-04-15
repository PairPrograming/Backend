const { Router } = require("express");
const {
    procesarPagoHandler
} = require('../utils/servicePayment')
const routeServices = Router();

routeServices.post("/", procesarPagoHandler);

module.exports = routeServices;