import multer from "multer";
import path from "path";

// Configure storage
const storage = multer.memoryStorage();

// Define file filter with specific handling for BMP files
const fileFilter = (req, file, cb) => {
  // ESP32-CAM primarily sends BMP files, but support other formats too
  const fileTypes = /jpeg|jpg|png|bmp/;

  // Check extension
  const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());

  // Check mime type - note ESP32-CAM might send image/bmp
  const mimetype = fileTypes.test(file.mimetype);

  // For ESP32-CAM, accept files without a standard mimetype if they have the right extension
  if (
    (mimetype && extname) ||
    (extname && file.mimetype === "application/octet-stream")
  ) {
    return cb(null, true);
  } else {
    cb("Error: Images only!");
  }
};

// Configure upload with larger size limit for ESP32-CAM images
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: fileFilter,
});

export const multerErrorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    console.error("Multer error:", err);
    return res.status(400).json({
      status: "error",
      message: "File upload error",
      detail: err.message,
    });
  } else if (err) {
    console.error("Other upload error:", err);
    return res.status(500).json({
      status: "error",
      message: "Unknown error occurred during file upload",
      detail: err.message,
    });
  }
  next();
};
