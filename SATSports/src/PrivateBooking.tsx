import React, { useEffect, useState } from "react";
import {
  Box, Typography, Button, TextField, Card, CardContent, 
  Stack, Container, IconButton, InputAdornment, Grid, MenuItem
} from "@mui/material";
import { LocalizationProvider, TimePicker, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { motion } from "framer-motion";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import API_BASE from "./api";
import dayjs, { Dayjs } from "dayjs";

const MotionBox = motion(Box);

export default function PrivateBooking() {
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [startTime, setStartTime] = useState<Dayjs | null>(dayjs().set('hour', 7).set('minute', 0).set('second', 0));
  const [endTime, setEndTime] = useState<Dayjs | null>(dayjs().set('hour', 8).set('minute', 0).set('second', 0));
  const [bookingDate, setBookingDate] = useState<Dayjs | null>(dayjs());
  
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    location_id: "",
  });

  useEffect(() => {
    fetch(`${API_BASE}/api/admin/locations`)
      .then(res => res.json())
      .then(setLocations);
  }, []);

  const submit = async () => {
    if (!form.name || !form.email || !form.phone || !form.location_id || !bookingDate || !startTime || !endTime) {
      alert("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        location_id: form.location_id,
        booking_date: bookingDate.format("YYYY-MM-DD"),
        // Sending clean 24h time without seconds to avoid backend logic errors
        start_time: startTime.format("HH:mm"), 
        end_time: endTime.format("HH:mm")
      };

      const res = await fetch(`${API_BASE}/api/private-bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      const result = await res.json();
      if (res.ok) {
        alert("Booking Requested! 🎾");
      } else {
        // This will show the exact error from the server
        alert(result.message || "End time must be after start time");
      }
    } catch (err) {
      alert("Network error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={pageWrapperStyle}>
        <Container maxWidth="sm">
          <IconButton onClick={() => window.history.back()} sx={{ color: "white", mb: 2 }}>
            <ArrowBackIcon />
          </IconButton>

          <MotionBox initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Box textAlign="center" mb={4}>
              <Typography variant="h4" fontWeight={900} color="white">
                BOOK A <span style={{ color: "#3b82f6" }}>SESSION</span>
              </Typography>
            </Box>

            <Card sx={glassCardStyle}>
              <CardContent sx={{ p: 4 }}>
                <Stack spacing={2.5}>
                  <TextField 
                    label="Full Name" fullWidth sx={inputStyle}
                    value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon/></InputAdornment> }}
                  />

                  <TextField 
                    label="Email Address" fullWidth sx={inputStyle}
                    value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                    InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon/></InputAdornment> }}
                  />

                  <TextField 
                    label="Phone Number" fullWidth sx={inputStyle}
                    value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIcon/></InputAdornment> }}
                  />

                  <TextField
                    select fullWidth label="Location" sx={inputStyle} value={form.location_id}
                    onChange={(e) => setForm({ ...form, location_id: e.target.value })}
                  >
                    {locations.map((loc) => (
                      <MenuItem key={loc.id} value={loc.id}>{loc.name}</MenuItem>
                    ))}
                  </TextField>

                  <DatePicker
                    label="Booking Date"
                    value={bookingDate}
                    onChange={(newValue) => setBookingDate(newValue)}
                    slotProps={{ textField: { fullWidth: true, sx: inputStyle } }}
                  />

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TimePicker
                        label="From"
                        value={startTime}
                        onChange={(newValue) => setStartTime(newValue)}
                        slotProps={{ textField: { fullWidth: true, sx: inputStyle } }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TimePicker
                        label="To"
                        value={endTime}
                        onChange={(newValue) => setEndTime(newValue)}
                        slotProps={{ textField: { fullWidth: true, sx: inputStyle } }}
                      />
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
    </LocalizationProvider>
  );
}

// --- REVISED STYLES TO FIX THE WHITE BOX ISSUE ---
const pageWrapperStyle = { minHeight: "100vh", bgcolor: "#020617", py: 6 };
const glassCardStyle = { bgcolor: "#0f172a", borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", boxShadow: 'none' };

const inputStyle = {
  "& .MuiOutlinedInput-root": {
    bgcolor: "transparent", // Fixes the white background from the screenshot
    color: "white",
    "& fieldset": { borderColor: "rgba(255,255,255,0.2)", borderRadius: "12px" },
    "&:hover fieldset": { borderColor: "rgba(255,255,255,0.4)" },
    "&.Mui-focused fieldset": { borderColor: "#3b82f6" },
  },
  "& .MuiInputBase-input": { 
    color: "#ffffff !important", 
    "-webkit-text-fill-color": "#ffffff !important" 
  },
  "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.7) !important" },
  "& .MuiSvgIcon-root": { color: "#3b82f6" }
};

const submitBtnStyle = {
  py: 1.5, background: "linear-gradient(135deg, #3b82f6, #2563eb)", 
  fontWeight: 900, borderRadius: "12px", mt: 2 
};