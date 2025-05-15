const {
    agregarEntradasController, obtenerEntradasController,
    deleteEntradaController
} = require('../Controllers/EntradaController')
const { genericHandler } = require('../utils//Handler');

const agregarEntradasHandler = genericHandler(agregarEntradasController);
const obtenerEntradasHandler = genericHandler((eventoId) => obtenerEntradasController(eventoId));
const deleteEntradashandler = genericHandler((id) => deleteEntradaController(id));

module.exports = {
    agregarEntradasHandler,
    obtenerEntradasHandler,
    deleteEntradashandler
};