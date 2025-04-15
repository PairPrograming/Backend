const { MercadoPagoConfig, Payment, User } = require('mercadopago');
const { getTMp } = require('./MpKeyService');

const diagnosticarCredenciales = async (salonId) => {
    try {
        // Obtener el Access Token
        const accessToken = await getTMp(salonId);
        
        // Verificar si es un token de prueba o producción
        const isTestToken = accessToken.includes('TEST-');
        console.log(`Token de acceso: ${isTestToken ? 'PRUEBA' : 'PRODUCCIÓN'}`);
        
        // Configurar cliente de Mercado Pago
        const client = new MercadoPagoConfig({ accessToken });
        
        // Verificar información del usuario
        try {
            const userClient = new User(client);
            const userInfo = await userClient.get();
            
            return {
                success: true,
                ambiente: isTestToken ? 'PRUEBA' : 'PRODUCCIÓN',
                usuario: {
                    id: userInfo.id,
                    email: userInfo.email,
                    nombre: userInfo.first_name + ' ' + userInfo.last_name,
                    permisos: userInfo.scopes || []
                },
                mensaje: 'Credenciales válidas'
            };
        } catch (error) {
            return {
                success: false,
                ambiente: isTestToken ? 'PRUEBA' : 'PRODUCCIÓN',
                error: 'Error al verificar usuario',
                mensaje: error.message,
                detalles: error.response?.data || {}
            };
        }
    } catch (error) {
        return {
            success: false,
            error: 'Error al obtener credenciales',
            mensaje: error.message
        };
    }
};

const diagnosticoHandler = async (req, res) => {
    const { salonId } = req.params;
    
    if (!salonId) {
        return res.status(400).json({ error: 'Falta el ID del salón' });
    }
    
    try {
        const resultado = await diagnosticarCredenciales(salonId);
        return res.status(resultado.success ? 200 : 400).json(resultado);
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Error en diagnóstico',
            mensaje: error.message
        });
    }
};

module.exports = {
    diagnosticoHandler
};