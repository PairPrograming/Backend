const { Router } = require("express");
const {
    procesarPagoHandler
} = require('../utils/servicePayment')
const { procesarPagoRealHandler } = require('../utils/realCardPaymentService');
const {diagnosticoHandler} = require("../utils/diagnosticoService")
const routeServices = Router();

routeServices.post("/", procesarPagoHandler);
// Nueva ruta para pagos con tarjeta real (genera token automáticamente)
routeServices.post("/real", procesarPagoRealHandler);
routeServices.get("/diagnostico/:salonId", diagnosticoHandler);

module.exports = routeServices;