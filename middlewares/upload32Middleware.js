import multer from 'multer';
import path from 'path';

// Configure storage
const storage = multer.memoryStorage();

// Define file filter with support for RGB565
const fileFilter = (req, file, cb) => {
  // Accept common image types plus our custom RGB565 files
  const fileTypes = /jpeg|jpg|png|bmp/;
  
  // Check extension
  const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
  
  // Check mime type or handle custom type
  const mimetype = fileTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Images only!');
  }
};

// Configure upload
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Increased to 5MB to accommodate RGB565 files
  },
  fileFilter: fileFilter,
});

// Middleware to handle multer errors
export const multerErrorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    console.error('Multer error:', err);
    return res.status(400).json({
      message: 'File upload error',
      error: err.message,
    });
  } else if (err) {
    console.error('Other upload error:', err);
    return res.status(500).json({
      message: 'Unknown error occurred during file upload',
      error: err.message,
    });
  }
  next();
};
