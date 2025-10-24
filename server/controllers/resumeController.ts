import { Request, Response } from "express";
import { extractResumeText } from "../utils/extractResumeText";

export const uploadResume = async (req: Request, res: Response) => {
  try {
    console.log("📁 File received:", req.file ? "YES" : "NO");

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    console.log("📄 File details:", {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      buffer: req.file.buffer ? "Present" : "Missing",
    });

    console.log("🔍 Starting text extraction...");
    const resumeText = await extractResumeText(req.file);
    console.log("✅ Text extracted, length:", resumeText?.length);

    if (!resumeText || resumeText.trim().length === 0) {
      return res
        .status(400)
        .json({ error: "Could not extract text from resume" });
    }

    res.json({ resumeText });
  } catch (error) {
    console.error("❌ ERROR in uploadResume:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    res
      .status(500)
      .json({ error: "Failed to process resume", details: errorMessage });
  }
};
