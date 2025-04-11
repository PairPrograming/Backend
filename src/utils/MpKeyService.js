const mercadopago = require('mercadopago');
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

// Función para configurar MercadoPago con el token del salón
const configureMercadoPago = async (salonId) => {
    try {
        const accessToken = await getTMp(salonId);
        
        // Configura MercadoPago con el token obtenido
        mercadopago.configure({
            access_token: accessToken
        });
        
        return true; // Configuración exitosa
    } catch (error) {
        console.error('Error al configurar MercadoPago:', error.message);
        return false; // Configuración fallida
    }
};

module.exports = { 
    getTMp,
    configureMercadoPago
};