const { crearOrdenConDetalles } = require('../Controllers/OrdenesController')
const { genericHandler } = require('../utils/Handler')

const crearteOrderhandler = genericHandler(crearOrdenConDetalles)

module.exports = { crearteOrderhandler }