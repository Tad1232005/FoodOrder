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
    const [resending, setResending] = useState(false);
    const [count, setCount] = useState(60);
    const [success, setSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    
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
        setErrorMsg("");
        setSuccessMsg("");
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
        setErrorMsg("");
        setSuccessMsg("");

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
        if (code.length < 6) {
            setErrorMsg("Please enter the full 6-digit code.");
            return;
        }

        setLoading(true);
        setErrorMsg("");
        setSuccessMsg("");

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
            } else {
                const backendMsg = res.data.message || "";
                if (backendMsg.toLowerCase().includes("expire")) {
                    setErrorMsg("Verification code has expired. Please request a new one.");
                } else if (backendMsg.toLowerCase().includes("invalid")) {
                    setErrorMsg("Incorrect verification code. Please try again.");
                } else {
                    setErrorMsg(backendMsg || "Verification failed. Please try again.");
                }
            }
        } catch (err) {
            const backendMsg = err.response?.data?.message || "";
            if (backendMsg.toLowerCase().includes("expire")) {
                setErrorMsg("Verification code has expired. Please request a new one.");
            } else {
                setErrorMsg(backendMsg || "Incorrect verification code. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const onResendHandler = async () => {
        if (count > 0 || resending || success) return;

        if (!email) {
            setErrorMsg("Session expired. Please register again.");
            return;
        }

        setResending(true);
        setErrorMsg("");
        setSuccessMsg("");

        try {
            const res = await axios.post(`${url}/api/user/resend-verify`, { email });

            if (res.data.success) {
                setSuccessMsg("A new verification code has been sent to your email.");
                setOtp(new Array(6).fill(""));
                setCount(60);
                inputs.current[0]?.focus();
            } else {
                setErrorMsg(res.data.message || "Could not resend code. Please try again.");
            }
        } catch (err) {
            setErrorMsg(err.response?.data?.message || "Could not resend code. Please try again.");
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="verify-wrap">
            <div className={`verify-card ${success ? "blur-bg" : ""}`}>
                <h2>Verify Email</h2>
                <p>Enter 6-digit code sent to <strong>{email}</strong></p>

                {successMsg && (
                    <div className="success-msg-box">
                        {successMsg}
                    </div>
                )}

                {errorMsg && (
                    <div className="error-msg-box">
                        {errorMsg}
                    </div>
                )}

                <div className="otp-container" onPaste={handlePaste}>
                    {otp.map((v, i) => (
                        <input
                            key={i}
                            ref={(el) => (inputs.current[i] = el)}
                            value={v}
                            maxLength={1}
                            onChange={(e) => handleChange(e.target.value, i)}
                            onKeyDown={(e) => handleKeyDown(e, i)}
                            className={errorMsg ? "input-error" : ""} // Chuyển class viền đỏ khi có lỗi
                        />
                    ))}
                </div>

                <button className="verify-btn" onClick={onVerifyHandler} disabled={loading || success}>
                    {loading ? "Verifying..." : "Verify"}
                </button>

                <div className="resend">
                    Didn't get code?{" "}
                    <span
                        className={count > 0 || resending ? "disabled" : "link"}
                        onClick={onResendHandler}
                    >
                        {resending ? "Sending..." : `Resend${count > 0 ? ` (${count}s)` : ""}`}
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