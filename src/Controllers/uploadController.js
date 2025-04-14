// src/controllers/uploadController.js
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No se envió ninguna imagen" });
    }

    const imageUrl = req.file.path;

    res.status(200).json({ imageUrl });
  } catch (error) {
    res.status(500).json({ error: "Error al subir la imagen" });
  }
};

module.exports = { uploadImage };
