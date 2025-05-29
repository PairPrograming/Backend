const {
  crearOrdenConDetalles,
  getOrdenesController,
  getGridOrdenesController,
  deleteOrderController
} = require("../Controllers/OrdenesController");
const { genericHandler } = require("../utils/Handler");

const crearteOrderhandler = genericHandler(crearOrdenConDetalles);
const getOrdenDetalles = genericHandler((ordenId) => getOrdenesController(ordenId));
const getGridOrdenesHandler = genericHandler((data) => {return getGridOrdenesController(data);});
const deleteOrderHandler = genericHandler((ordenId) => deleteOrderController(ordenId));
module.exports = { crearteOrderhandler, getOrdenDetalles, getGridOrdenesHandler, deleteOrderHandler };
