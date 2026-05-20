const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const UPLOAD_DIRS = {
  avatars: path.join(__dirname, '../uploads/avatars'),
  posts: path.join(__dirname, '../uploads/posts'),
  pages: path.join(__dirname, '../uploads/pages'),
};

Object.values(UPLOAD_DIRS).forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const ALLOWED_TYPES = /jpeg|jpg|png|gif|webp/;

function imageUpload(options = {}) {
  const { subDir = 'posts', fieldName = 'image', width, height, quality = 80 } = options;

  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 1024 * 1024 * 10 },
    fileFilter: (req, file, cb) => {
      const mimetype = ALLOWED_TYPES.test(file.mimetype);
      const extname = ALLOWED_TYPES.test(path.extname(file.originalname).toLowerCase());
      if (mimetype && extname) return cb(null, true);
      cb(new Error('Only images (jpeg, jpg, png, gif, webp) are allowed!'));
    }
  }).single(fieldName);

  return (req, res, next) => {
    upload(req, res, async (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ message: 'File too large (max 10MB)' });
        return res.status(400).json({ message: err.message });
      }

      if (!req.file) return next();

      try {
        let pipeline = sharp(req.file.buffer).webp({ quality, effort: 4 });

        if (width && height) {
          pipeline = pipeline.resize(width, height, { fit: 'cover', position: 'centre' });
        } else if (width) {
          pipeline = pipeline.resize(width, null, { fit: 'inside', withoutEnlargement: true });
        }

        const webpBuffer = await pipeline.toBuffer();
        const webpFilename = fieldName + '-' + Date.now() + '-' + Math.round(Math.random() * 1E9) + '.webp';
        const destDir = UPLOAD_DIRS[subDir];
        const webpPath = path.join(destDir, webpFilename);

        fs.writeFileSync(webpPath, webpBuffer);

        req.imageUrl = `/uploads/${subDir}/${webpFilename}`;
        req.imageFilePath = webpPath;
        next();
      } catch (sharpErr) {
        console.error('Image processing error:', sharpErr);
        return res.status(500).json({ message: 'Failed to process image' });
      }
    });
  };
}

function deleteOldImage(imagePath) {
  if (!imagePath) return;
  const fullPath = path.join(__dirname, '../', imagePath);
  if (fs.existsSync(fullPath)) {
    fs.unlink(fullPath, (err) => { if (err) console.error('Error deleting old image:', err); });
  }
}

function cleanupImage(imagePath) {
  if (imagePath && fs.existsSync(imagePath)) {
    fs.unlink(imagePath, (err) => { if (err) console.error('Error cleaning up image:', err); });
  }
}

module.exports = { imageUpload, deleteOldImage, cleanupImage, UPLOAD_DIRS };
