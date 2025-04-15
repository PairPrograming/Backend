const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const {
  uploadImage,
  getImages,
  deleteImage,
} = require("../Controllers/uploadController");

// Subir imagen
router.post("/image", upload.single("image"), uploadImage);

// Obtener todas las imágenes
router.get("/images", getImages);

// Eliminar imagen por ID (public_id)
router.delete("/image/:id", deleteImage);

module.exports = router;
