export function renderAuthUI(isAuthenticated, user) {
    const authSection = document.getElementById('authSection');
    
    if (isAuthenticated && user) {
        // User is logged in
        let userManagementLink = '';
        
        // Add user management link for admins
        if (user.role === 'ADMIN') {
            userManagementLink = `<a href="/user-management" class="bg-blue-700 hover:bg-blue-800 px-4 py-2 mr-2 rounded-md btn-press-effect">User Management</a>`;
        }
        
        authSection.innerHTML = `
            <div class="flex items-center">
                <span class="mr-2">${user.name || user.email}</span>
                <span class="bg-blue-700 text-xs px-2 py-1 rounded-full">${user.role}</span>
            </div>
            ${userManagementLink}
            <a href="/user/logout" class="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-md btn-press-effect">Logout</a>
        `;
    } else {
        // User is not logged in
        authSection.innerHTML = `
            <a href="/signin" class="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-md btn-press-effect">Sign In</a>
        `;
    }
}
