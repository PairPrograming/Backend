const cloudinary = require("../utils/cloudinary");

// SUBIR archivo (imagen o PDF)
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No se envió ningún archivo" });
    }

    const fileUrl = req.file.path;
    const fileType = req.file.mimetype;

    res.status(200).json({ fileUrl, fileType });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al subir el archivo" });
  }
};

// OBTENER todos los archivos (imágenes y PDFs)
const getImages = async (req, res) => {
  try {
    const result = await cloudinary.search
      .expression("folder:usuarios")
      .sort_by("created_at", "desc")
      .max_results(30)
      .execute();

    const files = result.resources.map((file) => ({
      id: file.public_id,
      url: file.secure_url,
      format: file.format,
      created_at: file.created_at,
    }));

    res.status(200).json(files);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener los archivos" });
  }
};

// ELIMINAR archivo por public_id
const deleteImage = async (req, res) => {
  const { id } = req.params;

  try {
    await cloudinary.uploader.destroy(id);
    res.status(200).json({ message: "Archivo eliminado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar el archivo" });
  }
};

// Exportar todos los métodos
module.exports = { uploadImage, getImages, deleteImage };
