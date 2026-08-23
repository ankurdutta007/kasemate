import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import img7 from "@/imports/image-7.webp";
import img8 from "@/imports/image-8.webp";
import img9 from "@/imports/image-9.webp";
import imgStrategy from "@/imports/strategy.webp";
import imgStructure from "@/imports/structure-case-portrait.webp";
import logo from "@/imports/logo.webp";
import { supabase } from "../lib/supabase";

const IconEye = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

const IconEyeOff = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
    <line x1="1" y1="1" x2="23" y2="23"></line>
  </svg>
);

const IconGoogle = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

// v2, right panel redesigned with new illustrations

const STATS = [
  { value: "271", label: "curated cases", color: "#7C3AED" },
  // 33 distinct source_books in DB as of 2026-08-15 — using 30+ as conservative accurate figure
  { value: "30+", label: "curated sources", color: "#00d4a8" },
  { value: "4", label: "rubric dimensions", color: "#f59e0b" },
  { value: "Free", label: "for placements", color: "#7C3AED" },
];

const FEATURES = [
  {
    img: imgStrategy,
    label: "Personalized roadmap",
    desc: "A week-by-week plan built around your track and timeline",
    dot: true,
  },
  {
    img: imgStructure,
    label: "Structured case solutions",
    desc: "Full framework and reasoning for 271 curated cases, before you ever go live.",
    dot: true,
  },
  {
    img: img7,
    label: "Live AI interview",
    desc: "Real-time voice practice that pushes back, not a scripted quiz.",
  },
  {
    img: img9,
    label: "Rubric-tied feedback",
    desc: "Cites the exact turn where you dropped points",
  },
];

export default function Auth() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/roadmap`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      console.error("Google Auth Error:", err);
      setError(err.message || "Failed to sign in with Google.");
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      if (mode === "signup") {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) throw signUpError;
        navigate("/onboarding/role");
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        navigate("/roadmap");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during authentication.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="auth-wrapper lv2-root"
      style={{
        minHeight: "100vh",
        display: "flex",
        fontFamily: "Inter, sans-serif",
        backgroundColor: "var(--lv2-bg)",
        alignItems: "stretch",
      }}
    >
      {/* ── LEFT: Form pane ── */}
      <div
        className="auth-form-pane"
        style={{
          width: "46%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "clamp(24px, 5vh, 40px) 56px",
          background:
            "linear-gradient(145deg, var(--lv2-glass) 0%, var(--lv2-bg-elevated) 60%, var(--lv2-bg) 100%)",
          borderRight: "1px solid var(--lv2-hairline)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -80,
            right: -80,
            width: 250,
            height: 250,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, var(--lv2-accent) 0%, transparent 70%)",
            opacity: 0.4,
            filter: "blur(30px)",
            pointerEvents: "none",
          }}
        />

        {/* Logo (clickable to return to landing page) */}
        <div
          onClick={() => navigate("/")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            marginBottom: "clamp(16px, 3.5vh, 32px)",
            position: "relative",
            cursor: "pointer",
          }}
          title="Back to home"
        >
          <img
            src={logo}
            alt="KaseMate Logo"
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              objectFit: "cover",
            }}
          />
          <span
            className="lv2-display"
            style={{
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: "-0.01em",
              color: "var(--lv2-text)",
            }}
          >
            KaseMate
          </span>
        </div>

        <h1
          style={{
            fontFamily: "Plus Jakarta Sans, sans-serif",
            fontSize: 36,
            fontWeight: 400,
            color: "var(--lv2-text)",
            margin: "0 0 clamp(4px, 1vh, 8px)",
            letterSpacing: "-0.02em",
            lineHeight: 1.15,
            position: "relative",
          }}
        >
          {mode === "signup" ? "Create your account" : "Welcome back"}
        </h1>
        <p
          style={{
            fontSize: 15,
            color: "var(--lv2-text-muted)",
            margin: "0 0 clamp(16px, 3vh, 24px)",
            lineHeight: 1.6,
            position: "relative",
          }}
        >
          {mode === "signup"
            ? "Start building your placement roadmap in minutes."
            : "Sign in to continue your practice streak."}
        </p>

        {/* Card */}
        <div
          style={{
            backgroundColor: "var(--lv2-bg-elevated)",
            borderRadius: 20,
            border: "1px solid var(--lv2-hairline)",
            padding: "clamp(24px, 4vh, 32px)",
            boxShadow: "var(--card-shadow-lg)",
            position: "relative",
          }}
        >
          <div
            style={{
              display: "flex",
              backgroundColor: "var(--lv2-glass)",
              borderRadius: 10,
              padding: 3,
              marginBottom: 24,
            }}
          >
            {(["signup", "login"] as const).map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m);
                  setError("");
                }}
                style={{
                  flex: 1,
                  padding: "9px",
                  borderRadius: 8,
                  border: "none",
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: "Inter, sans-serif",
                  cursor: "pointer",
                  backgroundColor:
                    mode === m ? "var(--lv2-accent)" : "transparent",
                  color: mode === m ? "#fff" : "var(--lv2-text-muted)",
                  boxShadow: mode === m ? "var(--card-shadow)" : "none",
                  transition: "all 0.15s",
                }}
              >
                {m === "signup" ? "Create account" : "Sign in"}
              </button>
            ))}
          </div>

          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: 16 }}
          >
            {error && (
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: 8,
                  backgroundColor: "var(--coral-subtle)",
                  border: "1px solid rgba(224,82,82,0.3)",
                  color: "var(--coral)",
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                {error}
              </div>
            )}

            <div>
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "var(--lv2-text-muted)",
                  display: "block",
                  marginBottom: 6,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                }}
              >
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                placeholder="yourname@example.com"
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: 10,
                  border: `1.5px solid ${error ? "var(--coral)" : "var(--lv2-hairline)"}`,
                  backgroundColor: "var(--lv2-glass)",
                  color: "var(--lv2-text)",
                  fontSize: 14,
                  fontFamily: "Inter, sans-serif",
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "border-color 0.15s",
                }}
                onFocus={(e) => {
                  if (!error) e.target.style.borderColor = "var(--lv2-accent)";
                }}
                onBlur={(e) => {
                  if (!error)
                    e.target.style.borderColor = "var(--lv2-hairline)";
                }}
              />
            </div>
            <div>
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "var(--lv2-text-muted)",
                  display: "block",
                  marginBottom: 6,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                }}
              >
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    width: "100%",
                    padding: "12px 40px 12px 14px",
                    borderRadius: 10,
                    border: "1.5px solid var(--lv2-hairline)",
                    backgroundColor: "var(--lv2-glass)",
                    color: "var(--lv2-text)",
                    fontSize: 14,
                    fontFamily: "Inter, sans-serif",
                    outline: "none",
                    boxSizing: "border-box",
                    transition: "border-color 0.15s",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "var(--lv2-accent)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "var(--lv2-hairline)";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: "var(--lv2-text-muted)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 4,
                  }}
                >
                  {showPassword ? <IconEyeOff /> : <IconEye />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              style={{
                marginTop: 8,
                padding: "14px",
                borderRadius: 10,
                border: "none",
                background: "var(--lv2-accent)",
                color: "#fff",
                fontSize: 15,
                fontWeight: 700,
                cursor: isLoading ? "not-allowed" : "pointer",
                fontFamily: "Inter, sans-serif",
                boxShadow: "0 4px 20px rgba(66,16,61,0.4)",
                opacity: isLoading ? 0.7 : 1,
              }}
              onMouseEnter={(e) => {
                if (!isLoading) e.currentTarget.style.opacity = "0.88";
              }}
              onMouseLeave={(e) => {
                if (!isLoading) e.currentTarget.style.opacity = "1";
              }}
            >
              {isLoading
                ? "Processing..."
                : mode === "signup"
                  ? "Create account →"
                  : "Sign in →"}
            </button>
          </form>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              margin: "24px 0",
            }}
          >
            <div
              style={{
                flex: 1,
                height: 1,
                backgroundColor: "var(--lv2-hairline)",
              }}
            ></div>
            <div
              style={{
                fontSize: 12,
                color: "var(--lv2-text-muted)",
                textTransform: "uppercase",
                fontWeight: 600,
                letterSpacing: "0.05em",
              }}
            >
              OR
            </div>
            <div
              style={{
                flex: 1,
                height: 1,
                backgroundColor: "var(--lv2-hairline)",
              }}
            ></div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              padding: "12px 14px",
              borderRadius: 10,
              border: "1.5px solid var(--lv2-hairline)",
              backgroundColor: "var(--lv2-glass)",
              color: "var(--lv2-text)",
              fontSize: 14,
              fontWeight: 600,
              cursor: isLoading ? "not-allowed" : "pointer",
              fontFamily: "Inter, sans-serif",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              if (!isLoading)
                e.currentTarget.style.backgroundColor =
                  "var(--lv2-bg-elevated)";
            }}
            onMouseLeave={(e) => {
              if (!isLoading)
                e.currentTarget.style.backgroundColor = "var(--lv2-glass)";
            }}
          >
            <IconGoogle />
            Continue with Google
          </button>
        </div>
      </div>

      {/* ── RIGHT: Social proof pane ── */}
      <div
        className="auth-social-pane"
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "clamp(40px, 8vh, 80px) 56px",
          background:
            "linear-gradient(160deg, var(--lv2-bg-elevated) 0%, var(--lv2-bg) 60%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background radial glow */}
        <div
          style={{
            position: "absolute",
            top: "10%",
            right: "-5%",
            width: 380,
            height: 380,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "5%",
            left: "10%",
            width: 240,
            height: 240,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(0,212,168,0.08) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        {/* Illustration hero with Stats in corners */}
        <div
          style={{
            position: "relative",
            width: "100%",
            maxWidth: 420,
            margin: "0 auto clamp(16px, 3vh, 24px)",
            minHeight: "clamp(180px, 25vh, 260px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            src={img8}
            alt="Collaborative case practice"
            style={{
              width: "100%",
              maxHeight: "clamp(180px, 25vh, 260px)",
              objectFit: "contain",
              objectPosition: "center",
              display: "block",
              position: "relative",
              zIndex: 2,
            }}
          />
          {STATS.map((s, i) => {
            const positions: React.CSSProperties[] = [
              { top: 10, left: -20, transform: "rotate(-4deg)" },
              { top: 10, right: -20, transform: "rotate(4deg)" },
              { bottom: 20, left: -20, transform: "rotate(4deg)" },
              { bottom: 20, right: -20, transform: "rotate(-4deg)" },
            ];
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  ...positions[i],
                  backgroundColor: "var(--lv2-glass)",
                  border: "1px solid var(--lv2-hairline)",
                  borderRadius: 14,
                  padding: "14px 18px",
                  textAlign: "center",
                  backdropFilter: "blur(8px)",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                  zIndex: 3,
                  minWidth: 120,
                }}
              >
                <div
                  style={{
                    fontFamily: "JetBrains Mono, monospace",
                    fontSize: 26,
                    fontWeight: 800,
                    color: s.color,
                    lineHeight: 1,
                    marginBottom: 6,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {s.value}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: "var(--lv2-text-muted)",
                    lineHeight: 1.3,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  {s.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Tagline */}
        <div style={{ marginBottom: 24 }}>
          <h2
            style={{
              fontFamily: "Plus Jakarta Sans, sans-serif",
              fontSize: 26,
              fontWeight: 700,
              color: "var(--lv2-text)",
              margin: "0 0 8px",
              lineHeight: 1.25,
              letterSpacing: "-0.02em",
            }}
          >
            Your edge in every placement round.
          </h2>
          <p
            style={{
              fontSize: 13,
              color: "var(--lv2-text-muted)",
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            Personalized roadmap · Curated case solutions · Live AI practice
          </p>
        </div>

        {/* Feature list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {FEATURES.map((f, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                backgroundColor: "var(--lv2-glass)",
                borderRadius: 12,
                padding: "12px 16px",
                border: "1px solid var(--lv2-hairline)",
                backdropFilter: "blur(6px)",
              }}
            >
              {/* Icon area */}
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 10,
                  background: "var(--lv2-bg-elevated)",
                  border: "1px solid var(--lv2-hairline)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  overflow: "hidden",
                }}
              >
                {f.img ? (
                  <img
                    src={f.img}
                    alt=""
                    style={{ width: 28, height: 28, objectFit: "contain" }}
                  />
                ) : (
                  /* Interviewer pushback, abstract dot grid icon */
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <circle cx="5" cy="5" r="2" fill="#7C3AED" opacity="0.7" />
                    <circle cx="10" cy="5" r="2" fill="#7C3AED" />
                    <circle cx="15" cy="5" r="2" fill="#7C3AED" opacity="0.7" />
                    <circle cx="5" cy="10" r="2" fill="#7C3AED" />
                    <circle
                      cx="10"
                      cy="10"
                      r="2"
                      fill="#7C3AED"
                      opacity="0.5"
                    />
                    <circle cx="15" cy="10" r="2" fill="#7C3AED" />
                    <circle cx="5" cy="15" r="2" fill="#7C3AED" opacity="0.7" />
                    <circle cx="10" cy="15" r="2" fill="#7C3AED" />
                    <circle
                      cx="15"
                      cy="15"
                      r="2"
                      fill="#7C3AED"
                      opacity="0.4"
                    />
                  </svg>
                )}
              </div>
              <div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--lv2-text)",
                    marginBottom: 2,
                  }}
                >
                  {f.label}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--lv2-text-muted)",
                    lineHeight: 1.45,
                  }}
                >
                  {f.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
