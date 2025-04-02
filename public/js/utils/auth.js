// Check authentication state
export async function checkAuthState() {
    try {
        const response = await fetch('/user/check-auth');
        const data = await response.json();
        
        return {
            authenticated: data.authenticated,
            user: data.authenticated ? data.user : null
        };
    } catch (error) {
        console.error('Auth check error:', error);
        return {
            authenticated: false,
            user: null
        };
    }
}

// Logout function
export function logout() {
    window.location.href = '/user/logout';
}

// Redirect to login
export function redirectToLogin() {
    window.location.href = '/signin';
}
