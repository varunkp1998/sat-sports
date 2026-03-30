import React, { useState, useEffect } from "react";
import {
  Box, Typography, TextField, Button, Stack, Card, CardContent, 
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  Select, MenuItem, useMediaQuery, Chip, InputAdornment, Fade, Paper, Avatar
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

  const isMobile = useMediaQuery("(max-width:900px)");

  const load = () => {
    Promise.all([
      fetch(`${API_BASE}/api/admin/players`).then(res => res.json()),
      fetch(`${API_BASE}/api/admin/programs`).then(res => res.json())
    ]).then(([p, pr]) => {
      setPlayers(p);
      setPrograms(pr);
    });
  };

  useEffect(() => { load(); }, []);

  const filtered = players.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpen = (p: any = null) => {
    setEditing(p);
    setForm(p ? { name: p.name, email: p.email, age: p.age, program_id: p.program_id || "" } 
              : { name: "", email: "", age: "", program_id: "" });
    setOpen(true);
  };

  const save = async () => {
    const url = editing ? `${API_BASE}/api/admin/players/${editing.id}` : `${API_BASE}/api/admin/players`;
    await fetch(url, {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    setOpen(false);
    load();
  };

  const remove = async (id: number) => {
    if (!window.confirm("Permanent Delete?")) return;
    await fetch(`${API_BASE}/api/admin/players/${id}`, { method: "DELETE" });
    load();
  };

  const assignProgram = async (id: number, program_id: any) => {
    await fetch(`${API_BASE}/api/admin/players/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ program_id })
    });
    load();
  };

  const autoAssign = async (p: any) => {
    const match = programs.find(pr => p.age >= pr.min_age && p.age <= pr.max_age);
    if (!match) return alert("No age-appropriate program found");
    await assignProgram(p.id, match.id);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, background: "#f8fafc", minHeight: "100vh" }}>
      
      {/* ACTION BAR */}
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight={900} letterSpacing="-1px">Athlete Directory</Typography>
          <Typography variant="body2" color="text.secondary">{players.length} Registered Players</Typography>
        </Box>
        
        <Stack direction="row" spacing={2} sx={{ width: { xs: "100%", md: "auto" } }}>
          <TextField
            placeholder="Search athletes..."
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small"/></InputAdornment>,
            }}
            sx={searchStyle}
          />
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()} sx={addBtnStyle}>
            Add Player
          </Button>
        </Stack>
      </Stack>

      <GridContainer>
        {filtered.map((p) => (
          <Fade in key={p.id}>
            <Card sx={playerCardStyle}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                  <Avatar sx={{ bgcolor: '#eff6ff', color: '#3b82f6', fontWeight: 700 }}>{p.name[0]}</Avatar>
                  <Box>
                    <Typography fontWeight={800} noWrap>{p.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{p.email}</Typography>
                  </Box>
                </Stack>

                <Stack spacing={1.5}>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" fontWeight={600} color="text.secondary">Age</Typography>
                    <Chip label={`${p.age} yrs`} size="small" sx={{ fontWeight: 700 }} />
                  </Box>

                  <Box>
                    <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>PROGRAM ASSIGNMENT</Typography>
                    <Stack direction="row" spacing={1}>
                      <Select
                        fullWidth
                        size="small"
                        value={p.program_id || ""}
                        onChange={(e) => assignProgram(p.id, e.target.value)}
                        sx={selectStyle}
                      >
                        <MenuItem value="">Unassigned</MenuItem>
                        {programs.map(pr => <MenuItem key={pr.id} value={pr.id}>{pr.title}</MenuItem>)}
                      </Select>
                      <IconButton onClick={() => autoAssign(p)} sx={magicBtnStyle} title="Auto-Assign">
                        <AutoFixHighIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Box>

                  <Stack direction="row" spacing={1} pt={1}>
                    <Button fullWidth variant="outlined" onClick={() => handleOpen(p)} sx={editBtnStyle} startIcon={<EditIcon />}>
                      Edit
                    </Button>
                    <IconButton color="error" onClick={() => remove(p.id)} sx={deleteBtnStyle}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Fade>
        ))}
      </GridContainer>

      {/* MODAL */}
      <Dialog open={open} onClose={() => setOpen(false)} PaperProps={{ sx: { borderRadius: 4, p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 900 }}>{editing ? "Update Athlete" : "New Athlete"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField label="Full Name" fullWidth value={form.name} onChange={e => setForm({...form, name: e.target.value})} sx={modalInput} />
            <TextField label="Email" fullWidth value={form.email} onChange={e => setForm({...form, email: e.target.value})} sx={modalInput} />
            <TextField label="Age" type="number" fullWidth value={form.age} onChange={e => setForm({...form, age: e.target.value})} sx={modalInput} />
            <Select value={form.program_id} onChange={e => setForm({...form, program_id: e.target.value})} displayEmpty sx={modalInput}>
              <MenuItem value="">Manual Assignment (Optional)</MenuItem>
              {programs.map(p => <MenuItem key={p.id} value={p.id}>{p.title}</MenuItem>)}
            </Select>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpen(false)} sx={{ fontWeight: 700, color: 'text.secondary' }}>Cancel</Button>
          <Button variant="contained" onClick={save} sx={addBtnStyle}>Save Athlete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// --- STYLES ---

const GridContainer = ({ children }: { children: React.ReactNode }) => (
  <Box sx={{ 
    display: 'grid', 
    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr 1fr' }, 
    gap: 3 
  }}>
    {children}
  </Box>
);

const searchStyle = {
  bgcolor: "white", borderRadius: 3, 
  "& .MuiOutlinedInput-root": { "& fieldset": { border: "none" }, boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }
};

const addBtnStyle = {
  borderRadius: 3, px: 3, fontWeight: 800, textTransform: "none",
  background: "linear-gradient(135deg, #2563eb, #4f46e5)",
  boxShadow: "0 10px 20px -5px rgba(37, 99, 235, 0.4)"
};

const playerCardStyle = {
  borderRadius: 4, border: '1px solid #e2e8f0', boxShadow: 'none', transition: '0.3s',
  '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 20px 30px -10px rgba(0,0,0,0.1)', borderColor: '#3b82f6' }
};

const selectStyle = {
  borderRadius: 2, bgcolor: '#f1f5f9', fontSize: '0.8rem', fontWeight: 700,
  "& .MuiOutlinedInput-notchedOutline": { border: 'none' }
};

const magicBtnStyle = {
  bgcolor: '#fff7ed', color: '#f97316', borderRadius: 2, border: '1px solid #ffedd5',
  '&:hover': { bgcolor: '#f97316', color: 'white' }
};

const editBtnStyle = {
  borderRadius: 2.5, textTransform: 'none', fontWeight: 700, color: '#475569', borderColor: '#e2e8f0', fontSize: '0.75rem'
};

const deleteBtnStyle = {
  borderRadius: 2.5, bgcolor: '#fff1f2', '&:hover': { bgcolor: '#fb7185', color: 'white' }
};

const modalInput = {
  "& .MuiOutlinedInput-root": { borderRadius: 3, bgcolor: "#f8fafc" }
};