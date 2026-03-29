import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  Typography,
  Select,
  MenuItem,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Grid
} from "@mui/material";
import API_BASE from "./api";

declare global {
  interface Window {
    Razorpay: any;
  }
}
export {};

export default function PlayerPayments() {
  const [plan, setPlan] = useState("monthly");
  const [sessions, setSessions] = useState(8);
  const [programs, setPrograms] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState("");
  const [pricing, setPricing] = useState([]);
  const [amount, setAmount] = useState(0);
  const [payments, setPayments] = useState([]);

  const playerId = localStorage.getItem("userId");

  // ✅ Load programs + payments
  useEffect(() => {
    fetch(`${API_BASE}/api/programs`)
      .then(res => res.json())
      .then(setPrograms);

    fetch(`${API_BASE}/api/player/payments/${playerId}`)
      .then(res => res.json())
      .then(setPayments);
  }, []);

  // ✅ Load pricing when program changes
  useEffect(() => {
    if (!selectedProgram) return;

    fetch(`${API_BASE}/api/programs/${selectedProgram}/pricing`)
      .then(res => res.json())
      .then(data => {
        setPricing(data);
      });
  }, [selectedProgram]);

  // ✅ Calculate amount dynamically
  useEffect(() => {
    const p = pricing.find(p => p.sessions_per_month === sessions);

    if (!p) return;

    let price = 0;

    if (plan === "weekly") price = p.price_weekly;
    if (plan === "monthly") price = p.price_monthly;
    if (plan === "yearly") price = p.price_yearly;

    setAmount(price);
  }, [plan, sessions, pricing]);

  const handlePayment = async () => {
    if (!window.Razorpay) {
      alert("Razorpay SDK not loaded");
      return;
    }

    const res = await fetch(`${API_BASE}/api/payment/create-order`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        amount,
        plan,
        playerId,
        programId: selectedProgram,
        sessions
      })
    });

    const order = await res.json();

    const options = {
      key: "rzp_test_YOUR_KEY",
      amount: order.amount,
      currency: "INR",
      name: "Sports Academy",
      description: `${sessions} sessions - ${plan}`,
      order_id: order.id,

      handler: async (response) => {
        await fetch(`${API_BASE}/api/payment/verify`, {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({
            ...response,
            playerId,
            plan,
            amount,
            programId: selectedProgram,
            sessions
          })
        });

        alert("Payment Successful");
        window.location.reload();
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return (
    <Box>
      <Typography variant="h5">💳 Payments</Typography>

      {/* 🔥 PAYMENT CARD */}
      <Card sx={{ p: 3, mt: 2 }}>
        <Grid container spacing={2}>

          {/* Program */}
          <Grid item xs={12}>
            <Typography>Select Program</Typography>
            <Select
              fullWidth
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value)}
            >
              {programs.map(p => (
                <MenuItem key={p.id} value={p.id}>
                  {p.title}
                </MenuItem>
              ))}
            </Select>
          </Grid>

          {/* Sessions */}
          <Grid item xs={6}>
            <Typography>Sessions</Typography>
            <Select
              fullWidth
              value={sessions}
              onChange={(e) => setSessions(Number(e.target.value))}
            >
              <MenuItem value={8}>8 Sessions</MenuItem>
              <MenuItem value={12}>12 Sessions</MenuItem>
            </Select>
          </Grid>

          {/* Plan */}
          <Grid item xs={6}>
            <Typography>Plan</Typography>
            <Select
              fullWidth
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
            >
              <MenuItem value="weekly">Weekly</MenuItem>
              <MenuItem value="monthly">Monthly</MenuItem>
              <MenuItem value="yearly">Yearly</MenuItem>
            </Select>
          </Grid>

          {/* Amount */}
          <Grid item xs={12}>
            <Typography variant="h6">
              Amount: ₹{amount}
            </Typography>
          </Grid>

          {/* Pay */}
          <Grid item xs={12}>
            <Button
              variant="contained"
              fullWidth
              onClick={handlePayment}
              disabled={!amount}
            >
              Pay Now
            </Button>
          </Grid>

        </Grid>
      </Card>

      {/* 🔥 PAYMENT HISTORY */}
      <Typography mt={4}>Payment History</Typography>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Program</TableCell>
            <TableCell>Sessions</TableCell>
            <TableCell>Amount</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Invoice</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {payments.map((p, i) => (
            <TableRow key={i}>
              <TableCell>{p.date}</TableCell>
              <TableCell>{p.program_name}</TableCell>
              <TableCell>{p.sessions}</TableCell>
              <TableCell>₹{p.amount}</TableCell>
              <TableCell>{p.status}</TableCell>
              <TableCell>
                <Button href={p.invoice_url}>Download</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}
