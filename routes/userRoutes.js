const express = require('express');
const router = express.Router();
const { requestOTP, verifyLoginOTP } = require("../controllers/authController");

router.post("/request-otp", requestOTP);
router.post("/verify-otp", verifyLoginOTP);

router.get("/logout", (req, res) => {
  res.clearCookie("token").redirect("/");
});

router.get('/check-auth', (req, res) => {
  if (req.user) {
    return res.json({ 
      authenticated: true, 
      user: req.user 
    });
  }
  return res.json({ authenticated: false });
});

module.exports = router;
