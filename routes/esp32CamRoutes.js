import express from "express";
import {
  upload,
  multerErrorHandler,
} from "../middlewares/upload32Middleware.js";
import { s3Client } from "../config/aws.js";
import { PutObjectCommand } from "@aws-sdk/client-s3";
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

      if (!req.body.number_plate) {
        return res.status(400).json({
          status: "error",
          detail: "Missing required fields: number_plate and timestamp",
        });
      }

      const numberPlate = req.body.number_plate;
      const timestamp = Date.now();

      // Upload to S3
      const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `vehicle-entries/${timestamp}_${req.file.originalname}`,
        Body: req.file.buffer,
        ContentType: "image/bmp",
      };

      await s3Client.send(new PutObjectCommand(params));

      // Create entry in MongoDB
      const record = {
        timestamp: timestamp,
        imageKey: params.Key,
        number: numberPlate,
      };

      // Save to MongoDB
      const entry = new Entry(record);
      await entry.save();

      // Match the FastAPI response format
      return res.status(200).json({
        status: "success",
        message: `Entry recieved and saved in database`,
        record: {
          id: entry._id,
          number_plate: numberPlate,
          timestamp: timestamp,
          imageKey: params.Key,
          received_at: record.received_at,
        },
      });
    } catch (error) {
      console.error("ESP32-CAM upload error:", error);
      return res.status(500).json({
        status: "error",
        detail: `Error saving ESP entry: ${error.message}`,
      });
    }
  },
  multerErrorHandler
);

export default router;
