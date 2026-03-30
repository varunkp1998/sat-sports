import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Box, Typography, Card, Stack, Divider } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import API_BASE from "./api";
import "./ticker.css"; 

const MotionBox = motion(Box);

export default function TournamentDetails() {
  const { id } = useParams();
  const [tournament, setTournament] = useState(null);
  const [allMatches, setAllMatches] = useState([]); 
  const [rounds, setRounds] = useState({ round1: [], semi: [], final: [] });

  // 1. LIVE DATA FETCHING
  const loadData = () => {
    fetch(`${API_BASE}/api/tournaments/${id}/matches`)
      .then((res) => res.json())
      .then((data) => {
        setAllMatches(data);
        const grouped = { round1: [], semi: [], final: [] };
        data.forEach((m) => {
          // Supports both numeric (1, 2, 3) and string ("round1") round identifiers
          if (m.round === "round1" || m.round === 1 || m.round === "1") grouped.round1.push(m);
          else if (m.round === "semi" || m.round === 2 || m.round === "2") grouped.semi.push(m);
          else if (m.round === "final" || m.round === 3 || m.round === "3") grouped.final.push(m);
        });
        setRounds(grouped);
      });

    fetch(`${API_BASE}/api/tournaments/${id}`)
      .then((res) => res.json())
      .then(setTournament);
  };

  useEffect(() => {
    loadData();
    const timer = setInterval(loadData, 20000); // Refresh every 20s
    return () => clearInterval(timer);
  }, [id]);

  // 2. REUSABLE MATCH CARD
  const MatchCard = ({ m }) => (
    <MotionBox
      whileHover={{ scale: 1.03 }}
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
    >
      <Card
        sx={{
          borderRadius: 3,
          minWidth: 240,
          p: 2,
          background: "rgba(255,255,255,0.03)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        }}
      >
        <Stack spacing={1}>
          {/* PLAYER 1 */}
          <Box
            sx={{
              p: 1,
              borderRadius: 1.5,
              display: "flex",
              justifyContent: "space-between",
              bgcolor: m.winner_id === m.player1_id ? "rgba(22, 163, 74, 0.2)" : "transparent",
              border: m.winner_id === m.player1_id ? "1px solid #16a34a" : "1px solid transparent"
            }}
          >
            <Typography variant="body2" fontWeight={m.winner_id === m.player1_id ? 800 : 400}>
                {m.player1}
            </Typography>
            <Typography variant="body2" fontWeight={900}>{m.score1 || 0}</Typography>
          </Box>

          <Typography variant="caption" sx={{ alignSelf: 'center', opacity: 0.3 }}>VS</Typography>

          {/* PLAYER 2 */}
          <Box
            sx={{
              p: 1,
              borderRadius: 1.5,
              display: "flex",
              justifyContent: "space-between",
              bgcolor: m.winner_id === m.player2_id ? "rgba(22, 163, 74, 0.2)" : "transparent",
              border: m.winner_id === m.player2_id ? "1px solid #16a34a" : "1px solid transparent"
            }}
          >
            <Typography variant="body2" fontWeight={m.winner_id === m.player2_id ? 800 : 400}>
                {m.player2}
            </Typography>
            <Typography variant="body2" fontWeight={900}>{m.score2 || 0}</Typography>
          </Box>
        </Stack>
      </Card>
    </MotionBox>
  );

  return (
    <Box sx={{ background: "#020617", minHeight: "100vh", color: "white", overflowX: "hidden" }}>
      
      {/* 🔴 LIVE TICKER BAR */}
      <Box sx={{ bgcolor: "#800000", py: 1.2, overflow: "hidden", whiteSpace: "nowrap", borderBottom: "1px solid #ff4d4d" }}>
        <div className="ticker-scroll">
          {allMatches.concat(allMatches).map((m, i) => (
            <Typography key={i} component="span" sx={{ px: 4, fontWeight: 700, fontSize: "0.8rem", letterSpacing: 1 }}>
              <span style={{ color: "#ffd700" }}>LIVE •</span> {m.player1.toUpperCase()} ({m.score1 || 0}) VS {m.player2.toUpperCase()} ({m.score2 || 0})
            </Typography>
          ))}
        </div>
      </Box>

      {/* 🏆 HEADER SECTION */}
      {tournament && (
        <Box sx={{ 
          height: "45vh", 
          position: "relative", 
          display: 'flex', 
          alignItems: 'flex-end', 
          p: { xs: 3, md: 6 },
          backgroundImage: `linear-gradient(to top, #020617, rgba(2, 6, 23, 0.3)), url(${API_BASE}/uploads/${tournament.image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}>
          <MotionBox initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Typography variant="h2" fontWeight={900} sx={{ textTransform: "uppercase", letterSpacing: -2, lineHeight: 1 }}>
              {tournament.title}
            </Typography>
            <Typography variant="h6" sx={{ color: "rgba(255,255,255,0.6)", mt: 1, maxWidth: 600 }}>
                {tournament.description}
            </Typography>
          </MotionBox>
        </Box>
      )}

      {/* 🧩 THE BRACKET ENGINE */}
      <Box sx={{ overflowX: "auto", px: 4, py: 8 }}>
        <Stack direction="row" spacing={10} sx={{ minWidth: "max-content", pb: 4 }}>
          
          {/* ROUND 1 */}
          <Stack spacing={4}>
            <Typography color="primary" fontWeight={900} variant="overline" textAlign="center">Round 01</Typography>
            {rounds.round1.map((m) => <MatchCard key={m.id} m={m} />)}
          </Stack>

          {/* SEMI FINALS */}
          <Stack spacing={14} justifyContent="center">
            <Typography color="primary" fontWeight={900} variant="overline" textAlign="center">Semi Finals</Typography>
            {rounds.semi.map((m) => <MatchCard key={m.id} m={m} />)}
          </Stack>

          {/* THE FINALS & CHAMPION */}
          <Stack spacing={8} justifyContent="center">
            <Typography color="secondary" fontWeight={900} variant="overline" textAlign="center">Grand Final</Typography>
            {rounds.final.map((m) => <MatchCard key={m.id} m={m} />)}

            <AnimatePresence>
              {rounds.final[0]?.winner && (
                <MotionBox 
                    initial={{ scale: 0, rotate: -10 }} 
                    animate={{ scale: 1, rotate: 0 }} 
                    sx={{ mt: 4 }}
                >
                  <Card sx={{ 
                    p: 3, 
                    borderRadius: 4, 
                    background: "linear-gradient(135deg, #fbbf24, #f59e0b)", 
                    textAlign: "center",
                    boxShadow: "0 0 40px rgba(245, 158, 11, 0.4)"
                  }}>
                    <Typography variant="h6" fontWeight={900} color="#000">🏆 CHAMPION</Typography>
                    <Typography variant="h4" fontWeight={900} color="#000">{rounds.final[0].winner}</Typography>
                  </Card>
                </MotionBox>
              )}
            </AnimatePresence>
          </Stack>

        </Stack>
      </Box>
    </Box>
  );
}