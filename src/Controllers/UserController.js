const { Users, Rols } = require("../DbIndex");
const bcrypt = require("bcrypt");

const createUserController = async (data) => {
  try {
    const [created] = await Users.findOrCreate({
      where: { email: data.email },
      defaults: data,
    });

    if (!created) throw new Error(`El usuario ya existe`);

    return { success: true, message: "Usuario creado exitosamente" };
  } catch (error) {
    throw new Error(`${error.message}`);
  }
};

const obtenerUserController = async (id) => {
  try {
    const user = await Users.findByPk(id, {
      attributes: [
        "id",
        "dni",
        "nombre",
        "apellido",
        "email",
        "direccion",
        "whatsapp",
        "usuario",
        "rol",
        "isActive",
      ],
      include: {
        model: Rols,
        attributes: ["rol"],
      },
      raw: true,
      nest: true,
    });

    if (!user) throw new Error("Usuario no encontrado");

    const completeUser = {
      id: user.id,
      dni: user.dni || "",
      nombre: user.nombre || "",
      apellido: user.apellido || "",
      email: user.email || "",
      direccion: user.direccion || "",
      whatsapp: user.whatsapp || "",
      usuario: user.usuario || "",
      rol: user.rol || (user.Rol ? user.Rol.rol : "vendor"),
      isActive: user.isActive !== undefined ? user.isActive : true,
    };

    return completeUser;
  } catch (error) {
    throw new Error(`Error al obtener el usuario: ${error.message}`);
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
      ],
      include: {
        model: Rols,
        attributes: ["rol"],
      },
      raw: true,
      nest: true,
    });

    return grid.map((user) => ({
      ...user,
      rol: user.rol || (user.Rol ? user.Rol.rol : "vendor"),
    }));
  } catch (error) {
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
    throw new Error(
      `Error al actualizar la información del usuario, ${error.message}`
    );
  }
};

const verificarUsuarioController = async ({ email, usuario, dni }) => {
  const whereClause = {};
  if (email) whereClause.email = email;
  if (usuario) whereClause.usuario = usuario;
  if (dni) whereClause.dni = dni;

  const user = await Users.findOne({
    where: whereClause,
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
    ],
    include: {
      model: Rols,
      attributes: ["rol"],
    },
  });

  return user;
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
      ],
    });

    return users;
  } catch (error) {
    throw new Error(`Error al obtener los usuarios: ${error.message}`);
  }
};

const changePasswordController = async (id, data) => {
  try {
    const { currentpassword, newpassword } = data;
    const user = await Users.findByPk(id, {
      attributes: ["id", "password"],
    });
    const match = await bcrypt.compare(currentpassword, user.password);
    if (!match) {
      throw new Error("La contraseña actual es incorrecta");
    }
    user.password = newpassword;
    await user.save();
    return { success: true, message: "Contraseña actualizada" };
  } catch (error) {
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
