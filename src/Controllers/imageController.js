// controllers/imageController.js
const {
  Image,
  Eventos,
  Salones,
  Invitados,
  Punto_de_venta,
  Users,
} = require("../DbIndex");

// Get all images
const getAllImages = async (req, res) => {
  try {
    const images = await Image.findAll({
      where: { active: true },
    });
    return res.status(200).json(images);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error retrieving images", error: error.message });
  }
};

// Get images by type
const getImagesByType = async (req, res) => {
  const { type } = req.params;
  try {
    const images = await Image.findAll({
      where: {
        type,
        active: true,
      },
    });
    return res.status(200).json(images);
  } catch (error) {
    return res.status(500).json({
      message: `Error retrieving ${type} images`,
      error: error.message,
    });
  }
};

// Get images by related entity
const getImagesByRelatedId = async (req, res) => {
  const { relatedId } = req.params;
  try {
    const images = await Image.findAll({
      where: {
        relatedId,
        active: true,
      },
    });
    return res.status(200).json(images);
  } catch (error) {
    return res.status(500).json({
      message: "Error retrieving related images",
      error: error.message,
    });
  }
};

// Create new image
const createImage = async (req, res) => {
  const { url, alt, type, relatedId, isMain } = req.body;

  if (!url) {
    return res.status(400).json({ message: "URL is required" });
  }

  try {
    // If isMain is true, update other images of the same type and relatedId to not be main
    if (isMain) {
      await Image.update(
        { isMain: false },
        {
          where: {
            type,
            relatedId,
            isMain: true,
          },
        }
      );
    }

    // Verify that the related entity exists
    if (relatedId) {
      let entityExists = false;

      switch (type) {
        case "evento":
          entityExists = await Eventos.findByPk(relatedId);
          break;
        case "salon":
          entityExists = await Salones.findByPk(relatedId);
          break;
        case "invitado":
          entityExists = await Invitados.findByPk(relatedId);
          break;
        case "punto_venta":
          entityExists = await Punto_de_venta.findByPk(relatedId);
          break;
        case "usuario":
          entityExists = await Users.findByPk(relatedId);
          break;
        default:
          entityExists = true; // For 'otro' type, no validation needed
      }

      if (!entityExists) {
        return res
          .status(404)
          .json({ message: `Related ${type} with id ${relatedId} not found` });
      }
    }

    const newImage = await Image.create({
      url,
      alt: alt || "",
      type,
      relatedId,
      isMain: isMain || false,
    });

    return res.status(201).json(newImage);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error creating image", error: error.message });
  }
};

// Update image
const updateImage = async (req, res) => {
  const { id } = req.params;
  const { url, alt, type, relatedId, isMain, active } = req.body;

  try {
    const image = await Image.findByPk(id);

    if (!image) {
      return res.status(404).json({ message: "Image not found" });
    }

    // If isMain is being set to true, update other images of the same type and relatedId
    if (
      isMain &&
      (!image.isMain || relatedId !== image.relatedId || type !== image.type)
    ) {
      await Image.update(
        { isMain: false },
        {
          where: {
            type: type || image.type,
            relatedId: relatedId || image.relatedId,
            isMain: true,
          },
        }
      );
    }

    await image.update({
      url: url || image.url,
      alt: alt !== undefined ? alt : image.alt,
      type: type || image.type,
      relatedId: relatedId !== undefined ? relatedId : image.relatedId,
      isMain: isMain !== undefined ? isMain : image.isMain,
      active: active !== undefined ? active : image.active,
    });

    return res.status(200).json(image);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error updating image", error: error.message });
  }
};

// Delete image (soft delete)
const deleteImage = async (req, res) => {
  const { id } = req.params;

  try {
    const image = await Image.findByPk(id);

    if (!image) {
      return res.status(404).json({ message: "Image not found" });
    }

    await image.update({ active: false });

    return res.status(200).json({ message: "Image deactivated successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error deactivating image", error: error.message });
  }
};

// Hard delete image
const hardDeleteImage = async (req, res) => {
  const { id } = req.params;

  try {
    const image = await Image.findByPk(id);

    if (!image) {
      return res.status(404).json({ message: "Image not found" });
    }

    await image.destroy();

    return res.status(200).json({ message: "Image deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error deleting image", error: error.message });
  }
};

module.exports = {
  getAllImages,
  getImagesByType,
  getImagesByRelatedId,
  createImage,
  updateImage,
  deleteImage,
  hardDeleteImage,
};
