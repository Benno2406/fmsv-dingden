const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { getUserUploadLimits } = require('./rbac');

// Ensure upload directories exist
const savesDir = path.join(__dirname, '..', '..', 'Saves');
const imagesDir = path.join(savesDir, 'images');
const documentsDir = path.join(savesDir, 'documents');
const avatarsDir = path.join(savesDir, 'avatars');
const tempDir = path.join(savesDir, 'temp');

[savesDir, imagesDir, documentsDir, avatarsDir, tempDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Allowed file types
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const DOCUMENT_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const ALLOWED_TYPES = [...IMAGE_TYPES, ...DOCUMENT_TYPES];

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = tempDir;

    if (IMAGE_TYPES.includes(file.mimetype)) {
      if (file.fieldname === 'avatar') {
        uploadPath = avatarsDir;
      } else {
        uploadPath = imagesDir;
      }
    } else if (DOCUMENT_TYPES.includes(file.mimetype)) {
      uploadPath = documentsDir;
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${uniqueSuffix}${ext}`);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Dateityp nicht erlaubt: ${file.mimetype}`), false);
  }
};

// Get max file size based on user role (RBAC)
const getMaxFileSize = async (req) => {
  if (!req.user || !req.user.id) {
    return 5 * 1024 * 1024; // 5MB default
  }

  const limits = await getUserUploadLimits(req.user.id);
  return limits.maxUploadSizeMB * 1024 * 1024; // Convert MB to bytes
};

// Create upload middleware with dynamic file size
const createUpload = (fieldName = 'file', maxCount = 1) => {
  return async (req, res, next) => {
    const maxSize = await getMaxFileSize(req);
    
    const upload = multer({
      storage,
      fileFilter,
      limits: {
        fileSize: maxSize
      }
    });

    const uploadHandler = maxCount === 1 
      ? upload.single(fieldName)
      : upload.array(fieldName, maxCount);

    uploadHandler(req, res, async (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          const maxSize = await getMaxFileSize(req);
          const maxSizeMB = (maxSize / 1048576).toFixed(0);
          return res.status(413).json({
            success: false,
            message: `Datei zu groß. Maximum: ${maxSizeMB}MB`
          });
        }
        return res.status(400).json({
          success: false,
          message: `Upload-Fehler: ${err.message}`
        });
      } else if (err) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }
      next();
    });
  };
};

// Upload configurations
const uploadSingleImage = createUpload('image', 1);
const uploadMultipleImages = createUpload('images', 10);
const uploadDocument = createUpload('document', 1);
const uploadAvatar = createUpload('avatar', 1);

// Delete file helper
const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

module.exports = {
  createUpload,
  uploadSingleImage,
  uploadMultipleImages,
  uploadDocument,
  uploadAvatar,
  deleteFile
};
