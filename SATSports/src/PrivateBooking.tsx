import React, { useEffect, useState, useMemo } from "react";
import {
  Box, Typography, TextField, Button, Select, MenuItem, Card, 
  CardContent, Stack, Container, IconButton, InputAdornment, Grid
} from "@mui/material";
import { motion } from "framer-motion";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import API_BASE from "./api";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

// Required to parse the "07:00 AM" format in the browser
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
      .catch(err => console.error("Location fetch error:", err));
  }, []);

  // Generates 30-minute intervals for the clock type selection
  const timeOptions = useMemo(() => {
    const slots = [];
    for (let hour = 6; hour <= 21; hour++) {
      for (let min of ["00", "30"]) {
        const h = hour > 12 ? hour - 12 : hour;
        const ampm = hour >= 12 ? "PM" : "AM";
        slots.push(`${h}:${min} ${ampm}`);
      }
    }
    return slots;
  }, []);

  const submit = async () => {
    // Frontend validation to prevent unnecessary API calls
    if (!form.name || !form.location_id || !form.booking_date) {
      alert("Please fill in all required fields.");
      return;
    }

    const start = dayjs(form.start_time, "hh:mm A");
    const end = dayjs(form.end_time, "hh:mm A");

    if (!end.isAfter(start)) {
      alert("Error: End time must be after start time");
      return;
    }

    setLoading(true);
    try {
      // MATCHES BACKEND: We send the raw AM/PM strings because your 
      // backend handles the formatTime conversion.
      const res = await fetch(`${API_BASE}/api/private-bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          location_id: form.location_id,
          booking_date: form.booking_date,
          start_time: form.start_time, 
          end_time: form.end_time
        })
      });
      
      const result = await res.json();

      if (res.ok) {
        alert("Booking Requested Successfully! 🎾");
        setForm({ ...form, name: "", email: "", phone: "" });
      } else {
        alert(`Error: ${result.message || "Failed to book"}`);
      }
    } catch (err) {
      alert("Network error. Please check your connection.");
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
          <Card sx={glassCardStyle}>
            <CardContent sx={{ p: 4 }}>
              <Stack spacing={3}>
                <Typography variant="h5" fontWeight={800} color="white" textAlign="center">
                  PRIVATE SESSION
                </Typography>
                
                <TextField label="Full Name" fullWidth sx={inputStyle} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />

                <Grid container spacing={2}>
                  <Grid item xs={6}><TextField label="Email" fullWidth sx={inputStyle} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Grid>
                  <Grid item xs={6}><TextField label="Phone" fullWidth sx={inputStyle} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Grid>
                </Grid>

                <TextField
                  select fullWidth label="Location" sx={inputStyle} value={form.location_id}
                  onChange={(e) => setForm({ ...form, location_id: e.target.value })}
                  SelectProps={{ MenuProps: { PaperProps: { sx: { bgcolor: "#0f172a", color: "white" } } } }}
                >
                  <MenuItem value="" disabled>Select Location</MenuItem>
                  {locations.map((loc) => <MenuItem key={loc.id} value={loc.id} sx={{color: 'white'}}>{loc.name}</MenuItem>)}
                </TextField>

                <TextField
                  type="date" label="Booking Date" fullWidth sx={inputStyle}
                  InputLabelProps={{ shrink: true }}
                  value={form.booking_date} onChange={(e) => setForm({ ...form, booking_date: e.target.value })}
                />

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField 
                      select fullWidth label="Start" sx={timeFieldStyle} 
                      value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                      InputLabelProps={{ shrink: true }}
                      InputProps={{ startAdornment: <InputAdornment position="start"><AccessTimeIcon sx={{ color: "#3b82f6", fontSize: 18 }} /></InputAdornment> }}
                    >
                      {timeOptions.map(t => <MenuItem key={t} value={t} sx={{color: 'white'}}>{t}</MenuItem>)}
                    </TextField>
                  </Grid>
                  <Grid item xs={6}>
                    <TextField 
                      select fullWidth label="End" sx={timeFieldStyle} 
                      value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                      InputLabelProps={{ shrink: true }}
                      InputProps={{ startAdornment: <InputAdornment position="start"><AccessTimeIcon sx={{color: "#3b82f6", fontSize: 18 }} /></InputAdornment> }}
                    >
                      {timeOptions.map(t => <MenuItem key={t} value={t} sx={{color: 'white'}}>{t}</MenuItem>)}
                    </TextField>
                  </Grid>
                </Grid>

                <Button fullWidth variant="contained" onClick={submit} disabled={loading} sx={submitBtnStyle}>
                  {loading ? "BOOKING..." : "BOOK SESSION 🚀"}
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </MotionBox>
      </Container>
    </Box>
  );
}

// --- CSS FIXES FOR VISIBILITY ---
const pageWrapperStyle = { minHeight: "100vh", bgcolor: "#020617", py: 6 };
const glassCardStyle = { bgcolor: "rgba(255,255,255,0.03)", borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)" };

const inputStyle = {
  "& .MuiOutlinedInput-root": {
    color: "white",
    "& fieldset": { borderColor: "rgba(255,255,255,0.2)", borderRadius: "12px" },
    "&.Mui-focused fieldset": { borderColor: "#3b82f6" },
  },
  "& .MuiInputLabel-root": { color: "#ffffff !important" },
  "& .MuiInputLabel-root.Mui-focused": { color: "#3b82f6 !important" }
};

const timeFieldStyle = {
  ...inputStyle,
  "& .MuiInputLabel-root": {
    transform: "translate(14px, -9px) scale(0.75)",
    background: "#020617",
    padding: "0 4px",
    color: "#ffffff !important"
  },
  "& .MuiSelect-select": { paddingLeft: "4px !important" }
};

const submitBtnStyle = { 
  py: 1.5, background: "linear-gradient(135deg, #3b82f6, #2563eb)", 
  fontWeight: 900, borderRadius: "12px", mt: 2 
};