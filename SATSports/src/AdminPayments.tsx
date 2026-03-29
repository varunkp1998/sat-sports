import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Select,
  MenuItem,
  TextField,
  Dialog,
  Grid
} from "@mui/material";
import API_BASE from "./api";

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [players, setPlayers] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [pricing, setPricing] = useState([]);

  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    player_id: "",
    program_id: "",
    sessions: 8,
    plan: "monthly",
    amount: "",
    source: "program",
    status: "paid",
    payment_method: "manual"
  });

  useEffect(() => {
    fetchPayments();
    fetchPlayers();
    fetchPrograms();
  }, []);

  const fetchPayments = async () => {
    const res = await fetch(`${API_BASE}/api/admin/payments`);
    const data = await res.json();
    setPayments(data);
  };

  const fetchPlayers = async () => {
    const res = await fetch(`${API_BASE}/api/admin/players`);
    const data = await res.json();
    setPlayers(data);
  };

  const fetchPrograms = async () => {
    const res = await fetch(`${API_BASE}/api/programs`);
    const data = await res.json();
    setPrograms(data);
  };

  // 🔥 Load pricing when program changes
  useEffect(() => {
    if (!form.program_id) return;

    fetch(`${API_BASE}/api/programs/${form.program_id}/pricing`)
      .then(res => res.json())
      .then(setPricing);
  }, [form.program_id]);

  // 🔥 Auto calculate amount
  useEffect(() => {
    const p = pricing.find(p => p.sessions_per_month === form.sessions);
    if (!p) return;

    let price = 0;

    if (form.plan === "weekly") price = p.price_weekly;
    if (form.plan === "monthly") price = p.price_monthly;
    if (form.plan === "yearly") price = p.price_yearly;

    setForm(prev => ({ ...prev, amount: price }));
  }, [form.plan, form.sessions, pricing]);

  const handleAdd = async () => {
    await fetch(`${API_BASE}/api/admin/payments`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(form)
    });

    setOpen(false);
    fetchPayments();
  };

  return (
    <Box>
      <Typography variant="h5">💰 Payments Management</Typography>

      <Button onClick={() => setOpen(true)} sx={{ mt: 2 }}>
        ➕ Add Payment
      </Button>

      {/* 🔥 TABLE */}
      <Table sx={{ mt: 3 }}>
        <TableHead>
          <TableRow>
            <TableCell>Player</TableCell>
            <TableCell>Program</TableCell>
            <TableCell>Sessions</TableCell>
            <TableCell>Amount</TableCell>
            <TableCell>Plan</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Method</TableCell>
            <TableCell>Invoice</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {payments.map((p) => (
            <TableRow key={p.id}>
              <TableCell>{p.player_name}</TableCell>
              <TableCell>{p.program_name}</TableCell>
              <TableCell>{p.sessions}</TableCell>
              <TableCell>₹{p.amount}</TableCell>
              <TableCell>{p.plan}</TableCell>
              <TableCell>{p.status}</TableCell>
              <TableCell>{p.payment_method}</TableCell>
              <TableCell>
                <Button href={p.invoice_url}>Download</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* 🔥 ADD PAYMENT MODAL */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <Box p={3} width={400}>
          <Typography>Add Payment</Typography>

          <Grid container spacing={2} mt={1}>

            {/* Player */}
            <Grid item xs={12}>
              <Select
                fullWidth
                value={form.player_id}
                onChange={(e) =>
                  setForm({ ...form, player_id: e.target.value })
                }
              >
                {players.map(p => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.name}
                  </MenuItem>
                ))}
              </Select>
            </Grid>

            {/* Program */}
            <Grid item xs={12}>
              <Select
                fullWidth
                value={form.program_id}
                onChange={(e) =>
                  setForm({ ...form, program_id: e.target.value })
                }
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
              <Select
                fullWidth
                value={form.sessions}
                onChange={(e) =>
                  setForm({ ...form, sessions: Number(e.target.value) })
                }
              >
                <MenuItem value={8}>8 Sessions</MenuItem>
                <MenuItem value={12}>12 Sessions</MenuItem>
              </Select>
            </Grid>

            {/* Plan */}
            <Grid item xs={6}>
              <Select
                fullWidth
                value={form.plan}
                onChange={(e) =>
                  setForm({ ...form, plan: e.target.value })
                }
              >
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
                <MenuItem value="yearly">Yearly</MenuItem>
              </Select>
            </Grid>

            {/* Amount */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Amount"
                value={form.amount}
                onChange={(e) =>
                  setForm({ ...form, amount: e.target.value })
                }
              />
            </Grid>

            {/* Status */}
            <Grid item xs={6}>
              <Select
                fullWidth
                value={form.status}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value })
                }
              >
                <MenuItem value="paid">Paid</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
              </Select>
            </Grid>

            {/* Method */}
            <Grid item xs={6}>
              <Select
                fullWidth
                value={form.payment_method}
                onChange={(e) =>
                  setForm({ ...form, payment_method: e.target.value })
                }
              >
                <MenuItem value="manual">Manual</MenuItem>
                <MenuItem value="razorpay">Razorpay</MenuItem>
              </Select>
            </Grid>

            <Grid item xs={12}>
              <Button fullWidth onClick={handleAdd}>
                Save Payment
              </Button>
            </Grid>

          </Grid>
        </Box>
      </Dialog>
    </Box>
  );
}
