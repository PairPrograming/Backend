const { Router } = require("express");
const { 
    createPagoHandler,
    obtenerPagoHandler,
    cancelarPagoHandler
} = require('../Handlers/PagoHandler')

const routeServices = Router();

routeServices.post("/pago", createPagoHandler);

routeServices.get("/pago/:id", obtenerPagoHandler);

routeServices.put("/pago/:id/cancelar", cancelarPagoHandler);

module.exports = routeServices;