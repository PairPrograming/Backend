const cloudinary = require("../utils/cloudinary");

// SUBIR imagen
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No se envió ninguna imagen" });
    }

    const imageUrl = req.file.path;

    res.status(200).json({ imageUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al subir la imagen" });
  }
};

// OBTENER todas las imágenes
const getImages = async (req, res) => {
  try {
    const result = await cloudinary.search
      .expression("folder:usuarios")
      .sort_by("created_at", "desc")
      .max_results(30)
      .execute();

    const images = result.resources.map((img) => ({
      id: img.public_id,
      url: img.secure_url,
      created_at: img.created_at,
    }));

    res.status(200).json(images);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener las imágenes" });
  }
};

// ELIMINAR imagen por public_id
const deleteImage = async (req, res) => {
  const { id } = req.params;

  try {
    await cloudinary.uploader.destroy(id);
    res.status(200).json({ message: "Imagen eliminada correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar la imagen" });
  }
};

// Exportar todos los métodos
module.exports = { uploadImage, getImages, deleteImage };
