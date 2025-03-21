const { Users, Rols, User_Type } = require("../DbIndex");

const createUserController = async (data) => {
  try {
    const defaultRol = await Rols.findOne({where: {rol:"Graduado"}});
    data.roleId = defaultRol.id;
    const [existingUser, created] = await Users.findOrCreate({
      where: { dni: data.dni }, // Or email or usuario
      defaults: data,
    });
    if (!created) {
      return { success: false, message: 'El usuario ya existe' };
    }
    return { success: true, message: 'Usuario creado exitosamente' };
  } catch (error) {
    throw new Error(`${error.message}`);
  }
};
//datos como el perfil principal del usuario
const obtenerUserController = async (id) => {
  try {
    const user = await Users.findByPk(id, {
      attributes: ['dni', 'nombre', 'apellido', 'email', 'direccion', 'whatsapp', 'usuario'],
      include:{
        model: User_Type,
        attributes: ['usertype']
      },
      raw: true,
    });
    
    if (!user) {
      throw new Error("Usuario no encontrado");
    }
    
    return user;
  } catch (error) {
    throw new Error(`Error al obtener el usuario: ${error.message}`);
  }
};
//obtener datos para grid
const obtenerUserGridController = async () => {
  try {
    const grid =  await Users.findAll({
      attributes:['usuario', 'nombre', 'apellido', 'email'],
      include:{
        model: Rols,
        attributes:['rol'],
      },
      raw: true
    })
    return grid;
  } catch (error) {
    throw new Error(`Error al obtener el usuario: ${error.message}`);
  }
}

const updateUserController = async (id, data) => {
  try {
    const [updatedRows] = await Users.update(data, { where: id });

    if (updatedRows === 0) {
      return { success: false, message: "No se encontró el usuario o no hubo cambios" };
    }
    return { success: true, message: "Información actualizada correctamente" };
  } catch (error) {
    throw new Error(`Error al actualizar la información del usuario, ${error.message}`);
  }
}
module.exports = {
  createUserController,
  obtenerUserController,
  obtenerUserGridController,
  updateUserController
}