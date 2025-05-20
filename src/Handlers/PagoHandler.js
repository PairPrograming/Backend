const { crearPago } = require('../Controllers/PagoController')
const { genericHandler } = require('../utils/Handler')

const createPagoHandler = genericHandler(crearPago);

module.exports = { createPagoHandler }