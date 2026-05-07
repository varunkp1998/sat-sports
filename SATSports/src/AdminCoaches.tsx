import React, { useState, useEffect } from "react";
import {
  Box, Typography, Stack, TextField, Button, 
  Table, TableHead, TableRow, TableCell, TableBody, 
  IconButton, Fade, Paper, 
  Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import SearchIcon from "@mui/icons-material/Search";
import API_BASE from "./api";

// --- TYPES ---
interface Coach {
  id: number;
  name: string;
  email: string;
  phone: string;
}

export default function AdminCoaches() {
  // Data States
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  
  // UI States
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" as "success" | "error" });
  
  // Form State
  const [form, setForm] = useState({ name: "", email: "", phone: "" });

  const loadCoaches = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/coaches`);
      const data = await res.json();
      setCoaches(Array.isArray(data) ? data : []);
    } catch (err) {
      handleToast("Failed to load coaches", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCoaches(); }, []);

  const handleToast = (message: string, severity: "success" | "error") => {
    setToast({ open: true, message, severity });
  };

  const openAdd = () => {
    setEditingId(null);
    setForm({ name: "", email: "", phone: "" });
    setOpen(true);
  };

  const openEdit = (c: Coach) => {
    setEditingId(c.id);
    setForm({ name: c.name || "", email: c.email || "", phone: c.phone || "" });
    setOpen(true);
  };

  const saveCoach = async () => {
    if (!form.name || !form.email) {
      return handleToast("Name and Email are required", "error");
    }

    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId ? `${API_BASE}/api/admin/coaches/${editingId}` : `${API_BASE}/api/admin/coaches`;
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      if (res.ok) {
        handleToast(editingId ? "Coach details updated" : "New coach onboarded", "success");
        loadCoaches();
        setOpen(false);
      } else {
        const errorData = await res.json();
        handleToast(errorData.message || "Failed to save coach", "error");
      }
    } catch (err) {
      handleToast("Network error occurred", "error");
    }
  };

  const removeCoach = async (id: number) => {
    if (!window.confirm("Are you sure you want to remove this coach? This action cannot be undone.")) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/coaches/${id}`, { method: "DELETE" });
      if (res.ok) {
        handleToast("Coach removed successfully", "success");
        loadCoaches();
      } else {
        handleToast("Could not delete coach", "error");
      }
    } catch (err) {
      handleToast("Network error", "error");
    }
  };

  const filtered = coaches.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box sx={containerStyle}>
      
      {/* HEADER */}
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between" alignItems="center" mb={6}>
        <Box textAlign={{ xs: 'center', md: 'left' }}>
          <Typography variant="h4" fontWeight={900} letterSpacing="-1.5px" color="#1e293b">Coach Management</Typography>
          <Typography variant="body2" color="text.secondary">Review and manage your academy coaching staff</Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<PersonAddIcon />} 
          onClick={openAdd}
          sx={primaryBtnStyle}
        >
          Add New Coach
        </Button>
      </Stack>

      {/* SEARCH */}
      <Paper sx={searchPaperStyle}>
        <SearchIcon sx={{ color: 'text.secondary', mr: 1.5 }} />
        <TextField
          fullWidth
          placeholder="Search by name or email..."
          variant="standard"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{ disableUnderline: true, sx: { fontWeight: 500 } }}
        />
      </Paper>

      {/* TABLE */}
      <Fade in timeout={600}>
        <Paper sx={tableWrapperStyle}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}><CircularProgress /></Box>
          ) : (
            <Table>
              <TableHead sx={{ bgcolor: '#f8fafc' }}>
                <TableRow>
                  <TableCell sx={thStyle}>COACH NAME</TableCell>
                  <TableCell sx={thStyle}>EMAIL ADDRESS</TableCell>
                  <TableCell sx={thStyle}>PHONE NUMBER</TableCell>
                  <TableCell sx={thStyle} align="right">ACTIONS</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map(c => (
                  <TableRow key={c.id} sx={{ '&:hover': { bgcolor: '#fcfcfd' } }}>
                    <TableCell sx={{ py: 3 }}>
                      <Typography variant="body2" fontWeight={800} color="#1e293b">{c.name}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600} color="text.secondary">{c.email}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={700} color="#3b82f6">{c.phone || "-"}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => openEdit(c)} sx={{ mr: 1, color: '#64748b' }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => removeCoach(c.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 8, color: 'text.secondary', fontWeight: 600 }}>
                      No coaches found matching your search.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </Paper>
      </Fade>

      {/* DIALOG */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: 5 } }}>
        <DialogTitle sx={{ fontWeight: 900, pt: 4, px: 4 }}>
          {editingId ? "Modify Coach" : "Onboard Coach"}
        </DialogTitle>
        <DialogContent sx={{ px: 4 }}>
          <Stack spacing={3} mt={2}>
            <TextField
              fullWidth label="Full Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              sx={inputStyle}
            />
            <TextField
              fullWidth label="Email Address"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              sx={inputStyle}
            />
            <TextField
              fullWidth label="Phone Number"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              sx={inputStyle}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 4 }}>
          <Button onClick={() => setOpen(false)} sx={{ fontWeight: 700, color: '#64748b' }}>Cancel</Button>
          <Button variant="contained" onClick={saveCoach} sx={{ ...primaryBtnStyle, px: 4 }}>
            {editingId ? "Update" : "Confirm Addition"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={toast.open} autoHideDuration={4000} 
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={toast.severity} variant="filled" sx={{ width: '100%', fontWeight: 700, borderRadius: 2 }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

// --- STYLES ---
const containerStyle = { p: { xs: 2, md: 8 }, background: "#f8fafc", minHeight: "100vh" };
const searchPaperStyle = { p: "12px 24px", display: 'flex', alignItems: 'center', borderRadius: 4, border: '1px solid #e2e8f0', boxShadow: 'none', mb: 4, bgcolor: 'white' };
const tableWrapperStyle = { borderRadius: 6, overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', bgcolor: 'white' };
const thStyle = { fontWeight: 900, color: '#64748b', fontSize: '0.75rem', letterSpacing: 1.5, py: 2 };
const inputStyle = { "& .MuiOutlinedInput-root": { borderRadius: 3, bgcolor: '#fcfcfd', "& fieldset": { borderColor: '#e2e8f0' } } };
const primaryBtnStyle = {
  px: 3, py: 1.2, borderRadius: 3, fontWeight: 900, textTransform: 'none',
  background: 'linear-gradient(135deg, #2563eb, #4f46e5)', color: 'white',
  boxShadow: '0 10px 20px -5px rgba(37, 99, 235, 0.4)',
  "&:hover": { transform: 'translateY(-2px)', boxShadow: '0 20px 30px -10px rgba(37, 99, 235, 0.5)' }
};