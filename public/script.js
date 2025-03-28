// Global variables to store current entries ID for modal actions
let currentEntryIdForUpdate = null;
let currentEntryIdForDelete = null;

async function fetchEntries() {
    try {
        const response = await fetch('/entries');
        const entries = await response.json();
        
        const entryTable = document.getElementById('vehicleEntryTable');
        const noEntriesMessage = document.getElementById('noEntriesMessage');
        
        entryTable.innerHTML = ''; // Clear existing entries

        if (entries.length === 0) {
            noEntriesMessage.classList.remove('hidden');
        } else {
            noEntriesMessage.classList.add('hidden');
        }

        entries.forEach(entry => {
            const entryDiv = document.createElement('div');
            entryDiv.className = 'entry-card bg-white rounded-lg shadow-md overflow-hidden transform transition duration-300 hover:scale-105 relative';
            
            const img = document.createElement('img');
            img.src = entry.signedUrl;
            img.className = 'w-full h-64 object-cover';
            img.alt = `Uploaded entry from ${entry.timestamp}`;
            
            const details = document.createElement('div');
            details.className = 'p-4';
            
            // Create number field with edit functionality
            const numberSpan = document.createElement('p');
            numberSpan.className = 'text-sm text-gray-500';
            numberSpan.innerHTML = `
                <span class="font-semibold">ID:</span> 
                <span id="number-${entry._id}">${entry.number}</span>
            `;

            const uploadDetails = document.createElement('p');
            uploadDetails.className = 'text-sm text-gray-600';
            uploadDetails.innerHTML = `
                <span class="font-semibold">Uploaded:</span> 
                ${new Date(entry.timestamp).toLocaleString()}
            `;

            // Action buttons container
            const actionButtons = document.createElement('div');
            actionButtons.className = 'absolute top-2 right-2 flex space-x-2';

            // Edit button
            const editButton = document.createElement('button');
            editButton.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-500 hover:text-blue-700" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
            `;
            editButton.className = 'hover:bg-blue-100 p-1 rounded-full';
            editButton.onclick = () => openUpdateModal(entry._id);

            // Delete button
            const deleteButton = document.createElement('button');
            deleteButton.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-500 hover:text-red-700" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
            `;
            deleteButton.className = 'hover:bg-red-100 p-1 rounded-full';
            deleteButton.onclick = () => openDeleteModal(entry._id);

            // Add buttons to action container
            actionButtons.appendChild(editButton);
            actionButtons.appendChild(deleteButton);

            details.appendChild(numberSpan);
            details.appendChild(uploadDetails);
            
            entryDiv.appendChild(img);
            entryDiv.appendChild(details);
            entryDiv.appendChild(actionButtons);
            
            entryTable.appendChild(entryDiv);
        });
    } catch (error) {
        console.error('Error fetching entries:', error);
        const entryTable = document.getElementById('vehicleEntryTable');
        entryTable.innerHTML = `
            <div class="col-span-full text-center text-red-500">
                Failed to load entries. Please try again later.
            </div>
        `;
    }
}

// Open Update Modal
function openUpdateModal(entryID) {
    const updateModal = document.getElementById('updateModal');
    const updateInput = document.getElementById('updateNumberInput');
    const currentNumber = document.getElementById(`number-${entryID}`).textContent;
    
    updateInput.value = currentNumber;
    currentEntryIdForUpdate = entryID;
    updateModal.classList.remove('hidden');
}

// Close Update Modal
function closeUpdateModal() {
    const updateModal = document.getElementById('updateModal');
    updateModal.classList.add('hidden');
    currentEntryIdForUpdate = null;
}

// Confirm Update
async function confirmUpdate() {
    if (!currentEntryIdForUpdate) return;

    const updateInput = document.getElementById('updateNumberInput');
    const newNumber = updateInput.value.trim();

    if (newNumber) {
        try {
            const response = await fetch(`/entries/${currentEntryIdForUpdate}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ number: newNumber })
            });

            if (response.ok) {
                // Update the number in the UI
                const numberSpan = document.getElementById(`number-${currentEntryIdForUpdate}`);
                numberSpan.textContent = newNumber;
                closeUpdateModal();
            } else {
                const errorData = await response.json();
                alert(`Error updating number: ${errorData.message}`);
            }
        } catch (error) {
            console.error('Error updating number:', error);
            alert('Failed to update number. Please try again.');
        }
    }
}

// Open Delete Modal
function openDeleteModal(entryID) {
    const deleteModal = document.getElementById('deleteModal');
    currentEntryIdForDelete = entryID;
    deleteModal.classList.remove('hidden');
}

// Close Delete Modal
function closeDeleteModal() {
    const deleteModal = document.getElementById('deleteModal');
    deleteModal.classList.add('hidden');
    currentEntryIdForDelete = null;
}

// Confirm Delete
async function confirmDelete() {
    if (!currentEntryIdForDelete) return;

    try {
        const response = await fetch(`/entries/${currentEntryIdForDelete}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            // Remove the entry from the UI
            const entryToRemove = document.querySelector(`.entry-card:has(#number-${currentEntryIdForDelete})`);
            if (entryToRemove) {
                entryToRemove.remove();
            }
            
            // Check if Entry Table is now empty
            const entryTable = document.getElementById('vehicleEntryTable');
            const noEntriesMessage = document.getElementById('noEntriesMessage');
            
            if (entryTable.children.length === 0) {
                noEntriesMessage.classList.remove('hidden');
            }

            closeDeleteModal();
        } else {
            const errorData = await response.json();
            alert(`Error deleting entry: ${errorData.message}`);
        }
    } catch (error) {
        console.error('Error deleting entry:', error);
        alert('Failed to delete entry. Please try again.');
    }
}

// Event Listeners for Modals
document.addEventListener('DOMContentLoaded', () => {
    // Update Modal Listeners
    document.getElementById('cancelUpdateBtn').addEventListener('click', closeUpdateModal);
    document.getElementById('confirmUpdateBtn').addEventListener('click', confirmUpdate);
    
    // Delete Modal Listeners
    document.getElementById('cancelDeleteBtn').addEventListener('click', closeDeleteModal);
    document.getElementById('confirmDeleteBtn').addEventListener('click', confirmDelete);

    // Close modals when clicking outside
    document.getElementById('updateModal').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) closeUpdateModal();
    });
    document.getElementById('deleteModal').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) closeDeleteModal();
    });
});

// Existing form submission code
document.getElementById('uploadForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });

        if (response.redirected) {
            window.location.href = response.url;
            await fetchEntries();
        }
    } catch (error) {
        console.error('Upload error:', error);
        alert('Failed to upload entries. Please try again.');
    }
});

// Fetch entries on page load
fetchEntries();
