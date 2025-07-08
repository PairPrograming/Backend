const {
    crearContratoController,
    eliminarContratoController,
    actContratoController,
    obtenerContratoController
} = require("../Controllers/ContratoController")
const { genericHandler } = require('../utils/Handler')

const createContratoHandler = genericHandler(crearContratoController)
const eliminarContratoHandler = genericHandler(eliminarContratoController);
const obtenerContratoHandler = genericHandler((id) => obtenerContratoController(id));
const actContratoHandler = genericHandler(actContratoController);

module.exports = {
    createContratoHandler,
    eliminarContratoHandler,
    obtenerContratoHandler,
    actContratoHandler
}