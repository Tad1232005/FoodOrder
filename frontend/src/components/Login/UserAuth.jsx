import { useState, useCallback, useEffect, useRef, useContext } from "react";
import "./UserAuth.css";
import capooGif from "../../assets/capoo.gif";
import axios from "axios";
import { StoreContext } from "../../context/StoreContext";
import { useNavigate } from "react-router-dom";

const EMAIL_REGEX = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

// ─── useField: quản lý value + error cho từng input ────────────────────────
function useField(initial = "") {
  const [value, setValue] = useState(initial);
  const [error, setError] = useState("");
  const onChange = useCallback((e) => {
    setValue(e.target.value);
    setError(""); // xóa lỗi khi user gõ lại
  }, []);
  return { value, error, setError, onChange, setValue };
}

// ─── Field: input có label, error msg, show/hide password ─────────────────
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
        {/* Nút ẩn/hiện mật khẩu */}
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

// ─── StarCanvas: vẽ nền sao + particles bằng canvas ───────────────────────
// rootRef: ref của .ua-shell để canvas biết kích thước và lắng nghe mousemove
function StarCanvas({ rootRef }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;
    const ctx = canvas.getContext("2d");

    // Resize canvas theo kích thước shell
    function resize() {
      canvas.width = root.offsetWidth;
      canvas.height = root.offsetHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    // ── Tạo 70 ngôi sao, mỗi sao có vị trí, tốc độ nhấp nháy riêng ──
    const STARS = Array.from({ length: 70 }, () => ({
      x: Math.random() * canvas.width,
      baseY: Math.random() * canvas.height, // vị trí Y gốc để tính dao động
      y: 0,
      r: Math.random() * 1.7 + 0.3,         // bán kính 0.3–2px
      speed: Math.random() * 0.5 + 0.15,    // tốc độ dao động dọc
      amp: Math.random() * 22 + 8,           // biên độ dao động (px)
      phase: Math.random() * Math.PI * 2,    // phase lệch nhau để không đồng bộ
      tw: Math.random() * Math.PI * 2,       // twinkle phase
      tws: Math.random() * 0.045 + 0.01,    // twinkle speed — tăng để nhấp nháy nhanh hơn
    }));
    STARS.forEach((s) => { s.y = s.baseY; });

    // ── Tạo 40 particles màu xanh nhạt, phân tán khi chuột lại gần ──
    const PARTS = Array.from({ length: 40 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.2 + 0.3,
      vx: (Math.random() - 0.5) * 0.3,  // vận tốc ngang ban đầu
      vy: (Math.random() - 0.5) * 0.3,  // vận tốc dọc ban đầu
      a: Math.random() * 0.35 + 0.1,    // độ trong suốt
    }));

    let mouse = { x: canvas.width / 2, y: canvas.height / 2 };
    let t = 0; // thời gian tích lũy, dùng để tính sin/cos
    let raf;

    function onMouseMove(e) {
      const r = root.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    }
    root.addEventListener("mousemove", onMouseMove);

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#07070f";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      t += 0.016; // ~60fps increment — tăng để animation nhanh hơn

      // Vẽ sao
      for (const s of STARS) {
        s.tw += s.tws; // cập nhật twinkle
        // dao động dọc theo sin
        s.y = s.baseY + Math.sin(t * s.speed * 2 + s.phase) * s.amp;
        if (s.y < 0) s.y = canvas.height;
        if (s.y > canvas.height) s.y = 0;
        const al = 0.4 + 0.6 * Math.sin(s.tw); // độ sáng nhấp nháy 0.4–1.0
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${al})`;
        ctx.fill();
        // Sao lớn vẽ thêm cross (dấu +) để lung linh hơn
        if (s.r > 1.3) {
          ctx.strokeStyle = `rgba(255,255,255,${al * 0.4})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(s.x - s.r * 3, s.y); ctx.lineTo(s.x + s.r * 3, s.y);
          ctx.moveTo(s.x, s.y - s.r * 3); ctx.lineTo(s.x, s.y + s.r * 3);
          ctx.stroke();
        }
      }

      // Nebula: gradient tròn màu xanh nhạt ở góc trái
      const nb = ctx.createRadialGradient(
        canvas.width * 0.35, canvas.height * 0.4, 0,
        canvas.width * 0.35, canvas.height * 0.4, 200 // 200px radius — tăng để to hơn
      );
      nb.addColorStop(0, "rgba(58,122,189,0.09)");
      nb.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = nb;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Vẽ particles, đẩy ra khi chuột lại gần trong 100px
      for (const p of PARTS) {
        const dx = mouse.x - p.x, dy = mouse.y - p.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 100) {
          // đẩy ngược chiều chuột — tăng 0.025 để đẩy mạnh hơn
          p.vx -= (dx / d) * 0.025;
          p.vy -= (dy / d) * 0.025;
        }
        p.vx *= 0.98; p.vy *= 0.98; // ma sát để particle dần dừng lại
        p.x += p.vx; p.y += p.vy;
        // wrap around khi ra ngoài màn hình
        if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(91,155,213,${p.a})`;
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
        pointerEvents: "none", // không chặn click/hover của các element bên trên
      }}
    />
  );
}

// ─── CapooFollower: con capoo chạy theo chuột ─────────────────────────────
// dùng lerp (linear interpolation) để chuyển động mượt, không teleport ngay
function CapooFollower({ rootRef }) {
  const [pos, setPos] = useState({ x: -100, y: -100, angle: 0, flipX: false });

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let fx = 0, fy = 0, prevFx = 0; // vị trí hiện tại của follower
    let raf;
    let mouse = { x: 0, y: 0 };

    function onMouseMove(e) {
      const r = root.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    }
    root.addEventListener("mousemove", onMouseMove);

    function animate() {
      prevFx = fx;
      // lerp: di chuyển 9% khoảng cách còn lại mỗi frame — tăng để đuổi nhanh hơn
      fx += (mouse.x - fx) * 0.09;
      fy += (mouse.y - 40 - fy) * 0.09; // -40 để capoo hơi lên trên chuột
      const dx = fx - prevFx;
      // nghiêng theo hướng di chuyển ngang — tăng 2.2 để nghiêng nhiều hơn
      const angle = Math.max(-28, Math.min(28, dx * 2.2));
      const flipX = dx < -1; // lật ảnh khi đi sang trái
      setPos({ x: fx, y: fy, angle, flipX });
      raf = requestAnimationFrame(animate);
    }
    raf = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(raf);
      root.removeEventListener("mousemove", onMouseMove);
    };
  }, [rootRef]);

  return (
    <img
      src={capooGif}
      alt=""
      style={{
        position: "absolute",
        left: pos.x,
        top: pos.y,
        width: 65,  // kích thước follower — chỉnh ở đây
        height: 65,
        objectFit: "contain",
        transform: `translate(-50%, -50%) scaleX(${pos.flipX ? -1 : 1}) rotate(${pos.angle}deg)`,
        zIndex: 3,
        pointerEvents: "none",
        userSelect: "none",
        borderRadius: "50%",
      }}
    />
  );
}

// ─── LoginForm ─────────────────────────────────────────────────────────────
function LoginForm({ onSwitch }) {
  const { url, setToken } = useContext(StoreContext);
  const navigate = useNavigate();
  const email = useField();
  const password = useField();
  const [busy, setBusy] = useState(false);
  const [generalError, setGeneralError] = useState("");

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
        email: email.value.trim(),
        password: password.value,
      });
      if (res.data.success) {
        //Đã verify email
        localStorage.setItem("token", res.data.token);
        setToken(res.data.token);
        navigate("/"); // về trang chủ sau khi login thành công
      }
      else if (res.data.needVerify) {
        //Chưa verify email
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
        <img src={capooGif} alt="Capoo" className="ua-capoo" />
        <h1 className="ua-title">Welcome back</h1>
        <p className="ua-subtitle">Sign in to your account</p>
      </div>

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
        {busy ? <span className="ua-spinner" /> : "Sign in"}
      </button>

      <p className="ua-switch">
        Don't have an account? <span onClick={onSwitch}>Register</span>
      </p>
    </form>
  );
}

// ─── RegisterForm ──────────────────────────────────────────────────────────
function RegisterForm({ onSwitch }) {
  const { url, setToken } = useContext(StoreContext);
  const navigate = useNavigate();
  const username = useField();
  const email = useField();
  const password = useField();
  const confirm = useField();
  const [busy, setBusy] = useState(false);
  const [generalError, setGeneralError] = useState("");

  const validate = () => {
    let ok = true;
    if (!username.value.trim()) { username.setError("Username is required"); ok = false; }
    else if (username.value.trim().length < 3) { username.setError("At least 3 characters"); ok = false; }
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
        name: username.value.trim(),
        email: email.value.trim(),
        password: password.value,
      });
      if (res.data.success) {
        //Chưa xác thực k cấp token
        localStorage.setItem("verifyEmail", res.data.email);
        navigate("/verify-email"); // về trang chủ sau khi register thành công
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
        <img src={capooGif} alt="Capoo" className="ua-capoo" />
        <h1 className="ua-title">Create account</h1>
        <p className="ua-subtitle">Join us and start your journey</p>
      </div>

      {generalError && <div className="ua-general-err">{generalError}</div>}

      <Field label="Username" placeholder="your_name" field={username}
        onChangeOverride={(e) => {
          username.onChange(e);
          const v = e.target.value.trim();
          if (v && v.length < 3) username.setError("At least 3 characters");
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
        {busy ? <span className="ua-spinner" /> : "Register"}
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
    // position: relative cần thiết để canvas absolute định vị đúng trong shell
    <div ref={rootRef} className="ua-shell">
      <StarCanvas rootRef={rootRef} />
      <CapooFollower rootRef={rootRef} />

      <div className="ua-card">
        {isLogin
          ? <LoginForm onSwitch={() => setIsLogin(false)} />
          : <RegisterForm onSwitch={() => setIsLogin(true)} />
        }
      </div>
    </div>
  );
}