import { fetchEntries } from '../utils/api.js';
import { currentUser } from '../main.js';
import { canManageEntries } from '../utils/permissions.js';

let entries = [];

// Render entry table
export async function renderEntryTable() {
    try {
        // Fetch entries from API
        entries = await fetchEntries();
        
        if (!entries) return; // Handle null response (e.g., auth failed)
        
        const entryContainer = document.getElementById('vehicleEntryTable');
        const noEntriesMessage = document.getElementById('noEntriesMessage');
        
        entryContainer.innerHTML = ''; // Clear existing entries
        
        if (entries.length === 0) {
            noEntriesMessage.classList.remove('hidden');
            return;
        } else {
            noEntriesMessage.classList.add('hidden');
        }

        // Group entries by date
        const entriesByDate = groupEntriesByDate(entries);

        // Create tables for each date
        renderEntriesByDate(entriesByDate, entryContainer);
        
    } catch (error) {
        console.error('Error rendering entry table:', error);
        const entryContainer = document.getElementById('vehicleEntryTable');
        entryContainer.innerHTML = `
            <div class="px-6 py-4 text-center text-red-500">
                Failed to load entries. Please try again later.
            </div>
        `;
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

// Render entries grouped by date
function renderEntriesByDate(entriesByDate, container) {
    Object.entries(entriesByDate).forEach(([date, dateEntries]) => {
        const dateHeader = document.createElement('h2');
        dateHeader.className = 'text-xl font-bold mt-8 mb-4';
        dateHeader.textContent = `Date: ${date}`;
        dateHeader.style.textAlign = 'center';
        container.appendChild(dateHeader);

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
            const canEdit = canManageEntries(currentUser);
            
            row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-center text-gray-900 text-base font-medium">${formattedTime}</td>
            <td class="px-6 py-4 whitespace-nowrap text-center">
                <div class="flex items-center justify-center space-x-2">
                    <span id="number-${entry._id}" class="text-base font-medium text-gray-900">${entry.number}</span>
                    ${canEdit ? `
                    <button class="hover:bg-blue-100 p-1 rounded-full" title="Edit vehicle number" onclick="window.openUpdateModal('${entry._id}')">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-500 hover:text-blue-700" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                    </button>
                    ` : ''}
                </div>
            </td>
            <td class="px-6 py-4 text-center relative">
                <div class="relative">
                    <img src="${entry.signedUrl}" class="max-h-10vh object-contain rounded-md cursor-pointer mx-auto" alt="Vehicle Image" onclick="window.expandImage('${entry.signedUrl}')">
                    ${canEdit ? `
                    <button class="absolute top-0 right-0 text-red-600 hover:text-red-800 hover:bg-red-100 p-1.5 rounded-full" title="Delete entry" onclick="window.openDeleteModal('${entry._id}')">
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
        container.appendChild(table);
    });
}

// Function to update entry number in the UI
export function updateEntryNumberInUI(entryId, newNumber) {
    const numberElement = document.getElementById(`number-${entryId}`);
    if (numberElement) {
        numberElement.textContent = newNumber || 'Not specified';
    }
}

// Function to remove entry row from the UI
export function removeEntryFromUI(entryId) {
    const rowToRemove = document.querySelector(`tr[data-entry-id="${entryId}"]`);
    if (rowToRemove) {
        rowToRemove.remove();
    }
    
    // Check if the table is now empty
    const entryTable = document.getElementById('vehicleEntryTable');
    if (!entryTable.querySelector('tr[data-entry-id]')) {
        document.getElementById('noEntriesMessage').classList.remove('hidden');
    }
}
