const { Router } = require("express");
const {
    crearteOrderhandler,
} = require('../Handlers/OrdenHandler')
const routeOrden = Router();

routeOrden.post("/", crearteOrderhandler);

module.exports = routeOrden;