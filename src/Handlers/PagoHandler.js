const {   
    crearPagoController,
    obtenerPagoController,
    cancelarPagoController,
    getGridPagosController 
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
const getGridPagosHandler = genericHandler((data) => {return getGridPagosController(data);})

// ✅ Exportar TODOS los handlers
module.exports = { 
    createPagoHandler,
    obtenerPagoHandler,
    cancelarPagoHandler,
    getGridPagosHandler
}