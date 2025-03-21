const { createPuntoDeVentaController, putPuntoDeVentaController,
    getPuntoDeVentaByIdController, addUserToPuntoDeVenta
 } = require('../Controllers/PuntodeVentaController');


 const createPuntoDeVentaHandler = async (req, res) => {
    const data = req.body;
    try {
        const result = await createPuntoDeVentaController(data);
        return res.status(201).json(result);
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}

const putPuntoDeVentaHandler = async (req, res) => {
    const { id } = req.params;
    const data = req.body;
    if (!id) {
        return res.status(400).json({ success: false, message: "ID es requerido en los parámetros" });
    }
    try {
        const result = await putPuntoDeVentaController(id, data);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ success: false, message: `Error interno del servidor: ${error.message}` });
    }
}


const getPuntoDeVentaByIdHandler = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ success: false, message: "ID es requerido en los parámetros" });
    }

    try {
        const result = await getPuntoDeVentaByIdController(id);

        if (!result.success) {
            return res.status(404).json(result);
        }

        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ success: false, message: `Error interno del servidor: ${error.message}` });
    }
};

const addVendedorPuntoHandler = async (req, res) => {
    const { userId, puntoId } = req.body;
    try {
        const result = await addUserToPuntoDeVenta(userId, puntoId);
        return res.status(201).json(result);
    } catch (error) {
        return res.status(500).json({ success: false, message: `Error interno del servidor: ${error.message}` });
    }
}
module.exports = {
    createPuntoDeVentaHandler,
    putPuntoDeVentaHandler,
    getPuntoDeVentaByIdHandler,
    addVendedorPuntoHandler
}