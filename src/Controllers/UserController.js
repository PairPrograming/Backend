const { Users } = require("../DbIndex");
const { Op } = require("sequelize");
const bcrypt = require("bcrypt");

// CONTROLLER
const createUserController = async (data) => {
  try {
    console.log("Datos recibidos para crear usuario:", data);

    // Para roles distintos de graduado → verificamos email único
    if (data.rol !== "graduado") {
      const usuarioExistente = await Users.findOne({
        where: { email: data.email },
      });

      if (usuarioExistente) {
        throw new Error(`Ya existe un usuario con el email ${data.email}`);
      }
    }

    // Si es graduado, solo nombre y apellido se guardan obligatorios
    const userData = {
      auth0Id: data.auth0Id || null,
      email: data.rol === "graduado" ? null : data.email,
      nombre: data.nombre,
      apellido: data.apellido,
      rol: data.rol || "comun",
      isActive: true,
      dni: data.dni || null,
      direccion: data.direccion || null,
      whatsapp: data.whatsapp || null,
      usuario: data.usuario || null,
      password: data.rol === "graduado" ? null : data.password || null,
    };

    const user = await Users.create(userData);

    console.log("Usuario creado exitosamente:", user.id);

    return {
      success: true,
      message: "Usuario creado exitosamente",
      user: user,
    };
  } catch (error) {
    console.error("Error en createUserController:", error);
    throw new Error(`${error.message}`);
  }
};


const obtenerUserGridController = async () => {
  try {
    const grid = await Users.findAll({
      attributes: [
        "id",
        "usuario",
        "nombre",
        "apellido",
        "email",
        "dni",
        "direccion",
        "whatsapp",
        "rol",
        "isActive",
        "auth0Id",
      ],
      raw: true,
    });

    return grid.map((user) => ({
      ...user,
      rol: user.rol || "comun",
    }));
  } catch (error) {
    console.error("Error en obtenerUserGridController:", error);
    throw new Error(`Error al obtener los usuarios: ${error.message}`);
  }
};

const updateUserController = async (id, data) => {
  try {
    const validFields = [
      "nombre",
      "apellido",
      "direccion",
      "email",
      "whatsapp",
      "usuario",
      "dni",
      "rol",
      "isActive",
    ];

    const filteredData = {};
    Object.keys(data).forEach((key) => {
      if (validFields.includes(key)) {
        filteredData[key] = data[key] || null;
      }
    });

    const [updatedRows] = await Users.update(filteredData, { where: { id } });

    if (updatedRows === 0) {
      throw new Error(`No se encontró el usuario o no hubo cambios`);
    }

    return { success: true, message: "Información actualizada correctamente" };
  } catch (error) {
    console.error("Error en updateUserController:", error);
    throw new Error(
      `Error al actualizar la información del usuario, ${error.message}`
    );
  }
};

const verificarUsuarioController = async ({ email }) => {
  try {
    console.log("Buscando usuario con email:", email);

    const user = await Users.findOne({
      where: { email },
      attributes: [
        "id",
        "email",
        "usuario",
        "dni",
        "rol",
        "nombre",
        "apellido",
        "isActive",
        "direccion",
        "whatsapp",
        "auth0Id",
      ],
    });

    console.log("Usuario encontrado:", user ? user.id : "No encontrado");

    return user;
  } catch (error) {
    console.error("Error en verificarUsuarioController:", error);
    throw error;
  }
};

const deleteUserController = async (id) => {
  try {
    const user = await Users.findByPk(id);
    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    await user.destroy();

    return { success: true, message: "Usuario eliminado correctamente" };
  } catch (error) {
    console.error("Error en deleteUserController:", error);
    throw new Error(`Error al eliminar el usuario: ${error.message}`);
  }
};

const softDeleteUserController = async (id, isActive) => {
  try {
    const user = await Users.findByPk(id);
    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    user.isActive = isActive;
    await user.save();

    return {
      success: true,
      message: `Usuario marcado como ${isActive ? "activo" : "inactivo"}`,
    };
  } catch (error) {
    console.error("Error en softDeleteUserController:", error);
    throw new Error(
      `Error al actualizar el estado de usuario: ${error.message}`
    );
  }
};

const obtenerUsuariosController = async (isActive) => {
  try {
    let whereClause = {};

    if (isActive !== undefined) {
      whereClause.isActive = isActive;
    }

    const users = await Users.findAll({
      where: whereClause,
      attributes: [
        "id",
        "nombre",
        "apellido",
        "email",
        "isActive",
        "usuario",
        "rol",
        "dni",
        "direccion",
        "whatsapp",
        "auth0Id",
      ],
    });

    return users;
  } catch (error) {
    console.error("Error en obtenerUsuariosController:", error);
    throw new Error(`Error al obtener los usuarios: ${error.message}`);
  }
};

const changePasswordController = async (id, data) => {
  try {
    const { currentpassword, newpassword } = data;
    const user = await Users.findByPk(id, {
      attributes: ["id", "password"],
    });

    if (!user.password) {
      throw new Error(
        "Este usuario no tiene contraseña configurada (usuario de Auth0)"
      );
    }

    const match = await bcrypt.compare(currentpassword, user.password);
    if (!match) {
      throw new Error("La contraseña actual es incorrecta");
    }

    user.password = newpassword;
    await user.save();

    return { success: true, message: "Contraseña actualizada" };
  } catch (error) {
    console.error("Error en changePasswordController:", error);
    throw new Error(
      `Error al actualizar la contraseña del usuario, ${error.message}`
    );
  }
};

const updateUserRoleController = async (id, rol) => {
  try {
    const user = await Users.findByPk(id);

    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    user.rol = rol;
    await user.save();

    return { success: true, message: `Rol del usuario actualizado a ${rol}` };
  } catch (error) {
    console.error("Error en updateUserRoleController:", error);
    throw new Error(`Error al actualizar el rol del usuario: ${error.message}`);
  }
};

module.exports = {
  createUserController,
  obtenerUserController,
  obtenerUserGridController,
  updateUserController,
  verificarUsuarioController,
  deleteUserController,
  softDeleteUserController,
  obtenerUsuariosController,
  changePasswordController,
  updateUserRoleController,
};
