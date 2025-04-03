const mercadopago = require("mercadopago");
const { getTMp } = require('./MpKeyService');
const { v4: uuidv4 } = require('uuid');
const initializeMercadoPago = async(salonId) => {
    try {
        const { mercadopago: access_token } = await getTMp(salonId);
        mercadopago.configurations.setAccessToken(access_token);
    } catch (error) {
        throw new Error(`Error configurando mercadopago: ${error.message}`);
    }
}

const paymentCreate = async (req, res) => {
    try {
        const { salonId, userId, membershipItemsArray } = req.body;
    
        if (!salonId) {
          return res.status(400).json({ error: "El ID del salón es requerido" });
        }
        // Configurar MercadoPago con la clave del salón correspondiente
         await initializeMercadoPago(salonId);

    
        // Crear la preferencia de pago
        const preference = await mercadopago.preferences.create({
          auto_return: "approved",
          items: membershipItemsArray,
          back_urls: {
            failure: "https://tu-api.com/failure",
            pending: "https://tu-api.com/pending",
            success: "https://tu-api.com/success",
          },
          metadata: {
            clientId: userId
          },
          notification_url: "https://tu-api.com/webhook",
          requestOptions: {
            idempotencyKey: uuidv4()
          }
        });
    
        res.status(200).json({ init_point: preference.body.init_point });

    } catch (error) {
        return res.status(500).json({ error: `Error al procesar el pago: ${error.message}` });
    }
}

module.exports = {
    paymentCreate
}