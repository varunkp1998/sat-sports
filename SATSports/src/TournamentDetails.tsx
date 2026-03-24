import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip
} from "@mui/material";
import API_BASE from "./api";

export default function TournamentDetails() {
  const { id } = useParams();

  const [matches, setMatches] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/api/tournaments/${id}/matches`)
      .then(res => res.json())
      .then(setMatches);
  }, [id]);

  return (
    <Box sx={{ p: 3, background: "#f5f7fb", minHeight: "100vh" }}>

      <Typography variant="h4" fontWeight={800} mb={3}>
        🏆 Tournament Matches
      </Typography>

      <Grid container spacing={3}>
        {matches.map((m) => (
          <Grid item xs={12} md={6} key={m.id}>
            <Card sx={{ borderRadius: 4 }}>
              <CardContent>

                {/* ROUND */}
                <Typography fontWeight={700}>
                  Round {m.round}
                </Typography>

                {/* MATCH */}
                <Typography mt={1}>
                  {m.player1} vs {m.player2}
                </Typography>

                {/* SCORE */}
                <Typography mt={1}>
                  {m.score1 || "-"} : {m.score2 || "-"}
                </Typography>

                {/* STATUS */}
                <Chip
                  label={m.status || "scheduled"}
                  size="small"
                  sx={{ mt: 1 }}
                />

                {/* WINNER */}
                <Typography mt={1}>
                  🏆 Winner: {m.winner || "-"}
                </Typography>

              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {matches.length === 0 && (
        <Typography mt={3}>
          No matches yet
        </Typography>
      )}

    </Box>
  );
}