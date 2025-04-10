const { Users, Rols, User_Type } = require("../DbIndex");

const createUserController = async (data) => {
  try {
    const defaultRol = await Rols.findOne({ where: { rol: "Graduado" } });
    data.roleId = defaultRol.id;

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
      attributes: ["usuario", "nombre", "apellido", "email"],
      include: {
        model: Rols,
        attributes: ["rol"],
      },
      raw: true,
    });
    return grid;
  } catch (error) {
    throw new Error(`Error al obtener el usuario: ${error.message}`);
  }
};

const updateUserController = async (id, data) => {
  try {
    const [updatedRows] = await Users.update(data, { where: id });

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

// NUEVO CONTROLLER
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

module.exports = {
  createUserController,
  obtenerUserController,
  obtenerUserGridController,
  updateUserController,
  verificarUsuarioController, // <-- EXPORTA
};
