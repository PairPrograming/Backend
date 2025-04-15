const { Router } = require("express");
const {
  createUserHandler,
  crearUsuarioAdminHandler,
  obtenerUserHandler,
  obtenerUserGridHandler,
  updateUserHandler,
  verificarUsuarioHandler,
  deleteUserHandler,
  softDeleteUserHandler,
  obtenerUsuariosHandler,
  changePasswordHandler,
} = require("../Handlers/UserHandler");

const routeUsers = Router();

routeUsers.post("/register", createUserHandler);
routeUsers.post("/create-user", crearUsuarioAdminHandler); // NUEVA RUTA
routeUsers.get("/perfil/:id", obtenerUserHandler);
routeUsers.get("/grid", obtenerUserGridHandler);
routeUsers.put("/perfil/:id", updateUserHandler);
routeUsers.post("/verificar", verificarUsuarioHandler);
routeUsers.delete("/delete/:id", deleteUserHandler);
routeUsers.put("/soft-delete/:id", softDeleteUserHandler);
routeUsers.get("/usuarios", obtenerUsuariosHandler);
routeUsers.put("/changepasword/:id", changePasswordHandler);

module.exports = routeUsers;
