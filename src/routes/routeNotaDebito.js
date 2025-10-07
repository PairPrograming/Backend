const { Router } = require("express");
const 
{    crearNotaDebitoHandler,
    obtenerNotaDebitoIdHandler,
obtenerNotaDebitoHandler
}
 = require('../Handlers/NotaDebitoHandler')
const routeNota = Router();

routeNota.post("/", crearNotaDebitoHandler);
routeNota.get("/:id", obtenerNotaDebitoIdHandler);
routeNota.get("/", obtenerNotaDebitoHandler);

module.exports = routeNota;