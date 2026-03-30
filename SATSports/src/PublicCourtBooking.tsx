import { useState } from "react";
import {
  Box, Card, CardContent, Typography, TextField, Button, Stack,
  ToggleButton, ToggleButtonGroup, Alert, Container, InputAdornment, IconButton, Fade
} from "@mui/material";
import { motion } from "framer-motion";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SportsTennisIcon from "@mui/icons-material/SportsTennis";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import API_BASE from "./api";

const MotionBox = motion(Box);

export default function PublicCourtBooking() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [court, setCourt] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setMsg(null);
    setError(null);

    if (!name || !date || !startTime || !endTime || !court) {
      setError("Please fill all required fields");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/court-bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, phone, court_name: court,
          booking_date: date, start_time: startTime, end_time: endTime,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Booking failed");

      setMsg("🎉 Court booked successfully!");
      // Reset fields
      setName(""); setPhone(""); setDate(""); 
      setStartTime(""); setEndTime(""); setCourt(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <Box sx={{ 
      minHeight: "100vh", bgcolor: "#020617", color: "white", py: 6,
      background: "radial-gradient(circle at bottom left, rgba(239, 68, 68, 0.1), transparent), #020617"
    }}>
      <Container maxWidth="sm">
        {/* Navigation */}
        <IconButton onClick={() => window.history.back()} sx={{ color: "white", mb: 2 }}>
          <ArrowBackIcon />
        </IconButton>

        <MotionBox initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <Box textAlign="center" mb={4}>
            <Typography variant="h3" fontWeight={900} sx={{ letterSpacing: -1 }}>
              COURT <span style={{ color: "#ef4444" }}>RESERVATION</span>
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.5)" }}>
              Pick a court and time to start playing.
            </Typography>
          </Box>

          <Card sx={glassStyle}>
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Stack spacing={3}>
                
                {msg && <Fade in={!!msg}><Alert severity="success" sx={alertStyle}>{msg}</Alert></Fade>}
                {error && <Fade in={!!error}><Alert severity="error" sx={alertStyle}>{error}</Alert></Fade>}

                {/* User Details */}
                <TextField
                  label="Your Name" value={name} onChange={(e) => setName(e.target.value)}
                  fullWidth sx={inputStyle}
                  InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon sx={{color: '#ef4444'}}/></InputAdornment> }}
                />

                <TextField
                  label="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)}
                  fullWidth sx={inputStyle}
                  InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIcon sx={{color: '#ef4444'}}/></InputAdornment> }}
                />

                {/* Date & Time */}
                <TextField
                  type="date" label="Booking Date" value={date} 
                  onChange={(e) => setDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth sx={inputStyle}
                  InputProps={{ startAdornment: <InputAdornment position="start"><CalendarMonthIcon sx={{color: '#ef4444'}}/></InputAdornment> }}
                />

                <Stack direction="row" spacing={2}>
                  <TextField
                    type="time" label="From" value={startTime} 
                    onChange={(e) => setStartTime(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    fullWidth sx={inputStyle}
                    InputProps={{ startAdornment: <InputAdornment position="start"><AccessTimeIcon sx={{color: '#ef4444'}}/></InputAdornment> }}
                  />
                  <TextField
                    type="time" label="To" value={endTime} 
                    onChange={(e) => setEndTime(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    fullWidth sx={inputStyle}
                  />
                </Stack>

                {/* Court Selection */}
                <Box>
                  <Typography variant="body2" sx={{ mb: 1.5, color: "rgba(255,255,255,0.6)", fontWeight: 700 }}>
                    SELECT A COURT
                  </Typography>
                  <ToggleButtonGroup
                    value={court} exclusive onChange={(_, v) => setCourt(v)}
                    fullWidth sx={{ gap: 1, '& .MuiToggleButtonGroup-grouped': { border: 'none !important', borderRadius: '12px !important' } }}
                  >
                    {["Court 1", "Court 2", "Court 3", "Court 4"].map((c) => (
                      <ToggleButton
                        key={c} value={c}
                        sx={{
                          bgcolor: court === c ? "#ef4444" : "rgba(255,255,255,0.05)",
                          color: "white", fontWeight: 700, py: 1.5, flex: 1,
                          border: "1px solid rgba(255,255,255,0.1) !important",
                          transition: "all 0.3s",
                          "&:hover": { bgcolor: court === c ? "#dc2626" : "rgba(255,255,255,0.15)" },
                          "&.Mui-selected": { bgcolor: "#ef4444", color: "white" }
                        }}
                      >
                        {c}
                      </ToggleButton>
                    ))}
                  </ToggleButtonGroup>
                </Box>

                <Button
                  variant="contained" size="large" onClick={submit}
                  sx={{
                    py: 2, borderRadius: 4, fontWeight: 900, fontSize: '1.1rem',
                    background: "linear-gradient(135deg, #f97316, #ef4444)",
                    boxShadow: "0 10px 30px rgba(239, 68, 68, 0.4)",
                    "&:hover": { transform: "translateY(-2px)", filter: "brightness(1.1)" },
                    transition: "all 0.3s"
                  }}
                >
                  RESERVE NOW 🎾
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </MotionBox>
      </Container>
    </Box>
  );
}

// 🎨 Styles
const glassStyle = {
  borderRadius: 6, background: "rgba(255,255,255,0.02)", backdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.08)", color: "white", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)"
};

const inputStyle = {
  "& .MuiOutlinedInput-root": {
    color: "white",
    "& fieldset": { borderColor: "rgba(255,255,255,0.1)", borderRadius: "14px" },
    "&:hover fieldset": { borderColor: "rgba(255,255,255,0.3)" },
    "&.Mui-focused fieldset": { borderColor: "#ef4444" },
    bgcolor: "rgba(255,255,255,0.02)"
  },
  "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.5)" },
  "& .MuiInputLabel-root.Mui-focused": { color: "#ef4444" },
  "& .MuiSvgIcon-root": { color: "#ef4444" }
};

const alertStyle = { borderRadius: "12px", fontWeight: 600, bgcolor: "rgba(0,0,0,0.2)", color: "white" };