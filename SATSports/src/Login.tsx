import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Card, CardContent, Typography, TextField, Button,
  Stack, Alert, CircularProgress, Fade, InputAdornment, keyframes
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import API_BASE from "./api";

// --- GPU ACCELERATED ANIMATIONS ---
const bounce = keyframes`
  0%, 100% { transform: translateY(0) scale(1, 1); }
  30% { transform: translateY(-60px) scale(0.9, 1.1); }
  70% { transform: translateY(0) scale(1.1, 0.9); }
`;

const shadowPulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 0.2; }
  30% { transform: scale(0.5); opacity: 0.05; }
`;

// --- LOADER (MEMOIZED FOR ZERO RE-RENDERS) ---
const TennisLoader = React.memo(({ message }: { message: string }) => (
  <Box sx={overlayStyle}>
    <Box display="flex" flexDirection="column" alignItems="center">
      <Box sx={ballStyle} />
      <Box sx={shadowStyle} />
      <Typography sx={loaderTextStyle}>{message.toUpperCase()}</Typography>
    </Box>
  </Box>
));

export default function Login() {
  const navigate = useNavigate();

  // ATOMIC STATES
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  const [forgotMode, setForgotMode] = useState(false);
  const [otpStep, setOtpStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // 🚀 EVENT LISTENER OPTIMIZATION
  useEffect(() => {
    const handleEnter = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !loading) {
        if (!forgotMode) handleLogin();
        else otpStep === 1 ? sendOtp() : resetPassword();
      }
    };
    window.addEventListener("keydown", handleEnter);
    return () => window.removeEventListener("keydown", handleEnter);
  }, [username, password, email, otp, newPassword, forgotMode, otpStep, loading]);

  const handleLogin = useCallback(async () => {
    if (!username || !password) return setError("CREDENTIALS REQUIRED");
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: username, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      // Decoding payload without external libs
      const payload = JSON.parse(window.atob(data.token.split(".")[1]));

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", payload.role);
      localStorage.setItem("userId", String(payload.id));

      setRedirecting(true);
      setTimeout(() => {
        const routes: Record<string, string> = { admin: "/admin", coach: "/coach", player: "/player" };
        navigate(routes[payload.role] || "/dashboard");
      }, 1000);
    } catch (err: any) {
      setError(err.message || "CONNECTION ERROR");
      setLoading(false);
    }
  }, [username, password, navigate]);

  // FORGOT PASSWORD LOGIC (Minified)
  const sendOtp = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      if (res.ok) setOtpStep(2);
      else setError("INVALID EMAIL");
    } finally { setLoading(false); }
  };

  const resetPassword = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword })
      });
      if (res.ok) {
        setForgotMode(false);
        setOtpStep(1);
        setError("");
      } else throw new Error("RESET FAILED");
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  if (redirecting) return <TennisLoader message="Initializing Court Access..." />;

  return (
    <Box sx={containerStyle}>
      <Fade in timeout={500}>
        <Card sx={glassCardStyle}>
          <CardContent sx={{ p: 4 }}>
            <Box textAlign="center" mb={4}>
              <Box component="img" src="/logo.png" sx={logoStyle} alt="SAT Sports" />
              <Typography variant="h5" fontWeight={900} sx={{ letterSpacing: 1, mt: 2 }}>
                {forgotMode ? "SECURITY RECOVERY" : "COURT LOGIN"}
              </Typography>
            </Box>

            {error && <Alert severity="error" sx={alertStyle}>{error}</Alert>}

            {!forgotMode ? (
              <Stack spacing={2}>
                <TextField
                  placeholder="EMAIL"
                  fullWidth
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  sx={inputStyle}
                  InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon sx={iconStyle} /></InputAdornment> }}
                />
                <TextField
                  placeholder="PASSWORD"
                  type="password"
                  fullWidth
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  sx={inputStyle}
                  InputProps={{ startAdornment: <InputAdornment position="start"><LockIcon sx={iconStyle} /></InputAdornment> }}
                />
                <Button fullWidth onClick={handleLogin} disabled={loading} sx={primaryBtnStyle}>
                  {loading ? <CircularProgress size={20} color="inherit" /> : "ENTER PORTAL"}
                </Button>
                <Stack direction="row" justifyContent="space-between">
                  <Typography onClick={() => setForgotMode(true)} sx={linkStyle}>Forgot Key?</Typography>
                  <Typography onClick={() => navigate("/signup")} sx={linkStyle}>Join Academy</Typography>
                </Stack>
              </Stack>
            ) : (
              <Stack spacing={2}>
                <TextField placeholder="REGISTERED EMAIL" fullWidth value={email} onChange={e => setEmail(e.target.value)} sx={inputStyle} />
                {otpStep === 2 && (
                  <>
                    <TextField placeholder="OTP CODE" fullWidth value={otp} onChange={e => setOtp(e.target.value)} sx={inputStyle} />
                    <TextField placeholder="NEW PASSWORD" type="password" fullWidth value={newPassword} onChange={e => setNewPassword(e.target.value)} sx={inputStyle} />
                  </>
                )}
                <Button fullWidth onClick={otpStep === 1 ? sendOtp : resetPassword} sx={primaryBtnStyle}>
                  {loading ? <CircularProgress size={20} color="inherit" /> : otpStep === 1 ? "REQUEST OTP" : "SAVE NEW KEY"}
                </Button>
                <Button startIcon={<ArrowBackIcon />} onClick={() => setForgotMode(false)} sx={{ color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>Back</Button>
              </Stack>
            )}
          </CardContent>
        </Card>
      </Fade>
    </Box>
  );
}

// --- CONSTANT STYLES (OUTSIDE RENDER) ---
const containerStyle = { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#020617" };
const glassCardStyle = { width: "90%", maxWidth: 400, borderRadius: 5, background: "rgba(15,23,42,0.95)", border: "1px solid rgba(255,255,255,0.05)", boxShadow: "0 20px 50px rgba(0,0,0,0.5)" };
const logoStyle = { height: 50, width: "auto", mx: "auto", display: "block", filter: "drop-shadow(0 0 10px rgba(204, 255, 0, 0.2))" };
const inputStyle = { "& .MuiOutlinedInput-root": { color: "white", bgcolor: "rgba(255,255,255,0.02)", borderRadius: 2, "& fieldset": { borderColor: "rgba(255,255,255,0.1)" }, "&:hover fieldset": { borderColor: "#ef4444" } } };
const primaryBtnStyle = { py: 1.5, borderRadius: 2, fontWeight: 900, background: "linear-gradient(135deg, #f97316, #ef4444)", color: "white", "&:hover": { background: "#dc2626" } };
const iconStyle = { color: "rgba(255,255,255,0.3)", fontSize: 20 };
const linkStyle = { cursor: "pointer", fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.4)", "&:hover": { color: "#ef4444" } };
const alertStyle = { bgcolor: "rgba(239, 68, 68, 0.1)", color: "#ef4444", fontWeight: 700, borderRadius: 2 };

const overlayStyle = { position: "fixed", inset: 0, zIndex: 9999, display: "flex", justifyContent: "center", alignItems: "center", background: "#020617" };
const ballStyle = { width: 45, height: 45, borderRadius: "50%", background: "#ccff00", boxShadow: "inset -5px -5px 10px rgba(0,0,0,0.2)", animation: `${bounce} 0.6s infinite ease-in-out` };
const shadowStyle = { width: 35, height: 6, mt: 1, borderRadius: "50%", background: "rgba(0,0,0,0.5)", animation: `${shadowPulse} 0.6s infinite ease-in-out` };
const loaderTextStyle = { mt: 4, color: "#ccff00", fontWeight: 900, letterSpacing: 2, fontSize: 12 };