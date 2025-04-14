import express from "express";
import { requestOTP, verifyLoginOTP } from "../controllers/authController.js";
import {
  createUser,
  getUsers,
  deleteUser,
  updateUser,
} from "../controllers/userController.js";
import { checkAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/request-otp", requestOTP);
router.post("/verify-otp", verifyLoginOTP);

router.get("/logout", (req, res) => {
  res.clearCookie("token").redirect("/");
});

const isAuthenticated = (req, res, next) => {
  if (req.user) {
    return next();
  }
  return res.status(401).json({ message: "Authentication required" });
};

// Add these new routes
router.get("/get-all", isAuthenticated, checkAdmin, getUsers);
router.delete("/:id", isAuthenticated, checkAdmin, deleteUser);
router.put("/:id", isAuthenticated, checkAdmin, updateUser);

router.get("/check-auth", (req, res) => {
  if (req.user) {
    return res.json({
      authenticated: true,
      user: req.user,
    });
  }
  return res.json({ authenticated: false });
});

router.post("/create", createUser);

export default router;
