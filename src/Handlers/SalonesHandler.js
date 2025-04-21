const {
  getGridSalonesController,
  getSalonController,
  putSalonController,
  postSalonController,
  deleteSalonLogicalController,
  deleteSalonPhysicalController,
  restoreSalonController,
  toggleSalonStatusController,
} = require("../Controllers/SalonesControlers");

const getGridSalonesHandler = async (req, res) => {
  try {
    const { search, page = 1, limit = 10, includeDeleted = false } = req.query;
    const salones = await getGridSalonesController(
      search,
      page,
      limit,
      includeDeleted
    );
    return res.status(200).json(salones);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const getSalonHandler = async (req, res) => {
  const { id } = req.params;
  try {
    const salon = await getSalonController(id);
    return res.status(200).json(salon);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const postSalonHandler = async (req, res) => {
  try {
    const {
      salon,
      nombre,
      capacidad,
      cuit,
      email,
      whatsapp,
      estatus,
      MercadopagoKeyP,
      Mercadopago,
      cbu,
      alias,
      image,
    } = req.body;

    // Verificar que los campos requeridos están presentes
    if (!salon || !nombre || !cuit || !email || !whatsapp) {
      return res.status(400).json({
        message:
          "Faltan campos requeridos: salon, nombre, cuit, email, whatsapp",
      });
    }

    const info = {
      salon,
      nombre,
      capacidad,
      cuit,
      email,
      whatsapp,
      estatus,
      MercadopagoKeyP,
      Mercadopago,
      cbu,
      alias,
      image,
    };

    const result = await postSalonController(info);
    return res.status(201).json(result);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const putSalonHandler = async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  try {
    // Validar que hay datos para actualizar
    if (Object.keys(data).length === 0) {
      return res
        .status(400)
        .json({ message: "No se proporcionaron datos para actualizar" });
    }

    const result = await putSalonController(id, data);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// Nuevo handler para borrado lógico
const deleteSalonLogicalHandler = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await deleteSalonLogicalController(id);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// Nuevo handler para borrado físico
const deleteSalonPhysicalHandler = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await deleteSalonPhysicalController(id);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// Nuevo handler para restaurar salón borrado lógicamente
const restoreSalonHandler = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await restoreSalonController(id);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// Nuevo handler para cambiar el estado (activo/inactivo)
const toggleSalonStatusHandler = async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;

  try {
    const result = await toggleSalonStatusController(id, isActive);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getGridSalonesHandler,
  getSalonHandler,
  postSalonHandler,
  putSalonHandler,
  deleteSalonLogicalHandler,
  deleteSalonPhysicalHandler,
  restoreSalonHandler,
  toggleSalonStatusHandler,
};
