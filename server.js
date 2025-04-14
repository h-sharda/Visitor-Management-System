import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import "./config/mongodb.js";
import { checkForAuthenticationCookie } from "./middlewares/authMiddleware.js";
import userRoute from "./routes/userRoutes.js";
import entryRoutes from "./routes/entryRoutes.js";

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
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/user", userRoute);
app.use("/", entryRoutes);

// Serve the main page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/signin", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "signin.html"));
});

app.get("/user-management", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "user-management.html"));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
