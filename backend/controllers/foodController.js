import foodModel from "../models/foodModel.js";
import fs from "fs"; // Thư viện có sẵn của Node.js để thao tác với file

// Thêm món ăn mới (Add food item)
const addFood = async (req, res) => {
    // Note: req.file.filename là tên file ảnh đã được Multer xử lý và đổi tên
    let image_filename = `${req.file.filename}`; 

    // Note: Tạo ra một đối tượng món ăn mới dựa trên form gửi lên (req.body)
    const food = new foodModel({
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        category: req.body.category,
        image: image_filename
    });

    try {
        await food.save(); // Note: Lưu món ăn vào MongoDB
        res.json({ success: true, message: "Thêm món ăn thành công!" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Lỗi! Không thể thêm món ăn." });
    }
}
// all food list
const listFood = async (req, res) => {
    try {
        const foods = await foodModel.find({}); // Lấy toàn bộ dữ liệu từ bảng food
        res.json({ success: true, data: foods });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
}

// remove food item
const removeFood = async (req, res) =>{
    try {
        // Tìm món ăn trong DB để lấy tên file ảnh
        const food = await foodModel.findById(req.body.id);
        
        // Xóa file ảnh trong thư mục uploads
        fs.unlink(`uploads/${food.image}`, () => {});

        // Xóa data món ăn trong MongoDB
        await foodModel.findByIdAndDelete(req.body.id);
        
        res.json({ success: true, message: "Food Removed" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
}
export { addFood, listFood,removeFood };