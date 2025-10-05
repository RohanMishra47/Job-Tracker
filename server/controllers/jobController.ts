import { Response } from "express";
import { validationResult } from "express-validator";
import mongoose from "mongoose";
import { buildArrayFilter } from "../filters/buildArrayFilter";
import { buildDateFilter } from "../filters/buildDateFilter";
import { buildSearchFilter } from "../filters/buildSearchFilter";
import { RequestWithUser } from "../interfaces/reqInterfaces";
import { Job } from "../models/Job";

// Helper function for consistent error responses
const handleControllerError = (
  res: Response,
  error: unknown,
  context: string,
  defaultMessage = "An error occurred"
) => {
  console.error(`[${context}] Error:`, error);

  if (error instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({
      error: "Validation failed",
      details: Object.values(error.errors).map((err) => err.message),
      context,
    });
  }

  if (error instanceof mongoose.Error.CastError) {
    return res.status(400).json({
      error: "Invalid ID format",
      context,
    });
  }

  if (error instanceof Error) {
    return res.status(500).json({
      error: error.message || defaultMessage,
      context,
    });
  }

  return res.status(500).json({
    error: defaultMessage,
    context,
  });
};

// Helper function to validate request
const validateRequest = (req: RequestWithUser, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: "Validation failed",
      details: errors.array(),
    });
  }
  return null;
};
// POST /api/jobs/seed
export const seedJobs = async (req: RequestWithUser, res: Response) => {
  console.log("🌱 Seeding endpoint hit!");
  console.log("🔐 User ID:", req.user?.id);

  try {
    const createdBy = req.user?.id;

    if (!createdBy) {
      console.log("❌ No user ID found");
      return res.status(401).json({
        error: "Authentication required",
        details: "User not authenticated or session expired",
      });
    }

    console.log("🗑️ Clearing existing test jobs...");
    const deleteResult = await Job.deleteMany({ company: /^Company \d+$/ });
    console.log(`✅ Cleared ${deleteResult.deletedCount} test jobs`);

    console.log("📝 Creating seed data...");
    const seedJobs = Array.from({ length: 30 }, (_, i) => i + 1).map((i) => ({
      company: `Company ${i}`,
      position: `Test Job ${i}`,
      status:
        i % 3 === 0 ? "interviewing" : i % 3 === 1 ? "declined" : "pending",
      jobType: i % 2 === 0 ? "full-time" : "part-time",
      location: `Location ${i}`,
      createdBy,
      description: i % 2 === 0 ? `Job description ${i}` : undefined,
      salary: i % 2 === 0 ? [10000, 20000] : undefined,
      experienceLevel: i % 2 === 0 ? "senior" : "junior",
      tags: i % 2 === 0 ? ["Node.js", "Express.js"] : ["React", "Redux"],
      applicationLink: i % 2 === 0 ? `https://example.com/job/${i}` : undefined,
      deadline: i % 2 === 0 ? new Date("2024-03-15") : undefined,
      priority: i % 2 === 0 ? "high" : "medium",
      source: i % 2 === 0 ? "LinkedIn" : "Company Site",
      notes: i % 2 === 0 ? `This is a test job ${i}` : undefined,
      isFavorite: i === 15 || i === 30,
    }));

    console.log("💾 Inserting jobs into database...");
    const result = await Job.insertMany(seedJobs);
    console.log("✅ Jobs inserted:", result.length);

    res.status(200).json({
      message: `${result.length} test jobs created successfully!`,
      jobsCreated: result.length,
    });
  } catch (error) {
    handleControllerError(res, error, "seedJobs", "Failed to seed jobs");
  }
};

// POST /api/jobs
export const createJob = async (req: RequestWithUser, res: Response) => {
  try {
    // Validate request first
    const validationError = validateRequest(req, res);
    if (validationError) return validationError;

    const { company, position, status, jobType, location } = req.body;
    const createdBy = req.user?.id;

    if (!createdBy) {
      return res.status(401).json({
        error: "Authentication required",
        details: "User not authenticated",
      });
    }

    // Create job with all possible fields from request body
    const jobData = {
      company,
      position,
      status,
      jobType,
      location,
      createdBy,
      ...req.body, // Include all other fields from request
    };

    const job = await Job.create(jobData);
    console.log("Job created:", job._id);

    res.status(201).json(job);
  } catch (error) {
    handleControllerError(res, error, "createJob", "Failed to create job");
  }
};

// GET /api/jobs
export const getJobs = async (req: RequestWithUser, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        error: "Authentication required",
        details: "User not authenticated",
      });
    }

    const {
      search,
      status,
      type,
      priority,
      experienceLevel,
      sources,
      tags,
      date,
      isFavorite,
      sortBy = "newest",
    } = req.query;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, parseInt(req.query.limit as string) || 10);
    const skip = (page - 1) * limit;

    // Build query object
    const query: Record<string, any> = {
      createdBy: userId,
      ...buildSearchFilter(search as string),
      ...buildDateFilter(date as string),
      ...buildArrayFilter("status", status as string | string[]),
      ...buildArrayFilter("jobType", type as string | string[]),
      ...buildArrayFilter("priority", priority as string | string[]),
      ...buildArrayFilter(
        "experienceLevel",
        experienceLevel as string | string[]
      ),
      ...buildArrayFilter("source", sources as string | string[]),
      ...buildArrayFilter("tags", tags as string | string[]),
      ...(isFavorite === "true" ? { isFavorite: true } : {}),
    };

    console.log("Querying jobs with:", query);

    // Determine sort order

    const sortDirection = sortBy === "oldest" ? 1 : -1;

    // Pagination and sorting
    const [jobs, totalJobs] = await Promise.all([
      Job.find(query)
        .sort({ createdAt: sortDirection })
        .skip(skip)
        .limit(limit)
        .lean(),
      Job.countDocuments(query),
    ]);

    res.json({
      jobs,
      totalJobs,
      page,
      totalPages: Math.ceil(totalJobs / limit),
      hasMore: skip + jobs.length < totalJobs,
    });
  } catch (error) {
    handleControllerError(res, error, "getJobs", "Failed to fetch jobs");
  }
};

export const getFullJob = async (req: RequestWithUser, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        error: "Authentication required",
        details: "User not authenticated",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: "Invalid job ID format",
      });
    }

    const job = await Job.findOne({ _id: id, createdBy: userId });

    if (!job) {
      return res.status(404).json({
        error: "Job not found",
        details:
          "The requested job doesn't exist or you don't have permission to view it",
      });
    }

    res.json(job);
  } catch (error) {
    handleControllerError(
      res,
      error,
      "getFullJob",
      "Failed to fetch job details"
    );
  }
};

// PUT /api/jobs/:id
export const updateJob = async (req: RequestWithUser, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        error: "Authentication required",
        details: "User not authenticated",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: "Invalid job ID format",
      });
    }

    // Validate request first
    const validationError = validateRequest(req, res);
    if (validationError) return validationError;

    const job = await Job.findOneAndUpdate(
      { _id: id, createdBy: userId },
      req.body,
      {
        new: true,
        runValidators: true,
        context: "update",
      }
    );

    if (!job) {
      return res.status(404).json({
        error: "Job not found",
        details:
          "The requested job doesn't exist or you don't have permission to update it",
      });
    }

    res.json(job);
  } catch (error) {
    handleControllerError(res, error, "updateJob", "Failed to update job");
  }
};

// DELETE /api/jobs/:id
export const deleteJob = async (req: RequestWithUser, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        error: "Authentication required",
        details: "User not authenticated",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: "Invalid job ID format",
      });
    }

    const job = await Job.findOneAndDelete({ _id: id, createdBy: userId });

    if (!job) {
      return res.status(404).json({
        error: "Job not found",
        details:
          "The requested job doesn't exist or you don't have permission to delete it",
      });
    }

    res.json({
      message: "Job deleted successfully",
      deletedJobId: id,
    });
  } catch (error) {
    handleControllerError(res, error, "deleteJob", "Failed to delete job");
  }
};
