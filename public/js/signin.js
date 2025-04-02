import { checkAuthState } from './utils/auth.js';

async function initializeSignIn() {
  try {
    // Check authentication state
    const authResult = await checkAuthState();
    if (authResult.authenticated) {
      window.location.href = '/';
    }
  } catch (error) {
    console.error('Authentication check failed:', error);
  }
}

document.addEventListener('DOMContentLoaded', function() {

  initializeSignIn()

  const emailForm = document.getElementById('emailForm');
  const otpSection = document.getElementById('otpSection');
  const errorAlert = document.getElementById('errorAlert');
  const successAlert = document.getElementById('successAlert');
  const cooldownTimer = document.getElementById('cooldownTimer');
  const expiryTimer = document.getElementById('expiryTimer');
  const emailInput = document.getElementById('email');

  let expiryInterval;
  let cooldownInterval;
  
  // Email form submission - With email standardization
  emailForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    hideAlerts();
    
    // Standardize email (lowercase and trim)
    const email = emailInput.value.trim().toLowerCase();
    emailInput.value = email; // Update the input value with standardized email
    
    if (!email) {
      showError('Please enter your email address');
      return;
    }
    
    try {
      const response = await fetch('/user/request-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 429) {
          // Handle rate limiting (cooldown period)
          const match = data.message.match(/Please wait (\d+) minute/);
          if (match && match[1]) {
            startCooldownTimer(parseInt(match[1]));
          }
        }
        throw new Error(data.message || 'Failed to request OTP');
      }
      
      // Show OTP section on success
      showSuccess(data.message);
      otpSection.style.display = 'block';
      startExpiryTimer();
      
      // Focus on OTP input
      document.getElementById('otp').focus();
      
    } catch (error) {
      showError(error.message);
    }
  });
  
  // OTP form submission
  otpSection.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    hideAlerts();
    
    // Use standardized email
    const email = emailInput.value.trim().toLowerCase();
    const otp = document.getElementById('otp').value.trim();
    
    if (!otp) {
      showError('Please enter the OTP sent to your email');
      return;
    }
    
    try {
      const response = await fetch('/user/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, otp })
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Invalid OTP');
      }
      
      // If successful, the controller will redirect to home page
      clearInterval(expiryInterval);
      
      // Redirect will happen automatically from the server
      // But in case it doesn't, we can force a redirect after a short delay
      setTimeout(() => {
        window.location.href = '/';
      }, 500);
      
    } catch (error) {
      showError(error.message);
    }
  });
  
  // Helper functions
  function showError(message) {
    errorAlert.textContent = message;
    errorAlert.style.display = 'block';
  }
  
  function showSuccess(message) {
    successAlert.textContent = message;
    successAlert.style.display = 'block';
  }
  
  function hideAlerts() {
    errorAlert.style.display = 'none';
    successAlert.style.display = 'none';
  }
  
  function startExpiryTimer() {
    clearInterval(expiryInterval);
    let timeLeft = 10 * 60; // 10 minutes in seconds
    expiryTimer.style.display = 'block';
    
    function updateExpiryTimer() {
      const minutes = Math.floor(timeLeft / 60);
      const seconds = timeLeft % 60;
      document.getElementById('expiryTimeLeft').textContent = 
        `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
      
      if (timeLeft <= 0) {
        clearInterval(expiryInterval);
        showError('OTP has expired. Please request a new one.');
        otpSection.style.display = 'none';
        expiryTimer.style.display = 'none';
      }
      timeLeft--;
    }
    
    updateExpiryTimer();
    expiryInterval = setInterval(updateExpiryTimer, 1000);
  }
  
  function startCooldownTimer(minutes) {
    clearInterval(cooldownInterval);
    let timeLeft = minutes * 60; // Convert minutes to seconds
    cooldownTimer.style.display = 'block';
    
    function updateCooldownTimer() {
      const mins = Math.floor(timeLeft / 60);
      const secs = timeLeft % 60;
      document.getElementById('timeLeft').textContent = 
        `${mins}:${secs < 10 ? '0' + secs : secs}`;
      
      if (timeLeft <= 0) {
        clearInterval(cooldownInterval);
        cooldownTimer.style.display = 'none';
      }
      timeLeft--;
    }
    
    updateCooldownTimer();
    cooldownInterval = setInterval(updateCooldownTimer, 1000);
  }
});
