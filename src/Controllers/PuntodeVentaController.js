const { Punto_de_venta, Users, Salones, UserPuntoVenta, Rols, SalonPunto } = require('../DbIndex');


const createPuntoDeVentaController = async (data) => {
  try {
    const [existingSalond, created] = await Punto_de_venta.findOrCreate({
      where: { nombre: data.nombre },
      defaults: data,
    });
    if (!created) {
      throw new Error(`No se pudo crear el punto de venta`);
    }
    return { success: true, message: "Punto de venta creado exitosamente" };
  } catch (error) {
    throw new Error(`${error.message}`);
  }
};

const putPuntoDeVentaController = async (id, data) => {
  try {
    // Validar campos requeridos
    const camposRequeridos = [
      "razon",
      "nombre",
      "direccion",
      "telefono",
      "cuit",
      "email",
    ];
    for (const campo of camposRequeridos) {
      if (!data[campo]) {
        throw new Error(`El campo ${campo} es requerido`);
      }
    }

    // Validar formato CUIT
    if (!/^\d{2}-\d{8}-\d{1}$/.test(data.cuit)) {
      throw new Error("El CUIT debe tener el formato 20-12345678-9");
    }

    // Validar email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      throw new Error("El email no tiene un formato válido");
    }

    const [updatedRows] = await Punto_de_venta.update(data, {
      where: { id },
      returning: true,
    });

    if (updatedRows === 0) {
      throw new Error(`No se encontró el punto de venta con ID ${id}`);
    }

    const puntoActualizado = await Punto_de_venta.findByPk(id);

    return {
      success: true,
      message: "Punto de venta actualizado exitosamente",
      data: puntoActualizado,
    };
  } catch (error) {
    console.error("Error en putPuntoDeVentaController:", error);
    throw new Error(error.message);
  }
};

const getPuntoDeVentaByIdController = async (id) => {
  try {
    const puntoDeVenta = await Punto_de_venta.findByPk(id, {
      attributes: [
        "razon",
        "cuit",
        "direccion",
        "nombre",
        "email",
        "telefono",
        "es_online",
        "isActive",
      ],
      include: [
        {
          model: Users,
          through: { attributes: [] },
          attributes: ["usuario"],
        },
      ],
    });
    if (!puntoDeVenta) {
      throw new Error(`Punto de venta no encontrado`);
    }
    return { success: true, data: puntoDeVenta };
  } catch (error) {
    throw new Error(`Error al obtener el punto de venta: ${error.message}`);
  }
};

const getAllPuntosDeVentaController = async () => {
  try {
    const puntosDeVenta = await Punto_de_venta.findAll({
      attributes: [
        "id",
        "razon",
        "nombre",
        "direccion",
        "telefono",
        "cuit",
        "email",
        "es_online",
        "isActive",
      ],
      include: [
        {
          model: Users,
          through: { attributes: [] },
          attributes: ["usuario"],
        },
      ],
    });
    return { success: true, data: puntosDeVenta };
  } catch (error) {
    throw new Error(`Error al obtener los puntos de venta: ${error.message}`);
  }
};

const addUserToPuntoDeVenta = async(userId, puntoId) => {
    try {
        const user = await Users.findByPk(userId, {
            include: [{
                model: Rols,
                attributes: ['rol']
            }],
            raw:true
        });
        const punto = await Punto_de_venta.findByPk(puntoId);
        if (!user) {
            throw new Error(`Usuario no encontrado`);
        }
        if (!user['Rol.rol'] || user['Rol.rol']?.toLowerCase() !== 'vendedor') {
            throw new Error(`El usuario debe tener el rol de vendedor para ser asignado a un punto de venta`);
        }
        if (!punto) {
            throw new Error(`Punto de venta no encontrado`);
        }
        const [existingUserPunto, created] = await UserPuntoVenta.findOrCreate({
            where: { userId, puntoId },
            defaults: { userId, puntoId }
        });
        if (!created) {
            throw new Error('El vendedor ya está asociado a este punto de venta');
        }

        return { success: true, message: 'Vendedor agregado al punto de venta exitosamente' };

    } catch (error) {
        throw new Error(`Error al agregar el vendedor al punto de venta: ${error.message}`);
    }
}


const addSalonPuntoController = async (puntoId, salonId) => {
    try {   
    const salon = await Salones.findByPk(salonId);
    const punto = await Punto_de_venta.findByPk(puntoId);
    if(!salon || !punto){
        throw new Error('No se encontro el punto de venta o el salon');
    }
    const [existingSalonPunto, created] = await SalonPunto.findOrCreate({
        where: {salonId, puntoId},
        defaults: {salonId, puntoId}
    })
    if(!created){
        throw new Error('El Salon ya esta asociado en un punto de venta');
    }
    return { success: true, message:'Salon agregado al punto de venta exitosamente'}
    } catch (error) {
        throw new Error(`Error al agregar el salon al punto de venta: ${error.message}`);
    }
}
const deletePuntoDeVentaController = async (id) => {
  const punto = await Punto_de_venta.findByPk(id);
  if (!punto) {
    throw new Error("Punto de venta no encontrado");
  }
  await punto.destroy();
  return { message: "Punto de venta eliminado físicamente con éxito" };
};

const softDeletePuntoDeVentaController = async (id, isActive) => {
  try {
    const puntoDeVenta = await Punto_de_venta.findByPk(id);
    if (!puntoDeVenta) {
      throw new Error("Punto de venta no encontrado");
    }

    const [updatedRows] = await Punto_de_venta.update(
      { isActive },
      { where: { id } }
    );

    if (updatedRows === 0) {
      throw new Error("No se pudo actualizar el estado del punto de venta");
    }

    const puntoActualizado = await Punto_de_venta.findByPk(id);

    return {
      success: true,
      message: `Punto de venta ${
        isActive ? "activado" : "desactivado"
      } correctamente`,
      data: puntoActualizado,
    };
  } catch (error) {
    console.error("Error en softDeletePuntoDeVentaController:", error);
    throw new Error(`Error al actualizar el estado: ${error.message}`);
  }
};

module.exports = {
    createPuntoDeVentaController,
    putPuntoDeVentaController,
    getPuntoDeVentaByIdController,
    addUserToPuntoDeVenta,
    addSalonPuntoController,
    getAllPuntosDeVentaController,
    deletePuntoDeVentaController,
    softDeletePuntoDeVentaController,
}
