import express from "express";
import { calculateFitScore } from "../controllers/fitScoreController";

const router = express.Router();
router.post("/", calculateFitScore);

export default router;
