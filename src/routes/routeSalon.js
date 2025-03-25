const { Router } = require("express");
const {
    getGridSalonesHandler,
    getSalonHandler,
    postSalonHandler,
    putSalonHandler,
    postUserSalonHandler
} = require('../Handlers/SalonesHandler')
const routeSalon = Router();

routeSalon.get("/", getGridSalonesHandler);
routeSalon.get("/:id", getSalonHandler);
routeSalon.post("/", postSalonHandler);
routeSalon.post("/adduser", postUserSalonHandler);
routeSalon.put("/:id", putSalonHandler);


module.exports = routeSalon;