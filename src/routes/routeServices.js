const { Router } = require("express");
const { 
    createPagoHandler,
    obtenerPagoHandler,
    cancelarPagoHandler,
    getGridPagosHandler
} = require('../Handlers/PagoHandler')

const routeServices = Router();

routeServices.post("/pago", createPagoHandler);

routeServices.get("/pago/:id", obtenerPagoHandler);

routeServices.get("/pago/", getGridPagosHandler);

routeServices.put("/pago/:id/cancelar", cancelarPagoHandler);

module.exports = routeServices;