import { useState } from "react";
import { uploadEntry } from "../services/api";
import { useNotification } from "../hooks/useNotification";

const EntryForm = ({ onUploadSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState(null);
  const { showNotification } = useNotification();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      showNotification("Please select an image to upload.", "error");
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    formData.append("entry", file);

    try {
      await uploadEntry(formData);
      showNotification("Entry uploaded successfully", "success");
      setFile(null);

      // Reset file input
      e.target.reset();

      // Refresh entries list
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (error) {
      console.error("Upload error:", error);
      showNotification("Failed to upload entry. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
      <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
        Add New Vehicle Entry
      </h1>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-4"
      >
        <div className="flex-grow w-full md:w-auto">
          <input
            type="file"
            id="fileInput"
            accept="image/*"
            required
            onChange={handleFileChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className={`px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300 ease-in-out btn-press-effect ${
            isLoading ? "opacity-75 cursor-not-allowed" : ""
          }`}
        >
          {isLoading ? "Uploading..." : "Upload Image"}
        </button>
      </form>
    </div>
  );
};

export default EntryForm;
