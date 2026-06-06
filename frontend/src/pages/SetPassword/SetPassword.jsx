import { useState } from "react";
import axios from "axios";
import { useSearchParams, useNavigate } from "react-router-dom";
import "./SetPassword.css";

export default function SetPassword() {
    const [password, setPassword] = useState("");
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const token = searchParams.get("token");

    const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";
    const handleSubmit = async () => {
        try {
            const res = await axios.post(`${backendUrl}/api/auth/set-password`, {
                token,
                password
            });

            if (res.data.success) {
                alert("Password set success!");
                navigate("/login", { replace: true });
            }
        } catch (err) {
            alert("Error");
        }
    };

    return (
        <div className="set-password-container">
            <div className="set-password-box">
                <h2>Set Your Password</h2>

                <input
                    type="password"
                    placeholder="New password"
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button onClick={handleSubmit}>
                    Save Password
                </button>
            </div>
        </div>
    );
}