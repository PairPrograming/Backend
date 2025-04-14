const { Router } = require("express");
const {
    getGridSalonesHandler,
    getSalonHandler,
    postSalonHandler,
    putSalonHandler,
    addEventoSalonHandler
} = require('../Handlers/SalonesHandler')
const routeSalon = Router();

routeSalon.get("/", getGridSalonesHandler);
routeSalon.get("/:id", getSalonHandler);
routeSalon.post("/", postSalonHandler);
routeSalon.put("/:id", putSalonHandler);
routeSalon.post("/addevento", addEventoSalonHandler);

module.exports = routeSalon;