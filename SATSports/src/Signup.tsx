import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Card, CardContent, TextField, Button, 
  Typography, Stack, Fade, CircularProgress, keyframes 
} from "@mui/material";
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

// --- TENNIS LOADER COMPONENT ---
const TennisLoader = ({ message }: { message: string }) => (
  <Box sx={overlayStyle}>
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <Box sx={ballStyle} />
      <Box sx={shadowStyle} />
      <Typography sx={loaderTextStyle}>{message}</Typography>
    </Box>
  </Box>
);

export default function Signup() {
  const navigate = useNavigate();
  const [role, setRole] = useState("player");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", phone: "", age: "", parentName: "", parentPhone: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone) return alert("Please fill required fields");
    if (role === "player" && (!form.age || !form.parentName)) return alert("Please fill player details");

    try {
      setLoading(true);
      const url = role === "coach" ? `${API_BASE}/api/signup/coach` : `${API_BASE}/api/signup`;
      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        ...(role === "player" && {
          age: form.age,
          parentName: form.parentName,
          parentPhone: form.parentPhone
        })
      };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      alert(data.message || "Registration Successful! Please check your email.");
      navigate("/login");

    } catch (err: any) {
      alert(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={containerStyle}>
      {loading && <TennisLoader message="Creating your Athlete Profile..." />}

      <Fade in timeout={800}>
        <Card sx={glassCardStyle}>
          <CardContent sx={{ p: { xs: 3, md: 5 } }}>
            
            {/* HEADER */}
            <Box textAlign="center" mb={4}>
              <Typography variant="h4" fontWeight={900} sx={{ letterSpacing: -1 }}>
                JOIN THE ACADEMY
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.6, fontWeight: 500 }}>
                Start your elite training journey today
              </Typography>
            </Box>

            {/* ROLE TOGGLE */}
            <Box sx={toggleWrapperStyle}>
              <Box sx={{ ...activeToggleBg, left: role === "player" ? "4px" : "calc(50% - 4px)" }} />
              {["player", "coach"].map((r) => (
                <Box
                  key={r}
                  onClick={() => setRole(r)}
                  sx={{ ...toggleItemStyle, color: role === r ? "white" : "rgba(255,255,255,0.4)" }}
                >
                  {r.toUpperCase()}
                </Box>
              ))}
            </Box>

            <form onSubmit={submit}>
              <Stack spacing={2.5}>
                <TextField label="Full Name" name="name" value={form.name} onChange={handleChange} fullWidth sx={inputStyle} variant="outlined" />
                
                <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", sm: "row" } }}>
                  <TextField label="Email" name="email" value={form.email} onChange={handleChange} fullWidth sx={inputStyle} />
                  <TextField label="Phone" name="phone" value={form.phone} onChange={handleChange} fullWidth sx={inputStyle} />
                </Box>

                {role === "player" && (
                  <Fade in={role === "player"}>
                    <Stack spacing={2.5}>
                      <TextField label="Athlete Age" name="age" value={form.age} onChange={handleChange} fullWidth sx={inputStyle} />
                      <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", sm: "row" } }}>
                        <TextField label="Parent Name" name="parentName" value={form.parentName} onChange={handleChange} fullWidth sx={inputStyle} />
                        <TextField label="Parent Phone" name="parentPhone" value={form.parentPhone} onChange={handleChange} fullWidth sx={inputStyle} />
                      </Box>
                    </Stack>
                  </Fade>
                )}

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loading}
                  sx={primaryBtnStyle}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : "CREATE ACCOUNT 🚀"}
                </Button>

                <Button 
                  startIcon={<ArrowBackIcon />} 
                  onClick={() => navigate("/login")}
                  sx={{ color: "white", opacity: 0.5, fontSize: "0.75rem", mt: 1, "&:hover": { opacity: 1 } }}
                >
                  Already have an account? Sign In
                </Button>
              </Stack>
            </form>
          </CardContent>
        </Card>
      </Fade>
    </Box>
  );
}

// --- STYLES (MATCHES LOGIN) ---

const containerStyle = {
  minHeight: "100vh", background: "#020617",
  backgroundImage: "radial-gradient(at 0% 0%, rgba(37, 99, 235, 0.2) 0, transparent 50%), radial-gradient(at 100% 100%, rgba(249, 115, 22, 0.15) 0, transparent 50%)",
  display: "flex", alignItems: "center", justifyContent: "center", p: 2
};

const glassCardStyle = {
  width: "100%", maxWidth: 550, borderRadius: 8,
  background: "rgba(15, 23, 42, 0.8)", backdropFilter: "blur(25px)",
  border: "1px solid rgba(255, 255, 255, 0.1)", color: "white",
  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
};

const toggleWrapperStyle = {
  display: "flex", background: "rgba(255,255,255,0.05)", borderRadius: 4,
  p: "4px", mb: 4, position: "relative", border: "1px solid rgba(255,255,255,0.1)"
};

const activeToggleBg = {
  position: "absolute", top: 4, width: "50%", height: "calc(100% - 8px)",
  borderRadius: 3, background: "linear-gradient(90deg, #2563eb, #7c3aed)",
  transition: "0.4s cubic-bezier(0.4, 0, 0.2, 1)", zIndex: 0
};

const toggleItemStyle = {
  flex: 1, textAlign: "center", py: 1.2, zIndex: 1,
  cursor: "pointer", fontWeight: 800, fontSize: "0.75rem", letterSpacing: 1
};

const inputStyle = {
  "& label": { color: "rgba(255,255,255,0.4)" },
  "& .MuiOutlinedInput-root": {
    color: "white", borderRadius: 3, bgcolor: "rgba(255,255,255,0.03)",
    "& fieldset": { borderColor: "rgba(255,255,255,0.1)" },
    "&:hover fieldset": { borderColor: "rgba(255,255,255,0.3)" },
    "&.Mui-focused fieldset": { borderColor: "#3b82f6" }
  }
};

const primaryBtnStyle = {
  py: 1.8, mt: 2, borderRadius: 4, fontWeight: 900, fontSize: "0.85rem", letterSpacing: 1.5,
  background: "linear-gradient(135deg, #2563eb, #7c3aed)", color: "white",
  boxShadow: "0 10px 20px -5px rgba(37, 99, 235, 0.4)",
  "&:hover": { transform: "translateY(-2px)", boxShadow: "0 20px 30px -10px rgba(37, 99, 235, 0.6)" }
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