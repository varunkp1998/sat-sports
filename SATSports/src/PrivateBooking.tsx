import { useEffect, useState } from "react";
import {
  Box, Typography, TextField, Button,
  Select, MenuItem, Card, Stack
} from "@mui/material";
import API_BASE from "./api";

export default function PrivateBooking() {

  const [locations, setLocations] = useState([]);

useEffect(() => {
  fetch(`${API_BASE}/api/admin/locations`)
    .then(res => res.json())
    .then(setLocations)
    .catch(err => console.error("Failed to load locations", err));
}, []);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    location_id: "",
    booking_date: "",
    time_slot: ""
  });

  useEffect(() => {
    fetch(`${API_BASE}/api/locations`)
      .then(res => res.json())
      .then(setLocations);
  }, []);
  const generateSlots = () => {
    const slots = [];
  
    for (let i = 6; i <= 22; i++) {
      const hour = i > 12 ? i - 12 : i;
      const suffix = i >= 12 ? "PM" : "AM";
  
      slots.push(`${hour}:00 ${suffix}`);
    }
  
    return slots;
  };
  
  const timeSlots = generateSlots();
  const submit = async () => {
    await fetch(`${API_BASE}/api/private-bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    alert("Booking requested ✅");
  };

  return (
    <Box sx={{
      minHeight: "100vh",
      p: 3,
      background: "linear-gradient(180deg,#020617,#0f172a)"
    }}>

      <Typography variant="h4" color="white" mb={3}>
        🎾 Private Session
      </Typography>

      <Card sx={{ p: 3, borderRadius: 4 }}>
        <Stack spacing={2}>

          <TextField label="Name"
            onChange={e => setForm({...form,name:e.target.value})} />

          <TextField label="Email"
            onChange={e => setForm({...form,email:e.target.value})} />

          <TextField label="Phone"
            onChange={e => setForm({...form,phone:e.target.value})} />

<Select
  fullWidth
  displayEmpty
  value={form.location_id}
  onChange={(e) =>
    setForm({ ...form, location_id: e.target.value })
  }
  sx={{ mb: 2 }}
>
  <MenuItem value="">Select Location</MenuItem>

  {locations.map(loc => (
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
  sx={{ mb: 2 }}
/>

<Box sx={{ mb: 2 }}>
  <Typography mb={1}>Select Time</Typography>

  <Box
    sx={{
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: 1
    }}
  >
    {timeSlots.map(time => (
      <Button
        key={time}
        onClick={() =>
          setForm({ ...form, time_slot: time })
        }
        sx={{
          borderRadius: 3,
          py: 1,
          fontWeight: 600,
          transition: "0.2s",
          background:
            form.time_slot === time
              ? "linear-gradient(135deg,#f97316,#ef4444)"
              : "#f1f5f9",
          color:
            form.time_slot === time ? "white" : "black",
          "&:hover": {
            transform: "scale(1.05)"
          }
        }}
      >
        {time}
      </Button>
    ))}
  </Box>
</Box>

          <Button variant="contained" onClick={submit}>
            Book Session
          </Button>

        </Stack>
      </Card>

    </Box>
  );
}