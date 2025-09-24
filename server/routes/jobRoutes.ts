import express from "express";
import {
  createJob,
  deleteJob,
  getJobs,
  seedJobs,
  updateJob,
} from "../controllers/jobController";
import { protect } from "../middleware/authMiddleware";
import { Job } from "../models/Job";

const router = express.Router();

router.use(protect);

router.post("/seed", seedJobs);
router.route("/").get(getJobs).post(createJob);
router.route("/:id").put(updateJob).delete(deleteJob);

router.put("/:id/status", async (req, res) => {
  try {
    const jobId = req.params.id;
    const { status } = req.body;

    if (
      ![
        "applied",
        "pending",
        "declined",
        "interviewing",
        "offer",
        "rejected",
      ].includes(status)
    ) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    const updatedJob = await Job.findByIdAndUpdate(
      jobId,
      { status },
      { new: true }
    );

    if (!updatedJob) {
      return res.status(404).json({ error: "Job not found" });
    }

    res.json(updatedJob);
  } catch (err) {
    console.error("Error updating job status:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
