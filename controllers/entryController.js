import { s3Client, getSignedUrl } from "../config/aws.js";
import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import Entry from "../models/Entry.js";
import { extractNumberPlate } from "../services/numberExtractionService.js";

export async function createEntry(req, res) {
  try {
    if (!req.file) {
      return res.status(400).send("No file uploaded or invalid file type.");
    }

    const entryTime = new Date();

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `vehicle-entries/${entryTime.getTime()}_${req.file.originalname}`,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    };

    await s3Client.send(new PutObjectCommand(params));

    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: params.Key,
    });

    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600,
    });
    
    const numberPlate = await extractNumberPlate(req.file.buffer, req.file.originalname);

    const entry = new Entry({
      timestamp: entryTime,
      imageKey: params.Key,
      number: numberPlate,
    });

    await entry.save();

    res.redirect("/");
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).send("Error uploading entry");
  }
}

export async function getEntries(req, res) {
  try {
    // Add pagination support
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const entries = await Entry.find()
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);

    const totalEntries = await Entry.countDocuments();

    const entriesWithUrls = await Promise.all(
      entries.map(async (entry) => {
        const command = new GetObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: entry.imageKey,
        });

        const signedUrl = await getSignedUrl(s3Client, command, {
          expiresIn: 3600,
        });

        return {
          ...entry.toObject(),
          signedUrl,
        };
      })
    );

    res.json({
      entries: entriesWithUrls,
      totalEntries,
      hasMore: totalEntries > skip + entries.length,
    });
  } catch (error) {
    console.error("Error fetching entries:", error);
    res.status(500).send("Error fetching entries");
  }
}

export async function updateEntryNumber(req, res) {
  try {
    const { id } = req.params;
    const { number } = req.body;

    if (!number) {
      return res.status(400).json({ message: "Number is required" });
    }

    const entry = await Entry.findByIdAndUpdate(
      id,
      { number },
      { new: true, runValidators: true }
    );

    if (!entry) {
      return res.status(404).json({ message: "Entry not found" });
    }

    res.json(entry);
  } catch (error) {
    console.error("Error updating entry:", error);
    res
      .status(500)
      .json({ message: "Error updating entry", error: error.message });
  }
}

export async function deleteEntry(req, res) {
  try {
    const { id } = req.params;

    const entry = await Entry.findById(id);
    if (!entry) {
      return res.status(404).json({ message: "Entry not found" });
    }

    const deleteParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: entry.imageKey,
    };
    await s3Client.send(new DeleteObjectCommand(deleteParams));

    await Entry.findByIdAndDelete(id);

    res.json({ message: "Entry deleted successfully" });
  } catch (error) {
    console.error("Error deleting entry:", error);
    res
      .status(500)
      .json({ message: "Error deleting entry", error: error.message });
  }
}
