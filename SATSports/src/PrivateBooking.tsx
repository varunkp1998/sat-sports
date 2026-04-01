import React, { useEffect, useState, useMemo } from "react";
import {
  Box, Typography, TextField, Button, Select, MenuItem, Card, 
  CardContent, Stack, Container, IconButton, InputAdornment, Grid
} from "@mui/material";
import { motion } from "framer-motion";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import API_BASE from "./api";
import dayjs from "dayjs";

const MotionBox = motion(Box);

export default function PrivateBooking() {
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", phone: "", location_id: "",
    booking_date: dayjs().format("YYYY-MM-DD"),
    start_time: "07:00 AM",
    end_time: "08:00 AM"
  });

  useEffect(() => {
    fetch(`${API_BASE}/api/admin/locations`)
      .then(res => res.json())
      .then(setLocations)
      .catch(err => console.error("Failed to load locations", err));
  }, []);

  // NEW: Generates 30-minute increments (7:00, 7:30, 8:00...)
  const timeOptions = useMemo(() => {
    const slots = [];
    for (let hour = 6; hour <= 21; hour++) {
      for (let min of ["00", "30"]) {
        const displayHour = hour > 12 ? hour - 12 : hour;
        const ampm = hour >= 12 ? "PM" : "AM";
        slots.push(`${displayHour}:${min} ${ampm}`);
      }
    }
    return slots;
  }, []);

  const submit = async () => {
    if (!form.name || !form.location_id || !form.booking_date) {
      alert("Please fill in all required fields.");
      return;
    }

    const sTime = dayjs(`2026-01-01 ${form.start_time}`, "YYYY-MM-DD hh:mm A").format("HH:mm:ss");
    const eTime = dayjs(`2026-01-01 ${form.end_time}`, "YYYY-MM-DD hh:mm A").format("HH:mm:ss");

    if (sTime >= eTime) {
      alert("End time must be after start time!");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/private-bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, start_time: sTime, end_time: eTime })
      });
      if (res.ok) {
        alert("Booking Requested! 🎾 Check your email.");
        setForm({ ...form, name: "", email: "", phone: "" });
      }
    } catch (err) {
      alert("Booking failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={pageWrapperStyle}>
      <Container maxWidth="sm">
        <IconButton onClick={() => window.history.back()} sx={{ color: "white", mb: 2 }}>
          <ArrowBackIcon />
        </IconButton>

        <MotionBox initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Box textAlign="center" mb={4}>
            <Typography variant="h3" fontWeight={900} sx={{ letterSpacing: -1 }}>
              BOOK A <span style={{ color: "#3b82f6" }}>SESSION</span>
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.6)" }}>
              Precision scheduling for your tennis growth
            </Typography>
          </Box>

          <Card sx={glassCardStyle}>
            <CardContent sx={{ p: 4 }}>
              <Stack spacing={3}>
                <Typography variant="caption" fontWeight={800} sx={{ color: "#3b82f6", letterSpacing: 1 }}>
                  STEP 1: CONTACT DETAILS
                </Typography>
                
                <TextField 
                  label="Full Name" fullWidth sx={inputStyle}
                  value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon sx={{color: '#3b82f6'}}/></InputAdornment> }}
                />

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField label="Email" fullWidth sx={inputStyle} value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon sx={{color: '#3b82f6'}}/></InputAdornment> }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField label="Phone" fullWidth sx={inputStyle} value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIcon sx={{color: '#3b82f6'}}/></InputAdornment> }}
                    />
                  </Grid>
                </Grid>

                <Box sx={{ height: '1px', bgcolor: 'rgba(255,255,255,0.1)', my: 1 }} />

                <Typography variant="caption" fontWeight={800} sx={{ color: "#3b82f6", letterSpacing: 1 }}>
                  STEP 2: LOGISTICS
                </Typography>

                {/* FIXED: Select Location Color */}
                <Select
                  fullWidth sx={selectStyle} value={form.location_id} displayEmpty
                  onChange={(e) => setForm({ ...form, location_id: e.target.value })}
                  startAdornment={<InputAdornment position="start"><LocationOnIcon sx={{color: '#3b82f6', ml: 1}}/></InputAdornment>}
                  MenuProps={{ PaperProps: { sx: { bgcolor: "#0f172a", color: "white" } } }}
                >
                  <MenuItem value="" disabled sx={{ color: "rgba(255,255,255,0.5)" }}>Select Preferred Court/Location</MenuItem>
                  {locations.map((loc) => (
                    <MenuItem key={loc.id} value={loc.id} sx={{ color: "white" }}>{loc.name}</MenuItem>
                  ))}
                </Select>

                <TextField
                  type="date" fullWidth sx={inputStyle} value={form.booking_date}
                  onChange={(e) => setForm({ ...form, booking_date: e.target.value })}
                  InputProps={{ 
                    startAdornment: <InputAdornment position="start"><CalendarMonthIcon sx={{color: '#3b82f6'}}/></InputAdornment>,
                    inputProps: { min: dayjs().format("YYYY-MM-DD") }
                  }}
                />

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      select fullWidth label="Start Time" sx={timeSelectStyle}
                      value={form.start_time}
                      onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><AccessTimeIcon sx={{color: '#3b82f6'}}/></InputAdornment>
                      }}
                      SelectProps={{ MenuProps: { PaperProps: { sx: { bgcolor: "#0f172a", color: "white", maxHeight: 300 } } } }}
                    >
                      {timeOptions.map(t => <MenuItem key={t} value={t} sx={{ color: "white" }}>{t}</MenuItem>)}
                    </TextField>
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      select fullWidth label="End Time" sx={timeSelectStyle}
                      value={form.end_time}
                      onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><AccessTimeIcon sx={{color: '#3b82f6'}}/></InputAdornment>
                      }}
                      SelectProps={{ MenuProps: { PaperProps: { sx: { bgcolor: "#0f172a", color: "white", maxHeight: 300 } } } }}
                    >
                      {timeOptions.map(t => <MenuItem key={t} value={t} sx={{ color: "white" }}>{t}</MenuItem>)}
                    </TextField>
                  </Grid>
                </Grid>

                <Button
                  fullWidth size="large" variant="contained" onClick={submit} disabled={loading}
                  sx={submitBtnStyle}
                >
                  {loading ? "SENDING REQUEST..." : "REQUEST BOOKING 🚀"}
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </MotionBox>
      </Container>
    </Box>
  );
}

// --- STYLES ---
const pageWrapperStyle = { 
  minHeight: "100vh", bgcolor: "#020617", color: "white", py: 6,
  background: "radial-gradient(circle at top right, rgba(59, 130, 246, 0.15), transparent), #020617"
};

const glassCardStyle = { 
  borderRadius: 6, bgcolor: "rgba(255,255,255,0.03)", 
  backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.1)",
  boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)"
};

const inputStyle = {
  "& .MuiOutlinedInput-root": {
    color: "white",
    "& fieldset": { borderColor: "rgba(255,255,255,0.2)", borderRadius: "12px" },
    "&:hover fieldset": { borderColor: "rgba(255,255,255,0.4)" },
    "&.Mui-focused fieldset": { borderColor: "#3b82f6" },
    bgcolor: "rgba(255,255,255,0.02)"
  },
  "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.6)" },
  "& .MuiInputLabel-root.Mui-focused": { color: "#3b82f6" },
  "& .MuiSvgIcon-root": { color: "#3b82f6" }
};

const selectStyle = {
  ...inputStyle,
  "& .MuiSelect-select": { color: "white !important", fontWeight: 600, paddingLeft: '8px' },
  "& .MuiSvgIcon-root": { color: "#3b82f6" }
};

const timeSelectStyle = {
  ...inputStyle,
  "& .MuiSelect-select": { 
    color: "white !important", 
    paddingLeft: "8px !important",
    display: "flex", 
    alignItems: "center"
  },
  "& .MuiInputLabel-root": {
    transform: "translate(45px, 16px) scale(1)",
    "&.Mui-focused, &.MuiFormLabel-filled": {
      transform: "translate(14px, -9px) scale(0.75)"
    }
  }
};

const submitBtnStyle = {
  py: 2, borderRadius: 4, fontWeight: 900,
  background: "linear-gradient(135deg, #3b82f6, #2563eb)",
  boxShadow: "0 15px 30px rgba(37, 99, 235, 0.4)",
  "&:hover": { transform: "translateY(-2px)", boxShadow: "0 20px 40px rgba(37, 99, 235, 0.6)" },
  transition: "all 0.3s ease"
};