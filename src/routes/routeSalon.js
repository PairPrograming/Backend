const { Router } = require("express");
const {
    getGridSalonesHandler,
    getSalonHandler,
    postSalonHandler,
    putSalonHandler,
} = require('../Handlers/SalonesHandler')
const routeSalon = Router();

routeSalon.get("/", getGridSalonesHandler);
routeSalon.get("/:id", getSalonHandler);
routeSalon.post("/", postSalonHandler);
routeSalon.put("/:id", putSalonHandler);

module.exports = routeSalon;