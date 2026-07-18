const multer = require('multer');
const path = require('path');
const fs = require('fs');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');

const uploadDir = path.join(process.cwd(), env.upload.dir, 'animals');
fs.mkdirSync(uploadDir, { recursive: true });

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const unique = `${req.params.id || 'animal'}-${Date.now()}${ext}`;
    cb(null, unique);
  },
});

const fileFilter = (req, file, cb) => {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(ApiError.badRequest('Only JPEG, PNG, or WEBP images are allowed'));
  }
  cb(null, true);
};

const uploadAnimalPhoto = multer({
  storage,
  fileFilter,
  limits: { fileSize: env.upload.maxFileSizeMb * 1024 * 1024 },
}).single('photo');

module.exports = { uploadAnimalPhoto, uploadDir };
