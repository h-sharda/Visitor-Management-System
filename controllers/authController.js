import User from "../models/User.js";
import { generateOTP, saveOTP, verifyOTP } from "../services/otpService.js";
import { sendOTPEmail } from "../services/emailService.js";
import { createTokenForUser } from "../services/authService.js";

// Request OTP
export async function requestOTP(req, res) {
  const { email } = req.body;

  if (!email) {
    return res
      .status(400)
      .json({ success: false, message: "Email is required" });
  }

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found. Please sign up first.",
      });
    }

    // Generate and save OTP
    const otp = generateOTP();
    try {
      await saveOTP(email, otp);
    } catch (error) {
      return res.status(429).json({ success: false, message: error.message });
    }

    // Send OTP via email
    const emailResult = await sendOTPEmail(email, otp);
    if (!emailResult.success) {
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP. Please try again.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "OTP sent to your email. Valid for 10 minutes.",
    });
  } catch (error) {
    console.error("Request OTP error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

// Verify OTP
export async function verifyLoginOTP(req, res) {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res
      .status(400)
      .json({ success: false, message: "Email and OTP are required" });
  }

  try {
    // Verify OTP
    await verifyOTP(email, otp);

    // Get user
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Generate JWT token
    const token = createTokenForUser(user);

    // Set cookie and redirect to home
    return res
      .cookie("token", token, { maxAge: 90 * 24 * 60 * 60 * 1000 })
      .redirect("/");
  } catch (error) {
    console.error("Verify OTP error:", error);
    return res.status(401).json({ success: false, message: error.message });
  }
}
