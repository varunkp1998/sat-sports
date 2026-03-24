import { useEffect, useState } from "react";
import {
  Box, Typography, Card, CardContent,
  Tabs, Tab, Stack, Button, IconButton
} from "@mui/material";

import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";

import API_BASE from "./api";

export default function AdminTournamentDetail({ tournamentId }) {

  const [tab, setTab] = useState(0);
  const [players, setPlayers] = useState([]);
  const [matches, setMatches] = useState({
    round1: [], semi: [], final: null
  });

  useEffect(() => {
    fetch(`${API_BASE}/api/admin/tournaments/${tournamentId}/players`)
      .then(res => res.json())
      .then(setPlayers);
  }, [tournamentId]);

  const shuffleSeeding = () => {
    setPlayers(prev => [...prev].sort(() => Math.random() - 0.5));
  };

  const move = (i, dir) => {
    const arr = [...players];
    const j = i + dir;
    if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    setPlayers(arr);
  };

  const generateBrackets = () => {
    if (players.length < 2) return alert("Add players first");
    if (players.length % 2 !== 0) return alert("Players must be even");

    const r1 = [];
    for (let i = 0; i < players.length; i += 2) {
      r1.push({
        p1: players[i]?.name,
        p2: players[i+1]?.name,
        winner: null
      });
    }

    setMatches({ round1: r1, semi: [], final: null });
  };

  const pickWinner = (round, i, player) => {
    const updated = { ...matches };
    updated[round][i].winner = player;

    if (round === "round1") {
      const w = updated.round1.map(m=>m.winner).filter(Boolean);
      if (w.length === updated.round1.length) {
        const semi = [];
        for (let i=0;i<w.length;i+=2) {
          semi.push({ p1:w[i], p2:w[i+1], winner:null });
        }
        updated.semi = semi;
      }
    }

    if (round === "semi") {
      const w = updated.semi.map(m=>m.winner).filter(Boolean);
      if (w.length === updated.semi.length) {
        updated.final = { p1:w[0], p2:w[1], winner:null };
      }
    }

    setMatches(updated);
  };

  const pickFinalWinner = (p) => {
    setMatches(prev => ({
      ...prev,
      final: { ...prev.final, winner: p }
    }));
  };

  return (
    <Box sx={{ p: 3 }}>

      <Typography variant="h4" fontWeight={800} mb={2}>
        🏆 Tournament Dashboard
      </Typography>

      {/* EMPTY STATE */}
      {players.length === 0 && (
        <Card sx={{ p: 3 }}>
          <Typography>No players added</Typography>
          <Button
            sx={{ mt: 2 }}
            variant="contained"
            onClick={() => window.location.href = `/admin/tournaments/${tournamentId}/players`}
          >
            Add Players
          </Button>
        </Card>
      )}

      <Tabs value={tab} onChange={(e,v)=>setTab(v)}>
        <Tab label="Overview" />
        <Tab label="Seeding" />
        <Tab label="Brackets" />
      </Tabs>

      {/* OVERVIEW */}
      {tab===0 && (
        <Card sx={{ mt:2 }}>
          <CardContent>
            <Typography>Players: {players.length}</Typography>
            <Button sx={{ mt:2 }} variant="contained" onClick={generateBrackets}>
              Generate Brackets
            </Button>
          </CardContent>
        </Card>
      )}

      {/* SEEDING */}
      {tab===1 && (
        <Card sx={{ mt:2 }}>
          <CardContent>

            <Button onClick={shuffleSeeding}>Shuffle</Button>

            <Stack spacing={1} mt={2}>
              {players.map((p,i)=>(
                <Card key={p.id} sx={{ p:2 }}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography>#{i+1}</Typography>
                    <Typography>{p.name}</Typography>

                    <Box>
                      <IconButton onClick={()=>move(i,-1)}>
                        <ArrowUpwardIcon/>
                      </IconButton>
                      <IconButton onClick={()=>move(i,1)}>
                        <ArrowDownwardIcon/>
                      </IconButton>
                    </Box>
                  </Stack>
                </Card>
              ))}
            </Stack>

          </CardContent>
        </Card>
      )}

      {/* BRACKETS */}
      {tab===2 && (
        <Stack direction="row" spacing={4} mt={2}>

          <Stack spacing={2}>
            <Typography>Round 1</Typography>
            {matches.round1.map((m,i)=>(
              <Card key={i} sx={{ p:2 }}>
                <Button onClick={()=>pickWinner("round1",i,m.p1)}>
                  {m.p1}
                </Button>
                <Button onClick={()=>pickWinner("round1",i,m.p2)}>
                  {m.p2}
                </Button>
              </Card>
            ))}
          </Stack>

          <Stack spacing={2}>
            <Typography>Semi</Typography>
            {matches.semi.map((m,i)=>(
              <Card key={i} sx={{ p:2 }}>
                <Button onClick={()=>pickWinner("semi",i,m.p1)}>
                  {m.p1}
                </Button>
                <Button onClick={()=>pickWinner("semi",i,m.p2)}>
                  {m.p2}
                </Button>
              </Card>
            ))}
          </Stack>

          <Stack spacing={2}>
            <Typography>Final</Typography>

            {matches.final && (
              <Card sx={{ p:2 }}>
                <Button onClick={()=>pickFinalWinner(matches.final.p1)}>
                  {matches.final.p1}
                </Button>
                <Button onClick={()=>pickFinalWinner(matches.final.p2)}>
                  {matches.final.p2}
                </Button>
              </Card>
            )}

            {matches.final?.winner && (
              <Card sx={{ p:2, background:"#16a34a", color:"#fff" }}>
                <EmojiEventsIcon/>
                <Typography>
                  Champion: {matches.final.winner}
                </Typography>
              </Card>
            )}

          </Stack>

        </Stack>
      )}

    </Box>
  );
}