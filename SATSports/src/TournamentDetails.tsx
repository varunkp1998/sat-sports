import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Box, Typography, Card, Stack, Container, Divider, Dialog, 
  Fade, IconButton, Button, Grid, Zoom, DialogContent 
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseIcon from "@mui/icons-material/Close";
import PlaceIcon from "@mui/icons-material/Place";
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ShareIcon from "@mui/icons-material/Share";
import API_BASE from "./api";
import "./ticker.css";

const MotionBox = motion(Box);

export default function TournamentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tournament, setTournament] = useState<any>(null);
  const [allMatches, setAllMatches] = useState([]);
  const [rounds, setRounds] = useState({ round1: [], semi: [], final: [] });
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [open, setOpen] = useState(false);

  // 📡 DATA LOGIC
  const loadData = async () => {
    try {
      const [mRes, tRes] = await Promise.all([
        fetch(`${API_BASE}/api/tournaments/${id}/matches`),
        fetch(`${API_BASE}/api/tournaments/${id}`)
      ]);
      const matchData = await mRes.json();
      const tourneyData = await tRes.json();

      setAllMatches(matchData);
      setTournament(tourneyData);

      const grouped = { round1: [], semi: [], final: [] };
      matchData.forEach((m: any) => {
        if (m.round === "round1" || m.round == 1) grouped.round1.push(m);
        else if (m.round === "semi" || m.round == 2) grouped.semi.push(m);
        else if (m.round === "final" || m.round == 3) grouped.final.push(m);
      });
      setRounds(grouped);
    } catch (err) { console.error("Sync error", err); }
  };

  useEffect(() => {
    loadData();
    const timer = setInterval(loadData, 20000);
    return () => clearInterval(timer);
  }, [id]);

  const handleMatchClick = (m: any) => {
    setSelectedMatch(m);
    setOpen(true);
  };

  return (
    <Box sx={{ background: "#020617", color: "white", minHeight: "100vh", overflowX: 'hidden' }}>
      
      {/* 🔴 LIVE TICKER (Sports Aesthetic) */}
      <Box sx={tickerStyle}>
        <div className="ticker-scroll">
          {allMatches.concat(allMatches).map((m: any, i) => (
            <Typography key={i} component="span" sx={tickerTextStyle}>
              <span style={{ color: "#ef4444" }}>● LIVE</span> {m.player1.toUpperCase()} vs {m.player2.toUpperCase()}
            </Typography>
          ))}
        </div>
      </Box>

      {/* 🎾 CINEMATIC HERO (Matches Home/About) */}
      <Box sx={{ 
        height: "65vh", position: "relative", display: 'flex', alignItems: 'center',
        backgroundImage: `linear-gradient(to right, #020617, rgba(2,6,23,0.4)), url(${API_BASE}/uploads/${tournament?.image})`,
        backgroundSize: 'cover', backgroundPosition: 'center'
      }}>
        <Container>
          <IconButton onClick={() => navigate(-1)} sx={backButtonStyle}><ArrowBackIcon /></IconButton>
          
          <MotionBox initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
            <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                <EmojiEventsIcon sx={{ color: '#ef4444' }} />
                <Typography variant="overline" sx={{ color: "#ef4444", fontWeight: 900, letterSpacing: 4 }}>OFFICIAL DRAW</Typography>
            </Stack>
            <Typography variant="h1" fontWeight={950} sx={{ fontSize: { xs: '3rem', md: '5.5rem' }, mb: 2, lineHeight: 1 }}>
              {tournament?.title?.toUpperCase()}
            </Typography>
            <Typography variant="h6" sx={{ color: "rgba(255,255,255,0.6)", maxWidth: '600px', mb: 4, lineHeight: 1.6 }}>
              {tournament?.description}
            </Typography>
            <Stack direction="row" spacing={2}>
                <Button variant="contained" sx={primaryBtnStyle}>Register Now</Button>
                <Button variant="outlined" sx={outlineBtnStyle} startIcon={<ShareIcon />}>Share Draw</Button>
            </Stack>
          </MotionBox>
        </Container>
      </Box>

      {/* 📊 QUICK STATS STRIP */}
      <Box sx={{ py: 4, bgcolor: 'rgba(255,255,255,0.02)', borderY: '1px solid rgba(255,255,255,0.05)' }}>
        <Container>
          <Grid container justifyContent="space-around" textAlign="center">
            <Grid item><Typography variant="h4" sx={statNumStyle}>16</Typography><Typography variant="caption" sx={statLabelStyle}>PLAYERS</Typography></Grid>
            <Grid item><Typography variant="h4" sx={statNumStyle}>$2.5K</Typography><Typography variant="caption" sx={statLabelStyle}>PRIZE POOL</Typography></Grid>
            <Grid item><Typography variant="h4" sx={statNumStyle}>03</Typography><Typography variant="caption" sx={statLabelStyle}>ROUNDS</Typography></Grid>
          </Grid>
        </Container>
      </Box>

      {/* 🧩 THE BRACKET ENGINE */}
      <Box sx={{ py: 15, background: 'radial-gradient(circle at 50% 0%, rgba(239, 68, 68, 0.08), transparent)' }}>
        <Container>
            <Typography variant="h3" textAlign="center" fontWeight={900} mb={10}>TOURNAMENT <span style={{ color: '#ef4444' }}>BRACKET</span></Typography>
            
            <Box sx={{ overflowX: "auto", pb: 6 }}>
                <Stack direction="row" spacing={8} justifyContent="center" sx={{ minWidth: "max-content" }}>
                    
                    <RoundColumn title="Quarter Finals" matches={rounds.round1} onClick={handleMatchClick} />
                    <BracketLine height={140} />
                    <RoundColumn title="Semi Finals" matches={rounds.semi} onClick={handleMatchClick} />
                    <BracketLine height={320} />
                    <RoundColumn title="Championship" matches={rounds.final} onClick={handleMatchClick} highlight />

                </Stack>
            </Box>
        </Container>
      </Box>

      {/* 🔍 MATCH DETAIL MODAL */}
      <Dialog open={open} onClose={() => setOpen(false)} TransitionComponent={Zoom} PaperProps={{ sx: modalPaperStyle }} maxWidth="xs" fullWidth>
        <IconButton onClick={() => setOpen(false)} sx={closeBtnStyle}><CloseIcon /></IconButton>
        {selectedMatch && (
          <DialogContent sx={{ p: 4, textAlign: 'center' }}>
             <Typography variant="overline" sx={{ color: "#ef4444", fontWeight: 900, letterSpacing: 2 }}>MATCH BREAKDOWN</Typography>
             <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ my: 4, bgcolor: 'rgba(255,255,255,0.03)', p: 3, borderRadius: 4 }}>
                <Box flex={1}><Typography variant="h5" fontWeight={900}>{selectedMatch.player1}</Typography></Box>
                <Box sx={vsCircleStyle}>VS</Box>
                <Box flex={1}><Typography variant="h5" fontWeight={900}>{selectedMatch.player2}</Typography></Box>
             </Stack>
             <Stack direction="row" spacing={2} justifyContent="center" mb={4}>
                {(selectedMatch.sets || [[6,4], [7,6]]).map((set: any, i: number) => (
                  <Box key={i} sx={setBoxStyle}>
                    <Typography fontWeight={900} color={set[0] > set[1] ? "#ef4444" : "white"}>{set[0]}</Typography>
                    <Typography fontWeight={900} color={set[1] > set[0] ? "#ef4444" : "white"}>{set[1]}</Typography>
                  </Box>
                ))}
             </Stack>
             <Stack direction="row" justifyContent="center" spacing={3}>
                <Stack direction="row" spacing={1} alignItems="center"><PlaceIcon sx={{ color: '#ef4444', fontSize: 20 }} /><Typography variant="body2" fontWeight={800}>Court {selectedMatch.court_number || 1}</Typography></Stack>
                <Typography variant="body2" fontWeight={800} sx={{ color: '#22c55e' }}>● {selectedMatch.status || 'Finished'}</Typography>
             </Stack>
          </DialogContent>
        )}
      </Dialog>
    </Box>
  );
}

// 🏛️ INTERNAL COMPONENTS
function RoundColumn({ title, matches, onClick, highlight = false }: any) {
    return (
        <Stack spacing={4} sx={{ width: 280 }}>
            <Typography variant="overline" textAlign="center" sx={{ fontWeight: 950, color: highlight ? '#fbbf24' : 'rgba(255,255,255,0.3)', letterSpacing: 2 }}>{title}</Typography>
            {matches.map((m: any) => (
                <MotionBox key={m.id} whileHover={{ scale: 1.05, x: 5 }} onClick={() => onClick(m)} sx={{ cursor: 'pointer' }}>
                    <Card sx={glassCardStyle}>
                        <Stack spacing={1.5}>
                            <Box sx={playerRowStyle(m.winner_id === m.player1_id)}>
                                <Typography variant="body2" fontWeight={m.winner_id === m.player1_id ? 900 : 500}>{m.player1}</Typography>
                                <Typography sx={scoreBadgeStyle}>{m.score1 || 0}</Typography>
                            </Box>
                            <Box sx={playerRowStyle(m.winner_id === m.player2_id)}>
                                <Typography variant="body2" fontWeight={m.winner_id === m.player2_id ? 900 : 500}>{m.player2}</Typography>
                                <Typography sx={scoreBadgeStyle}>{m.score2 || 0}</Typography>
                            </Box>
                        </Stack>
                    </Card>
                </MotionBox>
            ))}
        </Stack>
    );
}

const BracketLine = ({ height }: { height: number }) => (
    <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', height: '100%', width: 40 }}>
      <Box sx={{ width: 20, height: height, border: '2px solid rgba(255,255,255,0.1)', borderLeft: 'none', borderRadius: '0 12px 12px 0' }} />
      <Box sx={{ width: 20, height: 2, bgcolor: 'rgba(255,255,255,0.1)' }} />
    </Box>
);

// 💅 DESIGN TOKENS (Aligned with Home/About)
const tickerStyle = { bgcolor: "#000", py: 1.5, overflow: "hidden", whiteSpace: "nowrap", borderBottom: "1px solid rgba(255,255,255,0.1)" };
const tickerTextStyle = { px: 4, fontWeight: 900, fontSize: "0.7rem", letterSpacing: 2, color: 'rgba(255,255,255,0.8)' };
const backButtonStyle = { color: 'white', bgcolor: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', mb: 4, "&:hover": { bgcolor: '#ef4444' } };
const primaryBtnStyle = { px: 4, py: 1.5, borderRadius: 3, fontWeight: 900, background: "linear-gradient(135deg,#f97316,#ef4444)", boxShadow: "0 10px 20px rgba(239, 68, 68, 0.3)", "&:hover": { transform: "scale(1.05)" } };
const outlineBtnStyle = { px: 4, py: 1.5, borderRadius: 3, fontWeight: 900, borderColor: 'rgba(255,255,255,0.2)', color: 'white', "&:hover": { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.05)' } };
const statNumStyle = { fontWeight: 950, color: "#ef4444", fontSize: '2.5rem' };
const statLabelStyle = { opacity: 0.5, fontWeight: 800, letterSpacing: 1 };
const glassCardStyle = { p: 2.5, borderRadius: 5, background: "rgba(255,255,255,0.03)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 20px 40px rgba(0,0,0,0.4)" };
const playerRowStyle = (win: boolean) => ({ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, borderRadius: 2, bgcolor: win ? 'rgba(34,197,94,0.1)' : 'transparent', border: win ? '1px solid rgba(34,197,94,0.3)' : '1px solid transparent' });
const scoreBadgeStyle = { bgcolor: 'rgba(0,0,0,0.3)', px: 1.2, py: 0.5, borderRadius: 1, fontWeight: 900, color: '#ef4444', fontSize: '0.8rem' };
const modalPaperStyle = { bgcolor: "#0f172a", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", color: "white", overflow: 'visible' };
const vsCircleStyle = { width: 44, height: 44, borderRadius: '50%', bgcolor: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.8rem', border: '4px solid #0f172a' };
const setBoxStyle = { display: 'flex', gap: 2, px: 3, py: 1.5, borderRadius: 3, bgcolor: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.05)' };
const closeBtnStyle = { position: 'absolute', top: -20, right: -20, bgcolor: '#ef4444', color: 'white', "&:hover": { bgcolor: '#dc2626' } };