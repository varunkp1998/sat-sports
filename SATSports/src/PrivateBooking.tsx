import React, { useEffect, useState } from "react";
import {
  Box, Typography, Button, TextField, Card, CardContent,
  Stack, Container, IconButton, InputAdornment, Grid, MenuItem
} from "@mui/material";
import { LocalizationProvider, TimePicker, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import dayjs from "dayjs";

const API_BASE = "";

export default function PrivateBooking() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);

  const [startTime, setStartTime] = useState(dayjs().hour(7).minute(0));
  const [endTime, setEndTime] = useState(dayjs().hour(8).minute(0));
  const [bookingDate, setBookingDate] = useState(dayjs());

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    location_id: ""
  });

  useEffect(() => {
    fetch(`${API_BASE}/api/admin/locations`)
      .then(res => res.json())
      .then(setLocations);
  }, []);

  const submit = async () => {
    if (!form.name || !form.email || !form.phone || !form.location_id) {
      alert("Fill all fields");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...form,
        booking_date: bookingDate.format("YYYY-MM-DD"),
        start_time: startTime.format("HH:mm"), // ✅ FIXED
        end_time: endTime.format("HH:mm")      // ✅ FIXED
      };

      const res = await fetch(`${API_BASE}/api/private-bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok) {
        alert("Booking successful 🎾");
      } else {
        alert(data.message);
      }
    } catch {
      alert("Network error");
    }

    setLoading(false);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ minHeight: "100vh", bgcolor: "#020617", py: 6 }}>
        <Container maxWidth="sm">

          <IconButton sx={{ color: "white" }}>
            <ArrowBackIcon />
          </IconButton>

          <Typography variant="h4" color="white" textAlign="center" mb={3}>
            BOOK SESSION
          </Typography>

          <Card sx={cardStyle}>
            <CardContent>
              <Stack spacing={2.5}>

                <TextField
                  label="Name"
                  fullWidth
                  sx={inputStyle}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><PersonIcon /></InputAdornment>
                  }}
                />

                <TextField
                  label="Email"
                  fullWidth
                  sx={inputStyle}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><EmailIcon /></InputAdornment>
                  }}
                />

                <TextField
                  label="Phone"
                  fullWidth
                  sx={inputStyle}
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><PhoneIcon /></InputAdornment>
                  }}
                />

                <TextField
                  select
                  label="Location"
                  fullWidth
                  sx={inputStyle}
                  value={form.location_id}
                  onChange={(e) => setForm({ ...form, location_id: e.target.value })}
                >
                  {locations.map((loc) => (
                    <MenuItem key={loc.id} value={loc.id}>
                      {loc.name}
                    </MenuItem>
                  ))}
                </TextField>

                <DatePicker
                  label="Date"
                  value={bookingDate}
                  onChange={setBookingDate}
                  slotProps={{ textField: { fullWidth: true, sx: inputStyle } }}
                />

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TimePicker
                      label="Start"
                      value={startTime}
                      onChange={setStartTime}
                      slotProps={{ textField: { fullWidth: true, sx: inputStyle } }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TimePicker
                      label="End"
                      value={endTime}
                      onChange={setEndTime}
                      slotProps={{ textField: { fullWidth: true, sx: inputStyle } }}
                    />
                  </Grid>
                </Grid>

                <Button
                  fullWidth
                  variant="contained"
                  onClick={submit}
                  disabled={loading}
                  sx={btnStyle}
                >
                  {loading ? "Sending..." : "Book Now 🚀"}
                </Button>

              </Stack>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </LocalizationProvider>
  );
}

const cardStyle = {
  bgcolor: "#0f172a",
  borderRadius: 4,
  border: "1px solid rgba(255,255,255,0.1)"
};

const inputStyle = {
  "& .MuiOutlinedInput-root": {
    backgroundColor: "transparent",
    color: "#fff",
    "& fieldset": { borderColor: "rgba(255,255,255,0.2)" },
    "&:hover fieldset": { borderColor: "#3b82f6" },
    "&.Mui-focused fieldset": { borderColor: "#3b82f6" }
  },

  "& .MuiInputBase-input": {
    color: "#fff !important",
    WebkitTextFillColor: "#fff !important"
  },

  "& .MuiInputLabel-root": {
    color: "rgba(255,255,255,0.7)"
  },

  "& .MuiSvgIcon-root": {
    color: "#3b82f6"
  },

  // 🔥 FIX CHROME AUTOFILL BLACK TEXT
  "& input:-webkit-autofill": {
    WebkitBoxShadow: "0 0 0 1000px #0f172a inset !important",
    WebkitTextFillColor: "#fff !important"
  }
};

const btnStyle = {
  py: 1.5,
  background: "linear-gradient(135deg,#3b82f6,#2563eb)",
  fontWeight: 700
};