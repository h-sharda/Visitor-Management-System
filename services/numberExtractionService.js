import axios from 'axios';

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

export default extractNumberPlate;
