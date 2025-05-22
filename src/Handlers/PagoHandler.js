const {   
    crearPagoController,
    obtenerPagoController,
    cancelarPagoController 
} = require('../Controllers/PagoController')
const { genericHandler } = require('../utils/Handler')

const createPagoHandler = genericHandler(crearPagoController);

const obtenerPagoHandler = genericHandler((data) => {
    const pagoId = data.id || data;
    return obtenerPagoController(pagoId);
});

const cancelarPagoHandler = genericHandler((data) => {
    const { id: pagoId, motivo } = data;
    return cancelarPagoController(pagoId, motivo);
});

// ✅ Exportar TODOS los handlers
module.exports = { 
    createPagoHandler,
    obtenerPagoHandler,
    cancelarPagoHandler
}