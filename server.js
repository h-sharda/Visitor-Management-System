import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import "./config/mongodb.js";
import { checkForAuthenticationCookie } from "./middlewares/authMiddleware.js";
import userRoute from "./routes/userRoutes.js";
import entryRoutes from "./routes/entryRoutes.js";
import accessRequestRoutes from "./routes/accessRequestRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import esp32Routes from "./routes/esp32CamRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(checkForAuthenticationCookie("token"));
app.use(express.static(path.join(__dirname, "frontend/dist")));

// Routes
app.use("/api/users", userRoute);
app.use("/api/entries", entryRoutes);
app.use("/api/access-requests", accessRequestRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/esp32", esp32Routes);

// Serve the main page
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "frontend/dist/index.html"));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
