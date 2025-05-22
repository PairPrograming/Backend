const {
  crearOrdenConDetalles,
  getOrdenesController,
} = require("../Controllers/OrdenesController");
const { genericHandler } = require("../utils/Handler");

const crearteOrderhandler = genericHandler(crearOrdenConDetalles);
const getOrdenDetalles = genericHandler((ordenId) => getOrdenesController(ordenId));

module.exports = { crearteOrderhandler, getOrdenDetalles };
