import { useEffect, useState } from "react";
import {
  Box, Typography, TextField, Button,
  Select, MenuItem, Card, CardContent, Stack, Container, IconButton, InputAdornment, Grid
} from "@mui/material";
import { motion } from "framer-motion";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import API_BASE from "./api";

const MotionBox = motion(Box);

export default function PrivateBooking() {
  const [locations, setLocations] = useState([]);
  const [form, setForm] = useState({
    name: "", email: "", phone: "", location_id: "",
    booking_date: "", time_slot: ""
  });

  useEffect(() => {
    fetch(`${API_BASE}/api/admin/locations`)
      .then(res => res.json())
      .then(setLocations)
      .catch(err => console.error("Failed to load locations", err));
  }, []);

  const generateSlots = () => {
    const slots = [];
    for (let i = 6; i <= 21; i++) { // Adjusted to 9 PM max
      const hour = i > 12 ? i - 12 : i;
      const suffix = i >= 12 ? "PM" : "AM";
      slots.push(`${hour}:00 ${suffix}`);
    }
    return slots;
  };

  const timeSlots = generateSlots();

  const convertTo24Hour = (timeStr) => {
    const [time, modifier] = timeStr.split(" ");
    let [hours] = time.split(":");
    if (modifier === "PM" && hours !== "12") hours = String(parseInt(hours) + 12);
    if (modifier === "AM" && hours === "12") hours = "00";
    return `${hours.padStart(2, "0")}:00:00`;
  };

  const submit = async () => {
    if (!form.name || !form.time_slot || !form.location_id) {
      alert("Please fill in all required fields.");
      return;
    }
    const payload = { ...form, time_slot: convertTo24Hour(form.time_slot) };
    try {
      const res = await fetch(`${API_BASE}/api/private-bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        alert("Booking requested ✅");
        setForm({ name: "", email: "", phone: "", location_id: "", booking_date: "", time_slot: "" });
      }
    } catch (err) { alert("Booking failed"); }
  };

  return (
    <Box sx={{ 
      minHeight: "100vh", bgcolor: "#020617", color: "white", py: 6,
      background: "radial-gradient(circle at top right, rgba(59, 130, 246, 0.1), transparent), #020617"
    }}>
      <Container maxWidth="sm">
        <IconButton onClick={() => window.history.back()} sx={{ color: "white", mb: 2 }}>
          <ArrowBackIcon />
        </IconButton>

        <MotionBox initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Box textAlign="center" mb={4}>
            <Typography variant="h3" fontWeight={900} sx={{ letterSpacing: -1 }}>
              BOOK A <span style={{ color: "#3b82f6" }}>SESSION</span>
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.5)" }}>
              Reserve your personalized coaching or court time
            </Typography>
          </Box>

          <Card sx={{ 
            borderRadius: 6, bgcolor: "rgba(255,255,255,0.02)", 
            backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)"
          }}>
            <CardContent sx={{ p: 4 }}>
              <Stack spacing={3}>
                
                {/* PERSONAL INFO SECTION */}
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

                <Divider sx={{ borderColor: "rgba(255,255,255,0.1)" }} />

                {/* LOGISTICS SECTION */}
                <Typography variant="caption" fontWeight={800} sx={{ color: "#3b82f6", letterSpacing: 1 }}>
                  STEP 2: SESSION LOGISTICS
                </Typography>

                <Select
                  fullWidth sx={inputStyle} value={form.location_id} displayEmpty
                  onChange={(e) => setForm({ ...form, location_id: e.target.value })}
                  startAdornment={<InputAdornment position="start"><LocationOnIcon sx={{color: '#3b82f6', ml: 1}}/></InputAdornment>}
                >
                  <MenuItem value="">Select Location</MenuItem>
                  {locations.map((loc) => <MenuItem key={loc.id} value={loc.id}>{loc.name}</MenuItem>)}
                </Select>

                <TextField
                  type="date" fullWidth sx={inputStyle} value={form.booking_date}
                  onChange={(e) => setForm({ ...form, booking_date: e.target.value })}
                  InputProps={{ startAdornment: <InputAdornment position="start"><CalendarMonthIcon sx={{color: '#3b82f6'}}/></InputAdornment> }}
                />

                <Box>
                  <Typography variant="body2" sx={{ mb: 1.5, color: "rgba(255,255,255,0.6)", fontWeight: 700 }}>
                    CHOOSE A TIME SLOT
                  </Typography>
                  <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1 }}>
                    {timeSlots.map((time) => (
                      <Button
                        key={time}
                        onClick={() => setForm({ ...form, time_slot: time })}
                        sx={{
                          borderRadius: 2, py: 1, fontSize: "0.75rem",
                          bgcolor: form.time_slot === time ? "#3b82f6" : "rgba(255,255,255,0.05)",
                          color: "white", border: "1px solid rgba(255,255,255,0.1)",
                          "&:hover": { bgcolor: "#2563eb" }
                        }}
                      >
                        {time}
                      </Button>
                    ))}
                  </Box>
                </Box>

                <Button
                  fullWidth size="large" variant="contained" onClick={submit}
                  sx={{
                    py: 2, borderRadius: 4, fontWeight: 900,
                    background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                    boxShadow: "0 15px 30px rgba(37, 99, 235, 0.4)",
                    "&:hover": { transform: "translateY(-2px)", boxShadow: "0 20px 40px rgba(37, 99, 235, 0.5)" },
                    transition: "all 0.3s"
                  }}
                >
                  REQUEST BOOKING 🚀
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </MotionBox>
      </Container>
    </Box>
  );
}

const Divider = ({sx}) => <Box sx={{ height: '1px', bgcolor: 'rgba(255,255,255,0.1)', my: 2, ...sx }} />;

const inputStyle = {
  "& .MuiOutlinedInput-root": {
    color: "white",
    "& fieldset": { borderColor: "rgba(255,255,255,0.1)", borderRadius: "12px" },
    "&:hover fieldset": { borderColor: "rgba(255,255,255,0.3)" },
    "&.Mui-focused fieldset": { borderColor: "#3b82f6" },
    bgcolor: "rgba(255,255,255,0.02)"
  },
  "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.5)" },
  "& .MuiInputLabel-root.Mui-focused": { color: "#3b82f6" },
  "& .MuiSvgIcon-root": { color: "white" }
};