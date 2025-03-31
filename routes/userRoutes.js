// routes/userRoutes.js

const express = require('express');
const router = express.Router();
const { requestOTP, verifyLoginOTP } = require("../controllers/authController");

router.post("/request-otp", requestOTP);
router.post("/verify-otp", verifyLoginOTP);

router.get("/logout", (req, res) => {
  res.clearCookie("token").redirect("/");
});

module.exports = router;
