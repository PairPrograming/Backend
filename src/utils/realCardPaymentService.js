const { procesarPago } = require('./servicePayment');
const { generarTokenTarjeta } = require('./cardTokenService');
const { verificarAmbiente } = require('./MpKeyService');

const procesarPagoRealHandler = async (req, res) => {
    const { salonId, cardData, paymentData } = req.body;
    
    if (!salonId || !cardData || !paymentData) {
        return res.status(400).json({ error: 'Faltan datos requeridos' });
    }
    
    try {
        // Verificar ambiente
        const ambienteValido = await verificarAmbiente(salonId);
        if (!ambienteValido) {
            return res.status(400).json({ 
                error: 'Configuración de ambiente inválida', 
                details: 'El Access Token y la Public Key deben ser del mismo ambiente (prueba o producción)' 
            });
        }
        
        // Generar token de tarjeta
        console.log('Generando token para tarjeta real...');
        const token = await generarTokenTarjeta(salonId, cardData);
        
        // Preparar datos del pago con el token generado
        const datosDelPago = {
            ...paymentData,
            token: token
        };
        
        // Procesar el pago
        console.log('Procesando pago con tarjeta real...');
        const result = await procesarPago(salonId, datosDelPago);
        
        return res.status(200).json({
            message: 'Pago con tarjeta real procesado correctamente',
            payment: result.body
        });
    } catch (error) {
        console.error('Error al procesar pago con tarjeta real:', error);
        return res.status(500).json({
            error: error.message,
            details: error.cause || 'No hay detalles adicionales'
        });
    }
};

module.exports = {
    procesarPagoRealHandler
};