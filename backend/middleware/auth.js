import jwt from "jsonwebtoken";

const authMiddleware = async (req, res, next) => {
// Lấy token từ headers của yêu cầu
    const { token } = req.headers;
    
    // Nếu không có token -> Đuổi về
    if (!token) {
        return res.json({ success: false, message: "Unauthorized access. Please log in again." });
    }
    
    try {
        // Giải mã token bằng chìa khóa bí mật trong file .env
        const token_decode = jwt.verify(token, process.env.JWT_SECRET);
        
        // Nhét cái ID người dùng vừa giải mã được vào body để cartController dùng
        req.body.userId = token_decode.id;
        
        // Cho phép đi tiếp vào Controller
        next();
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Invalid or expired token!" });
    }
}

export default authMiddleware;