import axios from "axios";

const api = axios.create({
  withCredentials: true,
});

// Handle unauthorized responses globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Upload vehicle entry
export async function uploadEntry(formData) {
  try {
    const response = await api.post("/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error uploading entry:", error);
    throw error;
  }
}

// Fetch all entries
export async function fetchEntries(page = 1, limit = 5) {
  try {
    const response = await api.get(`/entries?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching entries:", error);
    throw error;
  }
}

// Update entry number
export async function updateEntryNumber(entryId, newNumber) {
  try {
    const response = await api.put(`/entries/${entryId}`, {
      number: newNumber,
    });
    return response.data;
  } catch (error) {
    console.error("Error updating entry number:", error);
    throw error;
  }
}

// Delete entry
export async function deleteEntry(entryId) {
  try {
    const response = await api.delete(`/entries/${entryId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting entry:", error);
    throw error;
  }
}

// Create new user
export async function createUser(userData) {
  try {
    const response = await api.post("/user/create", userData);
    return {
      status: response.status,
      data: response.data,
    };
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

// Fetch all users
export async function fetchUsers() {
  try {
    const response = await api.get("/user/get-all");
    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
}

// Delete user
export async function deleteUser(userId) {
  try {
    const response = await api.delete(`/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
}

// Update user functionality
export async function updateUser(userId, userData) {
  try {
    const response = await api.put(`/user/${userId}`, userData);
    return response.data;
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
}
