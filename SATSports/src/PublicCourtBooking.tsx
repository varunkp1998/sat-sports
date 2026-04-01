import { useState } from "react";
import {
  Box, Card, CardContent, Typography, TextField, Button, Stack,
  ToggleButton, ToggleButtonGroup, Alert, Container,
  InputAdornment, IconButton, Fade, CircularProgress, Grid
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
      const res = await fetch(`${API_BASE}/api/payment/create-order-court`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          court_name: court,
          start_time: startTime,
          end_time: endTime
        })
      });

      const { order } = await res.json();

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
            headers: { "Content-Type": "application/json" },
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

        prefill: { name, contact: phone },
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
    <Box sx={pageStyle}>
      <Container maxWidth="sm">

        {/* BACK */}
        <IconButton onClick={() => window.history.back()} sx={{ color: "white", mb: 2 }}>
          <ArrowBackIcon />
        </IconButton>

        {/* TITLE */}
        <Typography variant="h4" textAlign="center" fontWeight={900} mb={4}>
          COURT BOOKING 🎾
        </Typography>

        <Card sx={glassCard}>
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <Stack spacing={3}>

              {msg && <Fade in><Alert severity="success">{msg}</Alert></Fade>}
              {error && <Fade in><Alert severity="error">{error}</Alert></Fade>}

              {/* NAME */}
              <TextField
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                fullWidth
                sx={inputStyle}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon />
                    </InputAdornment>
                  )
                }}
              />

              {/* PHONE */}
              <TextField
                label="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                fullWidth
                sx={inputStyle}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon />
                    </InputAdornment>
                  )
                }}
              />

              {/* DATE */}
              <TextField
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                fullWidth
                sx={inputStyle}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarMonthIcon />
                    </InputAdornment>
                  )
                }}
              />

              {/* TIME */}
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    fullWidth
                    sx={inputStyle}
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AccessTimeIcon />
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    fullWidth
                    sx={inputStyle}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>

              {/* COURTS */}
              <Box>
                <Typography fontWeight={800} mb={1} color="rgba(255,255,255,0.6)">
                  SELECT COURT
                </Typography>

                <ToggleButtonGroup
                  value={court}
                  exclusive
                  onChange={(_, v) => setCourt(v)}
                  fullWidth
                  sx={{ gap: 1 }}
                >
                  {["Court 1", "Court 2", "Court 3", "Court 4"].map((c) => (
                    <ToggleButton key={c} value={c} sx={toggleStyle(court === c)}>
                      {c}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              </Box>

              {/* BUTTON */}
              <Button
                fullWidth
                onClick={submit}
                disabled={loading}
                sx={btnStyle}
              >
                {loading ? <CircularProgress size={24} sx={{ color: "white" }} /> : "PAY & BOOK 🚀"}
              </Button>

            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

/* ---------------- STYLES ---------------- */

const pageStyle = {
  minHeight: "100vh",
  bgcolor: "#020617",
  py: { xs: 3, sm: 6 }
};

const glassCard = {
  borderRadius: "20px",
  background: "rgba(255,255,255,0.03)",
  backdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.1)",
  boxShadow: "0 20px 60px rgba(0,0,0,0.5)"
};

const inputStyle = {
  "& .MuiOutlinedInput-root": {
    background: "rgba(255,255,255,0.03)",
    borderRadius: "14px",
    "& fieldset": {
      borderColor: "rgba(255,255,255,0.15)"
    },
    "&:hover fieldset": {
      borderColor: "#ef4444"
    },
    "&.Mui-focused fieldset": {
      borderColor: "#ef4444"
    }
  },
  "& .MuiInputBase-input": {
    color: "#fff !important",
    WebkitTextFillColor: "#fff !important"
  },
  "& .MuiInputLabel-root": {
    color: "rgba(255,255,255,0.6)"
  },
  "& .MuiSvgIcon-root": {
    color: "#ef4444"
  }
};

const toggleStyle = (selected: boolean) => ({
  flex: 1,
  py: 1.5,
  fontWeight: 800,
  color: "white",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "12px",
  background: selected
    ? "linear-gradient(135deg,#ef4444,#f97316)"
    : "rgba(255,255,255,0.05)",
  "&:hover": {
    background: selected
      ? "linear-gradient(135deg,#dc2626,#ea580c)"
      : "rgba(255,255,255,0.1)"
  }
});

const btnStyle = {
  py: 1.6,
  fontWeight: 900,
  borderRadius: "14px",
  fontSize: "16px",
  background: "linear-gradient(135deg,#ef4444,#f97316)",
  boxShadow: "0 10px 30px rgba(239,68,68,0.4)",
  transition: "all 0.3s",
  "&:hover": {
    transform: "translateY(-2px)",
    filter: "brightness(1.1)"
  }
};