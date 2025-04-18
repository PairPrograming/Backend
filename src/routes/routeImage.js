// routes/imageRoutes.js
const express = require("express");
const router = express.Router();
const imageHandler = require("../Handlers/imageHandler");

// Get all images
router.get("/", imageHandler.getAllImages);

// Get images by type (eventos, salones, etc.)
router.get("/type/:type", imageHandler.getImagesByType);

// Get images by related entity ID
router.get("/related/:relatedId", imageHandler.getImagesByRelatedId);

// Create new image
router.post("/", imageHandler.createImage);

// Update image
router.put("/:id", imageHandler.updateImage);

// Soft delete image (deactivate)
router.delete("/:id", imageHandler.deleteImage);

// Hard delete image (remove from database)
router.delete("/permanent/:id", imageHandler.hardDeleteImage);

module.exports = router;
