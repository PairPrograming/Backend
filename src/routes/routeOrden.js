const { Router } = require("express");
const {
    crearteOrderhandler, getOrdenDetalles
} = require('../Handlers/OrdenHandler')
const routeOrden = Router();

routeOrden.post("/", crearteOrderhandler);
routeOrden.get("/:id", getOrdenDetalles);

module.exports = routeOrden;