import { updateEntryNumberInUI } from './EntryTable.js';
import { updateEntryNumber } from '../utils/api.js';
import { canManageEntries } from '../utils/permissions.js';
import { currentUser } from '../utils/state.js';

let currentEntryIdForUpdate = null;

// Render update modal
export function renderUpdateModal() {
    const container = document.getElementById('updateModalContainer');
    
    container.innerHTML = `
        <div id="updateModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 hidden flex items-center justify-center">
            <div class="bg-white p-6 rounded-lg shadow-xl w-96">
                <h2 class="text-xl font-bold mb-4">Update Vehicle Number</h2>
                <input 
                    type="text" 
                    id="updateNumberInput" 
                    class="w-full p-2 border border-gray-300 rounded-md mb-4"
                    placeholder="Enter new number"
                >
                <div class="flex justify-end space-x-2">
                    <button 
                        id="cancelUpdateBtn" 
                        class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 btn-press-effect"
                    >
                        Cancel
                    </button>
                    <button 
                        id="confirmUpdateBtn" 
                        class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 btn-press-effect"
                    >
                        Update
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Add event listeners
    document.getElementById('cancelUpdateBtn').addEventListener('click', closeUpdateModal);
    document.getElementById('confirmUpdateBtn').addEventListener('click', confirmUpdate);
    
    // Close modal when clicking outside
    document.getElementById('updateModal').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) closeUpdateModal();
    });
    
    // Allow Enter key to submit
    document.getElementById('updateNumberInput').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            confirmUpdate();
        }
    });
    
    // Expose global function for opening modal
    window.openUpdateModal = openUpdateModal;
}

// Open update modal
function openUpdateModal(entryId) {
    // Check if user has permission
    if (!canManageEntries(currentUser)) {
        alert('You do not have permission to edit entries');
        return;
    }
    
    const updateModal = document.getElementById('updateModal');
    const updateInput = document.getElementById('updateNumberInput');
    const currentNumber = document.getElementById(`number-${entryId}`).textContent;
    
    updateInput.value = currentNumber === 'Not specified' ? '' : currentNumber;
    currentEntryIdForUpdate = entryId;
    updateModal.classList.remove('hidden');
    
    // Focus the input field
    setTimeout(() => {
        updateInput.focus();
    }, 100);
}

// Close update modal
function closeUpdateModal() {
    const updateModal = document.getElementById('updateModal');
    updateModal.classList.add('hidden');
    currentEntryIdForUpdate = null;
}

// Confirm update
async function confirmUpdate() {
    if (!currentEntryIdForUpdate) return;
    
    // Check if user has permission
    if (!canManageEntries(currentUser)) {
        alert('You do not have permission to edit entries');
        closeUpdateModal();
        return;
    }

    const updateInput = document.getElementById('updateNumberInput');
    const newNumber = updateInput.value.trim();

    try {
        const response = await updateEntryNumber(currentEntryIdForUpdate, newNumber);
        
        if (response) {
            // Update the number in the UI
            updateEntryNumberInUI(currentEntryIdForUpdate, newNumber);
            closeUpdateModal();
        }
    } catch (error) {
        console.error('Error updating number:', error);
        alert('Failed to update number. Please try again.');
    }
}
