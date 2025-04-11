const mercadopago = require("mercadopago");
const { getTMp } = require('./MpKeyService');
const { v4: uuidv4 } = require('uuid');
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

const paymentCreate = async (req, res) => {
    try {
        const { salonId, userId, membershipItemsArray } = req.body;
    
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
        res.status(200).json({ init_point: preference.body.init_point });

    } catch (error) {
        return res.status(500).json({ error: `Error al procesar el pago: ${error.message}` });
    }
}

module.exports = {
    paymentCreate
}