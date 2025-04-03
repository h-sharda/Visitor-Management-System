import express from 'express';
import { upload, multerErrorHandler } from '../middlewares/upload32Middleware.js';
import { s3Client, getSignedUrl } from '../config/aws.js';
import { PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import Entry from '../models/Entry.js';
import extractNumberPlate from '../services/numberExtractionService.js';

const router = express.Router();

// ESP32-CAM Authentication middleware
const authenticateESP32CAM = (req, res, next) => {
  const authToken = req.headers.authorization;
  const validToken = process.env.ESP32_PASSWORD || 'abc'; // Added fallback for testing
  
  if (!authToken || authToken !== validToken) {
    return res.status(401).json({ message: 'Unauthorized: Invalid ESP32-CAM token' });
  }
  
  next();
};

// Handle ESP32-CAM image uploads
router.post('/esp32-upload', authenticateESP32CAM, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded or invalid file type' });
    }

    const entryTime = new Date();
    
    // Upload to S3 - fixed template string syntax
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `vehicle-entries/esp32cam_${entryTime.getTime()}_${req.file.originalname}`,
      Body: req.file.buffer,
      ContentType: req.file.mimetype
    };

    await s3Client.send(new PutObjectCommand(params));

    // Generate signed URL for license plate extraction
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: params.Key
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    
    // Extract license plate number using your existing service
    const numberPlate = await extractNumberPlate(signedUrl);

    // Create entry in MongoDB
    const entry = new Entry({
      timestamp: entryTime,
      imageKey: params.Key,
      number: numberPlate
    });
    
    await entry.save();

    res.status(201).json({ 
      message: 'Entry created successfully', 
      entryId: entry._id,
      numberPlate 
    });
  } catch (error) {
    console.error('ESP32-CAM upload error:', error);
    res.status(500).json({ message: 'Error processing ESP32-CAM upload', error: error.message });
  }
}, multerErrorHandler);

export default router;
