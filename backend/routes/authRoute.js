import express from "express";
import { setPassword } from "../controllers/authController.js";

const router = express.Router();

router.post("/set-password", setPassword);

export default router;