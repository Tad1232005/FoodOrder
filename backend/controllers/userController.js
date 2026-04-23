import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";

// Hàm tạo Token (giấy thông hành)
const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET);
}

// Chức năng Đăng nhập (Login)
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        // Kiểm tra xem user có tồn tại không
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: "Tài khoản không tồn tại!" });
        }

        // So sánh mật khẩu
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.json({ success: false, message: "Mật khẩu không chính xác!" });
        }

        // Cấp token nếu đúng
        const token = createToken(user._id);
        res.json({ success: true, token });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Lỗi đăng nhập" });
    }
}

// Chức năng Đăng ký (Register)
const registerUser = async (req, res) => {
    const { name, password, email } = req.body;
    try {
        // Kiểm tra xem email đã được dùng chưa
        const exists = await userModel.findOne({ email });
        if (exists) {
            return res.json({ success: false, message: "Email này đã được sử dụng!" });
        }

        // Kiểm tra định dạng email
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Vui lòng nhập email hợp lệ!" });
        }

        // Kiểm tra độ dài mật khẩu
        if (password.length < 8) {
            return res.json({ success: false, message: "Mật khẩu phải có ít nhất 8 ký tự!" });
        }

        // Mã hóa mật khẩu
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Tạo User mới
        const newUser = new userModel({
            name: name,
            email: email,
            password: hashedPassword
        });

        // Lưu vào Database
        const user = await newUser.save();
        const token = createToken(user._id);
        res.json({ success: true, token });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Lỗi đăng ký" });
    }
}

export { loginUser, registerUser };