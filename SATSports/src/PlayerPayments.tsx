import { useEffect, useState } from "react";
import {
  Box, Button, Card, Typography, Select, MenuItem, Table, TableHead, 
  TableRow, TableCell, TableBody, Grid, Container, Stack, Paper, Chip, 
  InputLabel, FormControl, Divider, useTheme, useMediaQuery
} from "@mui/material";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import HistoryIcon from "@mui/icons-material/History";
import ReceiptIcon from "@mui/icons-material/Receipt";
import { motion } from "framer-motion";
import API_BASE from "./api";

const MotionBox = motion(Box);

declare global { interface Window { Razorpay: any; } }

export default function PlayerPayments() {
  const [plan, setPlan] = useState("monthly");
  const [sessions, setSessions] = useState(8);
  const [programs, setPrograms] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState("");
  const [pricing, setPricing] = useState([]);
  const [amount, setAmount] = useState(0);
  const [payments, setPayments] = useState([]);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const playerId = localStorage.getItem("userId");

  useEffect(() => {
    fetch(`${API_BASE}/api/programs`).then(res => res.json()).then(setPrograms);
    fetch(`${API_BASE}/api/player/payments/${playerId}`).then(res => res.json()).then(setPayments);
  }, [playerId]);

  useEffect(() => {
    if (!selectedProgram) return;
    fetch(`${API_BASE}/api/programs/${selectedProgram}/pricing`)
      .then(res => res.json())
      .then(data => setPricing(data));
  }, [selectedProgram]);

  useEffect(() => {
    const p = pricing.find(p => p.sessions_per_month === sessions);
    if (!p) return;
    const priceMap: any = { weekly: p.price_weekly, monthly: p.price_monthly, yearly: p.price_yearly };
    setAmount(priceMap[plan] || 0);
  }, [plan, sessions, pricing]);

  const handlePayment = async () => {
    if (!window.Razorpay) { alert("Razorpay SDK not loaded"); return; }

    const res = await fetch(`${API_BASE}/api/payment/create-order`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ amount, plan, playerId, programId: selectedProgram, sessions })
    });

    const order = await res.json();

    const options = {
      key: "rzp_test_YOUR_KEY", 
      amount: order.amount,
      currency: "INR",
      name: "SAT Sports Academy",
      description: `${sessions} sessions - ${plan}`,
      order_id: order.id,
      theme: { color: "#ef4444" },
      handler: async (response: any) => {
        await fetch(`${API_BASE}/api/payment/verify`, {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({ ...response, playerId, plan, amount, programId: selectedProgram, sessions })
        });
        alert("Payment Successful");
        window.location.reload();
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#020617", color: "white", py: 6 }}>
      <Container maxWidth="md">
        
        <Stack direction="row" alignItems="center" spacing={2} mb={4}>
          <AccountBalanceWalletIcon sx={{ fontSize: 40, color: "#ef4444" }} />
          <Typography variant="h3" fontWeight={900}>PAYMENTS</Typography>
        </Stack>

        <Grid container spacing={4}>
          {/* 🔥 PAYMENT SELECTION CARD */}
          <Grid item xs={12} md={5}>
            <MotionBox initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <Card sx={glassStyle}>
                <Typography variant="h6" fontWeight={800} mb={3}>Subscription Setup</Typography>
                
                <Stack spacing={3}>
                  <FormControl fullWidth sx={selectStyle}>
                    <InputLabel>Select Program</InputLabel>
                    <Select value={selectedProgram} label="Select Program" onChange={(e) => setSelectedProgram(e.target.value)}>
                      {programs.map(p => <MenuItem key={p.id} value={p.id}>{p.title}</MenuItem>)}
                    </Select>
                  </FormControl>

                  <Stack direction="row" spacing={2}>
                    <FormControl fullWidth sx={selectStyle}>
                      <InputLabel>Sessions</InputLabel>
                      <Select value={sessions} label="Sessions" onChange={(e) => setSessions(Number(e.target.value))}>
                        <MenuItem value={8}>8 Sessions</MenuItem>
                        <MenuItem value={12}>12 Sessions</MenuItem>
                      </Select>
                    </FormControl>

                    <FormControl fullWidth sx={selectStyle}>
                      <InputLabel>Plan</InputLabel>
                      <Select value={plan} label="Plan" onChange={(e) => setPlan(e.target.value)}>
                        <MenuItem value="weekly">Weekly</MenuItem>
                        <MenuItem value="monthly">Monthly</MenuItem>
                        <MenuItem value="yearly">Yearly</MenuItem>
                      </Select>
                    </FormControl>
                  </Stack>

                  <Box sx={{ p: 2, borderRadius: 2, bgcolor: "rgba(255,255,255,0.05)", textAlign: 'center' }}>
                    <Typography variant="caption" color="rgba(255,255,255,0.5)">TOTAL AMOUNT</Typography>
                    <Typography variant="h4" fontWeight={900} color="#ef4444">₹{amount}</Typography>
                  </Box>

                  <Button
                    variant="contained" fullWidth size="large" onClick={handlePayment} disabled={!amount}
                    sx={{
                      py: 2, borderRadius: 3, fontWeight: 900,
                      background: "linear-gradient(135deg, #f97316, #ef4444)",
                      boxShadow: "0 10px 20px rgba(239, 68, 68, 0.3)",
                      "&:hover": { filter: "brightness(1.1)" }
                    }}
                  >
                    PROCEED TO PAY
                  </Button>
                </Stack>
              </Card>
            </MotionBox>
          </Grid>

          {/* 🔥 PAYMENT HISTORY */}
          <Grid item xs={12} md={7}>
            <MotionBox initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                <HistoryIcon sx={{ color: "rgba(255,255,255,0.5)" }} />
                <Typography variant="h6" fontWeight={700}>Transaction History</Typography>
              </Stack>

              <Paper sx={{ ...glassStyle, p: 0, overflow: 'hidden' }}>
                <Table size={isMobile ? "small" : "medium"}>
                  <TableHead sx={{ bgcolor: "rgba(255,255,255,0.05)" }}>
                    <TableRow>
                      <TableCell sx={headerStyle}>Program</TableCell>
                      <TableCell sx={headerStyle}>Sessions</TableCell>
                      <TableCell sx={headerStyle}>Amount</TableCell>
                      <TableCell sx={headerStyle}>Invoice</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {payments.map((p, i) => (
                      <TableRow key={i} sx={{ "&:hover": { bgcolor: "rgba(255,255,255,0.02)" } }}>
                        <TableCell sx={cellStyle}>
                            <Typography variant="body2" fontWeight={700}>{p.program_name}</Typography>
                            <Typography variant="caption" color="gray">{new Date(p.date).toLocaleDateString()}</Typography>
                        </TableCell>
                        <TableCell sx={cellStyle}>{p.sessions} Sssns</TableCell>
                        <TableCell sx={cellStyle}><Typography fontWeight={700}>₹{p.amount}</Typography></TableCell>
                        <TableCell sx={cellStyle}>
                          <IconButton href={p.invoice_url} target="_blank" sx={{ color: "#ef4444" }}>
                            <ReceiptIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </Stack>
                </TableBody>
              </Paper>
            </MotionBox>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

// 🎨 Styles
const glassStyle = {
  p: 3,
  borderRadius: 5,
  background: "rgba(255,255,255,0.03)",
  backdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "white"
};

const selectStyle = {
  "& .MuiOutlinedInput-root": {
    color: "white",
    "& fieldset": { borderColor: "rgba(255,255,255,0.1)", borderRadius: "12px" },
    "&:hover fieldset": { borderColor: "rgba(255,255,255,0.3)" },
    "&.Mui-focused fieldset": { borderColor: "#ef4444" }
  },
  "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.5)" },
  "& .MuiSelect-icon": { color: "white" }
};

const headerStyle = { color: "rgba(255,255,255,0.5)", fontWeight: 800, borderBottom: "1px solid rgba(255,255,255,0.1)" };
const cellStyle = { color: "white", borderBottom: "1px solid rgba(255,255,255,0.05)", py: 2 };