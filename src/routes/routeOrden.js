const { Router } = require("express");
const {
    crearteOrderhandler, getOrdenDetalles,
     getGridOrdenesHandler, deleteOrderHandler
} = require('../Handlers/OrdenHandler')
const routeOrden = Router();

routeOrden.post("/", crearteOrderhandler);
routeOrden.get("/:id", getOrdenDetalles);
routeOrden.get("/", getGridOrdenesHandler);
routeOrden.delete('/:id', deleteOrderHandler);
//routeOrden.put("/:id");

module.exports = routeOrden;