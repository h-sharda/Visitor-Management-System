import express from "express";
import {
  upload,
  multerErrorHandler,
} from "../middlewares/upload32Middleware.js";
import { s3Client, getSignedUrl } from "../config/aws.js";
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import Entry from "../models/Entry.js";

const router = express.Router();

// Updated route to match FastAPI endpoint
router.post(
  "/upload",
  upload.single("image"),
  async (req, res) => {
    try {
      // Check for required fields
      if (!req.file) {
        return res.status(400).json({
          status: "error",
          detail: "No image file provided",
        });
      }

      if (!req.body.number_plate || !req.body.timestamp) {
        return res.status(400).json({
          status: "error",
          detail: "Missing required fields: number_plate and timestamp",
        });
      }

      const numberPlate = req.body.number_plate;
      const timestamp = req.body.timestamp;

      // Generate a clean timestamp for the filename
      const cleanTimestamp = timestamp.replace(" ", "_").replace(/:/g, "-");
      const imageFilename = `${cleanTimestamp}_${numberPlate}.bmp`;

      // Upload to S3
      const s3Key = `anpr_data/images/${imageFilename}`;
      const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: s3Key,
        Body: req.file.buffer,
        ContentType: "image/bmp",
      };

      await s3Client.send(new PutObjectCommand(params));

      // Generate a signed URL for accessing the image
      const command = new GetObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: s3Key,
      });

      const imageUrl = await getSignedUrl(s3Client, command, {
        expiresIn: 604800, // URL valid for 7 days
      });

      // Create entry in MongoDB
      const record = {
        number_plate: numberPlate,
        timestamp: timestamp,
        image_path: `/images/${imageFilename}`, // Keep path format similar to FastAPI
        s3_key: s3Key,
        s3_url: imageUrl,
        received_at: new Date().toISOString(),
      };

      // Save to MongoDB
      const entry = new Entry(record);
      await entry.save();

      // Match the FastAPI response format
      return res.status(200).json({
        status: "success",
        message: `ANPR data received and saved for plate ${numberPlate}`,
        record: {
          id: entry._id,
          number_plate: numberPlate,
          timestamp: timestamp,
          image_path: `/images/${imageFilename}`,
          received_at: record.received_at,
        },
      });
    } catch (error) {
      console.error("ESP32-CAM ANPR upload error:", error);
      return res.status(500).json({
        status: "error",
        detail: `Error saving ANPR data: ${error.message}`,
      });
    }
  },
  multerErrorHandler
);

export default router;
