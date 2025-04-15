const { Salones, Users, Eventos, SalonesEventos } = require('../DbIndex')

const getGridSalonesController = async () => {
    try {
        const result = await Salones.findAll({
            attributes: ['salon', 'cuit', 'nombre', 'email', 'whatsapp']
        });
        return { success: true, data: result };
    } catch (error) {
        throw new Error(`Error al obtener la información de los salones: ${error.message}`);
    }
}

const getSalonController = async (id, data) => {
    try {
        const result = await Salones.findByPk(id, 
            {
                attributes: ['salon', "capacidad", 'cuit', 'email', 'nombre', 'whatsapp', 'Mercadopago', 'estatus'],
            }
         );
        if (!result) {
            throw new Error('Salon no encontrado');
        }
        return { success: true, data: result };
    } catch (error) {
        throw new Error(`Error al obtener informacion ${error.message}`);
    }
}

const postSalonController = async (data) => {
    try {
        const [existingSalond, created] = await Salones.findOrCreate({
            where: { salon: data.salon },
            defaults: data,
        })
        if(!created) {
            throw new Error('El salón ya existe');
        }
        return { success: true, message: 'Salón creado exitosamente' };
    } catch (error) {
        throw new Error(`${error.message}`);
    }
}

const putSalonController = async (id, data) =>{
    try {
        const [updateRows] = await Salones.update(data, {where: {Id: id}});
        if(updateRows === 0){
            throw new Error('No se encontro el salon o no hubo cambios');
        }
        return {success: true, message: 'Informacion actualizada correctamente'};
    } catch (error) {
        throw new Error(`Error al actualizar la información del salon, ${error.message}`);
    }
}

module.exports = {
    getGridSalonesController,
    getSalonController,
    postSalonController,
    putSalonController,
}