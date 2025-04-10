const { Router } = require("express");
const {
  createUsserHandler,
  obtenerUserHandler,
  obtenerUserGridHandler,
  updateUserHandler,
  verificarUsuarioHandler, // <-- IMPORTA
} = require("../Handlers/UserHandler");

const routeUsers = Router();

routeUsers.post("/register", createUsserHandler);
routeUsers.get("/perfil/:id", obtenerUserHandler);
routeUsers.get("/grid", obtenerUserGridHandler);
routeUsers.put("/perfil/:id", updateUserHandler);
routeUsers.post("/verificar", verificarUsuarioHandler); // <-- NUEVA RUTA

module.exports = routeUsers;
