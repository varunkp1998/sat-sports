import { useEffect, useState } from "react";
import {
    Box, Typography, TextField, Button,
    Select, MenuItem, Card, CardContent, Stack
  } from "@mui/material";
import API_BASE from "./api";

export default function PrivateBooking() {

  const [locations, setLocations] = useState([]);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    location_id: "",
    booking_date: "",
    time_slot: ""
  });

  // ✅ Load locations once
  useEffect(() => {
    fetch(`${API_BASE}/api/admin/locations`)
      .then(res => res.json())
      .then(setLocations)
      .catch(err => console.error("Failed to load locations", err));
  }, []);

  // ✅ Generate time slots (UI only)
  const generateSlots = () => {
    const slots = [];
    for (let i = 6; i <= 22; i++) {
      const hour = i > 12 ? i - 12 : i;
      const suffix = i >= 12 ? "PM" : "AM";
      slots.push(`${hour}:00 ${suffix}`);
    }
    return slots;
  };
  const inputStyle = {
    input: { color: "white" },
    label: { color: "#aaa" },
    "& .MuiOutlinedInput-root": {
      background: "rgba(255,255,255,0.05)",
      borderRadius: 2,
      "& fieldset": {
        borderColor: "rgba(255,255,255,0.2)"
      },
      "&:hover fieldset": {
        borderColor: "#3b82f6"
      },
      "&.Mui-focused fieldset": {
        borderColor: "#60a5fa"
      }
    }
  };
  const timeSlots = generateSlots();

  // ✅ Convert time before sending
  const convertTo24Hour = (timeStr) => {
    const [time, modifier] = timeStr.split(" ");
    let [hours, minutes] = time.split(":");

    if (modifier === "PM" && hours !== "12") {
      hours = String(parseInt(hours) + 12);
    }
    if (modifier === "AM" && hours === "12") {
      hours = "00";
    }

    return `${hours.padStart(2, "0")}:${minutes}:00`;
  };

  // ✅ Submit
  const submit = async () => {

    const payload = {
      name: form.name,
      email: form.email,
      phone: form.phone,
      location_id: form.location_id,
  
      // ✅ FIXED FIELD NAMES
      booking_date: form.booking_date,
      time_slot: convertTo24Hour(form.time_slot)
    };
    try {
      const res = await fetch(`${API_BASE}/api/private-bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      alert("Booking requested ✅");

      // reset form
      setForm({
        name: "",
        email: "",
        phone: "",
        location_id: "",
        booking_date: "",
        time_slot: ""
      });

    } catch (err) {
      console.error(err);
      alert(err.message || "Booking failed");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundImage: `
          linear-gradient(rgba(5,10,25,0.9), rgba(5,10,25,0.95)),
          url('/tennis-bg.jpg')
        `,
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2
      }}
    >
      <Card
        sx={{
          width: "100%",
          maxWidth: 520,
          borderRadius: 5,
          backdropFilter: "blur(25px)",
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.15)",
          boxShadow: "0 40px 100px rgba(0,0,0,0.8)",
          color: "white"
        }}
      >
        <CardContent sx={{ p: 4 }}>
  
          {/* Title */}
          <Box textAlign="center" mb={3}>
            <Typography variant="h5" fontWeight={700}>
              🎾 Private Session
            </Typography>
            <Typography color="gray">
              Book your court session
            </Typography>
          </Box>
  
          <Stack spacing={2}>
  
            <TextField
              label="Full Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              fullWidth
              sx={inputStyle}
            />
  
            <TextField
              label="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              fullWidth
              sx={inputStyle}
            />
  
            <TextField
              label="Phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              fullWidth
              sx={inputStyle}
            />
  
            <Select
              fullWidth
              value={form.location_id}
              displayEmpty
              onChange={(e) =>
                setForm({ ...form, location_id: e.target.value })
              }
              sx={inputStyle}
            >
              <MenuItem value="">Select Location</MenuItem>
              {locations.map((loc) => (
                <MenuItem key={loc.id} value={loc.id}>
                  {loc.name}
                </MenuItem>
              ))}
            </Select>
  
            <TextField
              type="date"
              fullWidth
              value={form.booking_date}
              onChange={(e) =>
                setForm({ ...form, booking_date: e.target.value })
              }
              inputProps={{
                min: new Date().toISOString().split("T")[0]
              }}
              sx={inputStyle}
            />
  
            {/* Time Slots */}
            <Box>
              <Typography mb={1}>Select Time</Typography>
  
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 1
                }}
              >
                {timeSlots.map((time) => (
                  <Button
                    key={time}
                    onClick={() =>
                      setForm({ ...form, time_slot: time })
                    }
                    sx={{
                      borderRadius: 2,
                      fontWeight: 600,
                      py: 1,
                      background:
                        form.time_slot === time
                          ? "linear-gradient(90deg,#3b82f6,#2563eb)"
                          : "rgba(255,255,255,0.08)",
                      color: "white",
                      border:
                        form.time_slot === time
                          ? "none"
                          : "1px solid rgba(255,255,255,0.2)"
                    }}
                  >
                    {time}
                  </Button>
                ))}
              </Box>
            </Box>
  
            <Button
              variant="contained"
              size="large"
              onClick={submit}
              sx={{
                mt: 2,
                borderRadius: 3,
                background: "linear-gradient(90deg,#3b82f6,#2563eb)",
                fontWeight: 700,
                boxShadow: "0 15px 40px rgba(37,99,235,0.6)"
              }}
            >
              Book Session 🚀
            </Button>
  
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}