const { Router } = require("express");
const {
  createUsserHandler,
  obtenerUserHandler,
  obtenerUserGridHandler,
  updateUserHandler,
  verificarUsuarioHandler,
  deleteUserHandler,
  softDeleteUserHandler,
  obtenerUsuariosHandler, // <-- Nueva ruta para obtener usuarios filtrados
} = require("../Handlers/UserHandler");

const routeUsers = Router();

routeUsers.post("/register", createUsserHandler);
routeUsers.get("/perfil/:id", obtenerUserHandler);
routeUsers.get("/grid", obtenerUserGridHandler);
routeUsers.put("/perfil/:id", updateUserHandler);
routeUsers.post("/verificar", verificarUsuarioHandler);
routeUsers.delete("/delete/:id", deleteUserHandler);
routeUsers.put("/soft-delete/:id", softDeleteUserHandler);
routeUsers.get("/usuarios", obtenerUsuariosHandler); // <-- Nueva ruta para obtener usuarios filtrados

module.exports = routeUsers;
