const { Salones } = require('../DbIndex');

const getTMp = async(id) => {
    try {
        const salon = await Salones.findByPk(id, {
            attributes: ['Mercadopago']
        });
        
        if (!salon) {
            throw new Error('Salón no encontrado');
        }

        return salon.Mercadopago;
    } catch (error) {
        throw new Error(`Error al procesar la solicitud: ${error.message}`);
    }
};

module.exports = {
    getTMp
}