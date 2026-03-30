import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Box, Typography, Card, Stack, Container, Divider, Dialog, 
  DialogContent, Fade, IconButton, Button, Tooltip, Zoom 
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseIcon from "@mui/icons-material/Close";
import PlaceIcon from "@mui/icons-material/Place";
import ShareIcon from "@mui/icons-material/Share";
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import API_BASE from "./api";
import "./ticker.css";

const MotionBox = motion(Box);

// 🛠️ Bracket Connection Line Component
const BracketLine = ({ height }: { height: number }) => (
  <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', height: '100%', width: 40 }}>
    <Box sx={{ 
      width: 20, height: height, 
      border: '2px solid rgba(255,255,255,0.1)', 
      borderLeft: 'none', borderRadius: '0 12px 12px 0' 
    }} />
    <Box sx={{ width: 20, height: 2, bgcolor: 'rgba(255,255,255,0.1)' }} />
  </Box>
);

export default function TournamentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tournament, setTournament] = useState<any>(null);
  const [allMatches, setAllMatches] = useState([]);
  const [rounds, setRounds] = useState({ round1: [], semi: [], final: [] });
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [open, setOpen] = useState(false);

  const loadData = async () => {
    try {
      const matchRes = await fetch(`${API_BASE}/api/tournaments/${id}/matches`);
      const matchData = await matchRes.json();
      setAllMatches(matchData);

      const grouped = { round1: [], semi: [], final: [] };
      matchData.forEach((m: any) => {
        if (m.round === "round1" || m.round == 1) grouped.round1.push(m);
        else if (m.round === "semi" || m.round == 2) grouped.semi.push(m);
        else if (m.round === "final" || m.round == 3) grouped.final.push(m);
      });
      setRounds(grouped);

      const tourneyRes = await fetch(`${API_BASE}/api/tournaments/${id}`);
      const tourneyData = await tourneyRes.json();
      setTournament(tourneyData);
    } catch (err) { console.error("Update failed", err); }
  };

  useEffect(() => {
    loadData();
    const timer = setInterval(loadData, 15000); // 15s refresh
    return () => clearInterval(timer);
  }, [id]);

  const handleMatchClick = (m: any) => {
    setSelectedMatch(m);
    setOpen(true);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Tournament link copied to clipboard! 🎾");
  };

  // 🎾 Internal Component: Match Card
  const MatchCard = ({ m }: { m: any }) => (
    <MotionBox 
      whileHover={{ scale: 1.05, x: 5 }} 
      onClick={() => handleMatchClick(m)}
      sx={{ cursor: 'pointer' }}
    >
      <Card sx={matchCardStyle}>
        <Stack spacing={1.5}>
          <Box sx={playerRowStyle(m.winner_id === m.player1_id)}>
            <Typography variant="body2" fontWeight={m.winner_id === m.player1_id ? 900 : 500}>
              {m.player1}
            </Typography>
            <Typography sx={scoreBoxStyle}>{m.score1 || 0}</Typography>
          </Box>
          <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)' }} />
          <Box sx={playerRowStyle(m.winner_id === m.player2_id)}>
            <Typography variant="body2" fontWeight={m.winner_id === m.player2_id ? 900 : 500}>
              {m.player2}
            </Typography>
            <Typography sx={scoreBoxStyle}>{m.score2 || 0}</Typography>
          </Box>
        </Stack>
      </Card>
    </MotionBox>
  );

  return (
    <Box sx={{ background: "#020617", minHeight: "100vh", color: "white" }}>
      
      {/* 🔴 LIVE TICKER */}
      <Box sx={tickerBarStyle}>
        <div className="ticker-scroll">
          {allMatches.concat(allMatches).map((m: any, i) => (
            <Typography key={i} component="span" sx={{ px: 4, fontWeight: 800, fontSize: "0.7rem", letterSpacing: 1.5 }}>
              <span style={{ color: "#ef4444" }}>● LIVE</span> {m.player1.toUpperCase()} VS {m.player2.toUpperCase()}
            </Typography>
          ))}
        </div>
      </Box>

      {/* 🏆 HERO HEADER */}
      {tournament && (
        <Box sx={{ 
          height: "45vh", position: "relative", display: 'flex', alignItems: 'flex-end',
          backgroundImage: `linear-gradient(to top, #020617, transparent), url(${API_BASE}/uploads/${tournament.image})`,
          backgroundSize: 'cover', backgroundPosition: 'center', p: { xs: 3, md: 8 }
        }}>
          <IconButton onClick={() => navigate(-1)} sx={backButtonStyle}><ArrowBackIcon /></IconButton>
          
          <MotionBox initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Stack direction="row" spacing={2} alignItems="center" mb={1}>
              <EmojiEventsIcon sx={{ color: '#fbbf24' }} />
              <Typography sx={{ color: "#ef4444", fontWeight: 900, letterSpacing: 3 }}>PRO TOURNAMENT</Typography>
            </Stack>
            <Typography variant="h2" fontWeight={950} sx={{ textTransform: "uppercase", fontSize: { xs: '2.5rem', md: '5rem' } }}>
              {tournament.title}
            </Typography>
            <Button startIcon={<ShareIcon />} onClick={handleShare} sx={shareButtonStyle}>Share Bracket</Button>
          </MotionBox>
        </Box>
      )}

      {/* 🧩 THE BRACKET ENGINE */}
      <Box sx={{ overflowX: "auto", py: 10, px: 4 }}>
        <Stack direction="row" spacing={4} sx={{ minWidth: "max-content", justifyContent: 'center' }}>
          
          <Stack spacing={4}>
            <Typography sx={roundHeaderStyle}>Quarter Finals</Typography>
            {rounds.round1.map((m: any) => <MatchCard key={m.id} m={m} />)}
          </Stack>

          <BracketLine height={140} />

          <Stack spacing={20} justifyContent="center">
            <Typography sx={roundHeaderStyle}>Semi Finals</Typography>
            {rounds.semi.map((m: any) => <MatchCard key={m.id} m={m} />)}
          </Stack>

          <BracketLine height={320} />

          <Stack spacing={8} justifyContent="center">
            <Typography sx={{ ...roundHeaderStyle, color: '#fbbf24' }}>Final Match</Typography>
            {rounds.final.map((m: any) => <MatchCard key={m.id} m={m} />)}

            <AnimatePresence>
              {rounds.final[0]?.winner_id && (
                <MotionBox initial={{ scale: 0, y: 30 }} animate={{ scale: 1, y: 0 }} sx={{ mt: 6 }}>
                  <Box sx={championCardStyle}>
                    <Typography variant="overline" fontWeight={900} color="#000" sx={{ opacity: 0.6 }}>WINNER & CHAMPION</Typography>
                    <Typography variant="h4" fontWeight={950} color="#000">{rounds.final[0].winner_name}</Typography>
                  </Box>
                </MotionBox>
              )}
            </AnimatePresence>
          </Stack>
        </Stack>
      </Box>

      {/* 🔍 MATCH DETAIL MODAL */}
      <Dialog open={open} onClose={() => setOpen(false)} TransitionComponent={Zoom} PaperProps={{ sx: modalPaperStyle }} maxWidth="xs" fullWidth>
        <IconButton onClick={() => setOpen(false)} sx={closeBtnStyle}><CloseIcon /></IconButton>
        {selectedMatch && (
          <DialogContent sx={{ p: 4, textAlign: 'center' }}>
             <Typography variant="overline" sx={{ color: "#ef4444", fontWeight: 900 }}>MATCH STATISTICS</Typography>
             
             <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ my: 4, bgcolor: 'rgba(255,255,255,0.03)', p: 3, borderRadius: 4 }}>
                <Box flex={1}>
                  <Typography variant="h5" fontWeight={900}>{selectedMatch.player1}</Typography>
                  <Typography variant="caption" sx={{ opacity: 0.5 }}>SEED #1</Typography>
                </Box>
                <Box sx={vsCircleStyle}>VS</Box>
                <Box flex={1}>
                  <Typography variant="h5" fontWeight={900}>{selectedMatch.player2}</Typography>
                  <Typography variant="caption" sx={{ opacity: 0.5 }}>SEED #4</Typography>
                </Box>
             </Stack>

             <Typography variant="body2" sx={{ opacity: 0.4, mb: 2, fontWeight: 800 }}>SET SCORES</Typography>
             <Stack direction="row" spacing={2} justifyContent="center" mb={4}>
                {(selectedMatch.sets || [[6,4], [7,5]]).map((set: any, i: number) => (
                  <Box key={i} sx={setBoxStyle}>
                    <Typography fontWeight={900} color={set[0] > set[1] ? "#ef4444" : "white"}>{set[0]}</Typography>
                    <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
                    <Typography fontWeight={900} color={set[1] > set[0] ? "#ef4444" : "white"}>{set[1]}</Typography>
                  </Box>
                ))}
             </Stack>

             <Stack direction="row" justifyContent="center" spacing={4}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <PlaceIcon sx={{ color: '#ef4444', fontSize: 20 }} />
                  <Typography variant="body2" fontWeight={800}>Court {selectedMatch.court_number || 1}</Typography>
                </Stack>
                <Typography variant="body2" fontWeight={800} sx={{ color: '#22c55e' }}>● {selectedMatch.status || 'Finished'}</Typography>
             </Stack>
          </DialogContent>
        )}
      </Dialog>
    </Box>
  );
}

// 🎨 DESIGN SYSTEM (STYLING OBJECTS)
const tickerBarStyle = { bgcolor: "#000", py: 1.5, overflow: "hidden", whiteSpace: "nowrap", borderBottom: "1px solid rgba(255,255,255,0.1)" };
const backButtonStyle = { position: 'absolute', top: 30, left: 30, color: 'white', bgcolor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', '&:hover': { bgcolor: '#ef4444' } };
const matchCardStyle = { borderRadius: 4, width: 260, p: 2, background: "rgba(255,255,255,0.02)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.08)", transition: '0.3s' };
const scoreBoxStyle = { bgcolor: 'rgba(0,0,0,0.4)', px: 1.2, py: 0.5, borderRadius: 1, fontWeight: 900, color: '#ef4444', border: '1px solid rgba(255,255,255,0.05)' };
const playerRowStyle = (isWinner: boolean) => ({ p: 1.5, borderRadius: 2, display: "flex", justifyContent: "space-between", alignItems: 'center', bgcolor: isWinner ? "rgba(34, 197, 94, 0.15)" : "transparent", border: isWinner ? "1px solid rgba(34, 197, 94, 0.4)" : "1px solid transparent" });
const roundHeaderStyle = { color: "rgba(255,255,255,0.2)", fontWeight: 900, letterSpacing: 3, textTransform: 'uppercase', fontSize: '0.75rem', textAlign: 'center', mb: 3 };
const championCardStyle = { p: 4, borderRadius: 6, background: "linear-gradient(135deg, #fbbf24, #f59e0b)", textAlign: "center", boxShadow: "0 0 80px rgba(245, 158, 11, 0.4)" };
const shareButtonStyle = { mt: 3, bgcolor: 'rgba(255,255,255,0.1)', color: 'white', fontWeight: 700, borderRadius: 2, px: 3, backdropFilter: 'blur(10px)', '&:hover': { bgcolor: 'white', color: 'black' } };
const modalPaperStyle = { bgcolor: "#0f172a", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", color: "white", overflow: 'visible' };
const vsCircleStyle = { width: 44, height: 44, borderRadius: '50%', bgcolor: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.8rem', boxShadow: '0 0 30px rgba(239, 68, 68, 0.5)', border: '4px solid #0f172a' };
const setBoxStyle = { display: 'flex', gap: 1.5, px: 2.5, py: 1.5, borderRadius: 3, bgcolor: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.05)' };
const closeBtnStyle = { position: 'absolute', top: -20, right: -20, bgcolor: '#ef4444', color: 'white', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', '&:hover': { bgcolor: '#dc2626' } };