import React, { useEffect, useState } from "react";
import {
  Box, Typography, Button, Table, TableHead, TableRow, TableCell, 
  TableBody, Select, MenuItem, TextField, Dialog, Grid, Card, 
  CardContent, Stack, TableContainer, Paper, Chip, IconButton, 
  DialogTitle, DialogContent, InputAdornment, DialogActions
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import PaidIcon from '@mui/icons-material/Paid';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import API_BASE from "./api";

export default function AdminPayments() {
  const [payments, setPayments] = useState<any[]>([]);
  const [players, setPlayers] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [pricing, setPricing] = useState<any[]>([]);
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

  // 🔥 Auto-calculate amount
  useEffect(() => {
    const p = pricing.find(item => item.sessions_per_month === form.sessions);
    if (!p) return;

    let price = 0;
    if (form.plan === "weekly") price = p.price_weekly;
    else if (form.plan === "monthly") price = p.price_monthly;
    else if (form.plan === "yearly") price = p.price_yearly;

    setForm(prev => ({ ...prev, amount: price.toString() }));
  }, [form.plan, form.sessions, pricing]);

  const handleAdd = async () => {
    const res = await fetch(`${API_BASE}/api/admin/payments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    if (res.ok) {
      setOpen(false);
      fetchPayments();
      setForm({ ...form, amount: "", player_id: "", program_id: "" });
    }
  };

  // KPIs
  const totalRevenue = payments.reduce((acc, p) => acc + (p.status === 'paid' ? Number(p.amount) : 0), 0);
  const pendingCount = payments.filter(p => p.status === 'pending').length;

  return (
    <Box sx={containerStyle}>
      {/* HEADER */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight={900} letterSpacing="-1.5px">Payments & Invoicing</Typography>
          <Typography variant="body2" color="text.secondary">Manage player subscriptions and transaction history</Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={() => setOpen(true)}
          sx={primaryBtnStyle}
        >
          Add Payment
        </Button>
      </Stack>

      {/* STAT CARDS */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={4}>
          <Card sx={glassCardStyle}>
            <CardContent>
              <Typography variant="caption" fontWeight={800} color="text.secondary">TOTAL COLLECTED</Typography>
              <Typography variant="h4" fontWeight={900} color="#10b981">₹{totalRevenue}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={glassCardStyle}>
            <CardContent>
              <Typography variant="caption" fontWeight={800} color="text.secondary">PENDING INVOICES</Typography>
              <Typography variant="h4" fontWeight={900} color="#f59e0b">{pendingCount}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* PAYMENTS TABLE */}
      <TableContainer component={Paper} sx={tablePaperStyle}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={headerStyle}>Player</TableCell>
              <TableCell sx={headerStyle}>Program</TableCell>
              <TableCell sx={headerStyle}>Sessions</TableCell>
              <TableCell sx={headerStyle}>Amount</TableCell>
              <TableCell sx={headerStyle}>Status</TableCell>
              <TableCell sx={headerStyle}>Method</TableCell>
              <TableCell align="right" sx={headerStyle}>Invoice</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {payments.map((p) => (
              <TableRow key={p.id} hover>
                <TableCell><Typography fontWeight={700}>{p.player_name}</Typography></TableCell>
                <TableCell>{p.program_name}</TableCell>
                <TableCell><Chip label={`${p.sessions} / Month`} size="small" variant="outlined" /></TableCell>
                <TableCell><Typography fontWeight={800}>₹{p.amount}</Typography></TableCell>
                <TableCell>
                  <Chip 
                    label={p.status.toUpperCase()} 
                    size="small" 
                    icon={p.status === 'paid' ? <PaidIcon /> : <PendingActionsIcon />}
                    sx={p.status === 'paid' ? statusPaidStyle : statusPendingStyle}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>{p.payment_method}</Typography>
                </TableCell>
                <TableCell align="right">
                  <IconButton color="primary" href={p.invoice_url} target="_blank">
                    <FileDownloadIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ADD PAYMENT MODAL */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle sx={{ fontWeight: 900, pb: 1 }}>Record New Payment</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3} mt={0.5}>
            <Grid item xs={12}>
              <TextField select fullWidth label="Select Player" value={form.player_id} onChange={(e) => setForm({ ...form, player_id: e.target.value })}>
                {players.map(p => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField select fullWidth label="Select Program" value={form.program_id} onChange={(e) => setForm({ ...form, program_id: e.target.value })}>
                {programs.map(p => <MenuItem key={p.id} value={p.id}>{p.title}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField select fullWidth label="Frequency" value={form.sessions} onChange={(e) => setForm({ ...form, sessions: Number(e.target.value) })}>
                <MenuItem value={8}>8 Sessions / Month</MenuItem>
                <MenuItem value={12}>12 Sessions / Month</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField select fullWidth label="Plan Duration" value={form.plan} onChange={(e) => setForm({ ...form, plan: e.target.value })}>
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
                <MenuItem value="yearly">Yearly</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField 
                fullWidth label="Amount" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })}
                InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField select fullWidth label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <MenuItem value="paid">Paid</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField select fullWidth label="Method" value={form.payment_method} onChange={(e) => setForm({ ...form, payment_method: e.target.value })}>
                <MenuItem value="manual">Manual Cash/Bank</MenuItem>
                <MenuItem value="razorpay">Razorpay Online</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpen(false)} color="inherit" sx={{ fontWeight: 800 }}>Cancel</Button>
          <Button variant="contained" onClick={handleAdd} sx={primaryBtnStyle}>Save Payment Record</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// --- STYLING ---
const containerStyle = { p: { xs: 2, md: 8 }, background: "#f8fafc", minHeight: "100vh" };
const glassCardStyle = { borderRadius: 4, border: '1px solid #e2e8f0', boxShadow: 'none' };
const tablePaperStyle = { borderRadius: 5, border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(0,0,0,0.02)', overflow: 'hidden' };
const headerStyle = { fontWeight: 900, bgcolor: '#f8fafc', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' };
const primaryBtnStyle = { px: 4, py: 1.2, borderRadius: 2.5, fontWeight: 900, textTransform: 'none', background: 'linear-gradient(135deg, #2563eb, #4f46e5)' };
const statusPaidStyle = { bgcolor: '#dcfce7', color: '#166534', fontWeight: 900, fontSize: '0.65rem' };
const statusPendingStyle = { bgcolor: '#fef3c7', color: '#92400e', fontWeight: 900, fontSize: '0.65rem' };