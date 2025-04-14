import OTP from "../models/OTP.js";

// Generate a 6-digit OTP
export function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Save OTP to database
export async function saveOTP(email, otp) {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes expiry

  const existingOTP = await OTP.findOne({ email });

  if (existingOTP) {
    const cooldownEnd = new Date(
      existingOTP.lastGeneratedAt.getTime() + 5 * 60 * 1000
    );
    if (now < cooldownEnd) {
      const timeLeftMs = cooldownEnd - now;
      const timeLeftMinutes = Math.ceil(timeLeftMs / (60 * 1000));
      throw new Error(
        `Please wait ${timeLeftMinutes} minute(s) before requesting a new OTP`
      );
    }

    existingOTP.otp = otp;
    existingOTP.expiresAt = expiresAt;
    existingOTP.lastGeneratedAt = now;
    await existingOTP.save();
    return existingOTP;
  }

  const newOTP = new OTP({
    email,
    otp,
    expiresAt,
    lastGeneratedAt: now,
  });

  await newOTP.save();
  return newOTP;
}

// Verify OTP
export async function verifyOTP(email, userOTP) {
  const otpRecord = await OTP.findOne({ email });

  if (!otpRecord) {
    throw new Error("No OTP found for this email");
  }

  const now = new Date();
  if (now > otpRecord.expiresAt) {
    throw new Error("OTP has expired");
  }

  if (otpRecord.otp !== userOTP) {
    throw new Error("Invalid OTP");
  }

  await OTP.deleteOne({ _id: otpRecord._id });

  return true;
}
