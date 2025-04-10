const { Users, Rols, User_Type } = require("../DbIndex");

const createUserController = async (data) => {
  try {
    if (!data.roleId) {
      const defaultRol = await Rols.findOne({ where: { rol: "Graduado" } });
      data.roleId = defaultRol.id;
    }

    const [existingUser, created] = await Users.findOrCreate({
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
        "dni",
        "nombre",
        "apellido",
        "email",
        "direccion",
        "whatsapp",
        "usuario",
      ],
      include: {
        model: User_Type,
        attributes: ["usertype"],
      },
      raw: true,
    });

    if (!user) throw new Error("Usuario no encontrado");

    return user;
  } catch (error) {
    throw new Error(`Error al obtener el usuario: ${error.message}`);
  }
};

const obtenerUserGridController = async () => {
  try {
    const grid = await Users.findAll({
      attributes: ["id", "usuario", "nombre", "apellido", "email"],
      include: {
        model: Rols,
        attributes: ["rol"],
      },
      raw: true,
    });
    return grid;
  } catch (error) {
    throw new Error(`Error al obtener los usuarios: ${error.message}`);
  }
};

const updateUserController = async (id, data) => {
  try {
    const [updatedRows] = await Users.update(data, { where: { id } });

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
    attributes: ["id", "email", "usuario", "dni"],
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
      attributes: ["id", "nombre", "apellido", "email", "isActive"],
    });

    return users;
  } catch (error) {
    throw new Error(`Error al obtener los usuarios: ${error.message}`);
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
};
