import { useState, useRef, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";
import "./VerifyEmail.css";

export default function VerifyEmail() {
    const { url, setToken } = useContext(StoreContext);
    const navigate = useNavigate();
    const email = localStorage.getItem("verifyEmail");

    const [otp, setOtp] = useState(new Array(6).fill(""));
    const [loading, setLoading] = useState(false);
    const [count, setCount] = useState(60);
    const [success, setSuccess] = useState(false);
    const inputs = useRef([]);

    // Đếm ngược thời gian gửi lại mã
    useEffect(() => {
        if (count <= 0) return;
        const timer = setInterval(() => setCount((c) => c - 1), 1000);
        return () => clearInterval(timer);
    }, [count]);

    // Xử lý khi người dùng dán (paste) mã code
    const handlePaste = (e) => {
        e.preventDefault();
        const pasteData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        if (!pasteData) return;

        const newOtp = [...otp];
        pasteData.split("").forEach((char, i) => { newOtp[i] = char; });
        setOtp(newOtp);
        inputs.current[pasteData.length - 1]?.focus();
    };

    // Xử lý nhập từng số
    const handleChange = (value, index) => {
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);

        if (value && index < 5) {
            inputs.current[index + 1].focus();
        }
    };

    // Xử lý phím Backspace để quay lại ô trước
    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputs.current[index - 1].focus();
        }
    };

    // Gọi API xác thực
    const onVerifyHandler = async () => {
        const code = otp.join("");
        if (code.length < 6) return;

        setLoading(true);
        try {
            const res = await axios.post(`${url}/api/user/verify-email`, { email, code });

            if (res.data.success) {
                // Hiển thị UI thành công trước khi chuyển trang
                setSuccess(true);

                // Dừng 2 giây để user thấy thông báo xanh lá rồi mới nhảy trang
                setTimeout(() => {
                    setToken(res.data.token);
                    localStorage.setItem("token", res.data.token);
                    localStorage.removeItem("verifyEmail");
                    navigate("/login");
                }, 2000);
            }
        } catch (err) {
            alert("Invalid verification code");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="verify-wrap">
            <div className={`verify-card ${success ? "blur-bg" : ""}`}>
                <h2>Verify Email</h2>
                <p>Enter 6-digit code sent to <strong>{email}</strong></p>

                <div className="otp-container" onPaste={handlePaste}>
                    {otp.map((v, i) => (
                        <input
                            key={i}
                            ref={(el) => (inputs.current[i] = el)}
                            value={v}
                            maxLength={1}
                            onChange={(e) => handleChange(e.target.value, i)}
                            onKeyDown={(e) => handleKeyDown(e, i)}
                        />
                    ))}
                </div>

                <button className="verify-btn" onClick={onVerifyHandler} disabled={loading || success}>
                    {loading ? "Verifying..." : "Verify"}
                </button>

                <div className="resend">
                    Didn't get code?{" "}
                    <span className={count > 0 ? "disabled" : "link"} onClick={() => count === 0 && setCount(60)}>
                        Resend {count > 0 && `(${count}s)`}
                    </span>
                </div>
            </div>

            {/* UI Thông báo thành công màu xanh lá */}
            {success && (
                <div className="success-overlay">
                    <div className="success-box">
                        <div className="check-icon">✔</div>
                        <h3 className="success-title">Verified Successfully!</h3>
                        <p>Redirecting to login page...</p>
                    </div>
                </div>
            )}
        </div>
    );
}