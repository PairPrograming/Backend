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

const verificarAmbiente = async (salonId) => {
    try {
        const accessToken = await getTMp(salonId);
        
        // Verificar si es un token de prueba o producción
        const isTestToken = accessToken.includes('TEST-');
        
        console.log(`Token de acceso: ${isTestToken ? 'PRUEBA' : 'PRODUCCIÓN'}`);
        
        // Obtener la public key
        const salon = await Salones.findByPk(salonId, {
            attributes: ['Mercadopago']
        });
        
        if (!salon || !salon.Mercadopago) {
            throw new Error('Información de MercadoPago no encontrada');
        }
        
        // Verificar si la public key es de prueba o producción
        const publicKey = salon.Mercadopago.startsWith('APP_USR-') ? salon.Mercadopago : "APP_USR-21a0ffde-28cb-4e15-8ba0-7904446a4ca7";
        const isTestPublicKey = publicKey.includes('TEST-');
        
        console.log(`Public Key: ${isTestPublicKey ? 'PRUEBA' : 'PRODUCCIÓN'}`);
        
        // Verificar si hay coincidencia de ambientes
        if (isTestToken !== isTestPublicKey) {
            console.error('⚠️ ERROR: Mezcla de ambientes. El Access Token y la Public Key deben ser del mismo ambiente (prueba o producción).');
            return false;
        }
        
        return true;
    } catch (error) {
        console.error('Error al verificar ambiente:', error);
        return false;
    }
};

// Exporta la función
module.exports = { 
    getTMp,
    configureMercadoPago,
    verificarAmbiente
};