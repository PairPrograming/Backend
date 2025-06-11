const { Router } = require("express")
const {
  createPaymentMethod,
  getAllPaymentMethods,
  getPaymentMethodById,
  updatePaymentMethod,
  deletePaymentMethod,
} = require("../Controllers/paymenMethodsController")

const routePaymentMethod = Router()

// Crear un nuevo método de pago
routePaymentMethod.post("/", createPaymentMethod)

// Obtener todos los métodos de pago
routePaymentMethod.get("/", getAllPaymentMethods)

// Obtener un método de pago por ID
routePaymentMethod.get("/:id", getPaymentMethodById)

// Actualizar un método de pago
routePaymentMethod.put("/:id", updatePaymentMethod)

// Eliminar un método de pago
routePaymentMethod.delete("/delete/:id", deletePaymentMethod)

module.exports = routePaymentMethod
