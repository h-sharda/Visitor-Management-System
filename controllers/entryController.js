const { s3Client, getSignedUrl } = require('../config/aws');
const { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const Entry = require('../models/Entry');
const extractNumberPlate = require('../services/numberExtractionService');

exports.createEntry = async (req, res) => {
  try {
    // Check if file exists
    if (!req.file) {
      return res.status(400).send('No file uploaded or invalid file type.');
    }

    const entryTime = new Date();

    // S3 upload parameters
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `vehicle-entries/${entryTime.getTime()}_${req.file.originalname}`,
      Body: req.file.buffer,
      ContentType: req.file.mimetype
    };

    // Upload to S3
    await s3Client.send(new PutObjectCommand(params));

    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: params.Key
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    const numberPlate = await extractNumberPlate(signedUrl);

    // Create MongoDB document
    const entry = new Entry({
      timestamp: entryTime,
      imageKey: params.Key,
      number: numberPlate
    });
    
    await entry.save();

    res.redirect('/');
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).send('Error uploading entry');
  }
};

exports.getEntries = async (req, res) => {
  try {
    const entries = await Entry.find().sort({ timestamp: -1 });
    
    // Generate signed URLs for private entries
    const entriesWithUrls = await Promise.all(entries.map(async (entry) => {
      const command = new GetObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: entry.imageKey
      });

      const signedUrl = await getSignedUrl(s3Client, command, { 
        expiresIn: 3600 // URL valid for 1 hour 
      });

      return {
        ...entry.toObject(),
        signedUrl
      };
    }));

    res.json(entriesWithUrls);
  } catch (error) {
    console.error('Error fetching entries:', error);
    res.status(500).send('Error fetching entries');
  }
};

// Update entry number
exports.updateEntryNumber = async (req, res) => {
  try {
    const { id } = req.params;
    const { number } = req.body;

    // Validate input
    if (!number) {
      return res.status(400).json({ message: 'Number is required' });
    }

    // Find and update the entry
    const entry = await Entry.findByIdAndUpdate(
      id, 
      { number }, 
      { new: true, runValidators: true }
    );

    if (!entry) {
      return res.status(404).json({ message: 'Entry not found' });
    }

    res.json(entry);
  } catch (error) {
    console.error('Error updating entry:', error);
    res.status(500).json({ message: 'Error updating entry', error: error.message });
  }
};

// Delete entry
exports.deleteEntry = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the entry first to get the S3 key
    const entry = await Entry.findById(id);
    if (!entry) {
      return res.status(404).json({ message: 'Entry not found' });
    }

    // Delete from S3
    const deleteParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: entry.imageKey
    };
    await s3Client.send(new DeleteObjectCommand(deleteParams));

    // Delete from MongoDB
    await Entry.findByIdAndDelete(id);

    res.json({ message: 'Entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting entry:', error);
    res.status(500).json({ message: 'Error deleting entry', error: error.message });
  }
};
