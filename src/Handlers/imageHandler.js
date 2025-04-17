// handlers/imageHandler.js
const imageController = require("../Controllers/imageController");

// Get all images
const getAllImages = async (req, res) => {
  try {
    return await imageController.getAllImages(req, res);
  } catch (error) {
    console.error("Handler error in getAllImages:", error);
    return res
      .status(500)
      .json({ message: "Internal server error in image handler" });
  }
};

// Get images by type
const getImagesByType = async (req, res) => {
  try {
    return await imageController.getImagesByType(req, res);
  } catch (error) {
    console.error("Handler error in getImagesByType:", error);
    return res
      .status(500)
      .json({ message: "Internal server error in image handler" });
  }
};

// Get images by related entity
const getImagesByRelatedId = async (req, res) => {
  try {
    return await imageController.getImagesByRelatedId(req, res);
  } catch (error) {
    console.error("Handler error in getImagesByRelatedId:", error);
    return res
      .status(500)
      .json({ message: "Internal server error in image handler" });
  }
};

// Create new image
const createImage = async (req, res) => {
  try {
    return await imageController.createImage(req, res);
  } catch (error) {
    console.error("Handler error in createImage:", error);
    return res
      .status(500)
      .json({ message: "Internal server error in image handler" });
  }
};

// Update image
const updateImage = async (req, res) => {
  try {
    return await imageController.updateImage(req, res);
  } catch (error) {
    console.error("Handler error in updateImage:", error);
    return res
      .status(500)
      .json({ message: "Internal server error in image handler" });
  }
};

// Delete image (soft delete)
const deleteImage = async (req, res) => {
  try {
    return await imageController.deleteImage(req, res);
  } catch (error) {
    console.error("Handler error in deleteImage:", error);
    return res
      .status(500)
      .json({ message: "Internal server error in image handler" });
  }
};

// Hard delete image
const hardDeleteImage = async (req, res) => {
  try {
    return await imageController.hardDeleteImage(req, res);
  } catch (error) {
    console.error("Handler error in hardDeleteImage:", error);
    return res
      .status(500)
      .json({ message: "Internal server error in image handler" });
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
