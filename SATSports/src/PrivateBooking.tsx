import React, { useEffect, useState } from "react";
import {
  Box, Typography, Button, TextField, Card, CardContent, 
  Stack, Container, IconButton, InputAdornment, Grid, MenuItem
} from "@mui/material";
import { LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { motion } from "framer-motion";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import API_BASE from "./api";
import dayjs, { Dayjs } from "dayjs";

const MotionBox = motion(Box);

export default function PrivateBooking() {
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [startTime, setStartTime] = useState<Dayjs | null>(dayjs().set('hour', 7).set('minute', 0));
  const [endTime, setEndTime] = useState<Dayjs | null>(dayjs().set('hour', 8).set('minute', 0));
  
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    location_id: "",
    booking_date: dayjs().format("YYYY-MM-DD"),
  });

  useEffect(() => {
    fetch(`${API_BASE}/api/admin/locations`)
      .then(res => res.json())
      .then(setLocations)
      .catch(err => console.error("Failed to fetch locations", err));
  }, []);

  const submit = async () => {
    // Validation check for all required fields
    if (!form.name || !form.email || !form.phone || !form.location_id || !startTime || !endTime) {
      alert("Please fill in all fields.");
      return;
    }

    if (endTime.isBefore(startTime) || endTime.isSame(startTime)) {
      alert("End time must be after start time");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...form,
        start_time: startTime.format("hh:mm A"),
        end_time: endTime.format("hh:mm A")
      };

      const res = await fetch(`${API_BASE}/api/private-bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        alert("Booking Requested! 🎾");
      } else {
        alert("Error submitting booking.");
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
              <Typography variant="h3" fontWeight={900} color="white">
                BOOK A <span style={{ color: "#3b82f6" }}>SESSION</span>
              </Typography>
              <Typography sx={{ color: "rgba(255,255,255,0.5)" }}>
                Pick an exact time for your training
              </Typography>
            </Box>

            <Card sx={glassCardStyle}>
              <CardContent sx={{ p: 4 }}>
                <Stack spacing={3}>
                  {/* Name Field */}
                  <TextField 
                    label="Full Name" fullWidth sx={inputStyle}
                    value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon/></InputAdornment> }}
                  />

                  {/* Email Field */}
                  <TextField 
                    label="Email Address" type="email" fullWidth sx={inputStyle}
                    value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                    InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon/></InputAdornment> }}
                  />

                  {/* Phone Field */}
                  <TextField 
                    label="Phone Number" fullWidth sx={inputStyle}
                    value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIcon/></InputAdornment> }}
                  />

                  {/* Location Dropdown */}
                  <TextField
                    select fullWidth label="Location" sx={inputStyle} value={form.location_id}
                    onChange={(e) => setForm({ ...form, location_id: e.target.value })}
                    SelectProps={{ MenuProps: { PaperProps: { sx: { bgcolor: "#0f172a", color: "white" } } } }}
                  >
                    {locations.map((loc) => (
                      <MenuItem key={loc.id} value={loc.id} sx={{ color: "white" }}>{loc.name}</MenuItem>
                    ))}
                  </TextField>

                  {/* Time Pickers */}
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TimePicker
                        label="From"
                        value={startTime}
                        onChange={(newValue) => setStartTime(newValue)}
                        slotProps={{
                          textField: { fullWidth: true, sx: timePickerStyle, InputLabelProps: { shrink: true } }
                        }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TimePicker
                        label="To"
                        value={endTime}
                        onChange={(newValue) => setEndTime(newValue)}
                        slotProps={{
                          textField: { fullWidth: true, sx: timePickerStyle, InputLabelProps: { shrink: true } }
                        }}
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

// --- STYLES ---
const pageWrapperStyle = { minHeight: "100vh", bgcolor: "#020617", py: 6 };
const glassCardStyle = { bgcolor: "rgba(255,255,255,0.02)", borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", backgroundImage: "none" };

const inputStyle = {
  "& .MuiOutlinedInput-root": {
    color: "white",
    "& fieldset": { borderColor: "rgba(255,255,255,0.2)", borderRadius: "12px" },
    "&.Mui-focused fieldset": { borderColor: "#3b82f6" },
  },
  "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.7) !important" },
  "& .MuiInputLabel-root.Mui-focused": { color: "#3b82f6 !important" },
  "& .MuiSvgIcon-root": { color: "#3b82f6" }
};

const timePickerStyle = {
  ...inputStyle,
  "& .MuiInputBase-input": { color: "white" },
  "& .MuiOutlinedInput-root": {
    "& .MuiIconButton-root": { color: "#3b82f6" }
  }
};

const submitBtnStyle = {
  py: 1.5, background: "linear-gradient(135deg, #3b82f6, #2563eb)", 
  fontWeight: 900, borderRadius: "12px", mt: 2,
  "&:hover": { background: "linear-gradient(135deg, #2563eb, #1d4ed8)" }
};