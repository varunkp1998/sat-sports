import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack
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

    // tournament
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
        minWidth: 180,
        p: 1.5,
        background: "#fff",
        position: "relative"
      }}
    >
      <Stack spacing={1}>

        <Box
          sx={{
            p: 1,
            borderRadius: 2,
            background: m.winner === m.player1 ? "#dcfce7" : "#f9fafb"
          }}
        >
          <Typography fontWeight={600}>{m.player1}</Typography>
        </Box>

        <Box
          sx={{
            p: 1,
            borderRadius: 2,
            background: m.winner === m.player2 ? "#dcfce7" : "#f9fafb"
          }}
        >
          <Typography fontWeight={600}>{m.player2}</Typography>
        </Box>

      </Stack>
    </Card>
  );

  ///////////////////////////////////////////////////////

  return (
    <Box sx={{ background: "#0f172a", minHeight: "100vh", color: "#fff" }}>

      {/* 🏆 HERO */}
      {tournament && (
        <Box
          sx={{
            height: 260,
            position: "relative",
            mb: 3,
            background: `url(${API_BASE}/uploads/${tournament.image}) center/cover`
          }}
        >

          {/* overlay */}
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)"
            }}
          />

          {/* text */}
          <Box
            sx={{
              position: "absolute",
              bottom: 20,
              left: 20
            }}
          >
            <Typography variant="h4" fontWeight={800}>
              {tournament.title}
            </Typography>

            <Typography sx={{ opacity: 0.8 }}>
              {tournament.description}
            </Typography>
          </Box>

        </Box>
      )}

      {/* 🧩 BRACKETS */}
      <Box sx={{ overflowX: "auto", px: 2, pb: 5 }}>
        <Stack direction="row" spacing={6}>

          {/* ROUND 1 */}
          <Stack spacing={3}>
            <Typography fontWeight={700}>Round 1</Typography>

            {rounds.round1.map(m => (
              <MatchCard key={m.id} m={m} />
            ))}
          </Stack>

          {/* SEMI */}
          <Stack spacing={6} mt={6}>
            <Typography fontWeight={700}>Semi</Typography>

            {rounds.semi.map(m => (
              <MatchCard key={m.id} m={m} />
            ))}
          </Stack>

          {/* FINAL */}
          <Stack spacing={10} mt={10}>
            <Typography fontWeight={700}>Final</Typography>

            {rounds.final.map(m => (
              <MatchCard key={m.id} m={m} />
            ))}

            {/* 🏆 CHAMPION */}
            {rounds.final[0]?.winner && (
              <Card
                sx={{
                  p: 2,
                  borderRadius: 3,
                  background: "linear-gradient(135deg,#16a34a,#22c55e)",
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

    </Box>
  );
}