// src/routes/uploadRoutes.js
const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const { uploadImage } = require("../Controllers/uploadController");

router.post("/image", upload.single("image"), uploadImage);

module.exports = router;
