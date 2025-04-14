import axios from "axios";

const api = axios.create({
  withCredentials: true,
});

// Check authentication state
export async function checkAuthState() {
  try {
    const response = await api.get("/user/check-auth");
    return {
      authenticated: response.data.authenticated,
      user: response.data.authenticated ? response.data.user : null,
    };
  } catch (error) {
    console.error("Auth check error:", error);
    return {
      authenticated: false,
      user: null,
    };
  }
}

// Request OTP
export async function requestOTP(email) {
  try {
    const response = await api.post("/user/request-otp", { email });
    return response.data;
  } catch (error) {
    console.error("Error in requesting OTP:", error);
    throw error;
  }
}

// Verify OTP
export async function verifyOTP(email, otp) {
  try {
    const response = await api.post("/user/verify-otp", { email, otp });
    return response.data;
  } catch (error) {
    console.error("Error in OTP verification:", error);
    throw error;
  }
}

// Logout function
export async function logout() {
  try {
    await api.get("/user/logout");
    return true;
  } catch (error) {
    console.error("Logout error:", error);
    return false;
  }
}
