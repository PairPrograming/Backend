const { Salones, Users, Eventos } = require('../DbIndex')

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
                include: [
                    {
                        model: Users,
                        through: { attributes: [] },
                        attributes: ['usuario']
                    }
                ] 
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

const addEventoSalonController = async(salonId, eventoId) =>{
    try {
        const salon = Salones.findByPk(salonId);
        const event = Eventos.findByPk(eventoId);
        if(!salon || !event){
            throw new Error('No se encontro el evento o el salon');
        }
        const [existingSalonEvento, created] = await SalonesEventos.findOrCreate({
            where: {salonId, eventoId},
            defaults: {salonId, eventoId}
        })
        if(!created){
            throw new Error('Este evento ya esta asociado a un salon');
        }

        return { sucess: true, message: "Evento agregado al salon exitosamente"};

    } catch (error) {
        throw new Error(`Error al agregar el evento al salon: ${error.message}`)
    }
}
module.exports = {
    getGridSalonesController,
    getSalonController,
    postSalonController,
    putSalonController,
    addEventoSalonController
}