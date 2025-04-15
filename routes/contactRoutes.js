import express from "express";
import { submitContactForm } from "../controllers/contactController.js";

const router = express.Router();

// Contact form submission route
router.post("/submit", submitContactForm);

export default router;
