import dotenv from "dotenv";
dotenv.config();

console.log("FRONTEND_URL:", process.env.FRONTEND_URL);

import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import foodRouter from "./routes/foodRoute.js";
import userRouter from "./routes/userRoute.js";
import cartRouter from "./routes/cartRoute.js";
import authRouter from "./routes/authRoute.js";
import orderRouter from "./routes/orderRoute.js";
import discountRouter from "./routes/discountRoute.js";
// import 'dotenv/config';
import dns from "node:dns/promises";
import startCronJobs from "./utils/cronJob.js";
import adminRouter from "./routes/adminRoute.js";
import reviewRouter from "./routes/reviewRoute.js";
dns.setServers(["8.8.8.8", "1.1.1.1"]);

// app config
const app = express();
const port = Number(process.env.PORT) || 4000;

// Khai báo danh sách tất cả các trang web được phép gọi API của bạn
const allowedOrigins = new Set(
    [
        "http://localhost:5173",
        "http://localhost:3000",
        process.env.FRONTEND_URL,
        process.env.ADMIN_URL,
        "https://food-order-theta-tan.vercel.app", // fallback
        "https://admin-gamma-eight-67.vercel.app", // fallback
    ].filter(Boolean)
);
const isAllowedOrigin = (origin) => {
    if (!origin) return true;
    if (allowedOrigins.has(origin)) return true;
    // Allow Vercel preview deployments
    try {
        const { hostname, protocol } = new URL(origin);
        if (protocol !== "https:") return false;
        return hostname.endsWith(".vercel.app");
    } catch {
        return false;
    }
};

app.set('trust proxy', 1);

const cleanNoSQL = (obj) => {
    if (obj && typeof obj === 'object') {
        for (const key in obj) {
            if (key.startsWith('$') || key.includes('.')) {
                delete obj[key];
            } else if (typeof obj[key] === 'object') {
                cleanNoSQL(obj[key]);
            }
        }
    }
};

const customMongoSanitize = (req, res, next) => {
    cleanNoSQL(req.body);
    cleanNoSQL(req.params);
    if (req.query) {
        const queryCopy = { ...req.query };
        cleanNoSQL(queryCopy);
        Object.defineProperty(req, 'query', {
            value: queryCopy,
            writable: true,
            configurable: true
        });
    }
    next();
};

// middleware
app.use(express.json());
app.use(cors({
    origin: function (origin, callback) {
        // Cho phép các request không có origin (như Postman hoặc thiết bị test)
        if (!origin) return callback(null, true);
        
        if (isAllowedOrigin(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Bị chặn bởi cơ chế CORS của Backend!"));
        }
    },
    credentials: true
}));;

// Kích hoạt màng lọc
app.use(customMongoSanitize);

// db connection
connectDB();

// api endpoints
app.use("/api/food", foodRouter);
app.use("/images", express.static('uploads'));
app.use("/api/user", userRouter);
app.use("/api/cart", cartRouter);
app.use("/api/auth", authRouter);
app.use("/api/order", orderRouter);
app.use("/api/admin", adminRouter);
app.use("/api/discount", discountRouter);
app.use("/api/review", reviewRouter);

app.get("/", (req, res) => {
    res.send("API Working...");
});

// listen
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
    startCronJobs();
});
