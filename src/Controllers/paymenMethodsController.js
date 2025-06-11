const { MetodoDePago } = require("../DbIndex");

// Crear un nuevo método de pago
const createPaymentMethod = async (req, res) => {
  try {
    const { tipo_de_cobro, impuesto, comision } = req.body

    // Validación básica
    if (!tipo_de_cobro) {
      return res.status(400).json({
        error: "El tipo de cobro es requerido",
      })
    }

    // Verificar si ya existe un método de pago con el mismo nombre
    const existingMethod = await MetodoDePago.findOne({
      where: {
        tipo_de_cobro: tipo_de_cobro,
      },
    })

    if (existingMethod) {
      return res.status(400).json({
        error: "Ya existe un método de pago con este nombre",
        data: existingMethod,
      })
    }

    const newPaymentMethod = await MetodoDePago.create({
      tipo_de_cobro,
      impuesto: impuesto || null,
      comision: comision || null,
    })

    res.status(201).json({
      message: "Método de pago creado exitosamente",
      data: newPaymentMethod,
    })
  } catch (error) {
    console.error("Error al crear método de pago:", error)
    res.status(500).json({
      error: "Error interno del servidor",
      details: error.message,
    })
  }
}

// Obtener todos los métodos de pago
const getAllPaymentMethods = async (req, res) => {
  try {
    const paymentMethods = await MetodoDePago.findAll({
      order: [["createdAt", "DESC"]],
    })

    res.status(200).json({
      message: "Métodos de pago obtenidos exitosamente",
      count: paymentMethods.length,
      data: paymentMethods,
    })
  } catch (error) {
    console.error("Error al obtener métodos de pago:", error)
    res.status(500).json({
      error: "Error interno del servidor",
      details: error.message,
    })
  }
}

// Obtener un método de pago por ID
const getPaymentMethodById = async (req, res) => {
  try {
    const { id } = req.params

    const paymentMethod = await MetodoDePago.findByPk(id)

    if (!paymentMethod) {
      return res.status(404).json({
        error: "Método de pago no encontrado",
      })
    }

    res.status(200).json({
      message: "Método de pago encontrado",
      data: paymentMethod,
    })
  } catch (error) {
    console.error("Error al obtener método de pago:", error)
    res.status(500).json({
      error: "Error interno del servidor",
      details: error.message,
    })
  }
}

// Actualizar un método de pago
const updatePaymentMethod = async (req, res) => {
  try {
    const { id } = req.params
    const { tipo_de_cobro, impuesto, comision } = req.body

    const paymentMethod = await MetodoDePago.findByPk(id)

    if (!paymentMethod) {
      return res.status(404).json({
        error: "Método de pago no encontrado",
      })
    }

    // Validación básica
    if (tipo_de_cobro !== undefined && !tipo_de_cobro) {
      return res.status(400).json({
        error: "El tipo de cobro no puede estar vacío",
      })
    }

    const updatedPaymentMethod = await paymentMethod.update({
      tipo_de_cobro: tipo_de_cobro || paymentMethod.tipo_de_cobro,
      impuesto: impuesto !== undefined ? impuesto : paymentMethod.impuesto,
      comision: comision !== undefined ? comision : paymentMethod.comision,
    })

    res.status(200).json({
      message: "Método de pago actualizado exitosamente",
      data: updatedPaymentMethod,
    })
  } catch (error) {
    console.error("Error al actualizar método de pago:", error)
    res.status(500).json({
      error: "Error interno del servidor",
      details: error.message,
    })
  }
}

// Eliminar un método de pago
const deletePaymentMethod = async (req, res) => {
  try {
    const { id } = req.params

    const paymentMethod = await MetodoDePago.findByPk(id)

    if (!paymentMethod) {
      return res.status(404).json({
        error: "Método de pago no encontrado",
      })
    }

    await paymentMethod.destroy()

    res.status(200).json({
      message: "Método de pago eliminado exitosamente",
      data: paymentMethod,
    })
  } catch (error) {
    console.error("Error al eliminar método de pago:", error)
    res.status(500).json({
      error: "Error interno del servidor",
      details: error.message,
    })
  }
}

module.exports = {
  createPaymentMethod,
  getAllPaymentMethods,
  getPaymentMethodById,
  updatePaymentMethod,
  deletePaymentMethod,
}
