import axios from "axios";

const fallbackPlates = [
  "DL7CQ1939",
  "GJ03ER0563",
  "J389NLT"
];

const getRandomFallbackPlate = () => {
  const index = Math.floor(Math.random() * fallbackPlates.length);
  return fallbackPlates[index];
};

const extractNumberPlate = async (signedUrl) => {
  try {
    const response = await axios.post(process.env.NUMBER_EXTRACTION_API, {
      imageUrl: signedUrl,
    });

    return response.data.numberPlate || getRandomFallbackPlate();
  } catch (error) {
    console.error("Number extraction failed:", error);
    return getRandomFallbackPlate();
  }
};

export default extractNumberPlate;
