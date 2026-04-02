import { useState, useEffect } from "react";
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
  90% { transform: translateY(5px) scaleX(1.1); }
`;

const shadowPulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 0.2; }
  30% { transform: scale(0.5); opacity: 0.05; }
`;

// --- SUB-COMPONENT: TENNIS LOADER ---
const TennisLoader = ({ message }: { message: string }) => (
  <Box sx={overlayStyle}>
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <Box sx={ballStyle} />
      <Box sx={shadowStyle} />
      <Typography sx={loaderTextStyle}>{message}</Typography>
    </Box>
  </Box>
);

export default function Login() {
  const navigate = useNavigate();

  // AUTH & UI STATE
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // Button spinner
  const [redirecting, setRedirecting] = useState(false); // Fullscreen Tennis Loader

  // FORGOT PASSWORD STATE
  const [forgotMode, setForgotMode] = useState(false);
  const [otpStep, setOtpStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // 🎹 Keyboard Shortcut: Enter to Submit
  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if (event.code === "Enter" || event.code === "NumpadEnter") {
        event.preventDefault();
        if (forgotMode) {
          otpStep === 1 ? sendOtp() : resetPassword();
        } else {
          handleLogin();
        }
      }
    };
    document.addEventListener("keydown", listener);
    return () => document.removeEventListener("keydown", listener);
  }, [username, password, forgotMode, otpStep, email, otp, newPassword]);

  const handleLogin = async () => {
    if (!username || !password) return setError("Please enter credentials");
    setLoading(true);
  
    try {
      const res = await fetch(`${API_BASE}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: username, password })
      });
  
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
  
      // 🔑 THE FIX: Save token exactly where ProtectedRoute looks for it
      localStorage.setItem("token", data.token);
  
      // Decode the middle part of the JWT to get role/id
      const payload = JSON.parse(window.atob(data.token.split(".")[1]));
      localStorage.setItem("role", payload.role);
      localStorage.setItem("userId", String(payload.id));
  
      setRedirecting(true);
      
      // Redirect based on role
      setTimeout(() => {
        const paths: any = { admin: "/admin", coach: "/coach", player: "/player" };
        window.location.href = paths[payload.role] || "/dashboard";
      }, 1500);
  
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };
  const sendOtp = async () => {
    if (!email) return setError("Enter your email");
    setLoading(true);
    await fetch(`${API_BASE}/api/auth/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });
    setLoading(false);
    setOtpStep(2);
  };

  const resetPassword = async () => {
    setLoading(true);
    const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp, newPassword })
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) return setError(data.message);
    
    alert("Password reset successful ✅");
    setForgotMode(false);
    setOtpStep(1);
  };

  return (
    <Box sx={containerStyle}>
      {/* Fullscreen Tennis Loader when redirecting */}
      {redirecting && <TennisLoader message="Synchronizing Training Profile..." />}

      <Fade in timeout={800}>
        <Card sx={glassCardStyle}>
          <CardContent sx={{ p: 4 }}>
            
            <Box textAlign="center" mb={4}>
              <Box sx={logoWrapperStyle}>
                <img src="/logo.png" alt="logo" style={{ height: 45 }} />
              </Box>
              <Typography variant="h4" fontWeight={900} sx={{ letterSpacing: -1, mt: 2 }}>
                {forgotMode ? "RECOVER" : "SIGN IN"}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.6, fontWeight: 500 }}>
                {forgotMode ? "Follow steps to reset password" : "SAT Sports Academy Portal"}
              </Typography>
            </Box>

            {error && <Alert severity="error" variant="filled" sx={alertStyle}>{error}</Alert>}

            {!forgotMode ? (
              <Stack spacing={2.5}>
                <TextField
                  placeholder="Email Address"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon sx={iconStyle}/></InputAdornment> }}
                  sx={inputStyle}
                />
                <TextField
                  placeholder="Password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  InputProps={{ startAdornment: <InputAdornment position="start"><LockIcon sx={iconStyle}/></InputAdornment> }}
                  sx={inputStyle}
                />
                
                <Button 
                  fullWidth 
                  disabled={loading} 
                  onClick={handleLogin} 
                  sx={primaryBtnStyle}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : "ACCESS PORTAL"}
                </Button>

                <Box display="flex" justifyContent="space-between" mt={1}>
                  <Typography sx={linkStyle} onClick={() => setForgotMode(true)}>Forgot Password?</Typography>
                  <Typography sx={linkStyle} onClick={() => navigate("/signup")}>Create Account</Typography>
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
                    <TextField placeholder="OTP Code" value={otp} onChange={e => setOtp(e.target.value)} sx={inputStyle} />
                    <TextField placeholder="New Password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} sx={inputStyle} />
                  </>
                )}

                <Button 
                  fullWidth 
                  onClick={otpStep === 1 ? sendOtp : resetPassword} 
                  sx={{ ...primaryBtnStyle, background: otpStep === 1 ? "#22c55e" : "#ef4444" }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : otpStep === 1 ? "SEND CODE" : "UPDATE PASSWORD"}
                </Button>

                <Button startIcon={<ArrowBackIcon />} sx={{ color: "white", opacity: 0.6, fontSize: 12, mt: 1 }} onClick={() => setForgotMode(false)}>
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

// --- STYLES ---

const containerStyle = {
  minHeight: "100vh", background: "#020617",
  backgroundImage: "radial-gradient(at 0% 0%, rgba(37, 99, 235, 0.2) 0, transparent 50%), radial-gradient(at 100% 100%, rgba(249, 115, 22, 0.15) 0, transparent 50%)",
  display: "flex", alignItems: "center", justifyContent: "center", p: 2
};

const glassCardStyle = {
  width: "100%", maxWidth: 400, borderRadius: 8,
  background: "rgba(15, 23, 42, 0.8)", backdropFilter: "blur(20px)",
  border: "1px solid rgba(255, 255, 255, 0.1)", color: "white",
  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
};

const logoWrapperStyle = {
  width: 70, height: 70, bgcolor: "rgba(255,255,255,0.05)", borderRadius: "20px",
  display: "flex", alignItems: "center", justifyContent: "center", mx: "auto",
  border: "1px solid rgba(255,255,255,0.1)"
};

const inputStyle = {
  "& .MuiOutlinedInput-root": {
    color: "white", borderRadius: 4, bgcolor: "rgba(255,255,255,0.05)",
    "& fieldset": { borderColor: "rgba(255,255,255,0.1)" },
    "&:hover fieldset": { borderColor: "rgba(255,255,255,0.3)" },
    "&.Mui-focused fieldset": { borderColor: "#3b82f6" }
  }
};

const primaryBtnStyle = {
  py: 1.8, borderRadius: 4, fontWeight: 900, fontSize: "0.85rem", letterSpacing: 1.5,
  background: "linear-gradient(135deg, #2563eb, #7c3aed)", color: "white",
  boxShadow: "0 10px 20px -5px rgba(37, 99, 235, 0.5)",
  "&:hover": { transform: "translateY(-2px)", boxShadow: "0 20px 30px -10px rgba(37, 99, 235, 0.6)" },
  "&.Mui-disabled": { background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.3)" }
};

const overlayStyle = {
  position: "fixed", inset: 0, zIndex: 9999, bgcolor: "#020617",
  display: "flex", alignItems: "center", justifyContent: "center"
};

const ballStyle = {
  width: 50, height: 50, bgcolor: "#ccff00", borderRadius: "50%",
  boxShadow: "inset -5px -5px 15px rgba(0,0,0,0.2), 0 0 20px rgba(204,255,0,0.4)",
  border: "2px solid #a3cc00", animation: `${bounce} 0.8s infinite ease-in-out`,
  position: "relative",
  "&::after": {
    content: '""', position: "absolute", top: "10%", left: "10%", width: "80%", height: "80%",
    borderRadius: "50%", border: "2px solid rgba(255,255,255,0.4)", clipPath: "inset(50% 0 0 0)"
  }
};

const shadowStyle = {
  width: 40, height: 8, bgcolor: "black", borderRadius: "50%", mt: 2.5,
  animation: `${shadowPulse} 0.8s infinite ease-in-out`
};

const loaderTextStyle = { mt: 4, color: "white", fontWeight: 800, letterSpacing: 2, fontSize: "0.7rem", opacity: 0.7 };
const linkStyle = { cursor: "pointer", fontSize: 13, fontWeight: 600, opacity: 0.6, "&:hover": { opacity: 1, color: "#3b82f6" } };
const iconStyle = { color: "rgba(255,255,255,0.4)", fontSize: 20 };
const alertStyle = { borderRadius: 3, mb: 3, fontWeight: 700, fontSize: 13 };