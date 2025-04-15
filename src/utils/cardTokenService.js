const axios = require('axios');
const { Salones } = require('../DbIndex');

// Función para obtener la public key del salón
const getPublicKey = async (salonId) => {
    try {
        // Obtener el salón con el atributo Mercadopago
        const salon = await Salones.findByPk(salonId, {
            attributes: ['Mercadopago']
        });
        
        if (!salon || !salon.Mercadopago) {
            throw new Error('Información de MercadoPago no encontrada para este salón');
        }
        
        // Verificar si el valor es la Public Key directamente
        // Las Public Keys de Mercado Pago suelen comenzar con "APP_USR-"
        if (salon.Mercadopago.startsWith('APP_USR-')) {
            return salon.Mercadopago;
        }
        
        // Si no es la Public Key directamente, usar un valor fijo para pruebas
        // Reemplaza esto con tu Public Key real
        return "APP_USR-21a0ffde-28cb-4e15-8ba0-7904446a4ca7";
    } catch (error) {
        throw new Error(`Error al obtener Public Key: ${error.message}`);
    }
};

// Función para generar token de tarjeta desde el backend (SOLO PARA PRUEBAS)
const generarTokenTarjeta = async (salonId, cardData) => {
    try {
        // Obtener la public key del salón
        const publicKey = await getPublicKey(salonId);
        
        console.log('Usando Public Key:', publicKey);
        
        // Generar token de tarjeta usando la API de Mercado Pago
        const response = await axios.post(
            `https://api.mercadopago.com/v1/card_tokens?public_key=${publicKey}`,
            cardData,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        if (!response.data || !response.data.id) {
            throw new Error('No se pudo generar el token de tarjeta');
        }
        
        console.log('Token generado exitosamente:', response.data.id);
        return response.data.id;
    } catch (error) {
        console.error('Error al generar token de tarjeta:', error.response?.data || error.message);
        throw new Error(`Error al generar token de tarjeta: ${error.response?.data?.message || error.message}`);
    }
};

module.exports = {
    generarTokenTarjeta
};