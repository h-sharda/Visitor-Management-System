import { createUser } from '../utils/api.js';

// Render user form
export function renderUserForm() {
    const container = document.getElementById('userFormContainer');
    
    container.innerHTML = `
        <div class="bg-white shadow-lg rounded-lg p-4 mb-8 mx-auto flex flex-col items-center justify-center">
            <h2 class="text-2xl font-bold text-center text-gray-800 mb-4">Create New User</h2>
            <form id="createUserForm" class="flex items-end space-x-4">
                <div>
                    <label for="newUserName" class="block text-gray-700 text-sm mb-1">Name </label>
                    <input type="text" id="newUserName" name="name"
                           class="w-60 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>
                <div>
                    <label for="newUserEmail" class="block text-gray-700 text-sm mb-1">
                        Email <span class="text-red-500">*</span>
                    </label>
                    <input type="email" id="newUserEmail" name="email" required
                           class="w-80 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>
                <div>
                    <label for="newUserRole" class="block text-gray-700 text-sm mb-1">
                        Role <span class="text-red-500">*</span>
                    </label>
                    <select id="newUserRole" name="role"
                            class="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="VIEWER">VIEWER</option>
                        <option value="OPERATOR">OPERATOR</option>
                        <option value="ADMIN">ADMIN</option>
                    </select>
                </div>
                <button type="submit"
                    class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300 ease-in-out">
                    Create User
                </button>
            </form>
        </div>
    `;
    
    // Add event listener for form submission
    document.getElementById('createUserForm').addEventListener('submit', handleUserFormSubmit);
}

// Handle user form submission
async function handleUserFormSubmit(e) {
    e.preventDefault();
    
    const nameInput = document.getElementById('newUserName');
    const emailInput = document.getElementById('newUserEmail');
    const roleInput = document.getElementById('newUserRole');
    
    const name = nameInput.value.trim();
    const email = emailInput.value.trim().toLowerCase(); // Standardize email
    const role = roleInput.value;
    
    // Only validate email since name is optional
    if (!email) {
        alert("Email is required");
        return;
    }
    
    try {
        const response = await createUser({ name, email, role });
        
        if (response && response.message) {
            alert(response.message);
            // Reset form on success
            document.getElementById('createUserForm').reset();
        }
    } catch (error) {
        console.error('Error creating user:', error);
        alert('Failed to create user. Please try again.');
    }
}
