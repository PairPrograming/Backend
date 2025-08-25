const {
    crearContratoController,
    eliminarContratoController,
    actContratoController,
    obtenerContratoController,
    obtenerTodosContratoController
} = require("../Controllers/ContratoController")
const { genericHandler } = require('../utils/Handler')

const createContratoHandler = genericHandler(crearContratoController)
const eliminarContratoHandler = genericHandler(eliminarContratoController);
const obtenerContratoHandler = genericHandler((id) => obtenerContratoController(id));
const actContratoHandler = genericHandler(actContratoController);
const obtenerTodosContratoHandler = genericHandler(obtenerTodosContratoController);

module.exports = {
    createContratoHandler,
    eliminarContratoHandler,
    obtenerContratoHandler,
    actContratoHandler,
    obtenerTodosContratoHandler
}