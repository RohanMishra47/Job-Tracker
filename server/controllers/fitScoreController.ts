import { Request, Response } from "express";
import { Job } from "../models/Job";
import { analyzeFit } from "../utils/analyzeFit";
import { cosineSimilarity } from "../utils/cosineSimilarity";
import { getEmbedding } from "../utils/getEmbedding";

export const calculateFitScore = async (req: Request, res: Response) => {
  try {
    console.log("🎯 Fit score request received:", {
      hasResumeText: !!req.body.resumeText,
      resumeTextLength: req.body.resumeText?.length,
      jobId: req.body.jobId,
    });

    const { resumeText, jobId } = req.body;
    if (!resumeText || !jobId) {
      return res.status(400).json({ error: "Missing resumeText or jobId" });
    }

    const job = await Job.findById(jobId);
    if (!job || !job.description) {
      return res
        .status(404)
        .json({ error: "Job not found or missing description" });
    }

    const [resumeEmbedding, jobEmbedding] = await Promise.all([
      getEmbedding(resumeText),
      getEmbedding(job.description),
    ]);

    const score = Math.round(
      cosineSimilarity(resumeEmbedding, jobEmbedding) * 100
    );
    const { suggestions, ...breakdown } = analyzeFit(
      resumeText,
      job.description
    );

    res.json({ score, breakdown, suggestions });
  } catch (error) {
    console.error("❌ ERROR in calculateFitScore:", error);
    console.error("Request body:", req.body);

    const details = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: "Failed to calculate fit score", details });
  }
};
