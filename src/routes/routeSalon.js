const { Router } = require("express");
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
routeSalon.get("/:id", getSalonHandler);
routeSalon.post("/", postSalonHandler);
routeSalon.put("/:id", putSalonHandler);
routeSalon.delete("/logical/:id", deleteSalonLogicalHandler); // Borrado lógico
routeSalon.delete("/physical/:id", deleteSalonPhysicalHandler); // Borrado físico
routeSalon.put("/restore/:id", restoreSalonHandler); // Restaurar salón borrado lógicamente
routeSalon.put("/toggle-status/:id", toggleSalonStatusHandler); // Nueva ruta para cambiar el estado

module.exports = routeSalon;
