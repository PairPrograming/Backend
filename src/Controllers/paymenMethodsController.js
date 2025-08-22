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

    let processedImpuesto = null
    if (impuesto) {
      // If impuesto is a string, try to parse it as JSON
      if (typeof impuesto === "string") {
        try {
          processedImpuesto = JSON.parse(impuesto)
        } catch (error) {
          return res.status(400).json({
            error: "El formato del impuesto es inválido. Debe ser un objeto JSON válido.",
          })
        }
      } else if (typeof impuesto === "object") {
        processedImpuesto = impuesto
      } else {
        return res.status(400).json({
          error: "El impuesto debe ser un objeto con el formato {cuotas: porcentaje}",
        })
      }

      // Validate that all keys are numbers and all values are valid percentages
      for (const [cuotas, porcentaje] of Object.entries(processedImpuesto)) {
        const cuotasNum = Number.parseInt(cuotas)
        const porcentajeNum = Number.parseFloat(porcentaje)

        if (isNaN(cuotasNum) || cuotasNum < 0) {
          return res.status(400).json({
            error: "Las cuotas deben ser números enteros no negativos",
          })
        }

        if (isNaN(porcentajeNum) || porcentajeNum < 0 || porcentajeNum > 100) {
          return res.status(400).json({
            error: "Los porcentajes de impuesto deben estar entre 0 y 100",
          })
        }
      }
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
      impuesto: processedImpuesto,
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

    // Validación básica
    if (!tipo_de_cobro) {
      return res.status(400).json({
        error: "El tipo de cobro es requerido",
      })
    }

    // Process impuesto similar to create method
    let processedImpuesto = null
    if (impuesto) {
      if (typeof impuesto === "string") {
        try {
          processedImpuesto = JSON.parse(impuesto)
        } catch (error) {
          return res.status(400).json({
            error: "El formato del impuesto es inválido. Debe ser un objeto JSON válido.",
          })
        }
      } else if (typeof impuesto === "object") {
        processedImpuesto = impuesto
      } else {
        return res.status(400).json({
          error: "El impuesto debe ser un objeto con el formato {cuotas: porcentaje}",
        })
      }

      // Validate format
      for (const [cuotas, porcentaje] of Object.entries(processedImpuesto)) {
        const cuotasNum = Number.parseInt(cuotas)
        const porcentajeNum = Number.parseFloat(porcentaje)

        if (isNaN(cuotasNum) || cuotasNum < 0) {
          return res.status(400).json({
            error: "Las cuotas deben ser números enteros no negativos",
          })
        }

        if (isNaN(porcentajeNum) || porcentajeNum < 0 || porcentajeNum > 100) {
          return res.status(400).json({
            error: "Los porcentajes de impuesto deben estar entre 0 y 100",
          })
        }
      }
    }

    const [updatedRowsCount] = await MetodoDePago.update(
      {
        tipo_de_cobro,
        impuesto: processedImpuesto,
        comision: comision || null,
      },
      {
        where: { Id: id },
      },
    )

    if (updatedRowsCount === 0) {
      return res.status(404).json({
        error: "Método de pago no encontrado",
      })
    }

    const updatedMethod = await MetodoDePago.findByPk(id)

    res.status(200).json({
      message: "Método de pago actualizado exitosamente",
      data: updatedMethod,
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
