import { useEffect, useState } from "react";
import { Box, Button, Card, Typography, Select, MenuItem, Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";
import API_BASE from "./api";
declare global {
    interface Window {
      Razorpay: any;
    }
  }
  
  // If you are in a .tsx file, you might need this empty export 
  // to treat the file as a module:
  export {};
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
    // FIX 1: Check if Razorpay script is actually loaded
    if (!window.Razorpay) {
      alert("Razorpay SDK not loaded. Please check your internet or index.html");
      return;
    }
  
    try {
      const res = await fetch(`${API_BASE}/api/payment/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, plan, playerId })
      });
  
      // FIX 2: Check if the server responded with an error (400, 500, etc.)
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: "Server Error" }));
        console.error("Order Creation Failed:", errorData);
        alert("Failed to create order. Check backend logs.");
        return;
      }
  
      const order = await res.json();
  
      const options = {
        key: "rzp_test_YOUR_ACTUAL_KEY", // Replace with your actual Key ID
        amount: order.amount,
        currency: "INR",
        name: "Sports Academy",
        description: `Payment for ${plan} plan`,
        order_id: order.id,
        handler: async function (response) {
          try {
            const verifyRes = await fetch(`${API_BASE}/api/payment/verify`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...response,
                playerId,
                plan,
                amount
              })
            });
  
            if (verifyRes.ok) {
              alert("Payment Successful");
              window.location.reload();
            } else {
              alert("Verification failed. Please contact support.");
            }
          } catch (err) {
            console.error("Verification Error:", err);
          }
        },
        prefill: {
          name: "Player Name", // Optional: Pass player data here
        },
        theme: { color: "#3399cc" }
      };
  
      const rzp = new window.Razorpay(options);
      
      // Handle payment failure (user closes modal)
      rzp.on('payment.failed', function (response){
          alert("Payment Failed: " + response.error.description);
      });
  
      rzp.open();
    } catch (error) {
      console.error("Critical Payment Error:", error);
      alert("Something went wrong. Please try again later.");
    }
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
