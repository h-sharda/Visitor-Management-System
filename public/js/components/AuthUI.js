// Render auth UI based on auth state
export function renderAuthUI(isAuthenticated, user) {
    const authSection = document.getElementById('authSection');
    
    if (isAuthenticated && user) {
        // User is logged in
        authSection.innerHTML = `
            <div class="flex items-center">
                <span class="mr-2">${user.name || user.email}</span>
                <span class="bg-blue-700 text-xs px-2 py-1 rounded-full">${user.role}</span>
            </div>
            <a href="/user/logout" class="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-md">Logout</a>
        `;
    } else {
        // User is not logged in
        authSection.innerHTML = `
            <a href="/signin" class="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-md">Sign In</a>
        `;
    }
}
