import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Card, CardContent, Typography, TextField, Button,
  Stack, Alert, CircularProgress, Fade, InputAdornment, keyframes
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import API_BASE from "./api";

// --- ANIMATIONS ---
const bounce = keyframes`
  0%, 100% { transform: translateY(0) scaleX(1); }
  30% { transform: translateY(-80px) scaleX(0.8); }
  70% { transform: translateY(0) scaleX(1.2); }
`;

const shadowPulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 0.2; }
  30% { transform: scale(0.5); opacity: 0.05; }
`;

// --- LOADER (MEMOIZED) ---
const TennisLoader = React.memo(({ message }: { message: string }) => (
  <Box sx={overlayStyle}>
    <Box display="flex" flexDirection="column" alignItems="center">
      <Box sx={ballStyle} />
      <Box sx={shadowStyle} />
      <Typography sx={loaderTextStyle}>{message}</Typography>
    </Box>
  </Box>
));

export default function Login() {
  const navigate = useNavigate();

  // STATE
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  // FORGOT
  const [forgotMode, setForgotMode] = useState(false);
  const [otpStep, setOtpStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // 🚀 KEYBOARD FIX (NO MEMORY LEAK)
  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (forgotMode) {
          otpStep === 1 ? sendOtp() : resetPassword();
        } else {
          handleLogin();
        }
      }
    };

    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [forgotMode, otpStep]);

  // 🚀 LOGIN OPTIMIZED
  const handleLogin = useCallback(async () => {
    if (loading) return;
    if (!username || !password) return setError("Please enter credentials");

    setLoading(true);
    setError("");

    try {
      const controller = new AbortController();
      setTimeout(() => controller.abort(), 8000);

      const res = await fetch(`${API_BASE}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: username, password }),
        signal: controller.signal
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      const payload = JSON.parse(atob(data.token.split(".")[1]));

      // ⚡ parallel storage
      await Promise.all([
        Promise.resolve(localStorage.setItem("token", data.token)),
        Promise.resolve(localStorage.setItem("role", payload.role)),
        Promise.resolve(localStorage.setItem("userId", String(payload.id)))
      ]);

      setRedirecting(true);

      setTimeout(() => {
        const paths: any = {
          admin: "/admin",
          coach: "/coach",
          player: "/player"
        };
        navigate(paths[payload.role] || "/dashboard");
      }, 1200);

    } catch (err: any) {
      setError(err.message || "Login failed");
      setLoading(false);
    }
  }, [username, password, loading, navigate]);

  // 🚀 OTP
  const sendOtp = async () => {
    if (loading) return;
    if (!email) return setError("Enter your email");

    setLoading(true);
    setError("");

    try {
      await fetch(`${API_BASE}/api/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      setOtpStep(2);
    } catch {
      setError("Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    if (loading) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      alert("Password reset successful ✅");
      setForgotMode(false);
      setOtpStep(1);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 🚀 FULLSCREEN LOADER
  if (redirecting) {
    return <TennisLoader message="Synchronizing Training Profile..." />;
  }

  return (
    <Box sx={containerStyle}>
      <Fade in timeout={800}>
        <Card sx={glassCardStyle}>
          <CardContent sx={{ p: 4 }}>

            <Box textAlign="center" mb={4}>
              <Box sx={logoWrapperStyle}>
                <img src="/logo.png" alt="logo" style={{ height: 45 }} />
              </Box>

              <Typography variant="h4" fontWeight={900} mt={2}>
                {forgotMode ? "RECOVER" : "SIGN IN"}
              </Typography>

              <Typography variant="body2" sx={{ opacity: 0.6 }}>
                SAT Sports Academy Portal
              </Typography>
            </Box>

            {error && <Alert severity="error" sx={alertStyle}>{error}</Alert>}

            {!forgotMode ? (
              <Stack spacing={2.5}>
                <TextField
                  autoComplete="email"
                  placeholder="Email Address"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon sx={iconStyle}/>
                      </InputAdornment>
                    )
                  }}
                  sx={inputStyle}
                />

                <TextField
                  autoComplete="current-password"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={iconStyle}/>
                      </InputAdornment>
                    )
                  }}
                  sx={inputStyle}
                />

                <Button fullWidth disabled={loading} onClick={handleLogin} sx={primaryBtnStyle}>
                  {loading ? <CircularProgress size={24} /> : "ACCESS PORTAL"}
                </Button>

                <Box display="flex" justifyContent="space-between">
                  <Typography sx={linkStyle} onClick={() => setForgotMode(true)}>
                    Forgot Password?
                  </Typography>
                  <Typography sx={linkStyle} onClick={() => navigate("/signup")}>
                    Create Account
                  </Typography>
                </Box>
              </Stack>
            ) : (
              <Stack spacing={2.5}>
                <TextField
                  placeholder="Email Address"
                  value={email}
                  disabled={otpStep === 2}
                  onChange={e => setEmail(e.target.value)}
                  sx={inputStyle}
                />

                {otpStep === 2 && (
                  <>
                    <TextField placeholder="OTP Code" value={otp} onChange={e => setOtp(e.target.value)} sx={inputStyle}/>
                    <TextField placeholder="New Password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} sx={inputStyle}/>
                  </>
                )}

                <Button fullWidth onClick={otpStep === 1 ? sendOtp : resetPassword} sx={primaryBtnStyle}>
                  {loading ? <CircularProgress size={24}/> : otpStep === 1 ? "SEND CODE" : "UPDATE PASSWORD"}
                </Button>

                <Button startIcon={<ArrowBackIcon />} onClick={() => setForgotMode(false)}>
                  Back to Login
                </Button>
              </Stack>
            )}

          </CardContent>
        </Card>
      </Fade>
    </Box>
  );
}

// --- STYLES (UNCHANGED BUT CLEAN) ---
const containerStyle = { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#020617" };
const glassCardStyle = { width: "100%", maxWidth: 400, borderRadius: 6, background: "rgba(15,23,42,0.9)" };
const logoWrapperStyle = { width: 70, height: 70, mx: "auto" };
const inputStyle = { "& .MuiOutlinedInput-root": { color: "white" } };
const primaryBtnStyle = { py: 1.5, borderRadius: 3, fontWeight: 800 };
const overlayStyle = { position: "fixed", inset: 0, display: "flex", justifyContent: "center", alignItems: "center", background: "#020617" };
const ballStyle = { width: 50, height: 50, borderRadius: "50%", background: "#ccff00", animation: `${bounce} 0.8s infinite` };
const shadowStyle = { width: 40, height: 8, borderRadius: "50%", background: "black", animation: `${shadowPulse} 0.8s infinite` };
const loaderTextStyle = { mt: 3, color: "white" };
const linkStyle = { cursor: "pointer", fontSize: 13 };
const iconStyle = { color: "rgba(255,255,255,0.5)" };
const alertStyle = { mb: 2 };