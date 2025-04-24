const { Router } = require("express");
const {     checkRole,
  authMiddleware } = require('../middleware/protection');
const {
  getGridSalonesHandler,
  getSalonHandler,
  postSalonHandler,
  putSalonHandler,
  deleteSalonLogicalHandler,
  deleteSalonPhysicalHandler,
  restoreSalonHandler,
  toggleSalonStatusHandler,
} = require("../Handlers/SalonesHandler");
const routeSalon = Router();

routeSalon.get("/", getGridSalonesHandler);
routeSalon.get("/:id", checkRole(['admin','vendor']), getSalonHandler);
routeSalon.post("/", authMiddleware, checkRole(['admin','vendor']), postSalonHandler);
routeSalon.put("/:id", checkRole(['admin','vendor']), putSalonHandler);
routeSalon.delete("/logical/:id", checkRole(['admin','vendor']), deleteSalonLogicalHandler); // Borrado lógico
routeSalon.delete("/physical/:id", checkRole(['admin']), deleteSalonPhysicalHandler); // Borrado físico
routeSalon.put("/restore/:id", checkRole(['admin','vendor']), restoreSalonHandler); // Restaurar salón borrado lógicamente
routeSalon.put("/toggle-status/:id", checkRole(['admin','vendor']), toggleSalonStatusHandler); // Nueva ruta para cambiar el estado

module.exports = routeSalon;
