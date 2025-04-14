const { configureMercadoPago } = require('./MpKeyService');
const mercadopago = require('mercadopago');

const procesarPago = async (salonId, datosDelPago, maxIntentos = 3) => {
    let intentos = 0;
    while (intentos < maxIntentos) {
        try {
            // Configura MercadoPago con el token del salón específico
            const configurado = await configureMercadoPago(salonId);
            if (!configurado) {
                throw new Error('No se pudo configurar MercadoPago para este salón');
            }
            mercadopago.configurations.setAccessToken(configurado.accessToken);
            // Procesar el pago
            const resultado = await mercadopago.payment.create(datosDelPago);
            
            // Registrar resultado exitoso
            console.log(`Pago procesado exitosamente para salón ID: ${salonId}, paymentId: ${resultado.body.id}`);
            
            return resultado;
        } catch (error) {
            intentos++;
            
            // Si es un error temporal de conexión y tenemos intentos restantes
            if (error.message.includes('timeout') && intentos < maxIntentos) {
                console.warn(`Reintento ${intentos}/${maxIntentos} para pago en salón ${salonId}`);
                await new Promise(resolve => setTimeout(resolve, 1000)); // Esperar 1 segundo antes de reintentar
            } else {
                // Error fatal o máximo de intentos alcanzado
                console.error(`Error al procesar pago para salón ${salonId}:`, error);
                throw new Error(`Error al procesar el pago: ${error.message}`);
            }
        }
    }
}

const procesarPagoHandler = async(req, res) => {
    const { salonId, datosDelPago } = req.body;
    if( !salonId || !datosDelPago ){
        return res.status(400).json({ error: 'Faltan datos requeridos' });
    }
    try {
        const result = await procesarPago(salonId, datosDelPago);
        return res.status(200).json({
            message: 'Pago procesado correctamente',
            payment: result.body
        })
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

module.exports = {
    procesarPagoHandler
}
