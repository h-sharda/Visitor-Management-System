import { fetchEntries, updateEntryNumber, deleteEntry } from "../utils/api.js";
import { currentUser } from "../utils/state.js";
import { canManageEntries } from "../utils/permissions.js";
import { showNotification } from "../utils/notifications.js";

let entries = [];
let currentPage = 1;
let isLoading = false;
let hasMoreEntries = true;
let observer = null;

// Render entry table
export async function renderEntryTable() {
  try {
    // Reset state when initializing table
    currentPage = 1;
    entries = [];
    hasMoreEntries = true;
    isLoading = false;

    const entryContainer = document.getElementById("vehicleEntryTable");

    entryContainer.innerHTML = ""; // Clear existing entries

    // Add a loading indicator
    const loadingIndicator = document.createElement("div");
    loadingIndicator.id = "loadingIndicator";
    loadingIndicator.className = "text-center py-4";
    loadingIndicator.innerHTML = `
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      <p class="mt-2 text-gray-600">Loading entries...</p>
    `;
    entryContainer.appendChild(loadingIndicator);

    // Fetch initial entries from API
    await loadMoreEntries();

    // Setup intersection observer for infinite scrolling
    setupInfiniteScroll();
  } catch (error) {
    console.error("Error rendering entry table:", error);
    const entryContainer = document.getElementById("vehicleEntryTable");
    entryContainer.innerHTML = `
      <div class="px-6 py-4 text-center text-red-500">
        Failed to load entries. Please try again later.
      </div>
    `;
  }
}

// Load more entries
async function loadMoreEntries() {
  if (isLoading || !hasMoreEntries) return;

  try {
    isLoading = true;

    // Show loading indicator
    const loadingIndicator = document.getElementById("loadingIndicator");
    if (loadingIndicator) {
      loadingIndicator.classList.remove("hidden");
    }

    await new Promise((resolve) => setTimeout(resolve, 500));

    // Fetch entries from API
    const response = await fetchEntries(currentPage);

    // Remove loading indicator
    if (loadingIndicator) {
      loadingIndicator.remove();
    }

    if (!response) return; // Handle null response (e.g., auth failed)

    const newEntries = response.entries;

    // Check if we have more entries to load
    if (newEntries.length === 0) {
      hasMoreEntries = false;
      return;
    }

    // Add new entries to the existing entries array
    entries = [...entries, ...newEntries];

    const noEntriesMessage = document.getElementById("noEntriesMessage");
    const entryContainer = document.getElementById("vehicleEntryTable");

    if (entries.length === 0) {
      noEntriesMessage.classList.remove("hidden");
      return;
    } else {
      noEntriesMessage.classList.add("hidden");
    }

    // Group new entries by date
    const entriesByDate = groupEntriesByDate(newEntries);

    // Append new entries to the container
    appendEntriesByDate(entriesByDate, entryContainer);

    // Create a new loading indicator for the next batch
    if (hasMoreEntries) {
      const newLoadingIndicator = document.createElement("div");
      newLoadingIndicator.id = "loadingIndicator";
      newLoadingIndicator.className = "text-center py-4";
      newLoadingIndicator.innerHTML = `
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <p class="mt-2 text-gray-600">
          <button id="loadMoreButton" class="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded transition-colors">
            Load More
          </button>
        </p>
      `;
      entryContainer.appendChild(newLoadingIndicator);

      // Add click event listener to the button (fallback for mobile)
      const loadMoreButton =
        newLoadingIndicator.querySelector("#loadMoreButton");
      if (loadMoreButton) {
        loadMoreButton.addEventListener("click", loadMoreEntries);
      }

      // Observe the new loading indicator
      if (observer) {
        observer.observe(newLoadingIndicator);
      }
    }

    // Increment page number for next fetch
    currentPage++;
  } catch (error) {
    console.error("Error loading more entries:", error);
  } finally {
    isLoading = false;
  }
}

// Set up infinite scroll using IntersectionObserver
function setupInfiniteScroll() {
  // Disconnect existing observer if any
  if (observer) {
    observer.disconnect();
  }

  // Create a new observer
  observer = new IntersectionObserver(
    (entries) => {
      const loadingIndicator = entries[0];
      if (loadingIndicator.isIntersecting && !isLoading) {
        loadMoreEntries();
      }
    },
    {
      root: null, // viewport
      rootMargin: "100px", // start loading before element is visible
      threshold: 0.1, // trigger when 10% of the target is visible
    }
  );

  // Start observing the loading indicator
  const loadingIndicator = document.getElementById("loadingIndicator");
  if (loadingIndicator) {
    observer.observe(loadingIndicator);
  }
}

// Append new entries to the container
function appendEntriesByDate(entriesByDate, container) {
  Object.entries(entriesByDate).forEach(([date, dateEntries]) => {
    // Check if we already have a table for this date
    let dateTable = container.querySelector(`[data-date="${date}"]`);

    if (!dateTable) {
      // Create a new date header and table
      const dateHeader = document.createElement("h2");
      dateHeader.className = "text-xl font-bold mt-8 mb-4";
      dateHeader.textContent = `Date: ${date}`;
      dateHeader.style.textAlign = "center";
      container.appendChild(dateHeader);

      const tableWrapper = document.createElement("div");
      tableWrapper.className = "overflow-x-auto";
      tableWrapper.setAttribute("data-date", date);

      const table = document.createElement("table");
      table.className =
        "min-w-full divide-y divide-gray-200 mb-8 responsive-table";

      const thead = document.createElement("thead");
      thead.className = "bg-gray-200";
      thead.innerHTML = `
        <tr>
          <th scope="col" class="px-6 py-3 text-center text-gray-500 uppercase tracking-wider" style="font-size: 14px;">Time</th>
          <th scope="col" class="px-6 py-3 text-center text-gray-500 uppercase tracking-wider" style="font-size: 14px;">Vehicle Number</th>
          <th scope="col" class="px-6 py-3 text-center text-gray-500 uppercase tracking-wider" style="font-size: 14px;">Image</th>
        </tr>
      `;
      table.appendChild(thead);

      const tbody = document.createElement("tbody");
      tbody.className = "bg-white divide-y divide-gray-200";
      table.appendChild(tbody);

      tableWrapper.appendChild(table);
      container.appendChild(tableWrapper);

      dateTable = tableWrapper;
    }

    // Get the tbody of the table
    const tbody = dateTable.querySelector("tbody");

    // Add new entries to the tbody
    dateEntries.forEach((entry) => {
      const entryDate = new Date(entry.timestamp);
      const formattedTime = entryDate.toLocaleTimeString();

      const row = document.createElement("tr");
      row.className = "hover:bg-gray-50 transition-colors";
      row.setAttribute("data-entry-id", entry._id);

      // Check if user has edit/delete permissions
      const canEdit = canManageEntries(currentUser);

      row.innerHTML = `
        <td class="px-6 py-4 whitespace-nowrap text-center text-gray-900 text-base font-medium" data-label="Time">
          ${formattedTime}
          ${
            canEdit
              ? `
            <div class="mt-2">
              <button class="delete-button text-red-600 hover:text-red-800 hover:bg-red-100 p-1.5 rounded-full btn-press-effect" title="Delete entry" onclick="window.deleteEntryConfirm('${entry._id}')">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          `
              : ""
          }
        </td>
        
        <td class="px-6 py-4 whitespace-nowrap text-center" data-label="Vehicle Number">
          ${
            canEdit
              ? `
            <div class="relative inline-block">
              <input 
                type="text" 
                class="entry-number-input text-base font-medium text-center border border-gray-300 rounded-md py-1 px-2 w-36"
                value="${entry.number || ""}"
                data-entry-id="${entry._id}"
                data-original-value="${entry.number || ""}"
                placeholder="Enter number"
              />
            </div>
          `
              : `<span class="text-base font-medium text-gray-900">${
                  entry.number || "Not specified"
                }</span>`
          }
        </td>
        <td class="px-6 py-4 text-center relative image-cell">
          <div class="image-container">
            <img src="${
              entry.signedUrl
            }" class="max-h-10vh object-contain rounded-md cursor-pointer mx-auto" alt="Vehicle Image" onclick="window.expandImage('${
        entry.signedUrl
      }')">
          </div>
        </td>
      `;

      tbody.appendChild(row);
    });

    // Add event listeners for inline number editing
    if (canManageEntries(currentUser)) {
      dateTable.querySelectorAll(".entry-number-input").forEach((input) => {
        // Save on blur
        input.addEventListener("blur", handleNumberUpdate);

        // Save on Enter key
        input.addEventListener("keydown", (e) => {
          if (e.key === "Enter") {
            input.blur();
          }
        });
      });
    }
  });
}

// Handle number update
async function handleNumberUpdate(event) {
  const input = event.target;
  const entryId = input.dataset.entryId;
  const newNumber = input.value.trim();
  const originalValue = input.dataset.originalValue;

  // If value hasn't changed, do nothing
  if (newNumber === originalValue) return;

  try {
    // Show loading state
    input.disabled = true;
    input.classList.add("opacity-50");

    // Call API to update entry number
    const response = await updateEntryNumber(entryId, newNumber);

    if (response) {
      // Update was successful
      input.dataset.originalValue = newNumber;
      showNotification("Vehicle number updated successfully", "success");
    } else {
      // Revert to original value
      input.value = originalValue;
      showNotification("Failed to update vehicle number", "error");
    }
  } catch (error) {
    console.error("Error updating vehicle number:", error);
    // Revert to original value
    input.value = originalValue;
    showNotification("Failed to update vehicle number", "error");
  } finally {
    // Remove loading state
    input.disabled = false;
    input.classList.remove("opacity-50");
  }
}

// Group entries by date
function groupEntriesByDate(entries) {
  return entries.reduce((acc, entry) => {
    const entryDate = new Date(entry.timestamp);
    const formattedDate = entryDate.toLocaleDateString();
    if (!acc[formattedDate]) {
      acc[formattedDate] = [];
    }
    acc[formattedDate].push(entry);
    return acc;
  }, {});
}

// Clean up observer when component unmounts
export function cleanup() {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
}

// Create the delete entry confirmation function
window.deleteEntryConfirm = function (entryId) {

  if (confirm('Are you sure you want to delete this entry?')) {
    deleteEntry(entryId).then(response => {
      if (response) {
        // Remove entry from the table
        document.querySelector(`tr[data-entry-id="${entryId}"]`).remove();
              
        // Check if table is now empty
        const tbody = document.querySelector("#vehicleEntryTable tbody");
        if (!tbody || !tbody.querySelector('tr')) {
          document.getElementById('noEntriesMessage').classList.remove('hidden');
        }
              
        showNotification('Entry deleted successfully', 'success');
      }
    })
      .catch(error => {
        console.error('Error deleting entry:', error);
        showNotification('Failed to delete entry', 'error');
      });
  }
}
