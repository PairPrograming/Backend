const { Router } = require("express");
const {
  getEventoHandler,
  getEventoGridHandler,
  addEventoHandler,
  modEventoHandler,
  deleteEventoLogicHandler, // Nuevo handler para borrado lógico
  deleteEventoFisicoHandler, // Nuevo handler para borrado físico
  addSalonEventoHandler, //asociar salon a evenbt desde el modal de el evento
  deleteSalonEventoHandler //eliminar el salon del evento odesde el modal
} = require("../Handlers/EventoHandler");
const { route } = require("./routeSalon");

const routeEvento = Router();

routeEvento.get("/:id", getEventoHandler);
routeEvento.get("/", getEventoGridHandler);
routeEvento.post("/", addEventoHandler);
routeEvento.put("/:id", modEventoHandler);
routeEvento.patch("/:id", deleteEventoLogicHandler); // Ruta para borrado lógico
routeEvento.delete("/:id", deleteEventoFisicoHandler); // Ruta para borrado físico
routeEvento.post("/esalon/", addSalonEventoHandler);
routeEvento.delete("/:eventoId/:salonId", deleteSalonEventoHandler);
module.exports = routeEvento;
