const express = require('express');
const router = express.Router();
const entryController = require('../controllers/entryController');
const { upload, multerErrorHandler } = require('../middlewares/uploadMiddleware');

const isAuthenticated = (req, res, next) => {
  if (req.user) {
      return next();
  }
  return res.status(401).json({ message: 'Authentication required' });
};  

router.get('/entries', isAuthenticated, entryController.getEntries);
router.put('/entries/:id', isAuthenticated, entryController.updateEntryNumber);
router.delete('/entries/:id', isAuthenticated, entryController.deleteEntry);
router.post('/upload', isAuthenticated, upload.single('entry'), entryController.createEntry, multerErrorHandler);

module.exports = router;
