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
  updateUserRoleHandler,
} = require("../Handlers/UserHandler");

const routeUsers = Router();

routeUsers.post("/register", createUserHandler);
routeUsers.post("/create-user", crearUsuarioAdminHandler);
routeUsers.get("/perfil/:id", obtenerUserHandler);
routeUsers.get("/grid", obtenerUserGridHandler);
routeUsers.put("/perfil/:id", updateUserHandler);
routeUsers.post("/verificar", verificarUsuarioHandler);
routeUsers.delete("/delete/:id", deleteUserHandler);
routeUsers.put("/soft-delete/:id", softDeleteUserHandler);
routeUsers.get("/usuarios", obtenerUsuariosHandler);
routeUsers.put("/changepasword/:id", changePasswordHandler);
routeUsers.put("/change-role/:id", updateUserRoleHandler); // NUEVA RUTA

module.exports = routeUsers;
