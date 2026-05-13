import dotenv from "dotenv";
dotenv.config();

console.log(process.env.EMAIL_USER);
console.log(process.env.EMAIL_PASS);
console.log("FRONTEND_URL:", process.env.FRONTEND_URL);

import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import foodRouter from "./routes/foodRoute.js";
import userRouter from "./routes/userRoute.js";
import cartRouter from "./routes/cartRoute.js";
import authRoutes from "./routes/authRoutes.js";
import 'dotenv/config';
import dns from "node:dns/promises";
dns.setServers(["8.8.8.8", "1.1.1.1"]);

// app config
const app = express();
const port = 4000;

// middleware
app.use(express.json());
app.use(cors());

// db connection
connectDB();

// api endpoints
app.use("/api/food", foodRouter);
app.use("/images", express.static('uploads'));
app.use("/api/user", userRouter);
app.use("/api/cart", cartRouter);
app.use("/api/auth", authRoutes);


app.get("/", (req, res) => {
    res.send("API Working...");
});

// listen
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});