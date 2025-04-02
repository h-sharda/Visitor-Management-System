import { redirectToLogin } from './auth.js';

// Fetch all entries
export async function fetchEntries() {
    try {
        const response = await fetch('/entries');
        
        // Check if unauthorized
        if (response.status === 401) {
            redirectToLogin();
            return null;
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error fetching entries:', error);
        throw error;
    }
}

// Update entry number
export async function updateEntryNumber(entryId, newNumber) {
    try {
        const response = await fetch(`/entries/${entryId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ number: newNumber })
        });

        if (response.status === 401) {
            redirectToLogin();
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error('Error updating entry number:', error);
        throw error;
    }
}

// Delete entry
export async function deleteEntry(entryId) {
    try {
        const response = await fetch(`/entries/${entryId}`, {
            method: 'DELETE'
        });

        if (response.status === 401) {
            redirectToLogin();
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error('Error deleting entry:', error);
        throw error;
    }
}

// Create new user
export async function createUser(userData) {
    try {
        const response = await fetch('/user/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        if (response.status === 401) {
            redirectToLogin();
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
}

// Upload vehicle entry
export async function uploadEntry(formData) {
    try {
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });

        if (response.status === 401) {
            redirectToLogin();
            return null;
        }

        return response;
    } catch (error) {
        console.error('Error uploading entry:', error);
        throw error;
    }
}
