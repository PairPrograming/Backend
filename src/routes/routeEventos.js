const { Router } = require("express");
const {
  getEventoHandler,
  getEventoGridHandler,
  addEventoHandler,
  modEventoHandler,
  deleteEventoLogicHandler, // Nuevo handler para borrado lógico
  deleteEventoFisicoHandler, // Nuevo handler para borrado físico
} = require("../Handlers/EventoHandler");

const routeEvento = Router();

routeEvento.get("/:id", getEventoHandler);
routeEvento.get("/", getEventoGridHandler);
routeEvento.post("/", addEventoHandler);
routeEvento.put("/:id", modEventoHandler);
routeEvento.patch("/:id", deleteEventoLogicHandler); // Ruta para borrado lógico
routeEvento.delete("/:id", deleteEventoFisicoHandler); // Ruta para borrado físico

module.exports = routeEvento;
