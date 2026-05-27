import mongoose from "mongoose";

const discountSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true }, // Tên mã (VD: 2026)
    
    //  Thêm 'freeship' vào mảng enum để cho phép lưu loại giảm giá này
    discountType: { type: String, required: true, enum: ['percent', 'fixed', 'freeship'] }, 
    
    discountValue: { type: Number, required: true }, // Mức giảm (VD: 10%, 2$, hoặc 0 nếu là freeship)
    expireDate: { type: Date, required: true }, // Hạn sử dụng
    isActive: { type: Boolean, default: true }, // Trạng thái bật/tắt
    
    // Số tiền đơn hàng tối thiểu để được áp mã
    minOrderAmount: { type: Number, default: 0 },

    // Mảng lưu danh sách ID những tài khoản đã dùng mã này
    usedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }]
});

const discountModel = mongoose.models.discount || mongoose.model("discount", discountSchema);

export default discountModel;