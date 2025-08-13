import express, { Router } from "express";
import { login, refreshLogin, register } from "../controllers/authController";

const router: Router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refreshLogin);

export default router;
