const { configureMercadoPago } = require('./MpKeyService');
const { MercadoPagoConfig, Payment, Preference} = require('mercadopago');

const procesarPago = async (salonId, datosDelPago, maxIntentos = 3) => {
    let intentos = 0;
    
    // Validar que el token de tarjeta esté presente
    if (!datosDelPago.token) {
        throw new Error('El token de tarjeta es obligatorio');
    }
    
    while (intentos < maxIntentos) {
        try {
            // Configura MercadoPago con el token del salón específico
            const configurado = await configureMercadoPago(salonId);
            if (!configurado) {
                throw new Error('No se pudo configurar MercadoPago para este salón');
            }
            
            const payment = new Payment(configurado);
            
            // Asegúrate de que la estructura del pago sea correcta
            const paymentData = {
                transaction_amount: datosDelPago.transaction_amount,
                token: datosDelPago.token,
                description: datosDelPago.description,
                installments: datosDelPago.installments,
                payment_method_id: datosDelPago.payment_method_id,
                payer: {
                    email: datosDelPago.payer.email,
                    identification: datosDelPago.payer.identification
                }
            };
            
            // Si se incluyen datos adicionales, añadirlos
            if (datosDelPago.metadata) {
                paymentData.metadata = datosDelPago.metadata;
            }
            
            // Procesar el pago
            console.log('Datos del pago a procesar:', JSON.stringify(paymentData, null, 2));
            const resultado = await payment.create({ body: paymentData });
            
            // Registrar resultado exitoso
            console.log(`Pago procesado exitosamente para salón ID: ${salonId}, paymentId: ${resultado.id}`);
            return { body: resultado };
        } catch (error) {
            intentos++;
            
            // Registrar el error completo para diagnóstico
            console.error('Error completo:', JSON.stringify(error, null, 2));
            
            // Manejar errores específicos
            if (error.status === 401 || error.message.includes('UNAUTHORIZED')) {
                console.error('Error de autorización. Verifica tus credenciales y permisos.');
                
                // Obtener más detalles del error
                if (error.response && error.response.data) {
                    console.error('Detalles del error:', JSON.stringify(error.response.data, null, 2));
                }
                
                throw new Error(`Error de autorización: ${error.message}. Verifica que tus credenciales sean válidas y tengan los permisos necesarios.`);
            }
            
            // Si es un error específico de token, no reintentar
            if (error.cause && error.cause.some(c => c.code === 2006)) {
                throw new Error('Token de tarjeta no encontrado o inválido. Genera un nuevo token e intenta nuevamente.');
            }
            
            // Si es un error temporal de conexión y tenemos intentos restantes
            if ((error.message.includes('timeout') || error.status === 500) && intentos < maxIntentos) {
                console.warn(`Reintento ${intentos}/${maxIntentos} para pago en salón ${salonId}`);
                await new Promise(resolve => setTimeout(resolve, 1000)); // Esperar 1 segundo antes de reintentar
            } else {
                // Error fatal o máximo de intentos alcanzado
                console.error(`Error al procesar pago para salón ${salonId}:`, error);
                throw new Error(`Error al procesar el pago: ${error.message}`);
            }
        }
    }
};

const procesarPagoHandler = async(req, res) => {
    const { salonId, datosDelPago } = req.body;
    
    if (!salonId || !datosDelPago) {
        return res.status(400).json({ error: 'Faltan datos requeridos' });
    }
    
    try {
        const result = await procesarPago(salonId, datosDelPago);
        return res.status(200).json({
            message: 'Pago procesado correctamente',
            payment: result.body
        });
    } catch (error) {
        return res.status(500).json({ 
            error: error.message,
            details: error.cause || 'No hay detalles adicionales'
        });
    }
};

module.exports = {
    procesarPagoHandler,
}
