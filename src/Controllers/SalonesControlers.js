const { Salones } = require("../DbIndex");
const { Op } = require("sequelize");

const getGridSalonesController = async (
  search,
  page,
  limit,
  includeDeleted = false
) => {
  try {
    const whereClause = {};

    // Aplicar filtro de búsqueda si se proporciona
    if (search) {
      whereClause[Op.or] = [
        { salon: { [Op.like]: `%${search}%` } },
        { nombre: { [Op.like]: `%${search}%` } },
        { cuit: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }

    // A menos que se solicite explícitamente, excluir registros eliminados lógicamente
    if (!includeDeleted) {
      whereClause.deletedAt = null;
    }

    // Calcular paginación
    const offset = (page - 1) * limit;

    const result = await Salones.findAndCountAll({
      attributes: [
        "Id",
        "salon",
        "cuit",
        "nombre",
        "email",
        "whatsapp",
        "deletedAt",
        "estatus",
        "capacidad",
      ],
      where: whereClause,
      limit: parseInt(limit),
      offset: offset,
      paranoid: includeDeleted ? false : true, // Incluir registros eliminados si se solicita
    });

    return {
      success: true,
      data: result.rows,
      pagination: {
        total: result.count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(result.count / limit),
      },
    };
  } catch (error) {
    throw new Error(
      `Error al obtener la información de los salones: ${error.message}`
    );
  }
};

const getSalonController = async (id) => {
  try {
    const result = await Salones.findByPk(id, {
      attributes: [
        "Id",
        "salon",
        "capacidad",
        "cuit",
        "email",
        "nombre",
        "whatsapp",
        "MercadopagoKeyP",
        "Mercadopago",
        "cbu",
        "alias",
        "estatus",
        "image",
        "deletedAt",
      ],
      paranoid: false, // Incluir registros eliminados también
    });
    if (!result) {
      throw new Error("Salon no encontrado");
    }
    return { success: true, data: result };
  } catch (error) {
    throw new Error(`Error al obtener información: ${error.message}`);
  }
};

const postSalonController = async (data) => {
  try {
    // Validar campos requeridos
    const requiredFields = ["salon", "nombre", "cuit", "email", "whatsapp"];
    for (const field of requiredFields) {
      if (!data[field]) {
        throw new Error(`El campo ${field} es requerido`);
      }
    }

    // Verificar si ya existe un salón con el mismo nombre (incluyendo borrados lógicamente)
    const existingSalon = await Salones.findOne({
      where: { salon: data.salon },
      paranoid: false,
    });

    if (existingSalon) {
      throw new Error(
        "Ya existe un salón con este nombre (puede estar eliminado)"
      );
    }

    // Validar formato de CUIT
    const cuitPattern = /^\d{2}-\d{8}-\d{1}$/;
    if (!cuitPattern.test(data.cuit)) {
      throw new Error("El formato del CUIT debe ser XX-XXXXXXXX-X");
    }

    // Validar formato de email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(data.email)) {
      throw new Error("El formato del correo electrónico es inválido");
    }

    // Crear el salón
    const newSalon = await Salones.create(data);
    return {
      success: true,
      message: "Salón creado exitosamente",
      salonId: newSalon.Id,
    };
  } catch (error) {
    throw new Error(`${error.message}`);
  }
};

const putSalonController = async (id, data) => {
  try {
    const salon = await Salones.findByPk(id);
    if (!salon) {
      throw new Error("No se encontró el salón");
    }

    // Si está cambiando el nombre, verificar que no exista otro salón con ese nombre
    if (data.salon && data.salon !== salon.salon) {
      const existingSalon = await Salones.findOne({
        where: { salon: data.salon },
        paranoid: false, // Verificar todos los registros, incluidos los eliminados
      });

      if (existingSalon && existingSalon.Id !== id) {
        throw new Error("Ya existe otro salón con este nombre");
      }
    }

    // Validar formato de CUIT si se está actualizando
    if (data.cuit) {
      const cuitPattern = /^\d{2}-\d{8}-\d{1}$/;
      if (!cuitPattern.test(data.cuit)) {
        throw new Error("El formato del CUIT debe ser XX-XXXXXXXX-X");
      }
    }

    // Validar formato de email si se está actualizando
    if (data.email) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(data.email)) {
        throw new Error("El formato del correo electrónico es inválido");
      }
    }

    const [updateRows] = await Salones.update(data, { where: { Id: id } });
    if (updateRows === 0) {
      throw new Error("No hubo cambios en la información");
    }
    return { success: true, message: "Información actualizada correctamente" };
  } catch (error) {
    throw new Error(
      `Error al actualizar la información del salón: ${error.message}`
    );
  }
};

// Nuevo controlador para borrado lógico
const deleteSalonLogicalController = async (id) => {
  try {
    const salon = await Salones.findByPk(id);
    if (!salon) {
      throw new Error("No se encontró el salón o ya fue eliminado");
    }

    await Salones.destroy({ where: { Id: id } }); // Esto realiza un borrado lógico

    return {
      success: true,
      message: "Salón eliminado lógicamente con éxito",
    };
  } catch (error) {
    throw new Error(`Error al eliminar lógicamente el salón: ${error.message}`);
  }
};

// Nuevo controlador para borrado físico
const deleteSalonPhysicalController = async (id) => {
  try {
    const salon = await Salones.findByPk(id, { paranoid: false });
    if (!salon) {
      throw new Error("No se encontró el salón");
    }

    await Salones.destroy({
      where: { Id: id },
      force: true, // Esto fuerza un borrado físico
    });

    return {
      success: true,
      message: "Salón eliminado físicamente con éxito",
    };
  } catch (error) {
    throw new Error(`Error al eliminar físicamente el salón: ${error.message}`);
  }
};

// Nuevo controlador para restaurar un salón eliminado lógicamente
const restoreSalonController = async (id) => {
  try {
    const salon = await Salones.findByPk(id, { paranoid: false });
    if (!salon) {
      throw new Error("No se encontró el salón");
    }

    if (!salon.deletedAt) {
      throw new Error("El salón no está eliminado lógicamente");
    }

    await Salones.restore({ where: { Id: id } });

    return {
      success: true,
      message: "Salón restaurado con éxito",
    };
  } catch (error) {
    throw new Error(`Error al restaurar el salón: ${error.message}`);
  }
};

// Nuevo controlador para cambiar el estado del salón (activo/inactivo)
const toggleSalonStatusController = async (id, isActive) => {
  try {
    const salon = await Salones.findByPk(id);
    if (!salon) {
      throw new Error("No se encontró el salón");
    }

    // Actualizar el estado
    await salon.update({ estatus: isActive });

    return {
      success: true,
      message: isActive
        ? "Salón activado exitosamente"
        : "Salón desactivado exitosamente",
    };
  } catch (error) {
    throw new Error(`Error al cambiar el estado del salón: ${error.message}`);
  }
};

module.exports = {
  getGridSalonesController,
  getSalonController,
  postSalonController,
  putSalonController,
  deleteSalonLogicalController,
  deleteSalonPhysicalController,
  restoreSalonController,
  toggleSalonStatusController,
};
