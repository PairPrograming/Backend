const { Router } = require("express");
const {
  createPuntoDeVentaHandler,
  putPuntoDeVentaHandler,
  getPuntoDeVentaByIdHandler,
  getAllPuntosDeVentaHandler,
  deletePuntoDeVentaHandler,
  softDeletePuntoDeVentaHandler,
  addVendedorPuntoHandler,
  addSalonPuntoHandler
} = require("../Handlers/PuntodeVentaHandler");
const routePunto = Router();

routePunto.post("/", createPuntoDeVentaHandler);
routePunto.put("/:id", putPuntoDeVentaHandler);
routePunto.get("/:id", getPuntoDeVentaByIdHandler);
routePunto.get("/", getAllPuntosDeVentaHandler);
routePunto.post("/addvendedor", addVendedorPuntoHandler);
routePunto.post("/addsalon", addSalonPuntoHandler);
routePunto.delete("/delete/:id", deletePuntoDeVentaHandler);
routePunto.put("/soft-delete/:id", softDeletePuntoDeVentaHandler);

module.exports = routePunto;
