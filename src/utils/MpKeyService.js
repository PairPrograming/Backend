const { MercadoPagoConfig } = require('mercadopago');
const { Salones } = require('../DbIndex');

const tokenCache = new Map();
const CACHE_TTL = 3600000; // 1 hora en ms
const getTMp = async(id) => {
    try {
        // Verificar caché primero
        if (tokenCache.has(id)) {
            const cached = tokenCache.get(id);
            if (Date.now() - cached.timestamp < CACHE_TTL) {
                return cached.token;
            }
            // Token caducado, eliminar de caché
            tokenCache.delete(id);
        }

        const salon = await Salones.findByPk(id, {
            attributes: ['Mercadopago']
        });
        
        if (!salon) {
            throw new Error('Salón no encontrado');
        }
        
        // Validar formato del token (ejemplo básico)
        if (!salon.Mercadopago || typeof salon.Mercadopago !== 'string') {
            throw new Error('Token de MercadoPago inválido');
        }

        // Guardar en caché
        tokenCache.set(id, {
            token: salon.Mercadopago,
            timestamp: Date.now()
        });

        return salon.Mercadopago;
    } catch (error) {
        throw new Error(`Error al obtener token de MercadoPago: ${error.message}`);
    }
};

// Función para configurar MercadoPago con el token del salón
const configureMercadoPago = async (salonId) => {
    try {
        const accessToken = await getTMp(salonId);
        return new MercadoPagoConfig({ accessToken })
    } catch (error) {
        console.error('Error al configurar MercadoPago:', error.message);
        return false; // Configuración fallida
    }
};

module.exports = { 
    getTMp,
    configureMercadoPago
};