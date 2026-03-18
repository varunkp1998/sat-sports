import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
  Select,
  MenuItem
} from "@mui/material";
import API_BASE from "./api";

export default function AdminTournamentMatches() {
  const { id } = useParams();

  const [matches, setMatches] = useState([]);
  const [players, setPlayers] = useState([]);

  const [newMatch, setNewMatch] = useState({
    player1_id: "",
    player2_id: "",
    round: 1,
    match_order: 1
  });

  const load = () => {
    fetch(`${API_BASE}/api/tournaments/${id}/matches`)
      .then(res => res.json())
      .then(setMatches);

    fetch(`${API_BASE}/api/admin/players`)
      .then(res => res.json())
      .then(setPlayers);
  };

  useEffect(() => {
    load();
  }, [id]);

  // ✅ ADD MATCH
  const addMatch = async () => {
    await fetch(`${API_BASE}/api/admin/matches`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        tournament_id: id,
        ...newMatch
      })
    });

    setNewMatch({
      player1_id: "",
      player2_id: "",
      round: 1,
      match_order: 1
    });

    load();
  };

  // ✅ UPDATE SCORE
  const updateScore = async (matchId, field, value) => {
    await fetch(`${API_BASE}/api/matches/${matchId}/score`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ [field]: value })
    });

    load();
  };

  // ✅ SET WINNER
  const setWinner = async (matchId, winnerId) => {
    await fetch(`${API_BASE}/api/matches/${matchId}/winner`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ winnerId })
    });

    load();
  };

  return (
    <Box p={3}>
      <Typography variant="h4" mb={3}>
        🎾 Match Management
      </Typography>

      {/* ➕ ADD MATCH */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography fontWeight={700}>Add Match</Typography>

          <Grid container spacing={2} mt={1}>
            <Grid item xs={6}>
              <Select
                fullWidth
                value={newMatch.player1_id}
                onChange={(e) =>
                  setNewMatch({ ...newMatch, player1_id: e.target.value })
                }
              >
                {players.map(p => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.name}
                  </MenuItem>
                ))}
              </Select>
            </Grid>

            <Grid item xs={6}>
              <Select
                fullWidth
                value={newMatch.player2_id}
                onChange={(e) =>
                  setNewMatch({ ...newMatch, player2_id: e.target.value })
                }
              >
                {players.map(p => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.name}
                  </MenuItem>
                ))}
              </Select>
            </Grid>

            <Grid item xs={3}>
              <TextField
                label="Round"
                type="number"
                fullWidth
                value={newMatch.round}
                onChange={(e) =>
                  setNewMatch({ ...newMatch, round: e.target.value })
                }
              />
            </Grid>

            <Grid item xs={3}>
              <TextField
                label="Order"
                type="number"
                fullWidth
                value={newMatch.match_order}
                onChange={(e) =>
                  setNewMatch({ ...newMatch, match_order: e.target.value })
                }
              />
            </Grid>

            <Grid item xs={6}>
              <Button fullWidth variant="contained" onClick={addMatch}>
                Add Match
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* 📋 MATCH LIST */}
      <Grid container spacing={2}>
        {matches.map((m) => (
          <Grid item xs={12} md={6} key={m.id}>
            <Card>
              <CardContent>

                <Typography fontWeight={700}>
                  Round {m.round}
                </Typography>

                <Typography>
                  {m.player1} vs {m.player2}
                </Typography>

                {/* SCORE */}
                <Box display="flex" gap={1} mt={1}>
                  <TextField
                    size="small"
                    placeholder="Score P1"
                    defaultValue={m.score1}
                    onBlur={(e) =>
                      updateScore(m.id, "score1", e.target.value)
                    }
                  />

                  <TextField
                    size="small"
                    placeholder="Score P2"
                    defaultValue={m.score2}
                    onBlur={(e) =>
                      updateScore(m.id, "score2", e.target.value)
                    }
                  />
                </Box>

                {/* WINNER */}
                <Box mt={1} display="flex" gap={1}>
                  <Button
                    size="small"
                    onClick={() => setWinner(m.id, m.player1_id)}
                  >
                    {m.player1}
                  </Button>

                  <Button
                    size="small"
                    onClick={() => setWinner(m.id, m.player2_id)}
                  >
                    {m.player2}
                  </Button>
                </Box>

                <Typography mt={1}>
                  Winner: {m.winner || "-"}
                </Typography>

              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}