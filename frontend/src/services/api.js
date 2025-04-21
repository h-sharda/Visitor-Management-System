import axios from "axios";

const api = axios.create({
  withCredentials: true,
});

// Handle unauthorized responses globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      window.location.href = "/signin";
    }
    return Promise.reject(error);
  }
);

// Upload vehicle entry
export async function uploadEntry(formData) {
  try {
    const response = await api.post("/api/entries/create", formData, {
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
    const response = await api.get(
      `/api/entries/get-all?page=${page}&limit=${limit}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching entries:", error);
    throw error;
  }
}

// Update entry number
export async function updateEntryNumber(entryId, newNumber) {
  try {
    const response = await api.put(`/api/entries/${entryId}`, {
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
    const response = await api.delete(`/api/entries/${entryId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting entry:", error);
    throw error;
  }
}

// Create new user
export async function createUser(userData) {
  try {
    const response = await api.post("/api/users/create", userData);
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
    const response = await api.get("api/users/get-all");
    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
}

// Delete user
export async function deleteUser(userId) {
  try {
    const response = await api.delete(`api/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
}

// Update user functionality
export async function updateUser(userId, userData) {
  try {
    const response = await api.put(`api/users/${userId}`, userData);
    return response.data;
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
}

// Create access request
export async function createAccessRequest(requestData) {
  try {
    const response = await api.post("/api/access-requests/create", requestData);
    return response.data;
  } catch (error) {
    console.error("Error creating access request:", error);
    throw error;
  }
}

// Fetch access requests (admin only)
export async function fetchAccessRequests() {
  try {
    const response = await api.get("/api/access-requests/get-all");
    return response.data;
  } catch (error) {
    console.error("Error fetching access requests:", error);
    throw error;
  }
}

// Approve access request (admin only)
export async function approveAccessRequest(requestId, roleData) {
  try {
    const response = await api.put(
      `/api/access-requests/approve/${requestId}`,
      roleData
    );
    return response.data;
  } catch (error) {
    console.error("Error approving access request:", error);
    throw error;
  }
}

// Reject access request (admin only)
export async function rejectAccessRequest(requestId) {
  try {
    const response = await api.put(`/api/access-requests/reject/${requestId}`);
    return response.data;
  } catch (error) {
    console.error("Error rejecting access request:", error);
    throw error;
  }
}

// Contact form API call
export async function submitContactForm(formData) {
  try {
    const response = await api.post("/api/contact/submit", formData);
    return response.data;
  } catch (error) {
    console.error("Error submitting contact form:", error);
    throw error;
  }
}
