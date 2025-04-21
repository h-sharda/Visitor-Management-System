import express from "express";
import {
  createAccessRequest,
  getAccessRequests,
  approveAccessRequest,
  rejectAccessRequest,
} from "../controllers/accessRequestController.js";
import { checkAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public route for creating access requests
router.post("/create", createAccessRequest);

// Admin only routes
router.get("/get-all", checkAdmin, getAccessRequests);
router.put("/approve/:id", checkAdmin, approveAccessRequest);
router.put("/reject/:id", checkAdmin, rejectAccessRequest);

export default router;
