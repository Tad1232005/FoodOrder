import { useState } from "react";
import axios from "axios";
import { useSearchParams, useNavigate } from "react-router-dom";
import "./SetPassword.css";

const ADMIN_LOGIN_URL =
    import.meta.env.VITE_ADMIN_URL || "https://admin-gamma-eight-67.vercel.app";

export default function SetPassword() {
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const token = searchParams.get("token");

    const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

    const redirectAfterSuccess = (role) => {
        if (role === "admin" || role === "staff") {
            window.location.href = `${ADMIN_LOGIN_URL.replace(/\/$/, "")}/login`;
            return;
        }
        navigate("/login", { replace: true });
    };

    const handleSubmit = async () => {
        if (!token) {
            setErrorMsg("Invalid or missing invite link.");
            return;
        }
        if (!password || password.length < 8) {
            setErrorMsg("Password must be at least 8 characters.");
            return;
        }

        setLoading(true);
        setErrorMsg("");

        try {
            const res = await axios.post(`${backendUrl}/api/auth/set-password`, {
                token,
                password,
            });

            if (res.data.success) {
                redirectAfterSuccess(res.data.role);
            } else {
                setErrorMsg(res.data.message || "Could not set password. Please try again.");
            }
        } catch (err) {
            setErrorMsg(err.response?.data?.message || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="set-password-container">
            <div className="set-password-box">
                <h2>Set Your Password</h2>

                {errorMsg && <div className="set-password-error">{errorMsg}</div>}

                <input
                    type="password"
                    placeholder="New password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button onClick={handleSubmit} disabled={loading}>
                    {loading ? "Saving..." : "Save Password"}
                </button>
            </div>
        </div>
    );
}