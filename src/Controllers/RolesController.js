const { Rols, Users } = require('../DbIndex')

const getRolesController = async () => {
    try {
        const roles = await Rols.findAll();
        return { success: true, data: roles }; // Respuesta estructurada con éxito y datos
    } catch (error) {
        throw new Error(`Error al obtener la información de los roles: ${error.message}`);
    }
};

const changeRolesController = async (id, roleId) => {
    if (!id || !roleId) {
        throw new Error("El ID del usuario y el roleId son obligatorios");
    }

    try {
        const [updatedRows] = await Users.update(
            { roleId },
            { where: { id } }
        );

        if (updatedRows === 0) {
            throw new Error("No se encontró el usuario o el rol no cambió");
        }
        return { success: true, message: "Rol actualizado correctamente" }; 
    } catch (error) {
        throw new Error(`Error al actualizar el rol del usuario: ${error.message}`);
    }
};
module.exports = {
    getRolesController,
    changeRolesController
}