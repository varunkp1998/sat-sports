import React, { useEffect, useState } from "react";
import {
  Box, Typography, Button, TextField, Card, CardContent,
  Stack, Container, IconButton, InputAdornment, Grid, MenuItem,
  CircularProgress
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import {
  LocalizationProvider,
  DatePicker,
  TimePicker
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import dayjs from "dayjs";
import API_BASE from "./api";

/* ---------------- THEME ---------------- */
const darkTheme = createTheme({
  palette: { mode: "dark" }
});

export default function PrivateBooking() {
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [price, setPrice] = useState<number | null>(null);
  const [priceLoading, setPriceLoading] = useState(false);

  const [startTime, setStartTime] = useState(dayjs().hour(7).minute(0));
  const [endTime, setEndTime] = useState(dayjs().hour(8).minute(0));
  const [bookingDate, setBookingDate] = useState(dayjs());

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    location_id: ""
  });

  /* ---------------- LOAD LOCATIONS ---------------- */
  useEffect(() => {
    fetch(`${API_BASE}/api/admin/locations`)
      .then(res => res.json())
      .then(setLocations);
  }, []);

  /* ---------------- FETCH PRICE ---------------- */
  useEffect(() => {
    if (!form.location_id) return;

    setPriceLoading(true);

    fetch(`${API_BASE}/api/private-booking-price/${form.location_id}`)
      .then(res => res.json())
      .then(data => setPrice(data.price))
      .catch(() => setPrice(null))
      .finally(() => setPriceLoading(false));

  }, [form.location_id]);

  /* ---------------- PAYMENT FLOW ---------------- */
  const handlePayment = async () => {
    if (!form.name || !form.email || !form.phone || !form.location_id) {
      alert("Fill all fields");
      return;
    }

    setLoading(true);

    try {
      // 1️⃣ CREATE ORDER
      const res = await fetch(`${API_BASE}/api/payment/create-order-private`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location_id: form.location_id })
      });

      const { order, price } = await res.json();

      // 2️⃣ OPEN RAZORPAY
      const options = {
        key: "YOUR_RAZORPAY_KEY", // 🔥 replace
        amount: order.amount,
        currency: "INR",
        name: "SAT Sports",
        description: "Private Session",
        order_id: order.id,

        handler: async function (response: any) {

          // 3️⃣ VERIFY PAYMENT + CREATE BOOKING
          const verifyRes = await fetch(`${API_BASE}/api/payment/verify-private`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...response,
              ...form,
              booking_date: bookingDate.format("YYYY-MM-DD"),
              start_time: startTime.format("HH:mm"),
              end_time: endTime.format("HH:mm")
            })
          });

          const result = await verifyRes.json();

          if (result.success) {
            alert("✅ Booking Confirmed!");
          } else {
            alert("Verification failed");
          }
        },

        prefill: {
          name: form.name,
          email: form.email,
          contact: form.phone
        },

        theme: { color: "#3b82f6" }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();

    } catch (err) {
      console.error(err);
      alert("Payment failed");
    }

    setLoading(false);
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Box sx={{ minHeight: "100vh", bgcolor: "#020617", py: 4 }}>
          <Container maxWidth="sm">

            <IconButton sx={{ color: "#fff" }}>
              <ArrowBackIcon />
            </IconButton>

            <Typography variant="h4" textAlign="center" fontWeight={800} mb={3}>
              BOOK PRIVATE SESSION
            </Typography>

            <Card sx={{ bgcolor: "#0f172a", borderRadius: 4 }}>
              <CardContent>
                <Stack spacing={2.5}>

                  {/* NAME */}
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

                  {/* EMAIL */}
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

                  {/* PHONE */}
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

                  {/* LOCATION */}
                  <TextField
                    select
                    label="Location"
                    fullWidth
                    sx={inputStyle}
                    value={form.location_id}
                    onChange={(e) => setForm({ ...form, location_id: e.target.value })}
                  >
                    {locations.map((loc) => (
                      <MenuItem key={loc.id} value={loc.id}>{loc.name}</MenuItem>
                    ))}
                  </TextField>

                  {/* PRICE DISPLAY */}
                  {priceLoading ? (
                    <CircularProgress />
                  ) : price ? (
                    <Box sx={{ display: "flex", alignItems: "center", color: "#22c55e" }}>
                      <CurrencyRupeeIcon />
                      <Typography fontWeight={800}>
                        {price} / session
                      </Typography>
                    </Box>
                  ) : null}

                  {/* DATE */}
                  <DatePicker
                    label="Date"
                    value={bookingDate}
                    onChange={setBookingDate}
                    slotProps={{ textField: { fullWidth: true, sx: inputStyle } }}
                  />

                  {/* TIME */}
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TimePicker
                        label="Start"
                        value={startTime}
                        onChange={setStartTime}
                        slotProps={{ textField: { fullWidth: true, sx: inputStyle } }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TimePicker
                        label="End"
                        value={endTime}
                        onChange={setEndTime}
                        slotProps={{ textField: { fullWidth: true, sx: inputStyle } }}
                      />
                    </Grid>
                  </Grid>

                  {/* BUTTON */}
                  <Button
                    fullWidth
                    variant="contained"
                    disabled={loading || !price}
                    onClick={handlePayment}
                    sx={btnStyle}
                  >
                    {loading ? "Processing..." : `Pay ₹${price || ""} & Book`}
                  </Button>

                </Stack>
              </CardContent>
            </Card>
          </Container>
        </Box>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

/* ---------------- STYLES ---------------- */

const inputStyle = {
  "& .MuiOutlinedInput-root": {
    backgroundColor: "transparent",
    "& fieldset": { borderColor: "rgba(255,255,255,0.2)" },
    "&.Mui-focused fieldset": { borderColor: "#3b82f6" }
  },
  "& .MuiInputBase-input": {
    color: "#fff !important",
    WebkitTextFillColor: "#fff !important"
  },
  "& .MuiInputLabel-root": {
    color: "rgba(255,255,255,0.7)"
  },
  "& input:-webkit-autofill": {
    WebkitBoxShadow: "0 0 0 1000px #0f172a inset !important",
    WebkitTextFillColor: "#fff !important"
  }
};

const btnStyle = {
  py: 1.5,
  fontWeight: 800,
  borderRadius: "12px",
  background: "linear-gradient(135deg,#3b82f6,#2563eb)"
};