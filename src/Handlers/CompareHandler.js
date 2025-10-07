const compareContratoController = require('../Controllers/CompareController')
const { genericHandler } = require("../utils/Handler");

const compareContratoHandler = genericHandler(compareContratoController)

module.exports = compareContratoHandler;