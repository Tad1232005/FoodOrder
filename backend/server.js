import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import foodRouter from "./routes/foodRoute.js";
import userRouter from "./routes/userRoute.js";
import cartRouter from "./routes/cartRoute.js";
<<<<<<< HEAD
=======
import authRoutes from "./routes/authRoutes.js";
import orderRouter from "./routes/orderRoute.js";
>>>>>>> 190b2bd (Create place order feature and stripe payment integration ,done)
import 'dotenv/config';
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
<<<<<<< HEAD

=======
app.use("/api/auth", authRoutes);
app.use("/api/order", orderRouter);
>>>>>>> 190b2bd (Create place order feature and stripe payment integration ,done)

app.get("/", (req, res) => {
    res.send("API Đang Chạy...");
});

// listen
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});