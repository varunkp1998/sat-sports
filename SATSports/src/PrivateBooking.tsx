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
import customParseFormat from "dayjs/plugin/customParseFormat";

// Required for parsing "07:30 AM" strings
dayjs.extend(customParseFormat);

const MotionBox = motion(Box);

export default function PrivateBooking() {
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    location_id: "",
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

    // FIX: Robust Time Comparison using the plugin
    const start = dayjs(form.start_time, "hh:mm A");
    const end = dayjs(form.end_time, "hh:mm A");

    if (!end.isAfter(start)) {
      alert("Error: End time must be after start time");
      return;
    }

    const sTime24 = start.format("HH:mm:ss");
    const eTime24 = end.format("HH:mm:ss");

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/private-bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          ...form, 
          start_time: sTime24, 
          end_time: eTime24,
          time_slot: sTime24 
        })
      });
      
      if (res.ok) {
        alert("Booking Requested Successfully! 🎾");
        setForm({ ...form, name: "", email: "", phone: "" });
      } else {
        alert("Server error. Please try again.");
      }
    } catch (err) {
      alert("Network error.");
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
            <Typography variant="h4" fontWeight={900} sx={{ color: "white", textTransform: 'uppercase' }}>
              Book A <span style={{ color: "#3b82f6" }}>Private Session</span>
            </Typography>
          </Box>

          <Card sx={glassCardStyle}>
            <CardContent sx={{ p: 4 }}>
              <Stack spacing={3}>
                <Typography variant="caption" fontWeight={800} sx={{ color: "#3b82f6" }}>STEP 1: CONTACT DETAILS</Typography>
                
                <TextField label="Full Name" fullWidth sx={inputStyle} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />

                <Grid container spacing={2}>
                  <Grid item xs={6}><TextField label="Email" fullWidth sx={inputStyle} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Grid>
                  <Grid item xs={6}><TextField label="Phone" fullWidth sx={inputStyle} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Grid>
                </Grid>

                <Typography variant="caption" fontWeight={800} sx={{ color: "#3b82f6" }}>STEP 2: LOGISTICS</Typography>

                <Select
                  fullWidth sx={selectStyle} value={form.location_id} displayEmpty
                  onChange={(e) => setForm({ ...form, location_id: e.target.value })}
                  MenuProps={{ PaperProps: { sx: { bgcolor: "#0f172a", color: "white" } } }}
                >
                  <MenuItem value="" disabled sx={{ color: "gray" }}>Select Location</MenuItem>
                  {locations.map((loc) => <MenuItem key={loc.id} value={loc.id} sx={{color: 'white'}}>{loc.name}</MenuItem>)}
                </Select>

                <TextField
                  type="date" fullWidth sx={inputStyle} label="Booking Date"
                  value={form.booking_date} onChange={(e) => setForm({ ...form, booking_date: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField select fullWidth label="Start Time" sx={timeSelectStyle} value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })}>
                      {timeOptions.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                    </TextField>
                  </Grid>
                  <Grid item xs={6}>
                    <TextField select fullWidth label="End Time" sx={timeSelectStyle} value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })}>
                      {timeOptions.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                    </TextField>
                  </Grid>
                </Grid>

                <Button fullWidth variant="contained" onClick={submit} disabled={loading} sx={submitBtnStyle}>
                  {loading ? "SENDING..." : "REQUEST BOOKING 🚀"}
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </MotionBox>
      </Container>
    </Box>
  );
}

// --- CSS FIXES ---
const pageWrapperStyle = { minHeight: "100vh", bgcolor: "#020617", py: 6 };
const glassCardStyle = { bgcolor: "rgba(255,255,255,0.03)", borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 20px 40px rgba(0,0,0,0.4)" };

const inputStyle = {
  "& .MuiOutlinedInput-root": { 
    color: "white", 
    "& fieldset": { borderColor: "rgba(255,255,255,0.2)", borderRadius: "12px" },
    "&:hover fieldset": { borderColor: "#3b82f6" }
  },
  "& .MuiInputLabel-root": { 
    color: "#ffffff !important", // FIX: No more black headers
    fontWeight: 600
  },
  "& .MuiInputLabel-root.Mui-focused": { color: "#3b82f6 !important" },
  "& input::-webkit-calendar-picker-indicator": { filter: "invert(1)" } 
};

const selectStyle = { 
  ...inputStyle, 
  "& .MuiSelect-select": { color: "white !important", paddingLeft: '8px' } 
};

const timeSelectStyle = { 
    ...inputStyle, 
    "& .MuiInputLabel-root": { 
      transform: "translate(14px, -9px) scale(0.75)", // FIX: Prevents shrinking/colliding
      color: "#ffffff !important",
      bgcolor: "#0b1221", // Matches card depth
      padding: "0 4px"
    } 
};

const submitBtnStyle = { 
  py: 2, borderRadius: "12px", background: "linear-gradient(135deg, #3b82f6, #2563eb)", 
  fontWeight: 900, fontSize: "1rem", boxShadow: "0 10px 20px rgba(37, 99, 235, 0.3)" 
};