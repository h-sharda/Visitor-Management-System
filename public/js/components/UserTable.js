import { fetchUsers, deleteUser } from '../utils/api.js';

// Render users table
export async function renderUsersTable() {
    try {
        // Fetch users from API
        const users = await fetchUsers();
        
        if (!users) return; // Handle null response (e.g., auth failed)
        
        const tableContainer = document.getElementById('usersTable');
        const noUsersMessage = document.getElementById('noUsersMessage');
        
        tableContainer.innerHTML = ''; // Clear existing content
        
        if (users.length === 0) {
            noUsersMessage.classList.remove('hidden');
            return;
        } else {
            noUsersMessage.classList.add('hidden');
        }

        // Create responsive table wrapper
        const tableWrapper = document.createElement('div');
        tableWrapper.className = 'overflow-x-auto';

        // Create table
        const table = document.createElement('table');
        table.className = 'min-w-full divide-y divide-gray-200';
        
        // Create table header
        const thead = document.createElement('thead');
        thead.className = 'bg-gray-200';
        thead.innerHTML = `
            <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
        `;
        table.appendChild(thead);

        // Create table body
        const tbody = document.createElement('tbody');
        tbody.className = 'bg-white divide-y divide-gray-200';
        
        users.forEach(user => {
            const row = document.createElement('tr');
            row.className = 'hover:bg-gray-50 transition-colors';
            row.setAttribute('data-user-id', user._id);
            
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">${user.fullName || 'N/A'}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-500">${user.email}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-${getRoleColor(user.role)}-100 text-${getRoleColor(user.role)}-800">
                        ${user.role}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <button class="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-100 btn-press-effect" onclick="window.deleteUserConfirm('${user._id}')">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                        </svg>
                    </button>
                </td>
            `;
            
            tbody.appendChild(row);
        });
        
        table.appendChild(tbody);
        tableWrapper.appendChild(table);
        tableContainer.appendChild(tableWrapper);
        
        // Set up delete user function
        window.deleteUserConfirm = deleteUserConfirm;
        
    } catch (error) {
        console.error('Error rendering users table:', error);
        const tableContainer = document.getElementById('usersTable');
        tableContainer.innerHTML = `
            <div class="px-6 py-4 text-center text-red-500">
                Failed to load users. Please try again later.
            </div>
        `;
    }
}

// Get color based on user role
function getRoleColor(role) {
    switch (role) {
        case 'ADMIN':
            return 'red';
        case 'OPERATOR':
            return 'green';
        case 'VIEWER':
            return 'blue';
        default:
            return 'gray';
    }
}

// Delete user confirmation
function deleteUserConfirm(userId) {
    if (confirm('Are you sure you want to delete this user?')) {
        deleteUser(userId)
            .then(response => {
                if (response) {
                    // Remove user from the table
                    document.querySelector(`tr[data-user-id="${userId}"]`).remove();
                    
                    // Check if table is now empty
                    const tbody = document.querySelector('#usersTable tbody');
                    if (!tbody || !tbody.querySelector('tr')) {
                        document.getElementById('noUsersMessage').classList.remove('hidden');
                    }
                }
            })
            .catch(error => {
                console.error('Error deleting user:', error);
                alert('Failed to delete user. Please try again.');
            });
    }
}
