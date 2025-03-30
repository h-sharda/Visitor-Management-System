const express = require('express');
const router = express.Router();
const entryController = require('../controllers/entryController');
const multer = require('multer');

// Multer upload middleware
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB file size limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/gif', 'image/bmp', 'image/avif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});

// Multer error handler middleware
const multerErrorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).send('File upload error: ' + err.message);
  } else if (err) {
    return res.status(400).send(err.message);
  }
  next();
};

// Upload entry route
router.post('/upload', 
  upload.single('entry'), 
  entryController.createEntry,
  multerErrorHandler
);

// Get entries route
router.get('/entries', entryController.getEntries);

// Update Vehicle number route
router.put('/entries/:id', entryController.updateEntryNumber);

// Delete entry route
router.delete('/entries/:id', entryController.deleteEntry);

module.exports = router;
