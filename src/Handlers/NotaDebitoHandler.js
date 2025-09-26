const { crearNotaDebitoController, obtenerNotaDebitoIdController } = require('../Controllers/NotaDebitoController');
const { genericHandler } = require("../utils/Handler");

const crearNotaDebitoHandler = genericHandler(crearNotaDebitoController);
const obtenerNotaDebitoIdHandler = genericHandler((notaId) => obtenerNotaDebitoIdController(notaId));

module.exports = {
    crearNotaDebitoHandler,
    obtenerNotaDebitoIdHandler
};