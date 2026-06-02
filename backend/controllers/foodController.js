import foodModel from "../models/foodModel.js";
import fs from "fs"; // Thư viện có sẵn của Node.js để thao tác với file

// Thêm món ăn mới (Add food item)
const addFood = async (req, res) => {
    // Note: req.files là mảng các file ảnh đã được Multer xử lý và đổi tên
    let image_filenames = req.files ? req.files.map(file => file.filename) : [];

    // Note: Tạo ra một đối tượng món ăn mới dựa trên form gửi lên (req.body)
    const food = new foodModel({
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        category: req.body.category,
        images: image_filenames
    });

    try {
        await food.save(); // Note: Lưu món ăn vào MongoDB
        res.json({ success: true, message: "Food Added!" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error. Food not added!" });
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
        
        // Xóa tất cả file ảnh trong thư mục uploads
        if (food.images && food.images.length > 0) {
            food.images.forEach(img => {
                fs.unlink(`uploads/${img}`, () => {});
            });
        }

        // Xóa data món ăn trong MongoDB
        await foodModel.findByIdAndDelete(req.body.id);
        
        res.json({ success: true, message: "Food Removed" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
}
// update food item (with optional image change)
const updateFood = async (req, res) => {
    try {
        const { id, name, description, price, category, imagesToDelete } = req.body;
        if (!id) return res.json({ success: false, message: "Missing id" });

        const food = await foodModel.findById(id);
        if (!food) return res.json({ success: false, message: "Food not found" });

        // Handle image deletion
        let currentImages = [...food.images];
        if (imagesToDelete) {
            const toDelete = Array.isArray(imagesToDelete) ? imagesToDelete : [imagesToDelete];
            toDelete.forEach(img => {
                const index = currentImages.indexOf(img);
                if (index > -1) {
                    currentImages.splice(index, 1);
                    fs.unlink(`uploads/${img}`, () => {});
                }
            });
        }

        // If new images are uploaded, add them
        if (req.files && req.files.length > 0) {
            const newImages = req.files.map(file => file.filename);
            currentImages = [...currentImages, ...newImages];
        }

        // Update food
        const updated = await foodModel.findByIdAndUpdate(
            id,
            {
                ...(name !== undefined ? { name } : {}),
                ...(description !== undefined ? { description } : {}),
                ...(price !== undefined ? { price } : {}),
                ...(category !== undefined ? { category } : {}),
                images: currentImages,
            },
            { new: true }
        );
        if (!updated) return res.json({ success: false, message: "Food not found" });
        res.json({ success: true, message: "Food Updated", data: updated });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
}
// GET /api/food/:id
const getFoodById = async (req, res) => {
    try {
        const food = await foodModel.findById(req.params.id);
        if (!food) return res.json({ success: false, message: "Food not found" });
        res.json({ success: true, data: food });
    } catch (error) {
        res.json({ success: false, message: "Error" });
    }
};

export { addFood, listFood, removeFood, updateFood, getFoodById };