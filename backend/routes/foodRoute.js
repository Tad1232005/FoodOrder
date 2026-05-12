import express from "express";
import { addFood, listFood, removeFood, updateFood } from "../controllers/foodController.js";
import multer from "multer";

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
foodRouter.post("/add", upload.single("image"), addFood);
foodRouter.get("/list", listFood);
foodRouter.post("/remove", removeFood);
foodRouter.post("/update", updateFood);
export default foodRouter;