import { Response } from "express";
import { RequestWithUser } from "../interfaces/reqInterfaces";
import { Job } from "../models/Job";

// POST /api/jobs
export const createJob = async (req: RequestWithUser, res: Response) => {
  const { company, position, status, jobType, location } = req.body;
  const createdBy = req.user?.id; // Changed from _id to id

  try {
    const job = await Job.create({
      company,
      position,
      status,
      jobType,
      location,
      createdBy,
    });
    res.status(201).json(job);
  } catch (err) {
    if (err instanceof Error) {
      console.error(err.message);
      res.status(500).json({ error: err.message });
    } else {
      console.error("Unknown error", err);
      res.status(500).json({ error: "An unknown error occurred." });
    }
  }
};

// GET /api/jobs
export const getJobs = async (req: RequestWithUser, res: Response) => {
  const userId = req.user?.id; // Using _id instead of id
  const { sortBy = "newest" } = req.query;

  const sortDirection = sortBy === "oldest" ? 1 : -1;
  const jobs = await Job.find({ createdBy: userId }).sort({
    _id: sortDirection,
  });
  res.json(jobs);
};

// PUT /api/jobs/:id
export const updateJob = async (req: RequestWithUser, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id; // Using _id instead of id

  const job = await Job.findOneAndUpdate(
    { _id: id, createdBy: userId },
    req.body,
    { new: true }
  );

  if (!job) return res.status(404).json({ error: "Job not found" });
  res.json(job);
};

// DELETE /api/jobs/:id
export const deleteJob = async (req: RequestWithUser, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id; // Using _id instead of id

  const job = await Job.findOneAndDelete({ _id: id, createdBy: userId });
  if (!job) return res.status(404).json({ error: "Job not found" });

  res.json({ message: "Job deleted" });
};
