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
        
        // Gắn userId vào request (không phụ thuộc req.body)
        req.userId = token_decode.id;
        if (!req.body) req.body = {};
        req.body.userId = token_decode.id;
        
        // Cho phép đi tiếp vào Controller
        next();
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Invalid or expired token!" });
    }
}

export default authMiddleware;