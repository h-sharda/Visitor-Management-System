// routes/entryRoutes.js

const express = require('express');
const router = express.Router();
const entryController = require('../controllers/entryController');
const { upload, multerErrorHandler } = require('../middlewares/uploadMiddleware');

// Upload entry route
router.post('/upload', upload.single('entry'), entryController.createEntry, multerErrorHandler);

// Get entries route
router.get('/entries', entryController.getEntries);

// Update Vehicle number route
router.put('/entries/:id', entryController.updateEntryNumber);

// Delete entry route
router.delete('/entries/:id', entryController.deleteEntry);

module.exports = router;
