import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box, Typography, Card, CardContent, Grid, Button, TextField, Select, MenuItem, Stack, Divider, Chip
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import API_BASE from "./api";

export default function AdminTournamentMatches() {
  const { id } = useParams();
  const [matches, setMatches] = useState([]);
  const [players, setPlayers] = useState([]);
  const [newMatch, setNewMatch] = useState({ player1_id: "", player2_id: "", round: 1, match_order: 1 });

  const load = () => {
    fetch(`${API_BASE}/api/tournaments/${id}/matches`).then(res => res.json()).then(setMatches);
    fetch(`${API_BASE}/api/admin/players`).then(res => res.json()).then(setPlayers);
  };

  useEffect(() => { load(); }, [id]);

  const addMatch = async () => {
    if (newMatch.player1_id === newMatch.player2_id) return alert("Players must be different!");
    await fetch(`${API_BASE}/api/admin/matches`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tournament_id: id, ...newMatch })
    });
    setNewMatch({ ...newMatch, player1_id: "", player2_id: "" });
    load();
  };

  const updateMatchData = async (matchId, score1, score2) => {
    await fetch(`${API_BASE}/api/matches/${matchId}/score`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ score1, score2 })
    });
    alert("Score Saved!");
    load();
  };

  const setWinner = async (matchId, winnerId) => {
    await fetch(`${API_BASE}/api/matches/${matchId}/winner`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ winnerId })
    });
    load();
  };

  return (
    <Box p={3}>
      <Typography variant="h4" fontWeight={900} mb={3} color="primary">🎾 Match Control Center</Typography>

      {/* ADD MATCH SECTION */}
      <Card sx={{ mb: 4, bgcolor: "#fcfcfc" }}>
        <CardContent>
          <Typography variant="h6" mb={2}>Schedule New Match</Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <Select fullWidth value={newMatch.player1_id} displayEmpty onChange={(e) => setNewMatch({ ...newMatch, player1_id: e.target.value })}>
                <MenuItem value="" disabled>Select Player 1</MenuItem>
                {players.map(p => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
              </Select>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Select fullWidth value={newMatch.player2_id} displayEmpty onChange={(e) => setNewMatch({ ...newMatch, player2_id: e.target.value })}>
                <MenuItem value="" disabled>Select Player 2</MenuItem>
                {players.map(p => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
              </Select>
            </Grid>
            <Grid item xs={6} sm={2}><TextField label="Round" type="number" fullWidth value={newMatch.round} onChange={(e) => setNewMatch({ ...newMatch, round: e.target.value })} /></Grid>
            <Grid item xs={6} sm={2}><Button fullWidth variant="contained" size="large" onClick={addMatch}>Add</Button></Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* MATCH LIST */}
      <Grid container spacing={2}>
        {matches.map((m) => (
          <Grid item xs={12} md={6} key={m.id}>
            <Card elevation={3}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" mb={1}>
                  <Chip label={`Round ${m.round}`} size="small" color="primary" variant="outlined" />
                  {m.winner && <Chip label="Completed" size="small" color="success" />}
                </Stack>
                
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" sx={{ flex: 1 }}>{m.player1}</Typography>
                  <Typography sx={{ mx: 2, fontWeight: 900 }}>VS</Typography>
                  <Typography variant="h6" sx={{ flex: 1, textAlign: 'right' }}>{m.player2}</Typography>
                </Box>

                <Stack direction="row" spacing={2} mb={2}>
                  <TextField size="small" label="P1 Score" id={`s1-${m.id}`} defaultValue={m.score1} />
                  <TextField size="small" label="P2 Score" id={`s2-${m.id}`} defaultValue={m.score2} />
                  <Button variant="outlined" startIcon={<SaveIcon />} 
                    onClick={() => {
                      const s1 = document.getElementById(`s1-${m.id}`).value;
                      const s2 = document.getElementById(`s2-${m.id}`).value;
                      updateMatchData(m.id, s1, s2);
                    }}>Save</Button>
                </Stack>

                <Divider sx={{ my: 1 }} />
                <Typography variant="caption" color="text.secondary">Select Winner to advance:</Typography>
                <Stack direction="row" spacing={1} mt={1}>
                  <Button size="small" variant={m.winner_id === m.player1_id ? "contained" : "outlined"} onClick={() => setWinner(m.id, m.player1_id)}>{m.player1}</Button>
                  <Button size="small" variant={m.winner_id === m.player2_id ? "contained" : "outlined"} onClick={() => setWinner(m.id, m.player2_id)}>{m.player2}</Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}