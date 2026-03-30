import { useEffect, useState } from "react";
import {
  Box, Typography, Card, CardContent,
  Tabs, Tab, Stack, Button, IconButton, Divider, Paper
} from "@mui/material";

import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import SaveIcon from "@mui/icons-material/Save";
import AccountTreeIcon from "@mui/icons-material/AccountTree";

import API_BASE from "./api";

export default function AdminTournamentDetail({ tournamentId }) {
  const [tab, setTab] = useState(0);
  const [players, setPlayers] = useState([]);
  const [rounds, setRounds] = useState([]); // Array of Rounds, each containing matches
  const [saving, setSaving] = useState(false);

  // 1. Load Players & Existing Bracket on Mount
  useEffect(() => {
    fetch(`${API_BASE}/api/admin/tournaments/${tournamentId}/details`)
      .then(res => res.json())
      .then(data => {
        setPlayers(data.players || []);
        if (data.bracket_data) {
          setRounds(JSON.parse(data.bracket_data));
        }
      });
  }, [tournamentId]);

  // 2. Seeding Logic
  const shuffleSeeding = () => {
    setPlayers(prev => [...prev].sort(() => Math.random() - 0.5));
  };

  const movePlayer = (i, dir) => {
    const arr = [...players];
    const j = i + dir;
    if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    setPlayers(arr);
  };

  // 3. Generate Initial Bracket
  const generateBrackets = () => {
    if (players.length < 2) return alert("Add at least 2 players");
    
    const initialMatches = [];
    for (let i = 0; i < players.length; i += 2) {
      initialMatches.push({
        id: `r0-m${i/2}`,
        p1: players[i],
        p2: players[i+1] || { name: "BYE", id: 'bye' }, 
        winner: players[i+1] ? null : players[i] // Auto-win for BYE
      });
    }
    setRounds([initialMatches]);
    setTab(2);
  };

  // 4. Winner Selection & Round Progression
  const selectWinner = (rIdx, mIdx, winner) => {
    const newRounds = [...rounds];
    newRounds[rIdx][mIdx].winner = winner;

    // Progression Logic: If this round is finished, prepare the next
    const allWinnersSet = newRounds[rIdx].every(m => m.winner);

    if (allWinnersSet && newRounds[rIdx].length > 1) {
      const winners = newRounds[rIdx].map(m => m.winner);
      const nextMatches = [];
      for (let i = 0; i < winners.length; i += 2) {
        nextMatches.push({
          id: `r${rIdx+1}-m${i/2}`,
          p1: winners[i],
          p2: winners[i+1] || null,
          winner: null
        });
      }
      newRounds[rIdx + 1] = nextMatches;
    }
    setRounds(newRounds);
  };

  // 5. Save to Database
  const saveBracket = async () => {
    setSaving(true);
    try {
      const response = await fetch(`${API_BASE}/api/admin/tournaments/${tournamentId}/save-bracket`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bracketData: JSON.stringify(rounds) })
      });
      if (response.ok) alert("Tournament Progress Saved!");
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: '1400px', margin: '0 auto' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={900} color="primary">
          🏆 Tournament Manager
        </Typography>
        {rounds.length > 0 && (
          <Button 
            variant="contained" 
            startIcon={<SaveIcon />} 
            onClick={saveBracket}
            disabled={saving}
            color="success"
          >
            {saving ? "Saving..." : "Save Progress"}
          </Button>
        )}
      </Stack>

      <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="Overview" />
        <Tab label="Seeding" />
        <Tab label="Brackets" icon={<AccountTreeIcon />} iconPosition="start" />
      </Tabs>

      {/* OVERVIEW */}
      {tab === 0 && (
        <Card elevation={4}>
          <CardContent>
            <Typography variant="h6">Tournament Statistics</Typography>
            <Divider sx={{ my: 2 }} />
            <Typography>Total Registered Players: <b>{players.length}</b></Typography>
            <Typography>Status: <b>{rounds.length > 0 ? "In Progress" : "Draft"}</b></Typography>
            <Button 
                variant="contained" 
                sx={{ mt: 3 }} 
                onClick={generateBrackets}
                disabled={players.length < 2}
            >
              Initialize Bracket
            </Button>
          </CardContent>
        </Card>
      )}

      {/* SEEDING */}
      {tab === 1 && (
        <Paper elevation={0} variant="outlined" sx={{ p: 2 }}>
          <Stack direction="row" justifyContent="space-between" mb={2}>
            <Typography variant="h6">Manual Seeding</Typography>
            <Button variant="outlined" onClick={shuffleSeeding}>Randomize Seeds</Button>
          </Stack>
          <Stack spacing={1}>
            {players.map((p, i) => (
              <Card key={p.id} sx={{ p: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography fontWeight="bold" sx={{ width: 40 }}>#{i + 1}</Typography>
                <Typography sx={{ flexGrow: 1 }}>{p.name}</Typography>
                <Box>
                  <IconButton size="small" onClick={() => movePlayer(i, -1)} disabled={i === 0}>
                    <ArrowUpwardIcon />
                  </IconButton>
                  <IconButton size="small" onClick={() => movePlayer(i, 1)} disabled={i === players.length - 1}>
                    <ArrowDownwardIcon />
                  </IconButton>
                </Box>
              </Card>
            ))}
          </Stack>
        </Paper>
      )}

      {/* BRACKETS (Horizontal Scaling) */}
      {tab === 2 && (
        <Box sx={{ display: 'flex', gap: 6, overflowX: 'auto', pb: 4, minHeight: '600px', alignItems: 'center' }}>
          {rounds.map((round, rIdx) => (
            <Stack key={rIdx} spacing={6} sx={{ minWidth: 220 }}>
              <Typography variant="overline" textAlign="center" sx={{ bgcolor: '#eee', borderRadius: 1 }}>
                {rIdx === rounds.length - 1 && round.length === 1 ? "Championship" : `Round ${rIdx + 1}`}
              </Typography>
              
              {round.map((match, mIdx) => (
                <Paper key={match.id} elevation={6} sx={{ overflow: 'hidden', borderLeft: '6px solid #800000' }}>
                  <Button 
                    fullWidth 
                    variant={match.winner?.id === match.p1?.id ? "contained" : "text"}
                    onClick={() => selectWinner(rIdx, mIdx, match.p1)}
                    sx={{ justifyContent: 'start', py: 1.5, borderRadius: 0 }}
                    color="success"
                  >
                    {match.p1?.name || "TBD"}
                  </Button>
                  <Divider>VS</Divider>
                  <Button 
                    fullWidth 
                    variant={match.winner?.id === match.p2?.id ? "contained" : "text"}
                    onClick={() => selectWinner(rIdx, mIdx, match.p2)}
                    sx={{ justifyContent: 'start', py: 1.5, borderRadius: 0 }}
                    color="success"
                  >
                    {match.p2?.name || "TBD"}
                  </Button>
                </Paper>
              ))}
            </Stack>
          ))}

          {/* CHAMPION BOX */}
          {rounds.length > 0 && rounds[rounds.length - 1][0]?.winner && (
            <Stack alignItems="center" spacing={1} sx={{ minWidth: 250 }}>
              <EmojiEventsIcon sx={{ fontSize: 80, color: '#FFD700' }} />
              <Typography variant="h5" fontWeight="900">TOURNAMENT WINNER</Typography>
              <Paper sx={{ p: 2, bgcolor: '#800000', color: '#fff', textAlign: 'center', width: '100%' }}>
                <Typography variant="h6">{rounds[rounds.length - 1][0].winner.name}</Typography>
              </Paper>
            </Stack>
          )}
        </Box>
      )}
    </Box>
  );
}