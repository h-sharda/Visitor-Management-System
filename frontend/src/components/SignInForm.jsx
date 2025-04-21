import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { requestOTP, verifyOTP } from "../services/auth";
import { useAuth } from "../hooks/useAuth";
import { useNotification } from "../hooks/useNotification";
import "../styles/signin.css";

const SignInForm = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [expiryTime, setExpiryTime] = useState(0);
  const { user, setUser } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const otpInputRef = useRef(null);
  const cooldownTimerRef = useRef(null);
  const expiryTimerRef = useRef(null);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
      if (expiryTimerRef.current) clearInterval(expiryTimerRef.current);
    };
  }, []);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();

    // Standardize email (lowercase and trim)
    const standardizedEmail = email.trim().toLowerCase();
    setEmail(standardizedEmail);

    if (!standardizedEmail) {
      showNotification("Please enter your email address", "error");
      return;
    }

    setIsLoading(true);

    try {
      const response = await requestOTP(standardizedEmail);
      showNotification(response.message, "success");
      setShowOtpForm(true);
      startExpiryTimer();

      // Focus on OTP input
      setTimeout(() => {
        if (otpInputRef.current) {
          otpInputRef.current.focus();
        }
      }, 100);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to request OTP";
      showNotification(errorMessage, "error");

      // Handle rate limiting (cooldown period)
      if (error.response?.status === 429) {
        const match = errorMessage.match(/Please wait (\d+) minute/);
        if (match && match[1]) {
          startCooldownTimer(parseInt(match[1]));
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();

    if (!otp) {
      showNotification("Please enter the OTP sent to your email", "error");
      return;
    }

    setIsLoading(true);

    try {
      const response = await verifyOTP(email, otp);
      showNotification("SignIn successful", "success");

      // Update auth context with user data
      if (response.user) {
        setUser(response.user);
      }

      // Clear timers
      if (expiryTimerRef.current) clearInterval(expiryTimerRef.current);

      // Redirect to home page
      navigate("/");
      // !!!ERROR!!!
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Invalid OTP";
      showNotification(errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const startCooldownTimer = (minutes) => {
    if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);

    let timeLeft = minutes * 60; // Convert minutes to seconds
    setCooldown(timeLeft);

    cooldownTimerRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(cooldownTimerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const startExpiryTimer = () => {
    if (expiryTimerRef.current) clearInterval(expiryTimerRef.current);

    let timeLeft = 10 * 60; // 10 minutes in seconds
    setExpiryTime(timeLeft);

    expiryTimerRef.current = setInterval(() => {
      setExpiryTime((prev) => {
        if (prev <= 1) {
          clearInterval(expiryTimerRef.current);
          setShowOtpForm(false);
          showNotification(
            "OTP has expired. Please request a new one.",
            "error"
          );
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" + secs : secs}`;
  };

  return (
    <>
      <h2 className="form-title">Sign In</h2>

      {/* Email Form */}
      <form
        onSubmit={handleEmailSubmit}
        className={showOtpForm ? "hidden" : ""}
      >
        <div className="mb-3">
          <label
            htmlFor="email"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Email address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 placeholder-gray-400 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <div className="text-sm text-gray-500 mt-1">
            We'll send a one-time password to this email.
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || cooldown > 0}
          className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 btn-press-effect ${
            isLoading || cooldown > 0 ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isLoading ? "Sending..." : "Request OTP"}
        </button>

        {cooldown > 0 && (
          <div className="timer mt-2 text-center text-gray-600">
            Please wait {formatTime(cooldown)} before requesting a new OTP
          </div>
        )}
      </form>

      {/* OTP Verification Form */}
      {showOtpForm && (
        <form onSubmit={handleOtpSubmit}>
          <div className="mb-3">
            <label
              htmlFor="otp"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Enter OTP
            </label>
            <input
              type="text"
              id="otp"
              ref={otpInputRef}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full px-3 py-2 placeholder-gray-400 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              pattern="[0-9]{6}"
              maxLength={6}
              required
            />
            <div className="text-sm text-gray-500 mt-1">
              Enter the 6-digit code sent to your email.
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 btn-press-effect ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? "Verifying..." : "Verify"}
          </button>

          {expiryTime > 0 && (
            <div className="timer mt-2 text-center text-gray-600">
              OTP expires in {formatTime(expiryTime)}
            </div>
          )}
        </form>
      )}
      <div className="text-sm text-center mt-4">
        <a
          href="/signup"
          className="font-medium text-blue-600 hover:text-blue-500"
        >
          Need an account? Request access
        </a>
      </div>
    </>
  );
};

export default SignInForm;
