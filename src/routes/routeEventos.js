const { Router } = require("express");
const {
    getEventoHandler,
    getEventoGridHandler,
    addEventoHandler,
    modEventoHandler
} = require('../Handlers/EventoHandler')
const routeEvento = Router();

routeEvento.get("/:id", getEventoHandler);
routeEvento.get("/", getEventoGridHandler);
routeEvento.post("/", addEventoHandler);
routeEvento.put("/:id", modEventoHandler);

module.exports = routeEvento;