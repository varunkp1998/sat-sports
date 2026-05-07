import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Box, Typography, TextField, Button, Stack, Card, CardContent, 
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  Select, MenuItem, useMediaQuery, Chip, InputAdornment, Fade, Paper, Avatar, Grid
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import AddIcon from "@mui/icons-material/Add";
import API_BASE from "./api";

export default function AdminPlayers() {
  const [players, setPlayers] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: "", email: "", age: "", program_id: "" });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [pRes, prRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/players`),
        fetch(`${API_BASE}/api/admin/programs`)
      ]);
      const [pData, prData] = await Promise.all([pRes.json(), prRes.json()]);
      setPlayers(Array.isArray(pData) ? pData : []);
      setPrograms(Array.isArray(prData) ? prData : []);
    } catch (err) {
      console.error("Directory Sync Failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // 🚀 PERFORMANCE: Memoized Filter
  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    return players.filter(p => p.name.toLowerCase().includes(s) || p.email.toLowerCase().includes(s));
  }, [players, search]);

  const handleOpen = useCallback((p: any = null) => {
    setEditing(p);
    setForm(p ? { name: p.name, email: p.email, age: p.age, program_id: p.program_id || "" } 
              : { name: "", email: "", age: "", program_id: "" });
    setOpen(true);
  }, []);

  const save = async () => {
    if (!form.name || !form.email) return;
    const url = editing ? `${API_BASE}/api/admin/players/${editing.id}` : `${API_BASE}/api/admin/players`;
    
    // Optimistic UI for New/Edit
    const tempPlayer = { ...form, id: editing?.id || Date.now() };
    setPlayers(prev => editing ? prev.map(p => p.id === editing.id ? tempPlayer : p) : [tempPlayer, ...prev]);
    setOpen(false);

    await fetch(url, {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    load();
  };

  const assignProgram = async (id: number, program_id: any) => {
    // Optimistic Update
    setPlayers(prev => prev.map(p => p.id === id ? { ...p, program_id } : p));
    await fetch(`${API_BASE}/api/admin/players/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ program_id })
    });
  };

  const autoAssign = (p: any) => {
    const match = programs.find(pr => p.age >= pr.min_age && p.age <= pr.max_age);
    if (!match) return;
    assignProgram(p.id, match.id);
  };

  return (
    <Box sx={rootStyle}>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between" alignItems="center" mb={6}>
        <Box>
          <Typography variant="h4" fontWeight={950} sx={{ letterSpacing: "-1.5px" }}>
            ATHLETE <span style={{ color: "#2563eb" }}>DIRECTORY</span>
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 800, opacity: 0.5 }}>
            {players.length} TOTAL REGISTRATIONS • ACTIVE MANAGEMENT
          </Typography>
        </Box>
        
        <Stack direction="row" spacing={2} sx={{ width: { xs: "100%", md: "auto" } }}>
          <TextField
            placeholder="Search by name/email..."
            size="small"
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{ startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, opacity: 0.5 }} /> }}
            sx={searchStyle}
          />
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()} sx={addBtnStyle}>
            Add Player
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={2.5}>
        {filtered.map((p) => (
          <Grid item xs={12} sm={6} lg={3} key={p.id}>
            <Fade in timeout={300}>
              <Card sx={playerCardStyle}>
                <CardContent sx={{ p: 2.5 }}>
                  <Stack direction="row" spacing={1.5} alignItems="center" mb={2.5}>
                    <Avatar sx={avatarStyle}>{p.name[0]}</Avatar>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="subtitle2" fontWeight={900} noWrap>{p.name}</Typography>
                      <Typography variant="caption" sx={{ opacity: 0.5, fontWeight: 700 }} noWrap display="block">{p.email}</Typography>
                    </Box>
                  </Stack>

                  <Stack spacing={2}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="caption" fontWeight={900} sx={{ opacity: 0.5 }}>AGE GROUP</Typography>
                      <Chip label={`${p.age} Yrs`} size="small" sx={ageChipStyle} />
                    </Box>

                    <Box>
                      <Typography variant="caption" fontWeight={900} sx={{ opacity: 0.5, mb: 1, display: 'block' }}>ASSIGNED PROGRAM</Typography>
                      <Stack direction="row" spacing={1}>
                        <Select
                          fullWidth
                          size="small"
                          value={p.program_id || ""}
                          onChange={(e) => assignProgram(p.id, e.target.value)}
                          sx={gridSelectStyle}
                        >
                          <MenuItem value=""><Typography variant="caption" fontWeight={700}>Unassigned</Typography></MenuItem>
                          {programs.map(pr => <MenuItem key={pr.id} value={pr.id}><Typography variant="caption" fontWeight={800}>{pr.title}</Typography></MenuItem>)}
                        </Select>
                        <Tooltip title="Auto-Assign by Age">
                          <IconButton onClick={() => autoAssign(p)} sx={magicBtnStyle}><AutoFixHighIcon fontSize="inherit" /></IconButton>
                        </Tooltip>
                      </Stack>
                    </Box>

                    <Stack direction="row" spacing={1} pt={1}>
                      <Button fullWidth onClick={() => handleOpen(p)} sx={editBtnStyle}>Edit Profile</Button>
                      <IconButton color="error" onClick={() => { if(window.confirm("Delete?")) { setPlayers(prev => prev.filter(i => i.id !== p.id)); fetch(`${API_BASE}/api/admin/players/${p.id}`, { method: "DELETE" }); }}} sx={delBtnStyle}>
                        <DeleteIcon fontSize="inherit" />
                      </IconButton>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Fade>
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={() => setOpen(false)} PaperProps={{ sx: modalPaper }}>
        <DialogTitle sx={{ fontWeight: 950 }}>{editing ? "REVISE ATHLETE" : "NEW REGISTRATION"}</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={2.5}>
            <TextField label="Full Name" fullWidth value={form.name} onChange={e => setForm({...form, name: e.target.value})} sx={inputStyle} />
            <TextField label="Email Address" fullWidth value={form.email} onChange={e => setForm({...form, email: e.target.value})} sx={inputStyle} />
            <TextField label="Current Age" type="number" fullWidth value={form.age} onChange={e => setForm({...form, age: e.target.value})} sx={inputStyle} />
            <Select value={form.program_id} onChange={e => setForm({...form, program_id: e.target.value})} displayEmpty sx={inputStyle}>
              <MenuItem value="">Manual Assignment (Optional)</MenuItem>
              {programs.map(p => <MenuItem key={p.id} value={p.id}>{p.title}</MenuItem>)}
            </Select>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpen(false)} sx={{ fontWeight: 800, color: '#64748b' }}>Cancel</Button>
          <Button variant="contained" onClick={save} sx={saveBtnStyle}>Confirm Athlete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// --- STATIC PERFORMANCE STYLES ---
const rootStyle = { p: { xs: 2, md: 5 }, bgcolor: "#f8fafc", minHeight: "100vh" };
const searchStyle = { bgcolor: "white", borderRadius: 2, "& .MuiOutlinedInput-root": { "& fieldset": { border: "1px solid #e2e8f0" }, "& input": { fontWeight: 700, fontSize: '0.85rem' } } };
const addBtnStyle = { borderRadius: 2, px: 3, fontWeight: 900, textTransform: "none", bgcolor: "#2563eb" };
const playerCardStyle = { borderRadius: 4, border: '1px solid #e2e8f0', boxShadow: 'none', transition: '0.2s', '&:hover': { borderColor: '#2563eb', transform: 'translateY(-4px)' } };
const avatarStyle = { bgcolor: '#eff6ff', color: '#2563eb', fontWeight: 900, width: 40, height: 40, borderRadius: 2 };
const ageChipStyle = { fontWeight: 900, bgcolor: '#f1f5f9', color: '#1e293b', fontSize: '0.65rem' };
const gridSelectStyle = { borderRadius: 1.5, bgcolor: '#f8fafc', border: '1px solid #f1f5f9', "& .MuiOutlinedInput-notchedOutline": { border: 'none' } };
const magicBtnStyle = { bgcolor: '#fff7ed', color: '#f97316', borderRadius: 1.5, fontSize: '1.2rem', '&:hover': { bgcolor: '#f97316', color: 'white' } };
const editBtnStyle = { borderRadius: 1.5, textTransform: 'none', fontWeight: 900, color: '#475569', bgcolor: '#f1f5f9', fontSize: '0.7rem' };
const delBtnStyle = { bgcolor: '#fff1f2', color: '#ef4444', borderRadius: 1.5, fontSize: '1.1rem', '&:hover': { bgcolor: '#ef4444', color: 'white' } };
const modalPaper = { borderRadius: 4, width: '100%', maxWidth: 400, p: 1 };
const inputStyle = { "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: "#f8fafc", fontWeight: 700, fontSize: '0.9rem' } };
const saveBtnStyle = { borderRadius: 2, fontWeight: 900, textTransform: "none", px: 4 };
const Tooltip = ({ title, children }: any) => <span title={title}>{children}</span>; // Minimal wrapper