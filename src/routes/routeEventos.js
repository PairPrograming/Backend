const { Router } = require("express");
const {
  getEventoHandler,
  getEventoGridHandler,
  addEventoHandler,
  modEventoHandler,
  deleteEventoLogicHandler,
  deleteEventoFisicoHandler,
  addSalonEventoHandler,
  deleteSalonEventoHandler,
} = require("../Handlers/EventoHandler");

const routeEvento = Router();

// Apply middleware for all routes
routeEvento.use((req, res, next) => {
  // Set cache control headers
  res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
  res.header("Expires", "-1");
  res.header("Pragma", "no-cache");
  next();
});

// Get all events with optional filters
routeEvento.get("/", getEventoGridHandler);

// Get event by ID
routeEvento.get("/:id", getEventoHandler);

// Create a new event
routeEvento.post("/", addEventoHandler);

// Update an existing event
routeEvento.put("/:id", modEventoHandler);

// Logical delete of an event
routeEvento.patch("/:id", deleteEventoLogicHandler);

// Physical delete of an event
routeEvento.delete("/:id", deleteEventoFisicoHandler);

// Add a salon to an event
routeEvento.post("/esalon", addSalonEventoHandler);

// Remove a salon from an event
routeEvento.delete("/esalon/:eventoId/:salonId", deleteSalonEventoHandler);

module.exports = routeEvento;
