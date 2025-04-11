const { configureMercadoPago } = require('./MpKeyService');
const mercadopago = require('mercadopago');

const procesarPago = async (salonId, datosDelPago) => {
    // Configura MercadoPago con el token del salón específico
    const configurado = await configureMercadoPago(salonId);
    
    if (!configurado) {
        throw new Error('No se pudo configurar MercadoPago para este salón');
    }
    
    // Ahora puedes usar mercadopago con el token configurado
    try {
        const resultado = await mercadopago.payment.save(datosDelPago);
        return resultado;
    } catch (error) {
        throw new Error(`Error al procesar el pago: ${error.message}`);
    }
}

module.exports = {
  procesarPago
}
