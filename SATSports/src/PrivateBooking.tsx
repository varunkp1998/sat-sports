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

  // ✅ Load locations once
  useEffect(() => {
    fetch(`${API_BASE}/locations`)
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
    if (!form.name || !form.email || !form.phone || !form.location_id || !form.booking_date || !form.time_slot) {
      return alert("Please fill all fields");
    }

    const payload = {
      name: form.name,
      email: form.email,
      phone: form.phone,
      location_id: form.location_id,
      session_date: form.booking_date,
      start_time: convertTo24Hour(form.time_slot)
    };

    try {
      const res = await fetch(`${API_BASE}/private-bookings`, {
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
        p: 3,
        background: "linear-gradient(180deg,#020617,#0f172a)"
      }}
    >
      <Typography variant="h4" color="white" mb={3}>
        🎾 Private Session Booking
      </Typography>

      <Card sx={{ p: 3, borderRadius: 4, maxWidth: 500 }}>
        <Stack spacing={2}>

          <TextField
            label="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <TextField
            label="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <TextField
            label="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />

          <Select
            value={form.location_id}
            displayEmpty
            onChange={(e) =>
              setForm({ ...form, location_id: e.target.value })
            }
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
            value={form.booking_date}
            onChange={(e) =>
              setForm({ ...form, booking_date: e.target.value })
            }
            inputProps={{
              min: new Date().toISOString().split("T")[0]
            }}
          />

          {/* Time Slots */}
          <Box>
            <Typography mb={1}>Select Time</Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
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
                    background:
                      form.time_slot === time
                        ? "#2563eb"
                        : "#e2e8f0",
                    color:
                      form.time_slot === time ? "white" : "black"
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
            sx={{ borderRadius: 3 }}
          >
            Book Session 🚀
          </Button>

        </Stack>
      </Card>
    </Box>
  );
}