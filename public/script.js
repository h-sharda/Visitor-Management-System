// Global variables to store current entries ID for modal actions
let currentEntryIdForUpdate = null;
let currentEntryIdForDelete = null;
let currentUser = null;

// Check authentication on page load
document.addEventListener('DOMContentLoaded', function() {
    checkAuthState();

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

    // Go to sign in button
    document.getElementById('goToSignIn').addEventListener('click', () => {
        window.location.href = '/signin';
    });
});

// Check authentication state
async function checkAuthState() {
    try {
        const response = await fetch('/user/check-auth');
        const data = await response.json();
        
        if (data.authenticated) {
            currentUser = data.user;
            updateAuthUI(true);
            fetchEntries();
        } else {
            updateAuthUI(false);
            showAuthRequiredMessage();
        }
    } catch (error) {
        console.error('Auth check error:', error);
        updateAuthUI(false);
        showAuthRequiredMessage();
    }
}

// Update UI based on authentication state
function updateAuthUI(isAuthenticated) {
    const authSection = document.getElementById('authSection');
    
    if (isAuthenticated && currentUser) {
        // User is logged in
        authSection.innerHTML = `
            <div class="flex items-center">
                <span class="mr-2">${currentUser.name || currentUser.email}</span>
                <span class="bg-blue-700 text-xs px-2 py-1 rounded-full">${currentUser.role}</span>
            </div>
            <a href="/user/logout" class="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-md">Logout</a>
        `;
        
        // Show upload form only for OPERATOR and ADMIN roles
        const uploadForm = document.getElementById('uploadForm');
        if (currentUser.role === 'OPERATOR' || currentUser.role === 'ADMIN') {
            uploadForm.classList.remove('hidden');
        } else {
            uploadForm.classList.add('hidden');
        }
    } else {
        // User is not logged in
        authSection.innerHTML = `
            <a href="/signin" class="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-md">Sign In</a>
        `;
    }
}

// Show authentication required message
function showAuthRequiredMessage() {
    document.getElementById('authRequiredMessage').classList.remove('hidden');
    document.getElementById('mainContent').classList.add('hidden');
}

// Hide authentication required message
function hideAuthRequiredMessage() {
    document.getElementById('authRequiredMessage').classList.add('hidden');
    document.getElementById('mainContent').classList.remove('hidden');
}

async function fetchEntries() {
    try {
        const response = await fetch('/entries');
        
        // Check if unauthorized
        if (response.status === 401) {
            updateAuthUI(false);
            showAuthRequiredMessage();
            return;
        }
        
        const entries = await response.json();
        
        const entryContainer = document.getElementById('vehicleEntryTable');
        const noEntriesMessage = document.getElementById('noEntriesMessage');
        
        entryContainer.innerHTML = ''; // Clear existing entries

        if (entries.length === 0) {
            noEntriesMessage.classList.remove('hidden');
        } else {
            noEntriesMessage.classList.add('hidden');
        }

        // Group entries by date
        const entriesByDate = entries.reduce((acc, entry) => {
            const entryDate = new Date(entry.timestamp);
            const formattedDate = entryDate.toLocaleDateString();
            if (!acc[formattedDate]) {
                acc[formattedDate] = [];
            }
            acc[formattedDate].push(entry);
            return acc;
        }, {});

        // Create tables for each date
        Object.entries(entriesByDate).forEach(([date, dateEntries]) => {
            const dateHeader = document.createElement('h2');
            dateHeader.className = 'text-xl font-bold mt-8 mb-4';
            dateHeader.textContent = `Date: ${date}`;
            dateHeader.style.textAlign = 'center';
            entryContainer.appendChild(dateHeader);

            const table = document.createElement('table');
            table.className = 'min-w-full divide-y divide-gray-200 mb-8';
            
            const thead = document.createElement('thead');
            thead.className = 'bg-gray-200';
            thead.innerHTML = `
                <tr>
                    <th scope="col" class="px-6 py-3 text-center text-gray-500 uppercase tracking-wider" style="font-size: 14px;">Time</th>
                    <th scope="col" class="px-6 py-3 text-center text-gray-500 uppercase tracking-wider" style="font-size: 14px;">Vehicle Number</th>
                    <th scope="col" class="px-6 py-3 text-center text-gray-500 uppercase tracking-wider" style="font-size: 14px;">Image</th>
                </tr>
            `;
            table.appendChild(thead);

            const tbody = document.createElement('tbody');
            tbody.className = 'bg-white divide-y divide-gray-200';

            dateEntries.forEach(entry => {
                const entryDate = new Date(entry.timestamp);
                const formattedTime = entryDate.toLocaleTimeString();
                
                const row = document.createElement('tr');
                row.className = 'hover:bg-gray-50 transition-colors';
                row.setAttribute('data-entry-id', entry._id);
                
                // Check if user has edit/delete permissions
                const canEdit = currentUser && currentUser.role === 'ADMIN';
                
                row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-center text-gray-900 text-base font-medium">${formattedTime}</td>
                <td class="px-6 py-4 whitespace-nowrap text-center">
                    <div class="flex items-center justify-center space-x-2">
                        <span id="number-${entry._id}" class="text-base font-medium text-gray-900">${entry.number}</span>
                        ${canEdit ? `
                        <button class="hover:bg-blue-100 p-1 rounded-full" title="Edit vehicle number" onclick="openUpdateModal('${entry._id}')">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-500 hover:text-blue-700" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                        </button>
                        ` : ''}
                    </div>
                </td>
                <td class="px-6 py-4 text-center relative">
                    <div class="relative">
                        <img src="${entry.signedUrl}" class="max-h-10vh object-contain rounded-md cursor-pointer mx-auto" alt="Vehicle Image" onclick="expandImage('${entry.signedUrl}')">
                        ${canEdit ? `
                        <button class="absolute top-0 right-0 text-red-600 hover:text-red-800 hover:bg-red-100 p-1.5 rounded-full" title="Delete entry" onclick="openDeleteModal('${entry._id}')">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                            </svg>
                        </button>
                        ` : ''}
                    </div>
                </td>
            `;
                
                tbody.appendChild(row);
            });
            
            table.appendChild(tbody);
            entryContainer.appendChild(table);
        });
    } catch (error) {
        console.error('Error fetching entries:', error);
        
        // Check if the error is due to authentication issues
        if (error.status === 401) {
            updateAuthUI(false);
            showAuthRequiredMessage();
            return;
        }
        
        const entryContainer = document.getElementById('vehicleEntryTable');
        entryContainer.innerHTML = `
            <div class="px-6 py-4 text-center text-red-500">
                Failed to load entries. Please try again later.
            </div>
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
    // Check if user has permission
    if (!(currentUser && currentUser.role === 'ADMIN')) {
        alert('You do not have permission to edit entries');
        return;
    }
    
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
    
    // Check if user has permission
    if (!(currentUser && currentUser.role === 'ADMIN')) {
        alert('You do not have permission to edit entries');
        closeUpdateModal();
        return;
    }

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

        if (response.status === 401) {
            alert('Your session has expired. Please login again.');
            window.location.href = '/signin';
            return;
        }

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
    // Check if user has permission
    if (!(currentUser && currentUser.role === 'ADMIN')) {
        alert('You do not have permission to delete entries');
        return;
    }
    
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
    
    // Check if user has permission
    if (!(currentUser && currentUser.role === 'ADMIN')) {
        alert('You do not have permission to delete entries');
        closeDeleteModal();
        return;
    }

    try {
        const response = await fetch(`/entries/${currentEntryIdForDelete}`, {
            method: 'DELETE'
        });

        if (response.status === 401) {
            alert('Your session has expired. Please login again.');
            window.location.href = '/signin';
            return;
        }

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

// Make functions globally accessible
window.collapseImage = collapseImage;
window.expandImage = expandImage;
window.openUpdateModal = openUpdateModal;
window.openDeleteModal = openDeleteModal;

// Existing form submission code
const uploadForm = document.getElementById('uploadForm');
if (uploadForm) {
    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Check if user has permission
        if (!(currentUser && (currentUser.role === 'OPERATOR' || currentUser.role === 'ADMIN'))) {
            alert('You do not have permission to upload entries');
            return;
        }
        
        const formData = new FormData(e.target);

        try {
            const response = await fetch('/upload', {
                method: 'POST',
                body: formData
            });

            if (response.status === 401) {
                alert('Your session has expired. Please login again.');
                window.location.href = '/signin';
                return;
            }

            if (response.redirected) {
                window.location.href = response.url;
            } else {
                // Refresh entries after upload
                fetchEntries();
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('Failed to upload entry. Please try again.');
        }
    });
}

function updateAuthUI(isAuthenticated) {
    const authSection = document.getElementById('authSection');

    if (isAuthenticated && currentUser) {
        authSection.innerHTML = `
        <div class="flex items-center">
            <span class="mr-2">${currentUser.name || currentUser.email}</span>
            <span class="bg-blue-700 text-xs px-2 py-1 rounded-full">${currentUser.role}</span>
        </div>
        <a href="/user/logout" class="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-md">Logout</a>
        `;

        // Hide upload form for non-admins if needed
        const uploadForm = document.getElementById('uploadForm');
        if (currentUser.role === 'ADMIN') {
            uploadForm.classList.remove('hidden');
        } else {
            uploadForm.classList.add('hidden');
        }

        // Show the create user form only for ADMINs
        const adminForm = document.getElementById('adminUserCreationForm');
        if (currentUser.role === 'ADMIN') {
            adminForm.classList.remove('hidden');
        } else {
            adminForm.classList.add('hidden');
        }
    } else {
        authSection.innerHTML = `
        <a href="/signin" class="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-md">Sign In</a>
        `;
    }
}

document.getElementById('createUserForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const name = document.getElementById('newUserName').value.trim();
    const email = document.getElementById('newUserEmail').value.trim();
    const role = document.getElementById('newUserRole').value;

    try {
        const response = await fetch('/user/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, role })
        });

        if (response.ok) {
            alert("User created successfully");
            document.getElementById('createUserForm').reset();
        } else {
            const data = await response.json();
            alert("Error creating user: " + data.message);
        }
    } catch (error) {
        console.error('Error creating user:', error);
        alert('Failed to create user, please try again.');
    }
});
