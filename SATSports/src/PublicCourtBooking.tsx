import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Alert,
} from "@mui/material";
import SportsTennisIcon from "@mui/icons-material/SportsTennis";
import API_BASE from "./api";

export default function PublicCourtBooking() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [court, setCourt] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setMsg(null);
    setError(null);

    if (!name || !date || !startTime || !endTime || !court) {
      setError("Please fill all required fields");
      return;
    }

    const res = await fetch(`${API_BASE}/api/court-bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        phone,
        court_name: court,
        booking_date: date,
        start_time: startTime,
        end_time: endTime,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.message || "Booking failed");
      return;
    }

    setMsg("🎉 Court booked successfully!");
    setName("");
    setPhone("");
    setDate("");
    setStartTime("");
    setEndTime("");
    setCourt(null);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      <Card
        sx={{
          width: "100%",
          maxWidth: 520,
          borderRadius: 4,
          boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
        }}
      >
        <CardContent>
          <Stack spacing={2}>
            <Box display="flex" alignItems="center" gap={1}>
              <SportsTennisIcon color="success" />
              <Typography variant="h5" fontWeight={700}>
                Book a Court
              </Typography>
            </Box>

            {msg && <Alert severity="success">{msg}</Alert>}
            {error && <Alert severity="error">{error}</Alert>}

            <TextField
              label="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
            />

            <TextField
              label="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              fullWidth
            />

            <TextField
              type="date"
              label="Date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />

            <Stack direction="row" spacing={2}>
              <TextField
                type="time"
                label="From"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />

              <TextField
                type="time"
                label="To"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Stack>

            <Box>
              <Typography fontWeight={600} mb={1}>
                Select Court
              </Typography>

              <ToggleButtonGroup
                value={court}
                exclusive
                onChange={(_, v) => setCourt(v)}
                fullWidth
              >
                {["Court 1", "Court 2", "Court 3", "Court 4"].map((c) => (
                  <ToggleButton
                    key={c}
                    value={c}
                    sx={{
                      borderRadius: 2,
                      fontWeight: 600,
                      textTransform: "none",
                    }}
                  >
                    🎾 {c}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Box>

            <Button
              variant="contained"
              size="large"
              onClick={submit}
              sx={{
                mt: 1,
                py: 1.5,
                fontSize: 16,
                fontWeight: 700,
                borderRadius: 3,
                background: "linear-gradient(135deg, #ff512f, #dd2476)",
                boxShadow: "0 8px 20px rgba(221,36,118,0.4)",
                ":hover": {
                  background: "linear-gradient(135deg, #dd2476, #ff512f)",
                },
              }}
            >
              🎾 Book Court
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
