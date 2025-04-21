import axios from "axios";
import FormData from "form-data";

// API details
const API_KEY = process.env.NUMBER_EXTRACTION_API_KEY;
const API_URL = process.env.NUMBER_EXTRACTION_API;

/**
 * Extracts number plate from an image buffer using CircuitDigest API.
 * @param {Buffer} imageBuffer - The image file buffer.
 * @param {string} filename - Original filename (used for MIME type and naming).
 * @returns {Promise<string>} - Returns extracted number plate or 'Not found'.
 */
export async function extractNumberPlate(imageBuffer, filename) {
  try {
    const form = new FormData();
    form.append("imageFile", imageBuffer, {
      filename: filename || "vehicle.jpg",
      contentType: "image/jpeg", // You could dynamically set this if needed
    });

    const headers = {
      ...form.getHeaders(),
      Authorization: API_KEY,
    };

    const response = await axios.post(API_URL, form, { headers });

    const numberPlate = response.data?.data?.number_plate || "Not found";
    return numberPlate;
  } catch (error) {
    console.error("Number plate extraction failed:", error.message);
    return "Not found";
  }
}
