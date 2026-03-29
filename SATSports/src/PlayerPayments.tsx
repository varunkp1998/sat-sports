import { useEffect, useState } from "react";
import { Box, Button, Card, Typography, Select, MenuItem, Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";
import API_BASE from "./api";

export default function PlayerPayments() {
  const [plan, setPlan] = useState("monthly");
  const [payments, setPayments] = useState([]);
  const [amount, setAmount] = useState(0);

  const playerId = localStorage.getItem("userId");

  useEffect(() => {
    fetch(`${API_BASE}/api/player/payments/${playerId}`)
      .then(res => res.json())
      .then(setPayments);

    fetch(`${API_BASE}/api/player/fee/${playerId}`)
      .then(res => res.json())
      .then(data => setAmount(data.amount));
  }, []);

  const handlePayment = async () => {
    const res = await fetch(`${API_BASE}/api/payment/create-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, plan, playerId })
    });

    const order = await res.json();

    const options = {
      key: "YOUR_RAZORPAY_KEY",
      amount: order.amount,
      currency: "INR",
      name: "Sports Academy",
      order_id: order.id,

      handler: async function (response) {
        await fetch(`${API_BASE}/api/payment/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...response,
            playerId,
            plan,
            amount
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

      <Card sx={{ p: 3, mt: 2 }}>
        <Typography>Amount: ₹{amount}</Typography>

        <Select value={plan} onChange={(e) => setPlan(e.target.value)}>
          <MenuItem value="weekly">Weekly</MenuItem>
          <MenuItem value="monthly">Monthly</MenuItem>
          <MenuItem value="yearly">Yearly</MenuItem>
        </Select>

        <Button onClick={handlePayment} variant="contained" sx={{ mt: 2 }}>
          Pay Now
        </Button>
      </Card>

      <Typography mt={4}>Payment History</Typography>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Amount</TableCell>
            <TableCell>Plan</TableCell>
            <TableCell>Invoice</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {payments.map((p, i) => (
            <TableRow key={i}>
              <TableCell>{p.date}</TableCell>
              <TableCell>₹{p.amount}</TableCell>
              <TableCell>{p.plan}</TableCell>
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
