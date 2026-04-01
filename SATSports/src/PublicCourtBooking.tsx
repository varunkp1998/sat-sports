import { useState } from "react";
import {
  Box, Card, CardContent, Typography, TextField, Button, Stack,
  ToggleButton, ToggleButtonGroup, Alert, Container,
  InputAdornment, IconButton, Fade, CircularProgress
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
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
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setMsg(null);
    setError(null);

    if (!name || !date || !startTime || !endTime || !court) {
      setError("Please fill all required fields");
      return;
    }

    setLoading(true);

    try {
      // 🔹 CREATE ORDER
      const res = await fetch(`${API_BASE}/api/payment/create-order-court`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          court_name: court,
          start_time: startTime,
          end_time: endTime
        })
      });

      const { order } = await res.json();

      // 🔹 OPEN PAYMENT
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY,
        amount: order.amount,
        currency: "INR",
        name: "SAT Sports",
        description: "Court Booking",
        order_id: order.id,

        handler: async function (response: any) {
          const verifyRes = await fetch(`${API_BASE}/api/payment/verify-court`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              ...response,
              name,
              phone,
              court_name: court,
              booking_date: date,
              start_time: startTime,
              end_time: endTime
            })
          });

          const result = await verifyRes.json();

          if (result.success) {
            setMsg("🎉 Payment successful & Court booked!");
            setName(""); setPhone(""); setDate("");
            setStartTime(""); setEndTime(""); setCourt(null);
          } else {
            setError("Payment verification failed");
          }
        },

        prefill: {
          name,
          contact: phone
        },

        theme: { color: "#ef4444" }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();

    } catch (err) {
      console.error(err);
      setError("Payment failed");
    }

    setLoading(false);
  };

  return (
    <Box sx={{
      minHeight: "100vh",
      bgcolor: "#020617",
      color: "white",
      py: 6
    }}>
      <Container maxWidth="sm">

        <IconButton onClick={() => window.history.back()} sx={{ color: "white", mb: 2 }}>
          <ArrowBackIcon />
        </IconButton>

        <Typography variant="h4" fontWeight={900} textAlign="center" mb={3}>
          COURT BOOKING 🎾
        </Typography>

        <Card sx={{
          bgcolor: "#0f172a",
          borderRadius: 4,
          border: "1px solid rgba(255,255,255,0.1)"
        }}>
          <CardContent>
            <Stack spacing={2.5}>

              {msg && <Fade in><Alert severity="success">{msg}</Alert></Fade>}
              {error && <Fade in><Alert severity="error">{error}</Alert></Fade>}

              <TextField
                label="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                fullWidth sx={inputStyle}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><PersonIcon /></InputAdornment>
                }}
              />

              <TextField
                label="Phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                fullWidth sx={inputStyle}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><PhoneIcon /></InputAdornment>
                }}
              />

              <TextField
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                fullWidth sx={inputStyle}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><CalendarMonthIcon /></InputAdornment>
                }}
              />

              <Stack direction="row" spacing={2}>
                <TextField
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  fullWidth sx={inputStyle}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  fullWidth sx={inputStyle}
                  InputLabelProps={{ shrink: true }}
                />
              </Stack>

              <ToggleButtonGroup
                value={court}
                exclusive
                onChange={(_, v) => setCourt(v)}
                fullWidth
              >
                {["Court 1", "Court 2", "Court 3", "Court 4"].map((c) => (
                  <ToggleButton key={c} value={c}>
                    {c}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>

              <Button
                fullWidth
                variant="contained"
                onClick={submit}
                disabled={loading}
                sx={{
                  py: 1.5,
                  fontWeight: 800,
                  background: "linear-gradient(135deg,#ef4444,#f97316)"
                }}
              >
                {loading ? <CircularProgress size={24} /> : "Pay & Book"}
              </Button>

            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

const inputStyle = {
  "& .MuiOutlinedInput-root": {
    color: "#fff",
    "& fieldset": { borderColor: "rgba(255,255,255,0.2)" },
    "&.Mui-focused fieldset": { borderColor: "#ef4444" }
  },
  "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.7)" }
};