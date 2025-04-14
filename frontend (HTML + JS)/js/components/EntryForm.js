import { uploadEntry } from "../utils/api.js";
import { renderEntryTable } from "./EntryTable.js";
import { showNotification } from "../utils/notifications.js";

// Render entry form
export function renderEntryForm() {
  const container = document.getElementById("entryFormContainer");

  container.innerHTML = `
        <div class="bg-white shadow-lg rounded-lg p-6 mb-8">
            <h1 class="text-2xl font-bold text-center text-gray-800 mb-6">Add New Vehicle Entry</h1>
            
            <form id="uploadForm" action="/upload" method="POST" enctype="multipart/form-data" 
                class="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-4">
                <div class="flex-grow w-full md:w-auto">
                    <input 
                        type="file" 
                        name="entry" 
                        id="fileInput" 
                        accept="image/*" 
                        required 
                        class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                </div>
                <button 
                    type="submit" 
                    id="uploadButton"
                    class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300 ease-in-out btn-press-effect"
                >
                    Upload Image
                </button>
            </form>
        </div>
    `;

  // Add event listener to form
  document
    .getElementById("uploadForm")
    .addEventListener("submit", handleFormSubmit);
}

// Handle form submission with button state management
async function handleFormSubmit(e) {
  e.preventDefault();

  const uploadButton = document.getElementById("uploadButton");
  const originalText = uploadButton.textContent;

  // Show loading state
  uploadButton.textContent = "Uploading...";
  uploadButton.disabled = true;
  uploadButton.classList.add("opacity-75");

  const formData = new FormData(e.target);

  try {
    const response = await uploadEntry(formData);

    if (response && response.redirected) {
      window.location.href = response.url;
    } else if (response) {
      // Refresh entries after upload
      await renderEntryTable();

      // Clear the file input
      document.getElementById("fileInput").value = "";

      // Success feedback
      showNotification("Entry uploaded successfully", "success");
    }
  } catch (error) {
    console.error("Upload error:", error);
    showNotification("Failed to upload entry. Please try again.", "error");
  } finally {
    // Restore button state
    uploadButton.textContent = originalText;
    uploadButton.disabled = false;
    uploadButton.classList.remove("opacity-75");
  }
}
