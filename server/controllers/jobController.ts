import { Response } from "express";
import { RequestWithUser } from "../interfaces/reqInterfaces";
import { Job } from "../models/Job";

export const seedJobs = async (req: RequestWithUser, res: Response) => {
  console.log("🌱 Seeding endpoint hit!");
  console.log("🔐 User ID:", req.user?.id);

  try {
    const createdBy = req.user?.id;

    if (!createdBy) {
      console.log("❌ No user ID found");
      return res.status(400).json({ error: "User not authenticated" });
    }

    console.log("🗑️ Clearing existing test jobs...");
    // Clear existing test jobs first (optional)
    await Job.deleteMany({ company: /^Company \d+$/ });
    console.log("✅ Test jobs cleared");

    console.log("📝 Creating seed data...");
    const seedJobs = [];
    for (let i = 1; i <= 30; i++) {
      seedJobs.push({
        company: `Company ${i}`,
        position: `Test Job ${i}`,
        status:
          i % 3 === 0 ? "interviewing" : i % 3 === 1 ? "declined" : "pending",
        jobType: i % 2 === 0 ? "full-time" : "part-time",
        location: `Location ${i}`,
        createdBy,
        // Added new fields from IJob interface
        description: i % 2 === 0 ? `Job description ${i}` : undefined,
        salary: i % 2 === 0 ? [10000, 20000] : undefined,
        experienceLevel: i % 2 === 0 ? "senior" : "junior",
        tags: i % 2 === 0 ? ["Node.js", "Express.js"] : ["React", "Redux"],
        applicationLink:
          i % 2 === 0 ? `https://example.com/job/${i}` : undefined,
        deadline: i % 2 === 0 ? new Date("2024-03-15") : undefined,
        priority: i % 2 === 0 ? "high" : "medium",
        source: i % 2 === 0 ? "LinkedIn" : "Company Site",
        notes: i % 2 === 0 ? `This is a test job ${i}` : undefined,
        isFavorite: i === 15 || i === 30,
      });
    }

    console.log("💾 Inserting jobs into database...");
    const result = await Job.insertMany(seedJobs);
    console.log("✅ Jobs inserted:", result.length);

    res.status(200).json({
      message: `${result.length} test jobs created successfully!`,
      jobsCreated: result.length,
    });
  } catch (error) {
    console.error("❌ Detailed seeding error:", error);
    if (error && typeof error === "object") {
      console.error("Error name:", (error as { name?: string }).name);
      console.error("Error message:", (error as { message?: string }).message);
      console.error("Error stack:", (error as { stack?: string }).stack);
      res.status(500).json({
        error: "Seeding failed",
        details: (error as { message?: string }).message,
        name: (error as { name?: string }).name,
      });
    } else {
      res
        .status(500)
        .json({ error: "Seeding failed", details: "Unknown error" });
    }
  }
};

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
  const { search, status, type, sortBy = "newest" } = req.query;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const query: Record<string, any> = {};

  if (search) {
    query.position = { $regex: search, $options: "i" }; // case-insensitive search
  }

  if (status) {
    const statusArray = Array.isArray(status)
      ? status
      : typeof status === "string"
      ? status.split(",").filter(Boolean)
      : [];
    query.status = { $in: statusArray };
  }

  if (type) {
    const typeArray = Array.isArray(type)
      ? type
      : typeof type === "string"
      ? type.split(",").filter(Boolean)
      : [];
    query.jobType = { $in: typeArray };
  }

  const sortDirection = req.query.sortBy === "oldest" ? 1 : -1;

  const combinedQuery = { createdBy: userId, ...query };
  const jobs = await Job.find(combinedQuery)
    .sort({ _id: sortDirection })
    .skip(skip)
    .limit(limit);

  const totalJobs = await Job.countDocuments(query);
  res.json({
    jobs,
    totalJobs,
    page,
    totalPages: Math.ceil(totalJobs / limit),
  });
};
export const getFullJob = async (req: RequestWithUser, res: Response) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
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
