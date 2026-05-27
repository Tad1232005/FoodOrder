import discountModel from "../models/discountModel.js";

// 1. API: Thêm mã giảm giá mới
const addDiscount = async (req, res) => {
    try {
        const discount = new discountModel({
            code: req.body.code,
            discountType: req.body.discountType,
            discountValue: req.body.discountValue,
            expireDate: req.body.expireDate,
            // NHẬN DỮ LIỆU TỪ ADMIN
            minOrderAmount: req.body.minOrderAmount || 0, 
            isActive: req.body.isActive !== undefined ? req.body.isActive : true 
        });
        await discount.save();
        res.json({ success: true, message: "Discount added successfully!" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error adding discount (Code may already exist)" });
    }
};

// 2. API: Lấy danh sách toàn bộ mã
const listDiscounts = async (req, res) => {
    try {
        const discounts = await discountModel.find({});
        res.json({ success: true, data: discounts });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error fetching discounts" });
    }
};

// 3. API: Xóa mã giảm giá
const removeDiscount = async (req, res) => {
    try {
        await discountModel.findByIdAndDelete(req.body.id);
        res.json({ success: true, message: "Discount removed successfully!" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error removing discount" });
    }
};

// 4. API: Khách hàng áp dụng mã giảm giá
const applyDiscount = async (req, res) => {
    try {
        // Nhận thêm userId (để check dùng rồi) và subtotal (để check đơn tối thiểu) từ frontend gửi lên
        const { code, userId, subtotal } = req.body;
        
        // Tìm mã giảm giá trong Database
        const discount = await discountModel.findOne({ code });

        // CỬA 1: Kiểm tra mã có tồn tại không
        if (!discount) {
            return res.json({ success: false, message: "Invalid promo code!" });
        }

        // CỬA 2: Kiểm tra trạng thái hoạt động (Status discount)
        if (!discount.isActive) {
            return res.json({ success: false, message: "This promo code is currently disabled!" });
        }

        // CỬA 3: Kiểm tra hạn sử dụng
        const currentDate = new Date();
        const expireDate = new Date(discount.expireDate);
        if (currentDate > expireDate) {
            return res.json({ success: false, message: "Promo code has expired!" });
        }

        // --- CỬA 4 ---
        // Dùng .some() và .toString() để đảm bảo ép kiểu chuẩn xác 100% giữa ObjectId và String
        if (discount.usedBy && discount.usedBy.some(id => id.toString() === userId.toString())) {
            return res.json({ success: false, message: "You have already used this promo code!" });
        }

        // CỬA 5: Kiểm tra điều kiện đơn hàng tối thiểu (minOrderAmount)
        if (subtotal && subtotal < discount.minOrderAmount) {
            return res.json({ 
                success: false, 
                message: `Order total must be at least $${discount.minOrderAmount} to use this code!` 
            });
        }

        res.json({ 
            success: true, 
            data: discount, 
            message: discount.discountType === "freeship" ? "Free shipping applied successfully!" : "Promo code applied successfully!" 
        });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error applying promo code" });
    }
};

// 5. API: Cập nhật thông tin mã giảm giá 
const updateDiscount = async (req, res) => {
    try {
        // Giải pháp an toàn: Chấp nhận cả trường _id hoặc id từ Frontend gửi lên
        const discountId = req.body._id || req.body.id;

        if (!discountId) {
            return res.json({ success: false, message: "Missing Discount ID!" });
        }

        const { code, discountType, discountValue, expireDate, minOrderAmount, isActive } = req.body;

        const updatedDiscount = await discountModel.findByIdAndUpdate(
            discountId,
            {
                code: code ? code.trim().toUpperCase() : undefined, // Đồng bộ viết hoa mã giảm giá
                discountType,
                discountValue,
                expireDate,
                minOrderAmount,
                isActive
            },
            { returnDocument: 'after' }
        );

        if (!updatedDiscount) {
            return res.json({ success: false, message: "Promo code not found!" });
        }

        res.json({ success: true, message: "Discount updated successfully!", data: updatedDiscount });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error updating discount" });
    }
};

export { addDiscount, listDiscounts, removeDiscount, applyDiscount, updateDiscount };