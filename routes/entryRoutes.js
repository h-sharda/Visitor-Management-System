import express from "express";
import {
  getEntries,
  updateEntryNumber,
  deleteEntry,
  createEntry,
} from "../controllers/entryController.js";
import { upload, multerErrorHandler } from "../middlewares/uploadMiddleware.js";

const router = express.Router();

const isAuthenticated = (req, res, next) => {
  if (req.user) {
    return next();
  }
  return res.status(401).json({ message: "Authentication required" });
};

router.get("/get-all", isAuthenticated, getEntries);
router.put("/:id", isAuthenticated, updateEntryNumber);
router.delete("/:id", isAuthenticated, deleteEntry);
router.post(
  "/create",
  isAuthenticated,
  upload.single("entry"),
  createEntry,
  multerErrorHandler
);

export default router;
