import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Chip
} from "@mui/material";
import API_BASE from "./api";

export default function TournamentDetails() {
  const { id } = useParams();

  const [rounds, setRounds] = useState({
    round1: [],
    semi: [],
    final: []
  });
  const [tournament, setTournament] = useState(null);
  useEffect(() => {
    // matches
    fetch(`${API_BASE}/api/tournaments/${id}/matches`)
      .then(res => res.json())
      .then(data => {
        const grouped = { round1: [], semi: [], final: [] };
  
        data.forEach(m => {
          if (m.round === "round1") grouped.round1.push(m);
          else if (m.round === "semi") grouped.semi.push(m);
          else if (m.round === "final") grouped.final.push(m);
        });
  
        setRounds(grouped);
      });
  
    // 🔥 tournament details (NEW)
    fetch(`${API_BASE}/api/tournaments/${id}`)
      .then(res => res.json())
      .then(setTournament);
  
  }, [id]);
  ///////////////////////////////////////////////////////
  // MATCH CARD
  ///////////////////////////////////////////////////////

  const MatchCard = ({ m }) => (
    <Card
      sx={{
        borderRadius: 3,
        p: 1.5,
        minWidth: 180,
        background: "#fff",
        boxShadow: "0 6px 16px rgba(0,0,0,0.05)"
      }}
    >
      <Stack spacing={1}>

        <Box
          sx={{
            p: 1,
            borderRadius: 2,
            background: m.winner === m.player1 ? "#d1fae5" : "#f9fafb"
          }}
        >
          <Typography fontWeight={600}>{m.player1}</Typography>
          <Typography fontSize={12}>
            {m.score1 || "-"}
          </Typography>
        </Box>

        <Box
          sx={{
            p: 1,
            borderRadius: 2,
            background: m.winner === m.player2 ? "#d1fae5" : "#f9fafb"
          }}
        >
          <Typography fontWeight={600}>{m.player2}</Typography>
          <Typography fontSize={12}>
            {m.score2 || "-"}
          </Typography>
        </Box>

        <Chip
          label={m.status || "scheduled"}
          size="small"
        />

      </Stack>
    </Card>
  );

  ///////////////////////////////////////////////////////

  return (
    <Box sx={{ p: 2, background: "#f5f7fb", minHeight: "100vh" }}>
{tournament && (
  <Card sx={{ mb: 3, borderRadius: 4 }}>
    <CardContent>

      {/* IMAGE */}
      {tournament.image && (
        <Box
          component="img"
          src={`${API_BASE}/uploads/${tournament.image}`} // 🔥 IMPORTANT
          alt="tournament"
          sx={{
            width: "100%",
            height: 200,
            objectFit: "cover",
            borderRadius: 2,
            mb: 2
          }}
        />
      )}

      <Typography variant="h5" fontWeight={800}>
        {tournament.title}
      </Typography>

      <Typography color="text.secondary">
        {tournament.description}
      </Typography>

    </CardContent>
  </Card>
)}
      <Typography variant="h5" fontWeight={800} mb={2}>
        🏆 Tournament Brackets
      </Typography>

      <Box sx={{ overflowX: "auto" }}>
        <Stack direction="row" spacing={4}>

          {/* ROUND 1 */}
          <Stack spacing={2}>
            <Typography fontWeight={700}>Round 1</Typography>

            {rounds.round1.map(m => (
              <MatchCard key={m.id} m={m} />
            ))}
          </Stack>

          {/* SEMI */}
          <Stack spacing={4} mt={4}>
            <Typography fontWeight={700}>Semi Final</Typography>

            {rounds.semi.map(m => (
              <MatchCard key={m.id} m={m} />
            ))}
          </Stack>

          {/* FINAL */}
          <Stack spacing={8} mt={8}>
            <Typography fontWeight={700}>Final</Typography>

            {rounds.final.map(m => (
              <MatchCard key={m.id} m={m} />
            ))}

            {/* CHAMPION */}
            {rounds.final[0]?.winner && (
              <Card
                sx={{
                  p: 2,
                  borderRadius: 3,
                  background: "#16a34a",
                  color: "#fff",
                  textAlign: "center"
                }}
              >
                <Typography fontWeight={700}>
                  🏆 Champion
                </Typography>

                <Typography variant="h6">
                  {rounds.final[0].winner}
                </Typography>
              </Card>
            )}

          </Stack>

        </Stack>
      </Box>

      {rounds.round1.length === 0 && (
        <Typography mt={3}>
          No matches yet
        </Typography>
      )}

    </Box>
  );
}