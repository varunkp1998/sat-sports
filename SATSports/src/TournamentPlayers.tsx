import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Checkbox
} from "@mui/material";
import API_BASE from "./api";

export default function TournamentPlayers() {
  const { id } = useParams();

  const [players, setPlayers] = useState([]);
  const [selected, setSelected] = useState([]);

  // load all players
  useEffect(() => {
    fetch(`${API_BASE}/api/admin/players`)
      .then(res => res.json())
      .then(setPlayers);
  }, []);

  const toggle = (playerId) => {
    setSelected(prev =>
      prev.includes(playerId)
        ? prev.filter(id => id !== playerId)
        : [...prev, playerId]
    );
  };

  const save = async () => {
    await fetch(`${API_BASE}/api/admin/tournaments/${id}/players`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ players: selected })
    });

    alert("Players added ✅");
  };

  return (
    <Box p={3}>
      <Typography variant="h5" mb={2}>
        Select Players
      </Typography>

      <Grid container spacing={2}>
        {players.map(p => (
          <Grid item xs={12} md={4} key={p.id}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1}>
                  <Checkbox
                    checked={selected.includes(p.id)}
                    onChange={() => toggle(p.id)}
                  />
                  <Typography>{p.name}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Button variant="contained" sx={{ mt: 2 }} onClick={save}>
        Save Players
      </Button>
    </Box>
  );
}