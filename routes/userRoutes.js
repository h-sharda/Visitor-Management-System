import express from 'express';
import { requestOTP, verifyLoginOTP } from '../controllers/authController.js';
import { createUser } from '../controllers/userController.js';

const router = express.Router();

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

router.post("/create", createUser);

export default router;
