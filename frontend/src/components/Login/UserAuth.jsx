import { useState, useCallback, useEffect, useRef, useContext } from "react";
import "./UserAuth.css";
import capooGif from "../../assets/capoo.gif";
import axios from "axios";
import { StoreContext } from "../../context/StoreContext";
import { useNavigate } from "react-router-dom";

const EMAIL_REGEX = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

// ─── Emoji đồ ăn bay trên nền ─────────────────────────────────────────────
const FOOD_EMOJIS = ["🍗", "🍟", "🍔", "🌭", "🍕", "🥤", "🍦", "🧁", "🥨", "🍩"];

// ─── useField ─────────────────────────────────────────────────────────────
function useField(initial = "") {
  const [value, setValue] = useState(initial);
  const [error, setError] = useState("");
  const onChange = useCallback((e) => {
    setValue(e.target.value);
    setError("");
  }, []);
  return { value, error, setError, onChange, setValue };
}

// ─── usePingGif: force GIF loop mãi mãi bằng cách reset src định kỳ ──────
function usePingGif(ref, intervalMs = 2800) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const id = setInterval(() => {
      const src = el.src;
      el.src = "";
      el.src = src;
    }, intervalMs);
    return () => clearInterval(id);
  }, [ref, intervalMs]);
}

// ─── Field ────────────────────────────────────────────────────────────────
function Field({ label, type = "text", placeholder, field, onChangeOverride }) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";

  return (
    <div className={`ua-field${field.error ? " ua-field--err" : ""}`}>
      {label && <label className="ua-label">{label}</label>}
      <div className="ua-input-wrap">
        <input
          type={isPassword ? (show ? "text" : "password") : type}
          placeholder={placeholder}
          value={field.value}
          onChange={onChangeOverride || field.onChange}
          className="ua-input"
          autoComplete="off"
        />
        {isPassword && (
          <button type="button" className="ua-eye" onClick={() => setShow((s) => !s)} tabIndex={-1}>
            {show ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        )}
      </div>
      {field.error && <span className="ua-err-msg">{field.error}</span>}
    </div>
  );
}

// ─── FoodCanvas: TỐI ƯU HÓA NEBULA NỀN (BỎ getBoundingClientRect khi move) ───
function FoodCanvas({ rootRef }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;
    const ctx = canvas.getContext("2d");

    // Bộ nhớ đệm tọa độ vùng chứa - chỉ đo khi resize, tránh giật lag khi move chuột
    let rootRect = root.getBoundingClientRect();

    function resize() {
      canvas.width  = root.offsetWidth;
      canvas.height = root.offsetHeight;
      rootRect = root.getBoundingClientRect();
    }
    resize();
    window.addEventListener("resize", resize);

    const items = Array.from({ length: 35 }, () => ({
      emoji:    FOOD_EMOJIS[Math.floor(Math.random() * FOOD_EMOJIS.length)],
      x:        Math.random() * (canvas.width || 800),
      y:        Math.random() * (canvas.height || 600),
      baseY:    0,
      size:     Math.random() * 18 + 10,
      speed:    Math.random() * 1.5 + 2,
      amp:      Math.random() * 25 + 10,
      phase:    Math.random() * Math.PI * 2,
      alpha:    Math.random() * 0.35 + 0.08,
      rot:      Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.05,
      drift:    (Math.random() - 0.5) * 1.5,
    }));
    items.forEach((it) => { it.baseY = it.y; });

    const parts = Array.from({ length: 30 }, () => ({
      x:  Math.random() * (canvas.width  || 800),
      y:  Math.random() * (canvas.height || 600),
      r:  Math.random() * 1.5 + 0.4,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      a:  Math.random() * 0.3 + 0.08,
    }));

    let mouse = { x: (canvas.width || 800) / 2, y: (canvas.height || 600) / 2 };
    let t = 0;
    let raf;

    function onMouseMove(e) {
      // Sử dụng rootRect đã được cache từ trước, không tính toán lại layout nữa
      mouse.x = e.clientX - rootRect.left;
      mouse.y = e.clientY - rootRect.top;
    }
    root.addEventListener("mousemove", onMouseMove);

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#1a0a00";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      t += 0.025;

      const nb = ctx.createRadialGradient(
        canvas.width * 0.3, canvas.height * 0.45, 0,
        canvas.width * 0.3, canvas.height * 0.45, 240
      );
      nb.addColorStop(0, "rgba(232,93,4,0.07)");
      nb.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = nb;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const nb2 = ctx.createRadialGradient(
        canvas.width * 0.75, canvas.height * 0.6, 0,
        canvas.width * 0.75, canvas.height * 0.6, 180
      );
      nb2.addColorStop(0, "rgba(255,180,0,0.05)");
      nb2.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = nb2;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (const it of items) {
        it.rot  += it.rotSpeed;
        it.x    += it.drift;
        it.y     = it.baseY + Math.sin(t * it.speed * 2 + it.phase) * it.amp;

        if (it.x < -30)               it.x = canvas.width  + 30;
        if (it.x > canvas.width + 30) it.x = -30;
        if (it.y < -30)               it.baseY = canvas.height + 30;
        if (it.y > canvas.height + 30) it.baseY = -30;

        ctx.save();
        ctx.globalAlpha = it.alpha;
        ctx.translate(it.x, it.y);
        ctx.rotate(it.rot);
        ctx.font = `${it.size}px serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(it.emoji, 0, 0);
        ctx.restore();
      }

      for (const p of parts) {
        const dx = mouse.x - p.x, dy = mouse.y - p.y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < 100) { p.vx -= (dx / d) * 0.03; p.vy -= (dy / d) * 0.03; }
        p.vx *= 0.98; p.vy *= 0.98;
        p.x  += p.vx;  p.y  += p.vy;
        if (p.x < 0) p.x = canvas.width;  if (p.x > canvas.width)  p.x = 0;
        if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,140,0,${p.a})`;
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      root.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", resize);
    };
  }, [rootRef]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    />
  );
}

// ─── MouseFollower: ĐÙI GÀ THEO CHUỘT SIÊU MƯỢT (GPU ACCELERATION + FIXED TỔNG) ───
function MouseFollower() {
  const elRef = useRef(null);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    let fx = 0, fy = 0, prevFx = 0;
    let raf;
    let mouse = { x: -200, y: -200 };

    function onMouseMove(e) {
      // Lấy trực tiếp tọa độ Viewport toàn màn hình, bỏ getBoundingClientRect
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    }
    window.addEventListener("mousemove", onMouseMove);

    function animate() {
      prevFx = fx;
      fx += (mouse.x - fx) * 0.25;
      fy += (mouse.y - 10 - fy) * 0.25; // Đẩy nhẹ Y lên đầu mũi tên chuột

      const dx    = fx - prevFx;
      const angle = Math.max(-28, Math.min(28, dx * 2.2));
      const flipX = dx < -1;

      // Sử dụng translate3d kích hoạt Card đồ họa (GPU), không dùng left/top để tránh Re-layout
      el.style.transform = `translate3d(calc(${fx}px - 50%), calc(${fy}px - 50%), 0) scaleX(${flipX ? -1 : 1}) rotate(${angle}deg)`;

      raf = requestAnimationFrame(animate);
    }
    raf = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return (
    <div
      ref={elRef}
      style={{
        position:     "fixed", // Chuyển sang fixed để thoát ly hoàn toàn và bay tự do
        left:         0,
        top:          0,
        transform:    "translate3d(-200px, -200px, 0)", 
        fontSize:     "42px",  // Cỡ đùi gà lớn, sắc nét
        zIndex:       9999,    // zIndex cực lớn để Đùi gà luôn bay TRÊN Form đăng nhập
        pointerEvents:"none",  // Chuột xuyên qua để click được nút bấm bên dưới
        userSelect:   "none",
        willChange:   "transform", // Báo hiệu trước cho trình duyệt tối ưu phần cứng
        filter:       "drop-shadow(0 5px 8px rgba(0,0,0,0.55))",
      }}
    >
      🍗
    </div>
  );
}

// ─── LoginForm ─────────────────────────────────────────────────────────────
function LoginForm({ onSwitch }) {
  const { url, setToken, cartItems, loadCartData } = useContext(StoreContext);
  const navigate  = useNavigate();
  const email     = useField();
  const password  = useField();
  const capooRef  = useRef(null);
  const [busy, setBusy]               = useState(false);
  const [generalError, setGeneralError] = useState("");

  usePingGif(capooRef, 2800); // Logo Capoo đứng yên trong Form vẫn giữ nguyên loop

  const validate = () => {
    let ok = true;
    if (!email.value.trim()) { email.setError("Email is required"); ok = false; }
    else if (!EMAIL_REGEX.test(email.value.trim())) { email.setError("Invalid email format"); ok = false; }
    if (!password.value) { password.setError("Password is required"); ok = false; }
    else if (password.value.length < 6) { password.setError("At least 6 characters"); ok = false; }
    return ok;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setBusy(true);
    setGeneralError("");
    try {
      const res = await axios.post(`${url}/api/user/login`, {
        email:    email.value.trim(),
        password: password.value,
      });
      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        setToken(res.data.token);
        await loadCartData(res.data.token, cartItems);
        navigate("/");
      } else if (res.data.needVerify) {
        localStorage.setItem("verifyEmail", res.data.email);
        navigate("/verify-email");
      } else {
        setGeneralError(res.data.message || "Login failed");
      }
    } catch (err) {
      setGeneralError(err.response?.data?.message || "Server error, try again");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="ua-form" onSubmit={handleSubmit} noValidate>
      <div className="ua-hero">
        <img ref={capooRef} src={capooGif} alt="Capoo" className="ua-capoo" />
        <h1 className="ua-title">Welcome back 🍗</h1>
        <p className="ua-subtitle">Sign in to order your meal</p>
      </div>

      <div className="ua-divider"><span>YOUR ACCOUNT</span></div>

      {generalError && <div className="ua-general-err">{generalError}</div>}

      <Field label="Email" type="email" placeholder="you@example.com" field={email}
        onChangeOverride={(e) => {
          email.onChange(e);
          if (e.target.value && !EMAIL_REGEX.test(e.target.value)) email.setError("Invalid email format");
          else email.setError("");
        }}
      />
      <Field label="Password" type="password" placeholder="••••••••" field={password}
        onChangeOverride={(e) => {
          password.onChange(e);
          if (e.target.value && e.target.value.length < 6) password.setError("At least 6 characters");
          else password.setError("");
        }}
      />

      <button className="ua-btn" type="submit" disabled={busy}>
        {busy ? <span className="ua-spinner" /> : "Sign in & Order 🍟"}
      </button>

      <p className="ua-switch">
        New here? <span onClick={onSwitch}>Create account</span>
      </p>
    </form>
  );
}

// ─── RegisterForm ──────────────────────────────────────────────────────────
function RegisterForm({ onSwitch }) {
  const { url }  = useContext(StoreContext);
  const navigate = useNavigate();
  const username = useField();
  const email     = useField();
  const password = useField();
  const confirm  = useField();
  const capooRef = useRef(null);
  const [busy, setBusy]               = useState(false);
  const [generalError, setGeneralError] = useState("");

  usePingGif(capooRef, 2800);

  const validate = () => {
    let ok = true;
    if (!username.value.trim()) { username.setError("Username is required"); ok = false; }
    else if (username.value.trim().length < 3)  { username.setError("At least 3 characters"); ok = false; }
    else if (username.value.trim().length > 20) { username.setError("Max 20 characters"); ok = false; }
    if (!email.value.trim()) { email.setError("Email is required"); ok = false; }
    else if (!EMAIL_REGEX.test(email.value.trim())) { email.setError("Invalid email format"); ok = false; }
    if (!password.value) { password.setError("Password is required"); ok = false; }
    else if (password.value.length < 6) { password.setError("At least 6 characters"); ok = false; }
    if (!confirm.value) { confirm.setError("Please confirm your password"); ok = false; }
    else if (confirm.value !== password.value) { confirm.setError("Passwords do not match"); ok = false; }
    return ok;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setBusy(true);
    setGeneralError("");
    try {
      const res = await axios.post(`${url}/api/user/register`, {
        name:     username.value.trim(),
        email:    email.value.trim(),
        password: password.value,
      });
      if (res.data.success) {
        localStorage.setItem("verifyEmail", res.data.email);
        navigate("/verify-email");
      } else {
        setGeneralError(res.data.message || "Registration failed");
      }
    } catch (err) {
      setGeneralError(err.response?.data?.message || "Server error, try again");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="ua-form" onSubmit={handleSubmit} noValidate>
      <div className="ua-hero">
        <img ref={capooRef} src={capooGif} alt="Capoo" className="ua-capoo" />
        <h1 className="ua-title">Join us 🍔</h1>
        <p className="ua-subtitle">Create an account to start ordering</p>
      </div>

      <div className="ua-divider"><span>NEW ACCOUNT</span></div>

      {generalError && <div className="ua-general-err">{generalError}</div>}

      <Field label="Username" placeholder="your_name" field={username}
        onChangeOverride={(e) => {
          username.onChange(e);
          const v = e.target.value.trim();
          if (v && v.length < 3)  username.setError("At least 3 characters");
          else if (v.length > 20) username.setError("Max 20 characters");
          else username.setError("");
        }}
      />
      <Field label="Email" type="email" placeholder="you@example.com" field={email}
        onChangeOverride={(e) => {
          email.onChange(e);
          if (e.target.value && !EMAIL_REGEX.test(e.target.value)) email.setError("Invalid email format");
          else email.setError("");
        }}
      />
      <Field label="Password" type="password" placeholder="••••••••" field={password}
        onChangeOverride={(e) => {
          password.onChange(e);
          if (e.target.value && e.target.value.length < 6) password.setError("At least 6 characters");
          else password.setError("");
          if (confirm.value && e.target.value !== confirm.value) confirm.setError("Passwords do not match");
          else if (confirm.value) confirm.setError("");
        }}
      />
      <Field label="Confirm Password" type="password" placeholder="••••••••" field={confirm}
        onChangeOverride={(e) => {
          confirm.onChange(e);
          if (e.target.value && e.target.value !== password.value) confirm.setError("Passwords do not match");
          else confirm.setError("");
        }}
      />

      <button className="ua-btn" type="submit" disabled={busy}>
        {busy ? <span className="ua-spinner" /> : "Create account 🎉"}
      </button>

      <p className="ua-switch">
        Already have an account? <span onClick={onSwitch}>Sign in</span>
      </p>
    </form>
  );
}

// ─── Main export ───────────────────────────────────────────────────────────
export default function UserAuth() {
  const [isLogin, setIsLogin] = useState(true);
  const rootRef = useRef(null);

  return (
    <div ref={rootRef} className="ua-shell">
      <FoodCanvas rootRef={rootRef} />   {/* Nền canvas đồ ăn bay đã tối ưu */}
      <MouseFollower />                  {/* Đùi gà bay mượt 60fps, luôn trên cùng */}

      <div className="ua-card">
        {isLogin
          ? <LoginForm    onSwitch={() => setIsLogin(false)} />
          : <RegisterForm onSwitch={() => setIsLogin(true)}  />
        }
      </div>
    </div>
  );
}