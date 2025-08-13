import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express, { Application } from "express";
import mongoose from "mongoose";

dotenv.config();

import authRoutes from "./routes/authRoutes";
import jobRoutes from "./routes/jobRoutes";

const app: Application = express();

app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173", // Your frontend URL
    credentials: true, // Allow cookies to be sent
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);

// Add this temporarily to your server.ts
app.post("/api/auth/refresh", (req, res) => {
  console.log("🚨 REFRESH ENDPOINT HIT!");
  console.log("Method:", req.method);
  console.log("Path:", req.path);
  console.log("Cookies:", req.cookies);
  res.json({ message: "Refresh endpoint is working" });
});

mongoose
  .connect(process.env.MONGO_URI as string)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () =>
      console.log(`🚀 Server running at http://localhost:${PORT}`)
    );
  })
  .catch((err: unknown) => console.error("❌ MongoDB connection error:", err));
