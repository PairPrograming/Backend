const { Router } = require("express");
const {
  createPuntoDeVentaHandler,
  putPuntoDeVentaHandler,
  getPuntoDeVentaByIdHandler,
  addVendedorPuntoHandler,
  getAllPuntosDeVentaHandler,
  deletePuntoDeVentaHandler,
  softDeletePuntoDeVentaHandler,
} = require("../Handlers/PuntodeVentaHandler");
const routePunto = Router();

routePunto.post("/", createPuntoDeVentaHandler);
routePunto.put("/:id", putPuntoDeVentaHandler);
routePunto.get("/:id", getPuntoDeVentaByIdHandler);
routePunto.get("/", getAllPuntosDeVentaHandler);
routePunto.post("/addvendedor", addVendedorPuntoHandler);
routePunto.delete("/delete/:id", deletePuntoDeVentaHandler);
routePunto.put("/soft-delete/:id", softDeletePuntoDeVentaHandler);

module.exports = routePunto;
