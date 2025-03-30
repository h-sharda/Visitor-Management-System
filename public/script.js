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
            // Format date and time
            const entryDate = new Date(entry.timestamp);
            const formattedDate = entryDate.toLocaleDateString();
            const formattedTime = entryDate.toLocaleTimeString();
            
            // Create table row
            const row = document.createElement('tr');
            row.className = 'hover:bg-gray-50 transition-colors';
            row.setAttribute('data-entry-id', entry._id);
            
            // Date cell
            const dateCell = document.createElement('td');
            dateCell.className = 'px-6 py-4 whitespace-nowrap text-sm text-gray-500';
            dateCell.textContent = formattedDate;
            
            // Time cell
            const timeCell = document.createElement('td');
            timeCell.className = 'px-6 py-4 whitespace-nowrap text-sm text-gray-500';
            timeCell.textContent = formattedTime;
            
            // Number cell with inline edit button
            const numberCell = document.createElement('td');
            numberCell.className = 'px-6 py-4 whitespace-nowrap';
            
            const numberWrapper = document.createElement('div');
            numberWrapper.className = 'flex items-center space-x-2';
            
            const numberSpan = document.createElement('span');
            numberSpan.id = `number-${entry._id}`;
            numberSpan.className = 'text-sm font-medium text-gray-900';
            numberSpan.textContent = entry.number;
            
            const editButton = document.createElement('button');
            editButton.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-500 hover:text-blue-700" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
            `;
            editButton.className = 'hover:bg-blue-100 p-1 rounded-full';
            editButton.title = 'Edit vehicle number';
            editButton.onclick = (e) => {
                e.stopPropagation();
                openUpdateModal(entry._id);
            };
            
            numberWrapper.appendChild(numberSpan);
            numberWrapper.appendChild(editButton);
            numberCell.appendChild(numberWrapper);
            
            // Image cell with delete button
            const imageCell = document.createElement('td');
            imageCell.className = 'px-6 py-4 relative imageCell';
            
            // Create a container for the image and delete button
            const imageContainer = document.createElement('div');
            imageContainer.className = 'relative';
            
            const img = document.createElement('img');
            img.src = entry.signedUrl;
            img.className = 'max-h-10vh object-contain rounded-md cursor-pointer';
            img.alt = `Vehicle Image`;
            img.onclick = (e) => {
                e.stopPropagation();
                expandImage(entry.signedUrl);
            };
            
            // Create delete button and position it at the top right
            const deleteButton = document.createElement('button');
            deleteButton.className = 'absolute top-0 right-0 text-red-600 hover:text-red-800 hover:bg-red-100 p-1.5 rounded-full';
            deleteButton.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
            `;
            deleteButton.title = 'Delete entry';
            deleteButton.onclick = (e) => {
                e.stopPropagation();
                openDeleteModal(entry._id);
            };
            
            // Add image and delete button to the container
            imageContainer.appendChild(img);
            imageContainer.appendChild(deleteButton);
            
            // Add the container to the cell
            imageCell.appendChild(imageContainer);
            
            // Add cells to row
            row.appendChild(dateCell);
            row.appendChild(timeCell);
            row.appendChild(numberCell);
            row.appendChild(imageCell);
            
            // Add row to table
            entryTable.appendChild(row);

        });
    } catch (error) {
        console.error('Error fetching entries:', error);
        const entryTable = document.getElementById('vehicleEntryTable');
        entryTable.innerHTML = `
            <tr>
                <td colspan="5" class="px-6 py-4 text-center text-red-500">
                    Failed to load entries. Please try again later.
                </td>
            </tr>
        `;
    }
}

// Function to expand image
function expandImage(imageUrl) {
    const container = document.getElementById('expandedImageContainer');
    
    // Create overlay content
    const overlayContent = document.createElement('div');
    overlayContent.className = 'expanded-image-overlay';
    
    // Create image element
    const img = document.createElement('img');
    img.src = imageUrl;
    img.className = 'expanded-image';
    img.alt = 'Expanded vehicle image';
    
    // Create close button
    const closeButton = document.createElement('button');
    closeButton.className = 'close-button';
    closeButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
    `;
    closeButton.onclick = (e) => {
        e.stopPropagation();
        collapseImage();
    };
    
    // Assemble the components
    overlayContent.appendChild(img);
    overlayContent.appendChild(closeButton);
    
    // Clear and add to container
    container.innerHTML = '';
    container.appendChild(overlayContent);
    container.classList.remove('hidden');
    
    // Add click event to close when clicking outside the image
    overlayContent.onclick = (e) => {
        if (e.target === overlayContent) {
            collapseImage();
        }
    };
    
    // Add escape key listener
    document.addEventListener('keydown', handleEscapeKey);
}

// Function to collapse image
function collapseImage() {
    const container = document.getElementById('expandedImageContainer');
    
    // Properly remove all child elements before hiding
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
    
    container.classList.add('hidden');
    
    // Remove escape key listener
    document.removeEventListener('keydown', handleEscapeKey);
}

// Handle escape key press
function handleEscapeKey(e) {
    if (e.key === 'Escape') {
        collapseImage();
    }
}

// Open Update Modal
function openUpdateModal(entryID) {
    const updateModal = document.getElementById('updateModal');
    const updateInput = document.getElementById('updateNumberInput');
    const currentNumber = document.getElementById(`number-${entryID}`).textContent;
    
    updateInput.value = currentNumber === 'Not specified' ? '' : currentNumber;
    currentEntryIdForUpdate = entryID;
    updateModal.classList.remove('hidden');
    
    // Focus the input field
    setTimeout(() => {
        updateInput.focus();
    }, 100);
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
            numberSpan.textContent = newNumber || 'Not specified';
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
            const rowToRemove = document.querySelector(`tr[data-entry-id="${currentEntryIdForDelete}"]`);
            if (rowToRemove) {
                rowToRemove.remove();
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

// Make collapseImage globally accessible
window.collapseImage = collapseImage;

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
    
    // Allow Enter key to submit the update form
    document.getElementById('updateNumberInput').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            confirmUpdate();
        }
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
