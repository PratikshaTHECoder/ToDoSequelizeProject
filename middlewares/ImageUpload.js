// middlewares/ImageUpload.js
const multer = require('multer');
const path = require('path');
const Constant = require('../Constant');

// Define storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, Constant.Messages.UPLOADFOlDER); // Destination folder
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
        cb(null, uniqueName); // Unique file name
    },
});

// Multer instance
const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const fileTypes = /jpeg|jpg|png/; // Allowed extensions
        const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
        const mimeType = fileTypes.test(file.mimetype);

        if (extName && mimeType) {
            cb(null, true);
        } else {
            cb(new Error(Constant.Messages.IMAGEERROR));
        }
    },
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB file size limit
});

module.exports = upload;
