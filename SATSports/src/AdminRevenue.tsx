import React, { useState, useEffect } from "react";
import {
  Box, Typography, Grid, Card, CardContent, Button, Stack, 
  TextField, MenuItem, Select, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper, Chip, Avatar,
  IconButton, InputAdornment, Fade
} from "@mui/material";
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AddCardIcon from '@mui/icons-material/AddCard';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/Edit';
import API_BASE from "./api";

export default function AdminRevenue() {
  const [items, setItems] = useState<any[]>([]);
  const [players, setPlayers] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form State
  const [form, setForm] = useState({
    date: "",
    type: "CR",
    amount: "",
    description: "",
    playerId: "",
    programId: "",
  });

  const loadData = async () => {
    const [rev, ply, prg] = await Promise.all([
      fetch(`${API_BASE}/api/admin/revenue`).then(res => res.json()),
      fetch(`${API_BASE}/api/admin/players`).then(res => res.json()),
      fetch(`${API_BASE}/api/admin/programs`).then(res => res.json())
    ]);
    setItems(rev);
    setPlayers(ply);
    setPrograms(prg);
  };

  useEffect(() => { loadData(); }, []);

  const saveItem = async () => {
    if (!form.date || !form.amount || !form.description) {
      return alert("Date, Amount and Description are required");
    }

    const payload = { ...form, amount: Number(form.amount), 
      playerId: form.playerId || null, programId: form.programId || null 
    };

    const url = editingId ? `${API_BASE}/api/revenue/${editingId}` : `${API_BASE}/api/revenue`;
    const method = editingId ? "PUT" : "POST";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    
    resetForm();
    loadData();
  };

  const editItem = (r: any) => {
    setEditingId(r.id);
    setForm({
      date: r.date.slice(0, 10),
      type: r.type,
      amount: r.amount.toString(),
      description: r.description,
      playerId: r.playerId || "",
      programId: r.programId || "",
    });
  };

  const deleteItem = async (id: number) => {
    if (!window.confirm("Delete this transaction?")) return;
    await fetch(`${API_BASE}/api/revenue/${id}`, { method: "DELETE" });
    loadData();
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({ date: "", type: "CR", amount: "", description: "", playerId: "", programId: "" });
  };

  const totalCR = items.filter(i => i.type === "CR").reduce((s, i) => s + i.amount, 0);
  const totalDR = items.filter(i => i.type === "DR").reduce((s, i) => s + i.amount, 0);
  const netBalance = totalCR - totalDR;

  return (
    <Box sx={containerStyle}>
      <Box mb={4}>
        <Typography variant="h4" fontWeight={900} letterSpacing="-1.5px">Financial Ledger</Typography>
        <Typography variant="body2" color="text.secondary">Track academy income, expenses, and player payments</Typography>
      </Box>

      {/* KPI SUMMARY */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={4}>
          <SummaryCard title="Total Credits" value={`₹${totalCR}`} color="#10b981" icon={<ArrowUpwardIcon />} />
        </Grid>
        <Grid item xs={12} md={4}>
          <SummaryCard title="Total Debits" value={`₹${totalDR}`} color="#ef4444" icon={<ArrowDownwardIcon />} />
        </Grid>
        <Grid item xs={12} md={4}>
          <SummaryCard title="Net Balance" value={`₹${netBalance}`} color="#6366f1" icon={<AccountBalanceWalletIcon />} />
        </Grid>
      </Grid>

      {/* TRANSACTION FORM */}
      <Card sx={glassCardStyle}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" fontWeight={800} mb={3} display="flex" alignItems="center">
            <AddCardIcon sx={{ mr: 1.5, color: '#6366f1' }} /> 
            {editingId ? "Modify Transaction" : "New Entry"}
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} md={2}>
              <TextField fullWidth type="date" label="Date" InputLabelProps={{ shrink: true }} value={form.date} onChange={e=>setForm({...form, date: e.target.value})} />
            </Grid>
            <Grid item xs={12} md={2}>
              <Select fullWidth value={form.type} onChange={e=>setForm({...form, type: e.target.value})}>
                <MenuItem value="CR">Credit (Income)</MenuItem>
                <MenuItem value="DR">Debit (Expense)</MenuItem>
              </Select>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField fullWidth label="Amount" type="number" value={form.amount} onChange={e=>setForm({...form, amount: e.target.value})} 
                InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Description" value={form.description} onChange={e=>setForm({...form, description: e.target.value})} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth select label="Link Player (Optional)" value={form.playerId} onChange={e=>setForm({...form, playerId: e.target.value})}>
                <MenuItem value="">None</MenuItem>
                {players.map(p => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth select label="Link Program (Optional)" value={form.programId} onChange={e=>setForm({...form, programId: e.target.value})}>
                <MenuItem value="">None</MenuItem>
                {programs.map(p => <MenuItem key={p.id} value={p.id}>{p.title}</MenuItem>)}
              </TextField>
            </Grid>
          </Grid>

          <Stack direction="row" spacing={1} mt={3} justifyContent="flex-end">
            {editingId && <Button onClick={resetForm} color="inherit" sx={{ fontWeight: 800 }}>Cancel</Button>}
            <Button variant="contained" onClick={saveItem} sx={primaryBtnStyle}>
              {editingId ? "Update Entry" : "Save Transaction"}
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* DATA TABLE */}
      <TableContainer component={Paper} sx={tablePaperStyle}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={headerStyle}>Date</TableCell>
              <TableCell sx={headerStyle}>Description</TableCell>
              <TableCell sx={headerStyle}>Reference</TableCell>
              <TableCell sx={headerStyle}>Type</TableCell>
              <TableCell sx={headerStyle}>Amount</TableCell>
              <TableCell align="right" sx={headerStyle}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((r) => (
              <TableRow key={r.id} hover>
                <TableCell sx={{ fontWeight: 700 }}>{r.date.slice(0, 10)}</TableCell>
                <TableCell>{r.description}</TableCell>
                <TableCell>
                  <Typography variant="caption" display="block" color="text.secondary">
                    {r.playerName || r.programTitle || "-"}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip label={r.type === "CR" ? "Credit" : "Debit"} size="small" 
                    sx={{ bgcolor: r.type === "CR" ? "#dcfce7" : "#fee2e2", color: r.type === "CR" ? "#166534" : "#991b1b", fontWeight: 900 }} />
                </TableCell>
                <TableCell>
                  <Typography fontWeight={900} color={r.type === "CR" ? "#10b981" : "#ef4444"}>
                    {r.type === "CR" ? "+" : "-"} ₹{r.amount}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                    <IconButton size="small" onClick={() => editItem(r)} color="primary"><EditIcon fontSize="small" /></IconButton>
                    <IconButton size="small" onClick={() => deleteItem(r.id)} color="error"><DeleteOutlineIcon fontSize="small" /></IconButton>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

// --- SUB-COMPONENTS ---
function SummaryCard({ title, value, color, icon }: any) {
  return (
    <Card sx={glassCardStyle}>
      <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
        <Avatar sx={{ bgcolor: `${color}15`, color, mr: 2, borderRadius: 2 }}>{icon}</Avatar>
        <Box>
          <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ textTransform: 'uppercase' }}>{title}</Typography>
          <Typography variant="h5" fontWeight={900}>{value}</Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

// --- STYLING ---
const containerStyle = { p: { xs: 2, md: 8 }, background: "#f8fafc", minHeight: "100vh" };
const glassCardStyle = { borderRadius: 4, border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', bgcolor: 'white' };
const tablePaperStyle = { mt: 4, borderRadius: 4, border: '1px solid #e2e8f0', boxShadow: 'none', overflow: 'hidden' };
const headerStyle = { fontWeight: 900, bgcolor: '#f8fafc', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' };
const primaryBtnStyle = { px: 4, py: 1, borderRadius: 2.5, fontWeight: 900, textTransform: 'none' };