import express from "express";
import { uploadResume } from "../controllers/resumeController";
import uploadmiddleware from "../middleware/uploadMiddleware";

const router = express.Router();

router.post("/upload", uploadmiddleware, uploadResume);

export default router;
