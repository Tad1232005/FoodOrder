import express from "express";
import { addFood, listFood, removeFood, updateFood, getFoodById } from "../controllers/foodController.js";
import multer from "multer";
import adminAuth from "../middleware/adminAuth.js";

const foodRouter = express.Router();

// Note: Cấu hình Multer - Nơi lưu ảnh và cách đặt tên ảnh
const storage = multer.diskStorage({
    destination: "./uploads", // Note: Lưu vào thư mục 'uploads' vừa tạo
    filename: (req, file, cb) => {
        // Note: Đổi tên file thành chuỗi thời gian + tên gốc để không bị trùng lặp ảnh
        return cb(null, `${Date.now()}${file.originalname}`); 
    }
});

const upload = multer({ storage: storage }); // Note: Khởi tạo middleware upload

// Note: Tạo API phương thức POST. Khi gọi API này, nó sẽ chạy middleware upload ảnh trước, rồi mới chạy hàm addFood
foodRouter.post("/add", adminAuth, upload.array("images", 10), addFood); // Support up to 10 images
foodRouter.get("/list", listFood);
foodRouter.post("/remove", adminAuth, removeFood);
foodRouter.post("/update", adminAuth, upload.array("images", 10), updateFood); // Support up to 10 images
foodRouter.get("/item/:id", getFoodById);
export default foodRouter;