import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Get max file size based on user role
const getMaxFileSize = (req) => {
  const isAdmin = req.user?.is_admin;
  const maxSizeMember = parseInt(process.env.MAX_FILE_SIZE_MEMBER) || 5242880; // 5MB
  const maxSizeAdmin = parseInt(process.env.MAX_FILE_SIZE_ADMIN) || 52428800; // 50MB
  
  return isAdmin ? maxSizeAdmin : maxSizeMember;
};

// Create upload middleware with dynamic file size
export const createUpload = (fieldName = 'file', maxCount = 1) => {
  return (req, res, next) => {
    const upload = multer({
      storage,
      fileFilter,
      limits: {
        fileSize: getMaxFileSize(req)
      }
    });

    const uploadHandler = maxCount === 1 
      ? upload.single(fieldName)
      : upload.array(fieldName, maxCount);

    uploadHandler(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          const maxSize = getMaxFileSize(req);
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
export const uploadSingleImage = createUpload('image', 1);
export const uploadMultipleImages = createUpload('images', 10);
export const uploadDocument = createUpload('document', 1);
export const uploadAvatar = createUpload('avatar', 1);

// Delete file helper
export const deleteFile = (filePath) => {
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
