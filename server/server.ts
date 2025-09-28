import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express, { Application } from "express";
import mongoose from "mongoose";

dotenv.config();

import { Job } from "./models/Job";
import authRoutes from "./routes/authRoutes";
import jobRoutes from "./routes/jobRoutes";

const app: Application = express();

app.use(cookieParser());
app.use(
  cors({
    origin: "https://job-tracker-2ub.pages.dev", // Your frontend URL
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

app.get("/api/test-db", async (req, res) => {
  try {
    const userCount = await Job.countDocuments();
    res.json({
      status: "connected",
      userCount,
      dbState: mongoose.connection.readyState,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

mongoose.connection.on("connected", () => {
  console.log("✅ Connected to MongoDB Atlas");
});

mongoose.connection.on("error", (err) => {
  console.log("❌ MongoDB connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("⚠️ MongoDB disconnected");
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
