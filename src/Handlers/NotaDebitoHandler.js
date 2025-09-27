const { crearNotaDebitoController, obtenerNotaDebitoIdController,
    obtenerNotaDebitoController
 } = require('../Controllers/NotaDebitoController');
const { genericHandler } = require("../utils/Handler");

const crearNotaDebitoHandler = genericHandler(crearNotaDebitoController);
const obtenerNotaDebitoIdHandler = genericHandler((notaId) => obtenerNotaDebitoIdController(notaId));
const obtenerNotaDebitoHandler = genericHandler(obtenerNotaDebitoController);

module.exports = {
    crearNotaDebitoHandler,
    obtenerNotaDebitoIdHandler,
    obtenerNotaDebitoHandler
};