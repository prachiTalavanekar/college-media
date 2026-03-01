const multer = require('multer');
const path = require('path');

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter for profile images (strict)
const imageFileFilter = (req, file, cb) => {
  // Accept images only
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// File filter for study materials (permissive)
const studyMaterialFileFilter = (req, file, cb) => {
  // Accept common document and media types
  const allowedMimeTypes = [
    'image/',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/',
    'video/',
    'audio/'
  ];
  
  const isAllowed = allowedMimeTypes.some(type => file.mimetype.startsWith(type));
  
  if (isAllowed) {
    cb(null, true);
  } else {
    cb(new Error('File type not supported. Please upload documents, images, or media files.'), false);
  }
};

// Configure multer for profile images
const uploadImage = multer({
  storage: storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  }
});

// Configure multer for study materials (larger size limit, more file types)
const uploadStudyMaterial = multer({
  storage: storage,
  fileFilter: studyMaterialFileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB max file size for study materials
  }
});

// Default export for backward compatibility (profile images)
module.exports = uploadImage;

// Named exports for specific use cases
module.exports.uploadImage = uploadImage;
module.exports.uploadStudyMaterial = uploadStudyMaterial;
