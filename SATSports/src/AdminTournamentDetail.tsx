import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Tabs,
  Tab,
  Stack,
  Button,
  Grid,
  Chip,
  IconButton
} from "@mui/material";

import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";

import API_BASE from "./api";

export default function AdminTournamentDetail({ tournamentId }) {

  const [tab, setTab] = useState(0);
  const [players, setPlayers] = useState([]);
  const [matches, setMatches] = useState({
    round1: [],
    semi: [],
    final: null
  });

  ///////////////////////////////////////////////////////
  // 🔥 LOAD PLAYERS
  ///////////////////////////////////////////////////////

  useEffect(() => {
    fetch(`${API_BASE}/api/admin/tournaments/${tournamentId}/players`)
      .then(res => res.json())
      .then(setPlayers);
  }, []);

  ///////////////////////////////////////////////////////
  // 🎲 SEEDING
  ///////////////////////////////////////////////////////

  const shuffleSeeding = () => {
    setPlayers(prev => [...prev].sort(() => Math.random() - 0.5));
  };

  const move = (index, dir) => {
    const arr = [...players];
    const newIndex = index + dir;

    if (newIndex < 0 || newIndex >= arr.length) return;

    [arr[index], arr[newIndex]] = [arr[newIndex], arr[index]];
    setPlayers(arr);
  };

  ///////////////////////////////////////////////////////
  // 🧩 GENERATE BRACKETS
  ///////////////////////////////////////////////////////

  const generateBrackets = () => {
    const r1 = [];

    for (let i = 0; i < players.length; i += 2) {
      r1.push({
        p1: players[i]?.name,
        p2: players[i + 1]?.name,
        winner: null
      });
    }

    setMatches({
      round1: r1,
      semi: [],
      final: null
    });
  };

  ///////////////////////////////////////////////////////
  // 🏆 MARK WINNER
  ///////////////////////////////////////////////////////

  const pickWinner = (round, index, player) => {
    const updated = { ...matches };

    updated[round][index].winner = player;

    // 🔥 AUTO ADVANCE
    if (round === "round1") {
      const winners = updated.round1.map(m => m.winner).filter(Boolean);

      if (winners.length === updated.round1.length) {
        const semi = [];
        for (let i = 0; i < winners.length; i += 2) {
          semi.push({ p1: winners[i], p2: winners[i + 1], winner: null });
        }
        updated.semi = semi;
      }
    }

    if (round === "semi") {
      const winners = updated.semi.map(m => m.winner).filter(Boolean);

      if (winners.length === updated.semi.length) {
        updated.final = { p1: winners[0], p2: winners[1], winner: null };
      }
    }

    setMatches(updated);
  };

  const pickFinalWinner = (player) => {
    setMatches(prev => ({
      ...prev,
      final: { ...prev.final, winner: player }
    }));
  };

  ///////////////////////////////////////////////////////

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, background: "#f5f7fb", minHeight: "100vh" }}>

      <Typography variant="h4" fontWeight={800} mb={2}>
        🏆 Tournament
      </Typography>

      <Tabs
        value={tab}
        onChange={(e, v) => setTab(v)}
        variant="fullWidth"
        sx={{ mb: 3 }}
      >
        <Tab label="Overview" />
        <Tab label="Seeding" />
        <Tab label="Brackets" />
      </Tabs>

      {/* ================= OVERVIEW ================= */}
      {tab === 0 && (
        <Card sx={{ borderRadius: 4 }}>
          <CardContent>
            <Typography fontWeight={700}>
              Total Players: {players.length}
            </Typography>

            <Button sx={{ mt: 2 }} onClick={generateBrackets} variant="contained">
              Generate Brackets
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ================= SEEDING ================= */}
      {tab === 1 && (
        <Card sx={{ borderRadius: 4 }}>
          <CardContent>

            <Stack direction="row" justifyContent="space-between" mb={2}>
              <Typography fontWeight={700}>Seeding</Typography>

              <Button onClick={shuffleSeeding}>
                🎲 Auto Seed
              </Button>
            </Stack>

            <Stack spacing={1}>
              {players.map((p, i) => (
                <Card key={p.id} sx={{ p: 2, borderRadius: 3 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">

                    <Typography fontWeight={700}>
                      #{i + 1}
                    </Typography>

                    <Typography>{p.name}</Typography>

                    <Box>
                      <IconButton onClick={() => move(i, -1)}>
                        <ArrowUpwardIcon />
                      </IconButton>
                      <IconButton onClick={() => move(i, 1)}>
                        <ArrowDownwardIcon />
                      </IconButton>
                    </Box>

                  </Stack>
                </Card>
              ))}
            </Stack>

          </CardContent>
        </Card>
      )}

      {/* ================= BRACKETS ================= */}
      {tab === 2 && (
        <Box sx={{ overflowX: "auto" }}>
          <Stack direction="row" spacing={4}>

            {/* ROUND 1 */}
            <Stack spacing={2}>
              <Typography fontWeight={700}>Round 1</Typography>

              {matches.round1.map((m, i) => (
                <Card key={i} sx={{ p: 2, borderRadius: 3 }}>
                  <Stack spacing={1}>

                    <Button
                      variant={m.winner === m.p1 ? "contained" : "outlined"}
                      onClick={() => pickWinner("round1", i, m.p1)}
                    >
                      {m.p1}
                    </Button>

                    <Button
                      variant={m.winner === m.p2 ? "contained" : "outlined"}
                      onClick={() => pickWinner("round1", i, m.p2)}
                    >
                      {m.p2}
                    </Button>

                  </Stack>
                </Card>
              ))}
            </Stack>

            {/* SEMI */}
            <Stack spacing={4} mt={6}>
              <Typography fontWeight={700}>Semi Final</Typography>

              {matches.semi.map((m, i) => (
                <Card key={i} sx={{ p: 2 }}>
                  <Stack spacing={1}>
                    <Button
                      variant={m.winner === m.p1 ? "contained" : "outlined"}
                      onClick={() => pickWinner("semi", i, m.p1)}
                    >
                      {m.p1}
                    </Button>

                    <Button
                      variant={m.winner === m.p2 ? "contained" : "outlined"}
                      onClick={() => pickWinner("semi", i, m.p2)}
                    >
                      {m.p2}
                    </Button>
                  </Stack>
                </Card>
              ))}
            </Stack>

            {/* FINAL */}
            <Stack spacing={8} mt={12}>
              <Typography fontWeight={700}>Final</Typography>

              {matches.final && (
                <Card sx={{ p: 3, background: "#111", color: "#fff" }}>
                  <Stack spacing={1}>

                    <Button
                      variant={matches.final.winner === matches.final.p1 ? "contained" : "outlined"}
                      onClick={() => pickFinalWinner(matches.final.p1)}
                    >
                      {matches.final.p1}
                    </Button>

                    <Button
                      variant={matches.final.winner === matches.final.p2 ? "contained" : "outlined"}
                      onClick={() => pickFinalWinner(matches.final.p2)}
                    >
                      {matches.final.p2}
                    </Button>

                  </Stack>
                </Card>
              )}

              {matches.final?.winner && (
                <Card sx={{ p: 3, background: "#16a34a", color: "#fff" }}>
                  <Stack alignItems="center">
                    <EmojiEventsIcon fontSize="large" />
                    <Typography fontWeight={700}>
                      Champion: {matches.final.winner}
                    </Typography>
                  </Stack>
                </Card>
              )}

            </Stack>

          </Stack>
        </Box>
      )}

    </Box>
  );
}