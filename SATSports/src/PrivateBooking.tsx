import { useEffect, useState } from "react";
import {
  Box, Typography, TextField, Button,
  Select, MenuItem, Card, Stack
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

  useEffect(() => {
    fetch(`${API_BASE}/api/locations`)
      .then(res => res.json())
      .then(setLocations);
  }, []);

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
            displayEmpty
            onChange={e => setForm({...form,location_id:e.target.value})}
          >
            <MenuItem value="">Select Location</MenuItem>
            {locations.map(l => (
              <MenuItem key={l.id} value={l.id}>
                {l.name}
              </MenuItem>
            ))}
          </Select>

          <TextField type="date"
            onChange={e => setForm({...form,booking_date:e.target.value})} />

          <Select
            displayEmpty
            onChange={e => setForm({...form,time_slot:e.target.value})}
          >
            <MenuItem value="">Select Time</MenuItem>
            <MenuItem value="6-7 AM">6-7 AM</MenuItem>
            <MenuItem value="7-8 AM">7-8 AM</MenuItem>
            <MenuItem value="5-6 PM">5-6 PM</MenuItem>
          </Select>

          <Button variant="contained" onClick={submit}>
            Book Session
          </Button>

        </Stack>
      </Card>

    </Box>
  );
}