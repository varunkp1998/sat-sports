import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  Stack
} from "@mui/material";
import { motion } from "framer-motion";
import API_BASE from "./api";

const MotionBox = motion(Box);

export default function TournamentDetails() {
  const { id } = useParams();

  const [rounds, setRounds] = useState({
    round1: [],
    semi: [],
    final: []
  });

  const [tournament, setTournament] = useState(null);

  useEffect(() => {
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

    fetch(`${API_BASE}/api/tournaments/${id}`)
      .then(res => res.json())
      .then(setTournament);

  }, [id]);

  ///////////////////////////////////////////////////////
  // MATCH CARD (UPGRADED)
  ///////////////////////////////////////////////////////

  const MatchCard = ({ m }) => (
    <MotionBox
      whileHover={{ scale: 1.05 }}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
    >
      <Card
        sx={{
          borderRadius: 4,
          minWidth: 200,
          p: 2,
          backdropFilter: "blur(10px)",
          background: "rgba(255,255,255,0.05)",
          boxShadow: "0 10px 40px rgba(0,0,0,0.6)"
        }}
      >
        <Stack spacing={1.5}>

          {/* PLAYER 1 */}
          <Box
            sx={{
              p: 1,
              borderRadius: 2,
              background:
                m.winner === m.player1
                  ? "linear-gradient(135deg,#16a34a,#22c55e)"
                  : "rgba(255,255,255,0.05)"
            }}
          >
            <Typography fontWeight={700}>
              {m.player1}
            </Typography>
          </Box>

          {/* PLAYER 2 */}
          <Box
            sx={{
              p: 1,
              borderRadius: 2,
              background:
                m.winner === m.player2
                  ? "linear-gradient(135deg,#16a34a,#22c55e)"
                  : "rgba(255,255,255,0.05)"
            }}
          >
            <Typography fontWeight={700}>
              {m.player2}
            </Typography>
          </Box>

        </Stack>
      </Card>
    </MotionBox>
  );

  ///////////////////////////////////////////////////////

  return (
    <Box sx={{ background: "#020617", minHeight: "100vh", color: "white" }}>

      {/* 🏆 HERO (UPGRADED) */}
      {tournament && (
        <Box
          sx={{
            height: "50vh",
            position: "relative",
            mb: 5,
            background: `url(${API_BASE}/uploads/${tournament.image}) center/cover`
          }}
        >
          {/* overlay */}
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to top, rgba(0,0,0,0.8), transparent)"
            }}
          />

          {/* content */}
          <MotionBox
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            sx={{
              position: "absolute",
              bottom: 30,
              left: 30
            }}
          >
            <Typography variant="h3" fontWeight={900}>
              {tournament.title}
            </Typography>

            <Typography color="gray">
              {tournament.description}
            </Typography>
          </MotionBox>
        </Box>
      )}

      {/* 🧩 BRACKETS */}
      <Box sx={{ overflowX: "auto", px: 3, pb: 6 }}>
        <Stack direction="row" spacing={8} alignItems="flex-start">

          {/* ROUND 1 */}
          <Stack spacing={3}>
            <Typography fontWeight={800}>
              Round 1
            </Typography>

            {rounds.round1.map(m => (
              <MatchCard key={m.id} m={m} />
            ))}
          </Stack>

          {/* SEMI */}
          <Stack spacing={5} mt={6}>
            <Typography fontWeight={800}>
              Semi Finals
            </Typography>

            {rounds.semi.map(m => (
              <MatchCard key={m.id} m={m} />
            ))}
          </Stack>

          {/* FINAL */}
          <Stack spacing={6} mt={10}>
            <Typography fontWeight={800}>
              Final
            </Typography>

            {rounds.final.map(m => (
              <MatchCard key={m.id} m={m} />
            ))}

            {/* 🏆 CHAMPION CARD */}
            {rounds.final[0]?.winner && (
              <MotionBox
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                <Card
                  sx={{
                    p: 3,
                    borderRadius: 4,
                    background:
                      "linear-gradient(135deg,#f97316,#ef4444)",
                    textAlign: "center",
                    boxShadow: "0 20px 60px rgba(0,0,0,0.6)"
                  }}
                >
                  <Typography fontWeight={900}>
                    🏆 Champion
                  </Typography>

                  <Typography variant="h5">
                    {rounds.final[0].winner}
                  </Typography>
                </Card>
              </MotionBox>
            )}

          </Stack>

        </Stack>
      </Box>

    </Box>
  );
}