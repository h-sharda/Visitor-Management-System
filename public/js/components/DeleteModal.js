import { removeEntryFromUI } from './EntryTable.js';
import { deleteEntry } from '../utils/api.js';
import { currentUser } from '../main.js';
import { canManageEntries } from '../utils/permissions.js';

let currentEntryIdForDelete = null;

// Render delete modal
export function renderDeleteModal() {
    const container = document.getElementById('deleteModalContainer');
    
    container.innerHTML = `
        <div id="deleteModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 hidden flex items-center justify-center">
            <div class="bg-white p-6 rounded-lg shadow-xl w-96">
                <h2 class="text-xl font-bold mb-4">Confirm Delete</h2>
                <p class="mb-4">Are you sure you want to delete this entry?</p>
                <div class="flex justify-end space-x-2">
                    <button 
                        id="cancelDeleteBtn" 
                        class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                    >
                        Cancel
                    </button>
                    <button 
                        id="confirmDeleteBtn" 
                        class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Add event listeners
    document.getElementById('cancelDeleteBtn').addEventListener('click', closeDeleteModal);
    document.getElementById('confirmDeleteBtn').addEventListener('click', confirmDelete);
    
    // Close modal when clicking outside
    document.getElementById('deleteModal').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) closeDeleteModal();
    });
    
    // Expose global function for opening modal
    window.openDeleteModal = openDeleteModal;
}

// Open delete modal
function openDeleteModal(entryId) {
    // Check if user has permission
    if (!canManageEntries(currentUser)) {
        alert('You do not have permission to delete entries');
        return;
    }
    
    const deleteModal = document.getElementById('deleteModal');
    currentEntryIdForDelete = entryId;
    deleteModal.classList.remove('hidden');
}

// Close delete modal
function closeDeleteModal() {
    const deleteModal = document.getElementById('deleteModal');
    deleteModal.classList.add('hidden');
    currentEntryIdForDelete = null;
}

// Confirm delete
async function confirmDelete() {
    if (!currentEntryIdForDelete) return;
    
    // Check if user has permission
    if (!canManageEntries(currentUser)) {
        alert('You do not have permission to delete entries');
        closeDeleteModal();
        return;
    }

    try {
        const response = await deleteEntry(currentEntryIdForDelete);
        
        if (response) {
            // Remove the entry from the UI
            removeEntryFromUI(currentEntryIdForDelete);
            closeDeleteModal();
        }
    } catch (error) {
        console.error('Error deleting entry:', error);
        alert('Failed to delete entry. Please try again.');
    }
}
