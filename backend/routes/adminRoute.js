import express from "express";

import { getDashboardStats } from "../controllers/adminController.js";

const adminRouter = express.Router();

adminRouter.get("/dashboard", getDashboardStats);

export default adminRouter;