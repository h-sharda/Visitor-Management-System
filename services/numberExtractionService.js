// services/nummberExtractionService.js

const axios = require('axios');

const extractNumberPlate = async (signedUrl) => {
  try {
    const response = await axios.post(process.env.NUMBER_EXTRACTION_API, {
      imageUrl: signedUrl
    });

    return response.data.numberPlate || "UNKNOWN";
  } catch (error) {
    console.error('Number extraction failed:', error);
    return "UNKNOWN";
  }
};

module.exports = extractNumberPlate;
