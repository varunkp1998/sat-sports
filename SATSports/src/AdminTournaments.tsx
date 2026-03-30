import React, { useState, useEffect } from "react";
import {
  Box, Typography, Grid, Card, CardContent, Button, Stack, Chip, 
  TextField, Select, MenuItem, Fade, Paper, Avatar, Divider, 
  IconButton, InputAdornment, Snackbar, Alert
} from "@mui/material";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import GroupsIcon from "@mui/icons-material/Groups";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import SearchIcon from "@mui/icons-material/Search";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import API_BASE from "./api";

export default function AdminTournaments() {
  // Data States
  const [players, setPlayers] = useState<any[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<any[]>([]);
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [activeTournament, setActiveTournament] = useState<number | null>(null);
  const [matches, setMatches] = useState<any[]>([]);
  
  // Form/Input States
  const [form, setForm] = useState({ title: "", description: "", date: "", location: "", status: "upcoming" });
  const [externalName, setExternalName] = useState("");
  const [image, setImage] = useState<any>(null);
  const [playerSearch, setPlayerSearch] = useState("");
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" as "success" | "error" });

  useEffect(() => {
    fetch(`${API_BASE}/api/admin/players`).then(res => res.json()).then(setPlayers);
    loadTournaments();
  }, []);

  const loadTournaments = () => {
    fetch(`${API_BASE}/api/admin/tournaments`).then(res => res.json()).then(setTournaments);
  };

  const togglePlayer = (p: any) => {
    const isSelected = selectedPlayers.find(sp => sp.id === p.id);
    setSelectedPlayers(isSelected ? selectedPlayers.filter(sp => sp.id !== p.id) : [...selectedPlayers, p]);
  };

  const addExternal = () => {
    if (!externalName) return;
    setSelectedPlayers([...selectedPlayers, { id: Date.now(), name: externalName, external: true }]);
    setExternalName("");
  };

  const saveTournament = async () => {
    if (!form.title || selectedPlayers.length < 2) {
      return setToast({ open: true, message: "Title and at least 2 players required", severity: "error" });
    }

    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => formData.append(k, v));
    if (image) formData.append("image", image);

    try {
      const res = await fetch(`${API_BASE}/api/admin/tournaments`, { method: "POST", body: formData });
      const data = await res.json();
      
      if (data.id) {
        await fetch(`${API_BASE}/api/admin/tournaments/${data.id}/players`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            players: selectedPlayers.map(p => ({ player_id: p.external ? null : p.id, name: p.name }))
          })
        });
        setToast({ open: true, message: "Tournament Created!", severity: "success" });
        loadTournaments();
        openDashboard(data.id);
      }
    } catch (e) { setToast({ open: true, message: "Error creating tournament", severity: "error" }); }
  };

  const openDashboard = async (id: number) => {
    const res = await fetch(`${API_BASE}/api/admin/tournaments/${id}/matches`);
    let data = await res.json();

    if (!data || data.length === 0) {
      await fetch(`${API_BASE}/api/admin/tournaments/${id}/generate-brackets`, { method: "POST" });
      const res2 = await fetch(`${API_BASE}/api/admin/tournaments/${id}/matches`);
      data = await res2.json();
    }
    setMatches(data);
    setActiveTournament(id);
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  const pickWinner = async (matchId: number, player: string) => {
    await fetch(`${API_BASE}/api/admin/matches/${matchId}/winner`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ winner: player })
    });
    const res = await fetch(`${API_BASE}/api/admin/tournaments/${activeTournament}/matches`);
    setMatches(await res.json());
  };

  return (
    <Box sx={containerStyle}>
      <Box mb={6}>
        <Typography variant="h4" fontWeight={900} letterSpacing="-1.5px" color="#1e293b">Tournament Arena</Typography>
        <Typography variant="body2" color="text.secondary">Organize brackets, manage players, and crown winners</Typography>
      </Box>

      <Grid container spacing={4}>
        {/* LEFT: TOURNAMENT CREATION */}
        <Grid item xs={12} lg={7}>
          <Card sx={glassCardStyle}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" fontWeight={800} mb={3} display="flex" alignItems="center">
                <AddCircleIcon sx={{ mr: 1.5, color: '#3b82f6' }} /> Setup New Tournament
              </Typography>

              <Stack spacing={3}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField fullWidth label="Event Title" sx={inputStyle} onChange={e=>setForm({...form, title: e.target.value})} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField fullWidth label="Location" sx={inputStyle} onChange={e=>setForm({...form, location: e.target.value})} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField fullWidth type="date" label="Start Date" InputLabelProps={{ shrink: true }} sx={inputStyle} onChange={e=>setForm({...form, date: e.target.value})} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Select fullWidth value={form.status} sx={inputStyle} onChange={e=>setForm({...form, status: e.target.value as string})}>
                      <MenuItem value="upcoming">Upcoming</MenuItem>
                      <MenuItem value="live">Live</MenuItem>
                      <MenuItem value="completed">Completed</MenuItem>
                    </Select>
                  </Grid>
                </Grid>

                <TextField fullWidth multiline rows={3} label="Description" sx={inputStyle} onChange={e=>setForm({...form, description: e.target.value})} />

                <Button component="label" variant="outlined" startIcon={<CloudUploadIcon />} sx={{ borderRadius: 3, py: 1.5, borderStyle: 'dashed' }}>
                  Upload Cover Image
                  <input hidden type="file" onChange={e=>setImage(e.target.files?.[0])}/>
                </Button>

                <Button variant="contained" onClick={saveTournament} sx={primaryBtnStyle}>
                  Build Tournament & Brackets
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* RIGHT: PLAYER SELECTION */}
        <Grid item xs={12} lg={5}>
          <Card sx={{ ...glassCardStyle, height: '100%' }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" fontWeight={800} mb={3} display="flex" alignItems="center">
                <GroupsIcon sx={{ mr: 1.5, color: '#4f46e5' }} /> Player Pool
              </Typography>

              <TextField 
                fullWidth placeholder="Search academy players..." 
                size="small" sx={{ mb: 2 }}
                InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon fontSize="small"/></InputAdornment>) }}
                onChange={(e) => setPlayerSearch(e.target.value)}
              />

              <Box sx={playerScrollArea}>
                <Stack direction="row" flexWrap="wrap" gap={1}>
                  {players.filter(p => p.name.toLowerCase().includes(playerSearch.toLowerCase())).map(p => (
                    <Chip 
                      key={p.id} label={p.name} 
                      onClick={() => togglePlayer(p)}
                      sx={playerChipStyle(selectedPlayers.some(sp => sp.id === p.id))}
                    />
                  ))}
                </Stack>
              </Box>

              <Divider sx={{ my: 3 }}>OR ADD EXTERNAL</Divider>

              <Stack direction="row" spacing={1}>
                <TextField fullWidth placeholder="Guest Name" size="small" value={externalName} onChange={e=>setExternalName(e.target.value)} />
                <Button variant="contained" onClick={addExternal} sx={{ borderRadius: 2, bgcolor: '#1e293b' }}>Add</Button>
              </Stack>

              <Box mt={4}>
                <Typography variant="caption" fontWeight={900} color="text.secondary">SELECTED ({selectedPlayers.length})</Typography>
                <Stack direction="row" flexWrap="wrap" gap={1} mt={1}>
                  {selectedPlayers.map(p => (
                    <Chip key={p.id} label={p.name} onDelete={() => setSelectedPlayers(selectedPlayers.filter(sp => sp.id !== p.id))} sx={{ fontWeight: 700 }} />
                  ))}
                </Stack>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* DASHBOARD LIST */}
      <Box mt={8}>
        <Typography variant="h5" fontWeight={900} mb={3}>Active Tournaments</Typography>
        <Grid container spacing={2}>
          {tournaments.map(t => (
            <Grid item xs={12} md={4} key={t.id}>
              <Card sx={tournamentCardStyle}>
                <CardContent>
                  <Typography variant="h6" fontWeight={800}>{t.title}</Typography>
                  <Typography variant="caption" color="text.secondary" display="block" mb={2}>{t.location} • {new Date(t.date).toLocaleDateString()}</Typography>
                  <Button fullWidth variant="contained" onClick={() => openDashboard(t.id)} sx={{ borderRadius: 2, bgcolor: '#f1f5f9', color: '#1e293b', fontWeight: 800, '&:hover': { bgcolor: '#e2e8f0' } }}>
                    Manage Bracket
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* BRACKET VISUALIZATION */}
      {activeTournament && (
        <Fade in>
          <Box mt={10}>
            <Typography variant="h5" fontWeight={900} mb={4} display="flex" alignItems="center">
              <AccountTreeIcon sx={{ mr: 1.5 }} /> Match Brackets
            </Typography>
            
            <Grid container spacing={3}>
              {matches.map((m, idx) => (
                <Grid item xs={12} md={6} lg={4} key={m.id}>
                  <Paper sx={matchCardStyle}>
                    <Box sx={matchHeader}>
                      <Typography variant="caption" fontWeight={900} color="white">{m.round.toUpperCase()}</Typography>
                      {m.winner && <EmojiEventsIcon sx={{ color: '#fbbf24', fontSize: 18 }} />}
                    </Box>
                    <Stack spacing={1} p={2}>
                      <Button 
                        fullWidth variant={m.winner === m.player1 ? "contained" : "outlined"} 
                        onClick={() => pickWinner(m.id, m.player1)}
                        sx={matchBtnStyle(m.winner === m.player1)}
                      >
                        {m.player1}
                      </Button>
                      <Typography align="center" variant="caption" fontWeight={900} color="text.secondary">VS</Typography>
                      <Button 
                        fullWidth variant={m.winner === m.player2 ? "contained" : "outlined"} 
                        onClick={() => pickWinner(m.id, m.player2)}
                        sx={matchBtnStyle(m.winner === m.player2)}
                      >
                        {m.player2}
                      </Button>
                    </Stack>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Fade>
      )}

      <Snackbar open={toast.open} autoHideDuration={3000} onClose={() => setToast({ ...toast, open: false })}>
        <Alert severity={toast.severity} variant="filled" sx={{ borderRadius: 2 }}>{toast.message}</Alert>
      </Snackbar>
    </Box>
  );
}

// --- STYLES ---
const containerStyle = { p: { xs: 2, md: 8 }, background: "#f8fafc", minHeight: "100vh" };
const glassCardStyle = { borderRadius: 6, border: '1px solid #e2e8f0', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.04)', bgcolor: 'white' };
const inputStyle = { "& .MuiOutlinedInput-root": { borderRadius: 3, bgcolor: '#fcfcfd' } };
const primaryBtnStyle = { py: 1.5, borderRadius: 3, fontWeight: 900, background: 'linear-gradient(135deg, #2563eb, #4f46e5)', boxShadow: '0 10px 20px -5px rgba(37, 99, 235, 0.4)' };
const playerScrollArea = { maxHeight: '200px', overflowY: 'auto', p: 1, border: '1px solid #f1f5f9', borderRadius: 3 };
const playerChipStyle = (active: boolean) => ({ fontWeight: 800, bgcolor: active ? '#4f46e5' : '#f1f5f9', color: active ? 'white' : '#64748b', '&:hover': { bgcolor: active ? '#4338ca' : '#e2e8f0' } });
const tournamentCardStyle = { borderRadius: 4, border: '1px solid #e2e8f0', boxShadow: 'none' };
const matchCardStyle = { borderRadius: 4, overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' };
const matchHeader = { bgcolor: '#1e293b', p: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const matchBtnStyle = (isWinner: boolean) => ({ borderRadius: 2, textTransform: 'none', fontWeight: 800, py: 1, borderColor: isWinner ? 'transparent' : '#e2e8f0', color: isWinner ? 'white' : '#1e293b' });