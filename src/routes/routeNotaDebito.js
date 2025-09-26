const { Router } = require("express");
const 
{    crearNotaDebitoHandler,
    obtenerNotaDebitoIdHandler}
 = require('../Handlers/NotaDebitoHandler')
const routeNota = Router();

routeNota.post("/", crearNotaDebitoHandler);
routeNota.get("/:id", obtenerNotaDebitoIdHandler);

module.exports = routeNota;