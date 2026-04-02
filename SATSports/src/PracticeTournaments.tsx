import React, { useState, useEffect, useCallback } from "react";
import { 
  Box, Container, Typography, Card, CardContent, TextField, 
  Button, Grid, Stack, Divider, Alert, Fade, CircularProgress, Chip 
} from "@mui/material";
import { motion } from "framer-motion";
import API_BASE from "./api";
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import HistoryIcon from '@mui/icons-material/History';

const MotionCard = motion(Card);

export default function PracticeTournaments() {
  const coachId = localStorage.getItem("userId");
  
  // Form States
  const [player1, setPlayer1] = useState("");
  const [player2, setPlayer2] = useState("");
  const [score1, setScore1] = useState("0");
  const [score2, setScore2] = useState("0");
  const [review, setReview] = useState("");
  
  // Data/UI States
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // 🔄 Fetch History Logic
  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/coach/tournament-history/${coachId}`);
      const data = await res.json();
      setHistory(data);
    } catch (err) {
      console.error("History Load Failed");
    } finally {
      setLoadingHistory(false);
    }
  }, [coachId]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const handlePostMatch = async () => {
    if (!player1 || !player2 || !review) {
      return setMessage({ type: "error", text: "ALL FIELDS ARE REQUIRED" });
    }

    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/coach/post-tournament`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          player1, player2,
          score: `${score1} - ${score2}`,
          review,
          coachId
        }),
      });

      if (res.ok) {
        setMessage({ type: "success", text: "MATCH RESULT POSTED SUCCESSFULLY" });
        setPlayer1(""); setPlayer2(""); setScore1("0"); setScore2("0"); setReview("");
        fetchHistory(); // 🟢 Refresh history after posting
      } else {
        throw new Error();
      }
    } catch {
      setMessage({ type: "error", text: "FAILED TO POST MATCH RESULT" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ background: "#020617", minHeight: "100vh", py: 6, color: "white" }}>
      <Container maxWidth="md">
        
        {/* HEADER SECTION */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="overline" sx={{ color: "#ef4444", fontWeight: 900, letterSpacing: 3 }}>MATCH CENTER</Typography>
          <Typography variant="h3" fontWeight={950} sx={{ letterSpacing: -1.5 }}>PRACTICE <span style={{ color: "#ef4444" }}>TOURNAMENTS</span></Typography>
        </Box>

        {message && (
          <Fade in>
            <Alert severity={message.type} sx={alertStyle(message.type)} onClose={() => setMessage(null)}>
              {message.text.toUpperCase()}
            </Alert>
          </Fade>
        )}

        {/* 📝 MATCH ENTRY FORM */}
        <MotionCard initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} sx={glassCardStyle}>
          <CardContent sx={{ p: { xs: 3, md: 5 } }}>
             <Typography variant="h6" fontWeight={900} mb={4} display="flex" alignItems="center" gap={1}>
               <EmojiEventsIcon color="error" /> LOG NEW MATCH
             </Typography>
            
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={5}>
                <Stack spacing={2} textAlign="center">
                  <Typography variant="h6" fontWeight={900} color="#ef4444">PLAYER 1</Typography>
                  <TextField placeholder="Name" value={player1} onChange={(e) => setPlayer1(e.target.value)} sx={darkInputStyle} />
                  <TextField label="SET SCORE" type="number" value={score1} onChange={(e) => setScore1(e.target.value)} sx={scoreInputStyle} />
                </Stack>
              </Grid>

              <Grid item xs={12} md={2} textAlign="center">
                <Typography variant="h4" fontWeight={950} sx={{ opacity: 0.2 }}>VS</Typography>
              </Grid>

              <Grid item xs={12} md={5}>
                <Stack spacing={2} textAlign="center">
                  <Typography variant="h6" fontWeight={900} color="#ef4444">PLAYER 2</Typography>
                  <TextField placeholder="Name" value={player2} onChange={(e) => setPlayer2(e.target.value)} sx={darkInputStyle} />
                  <TextField label="SET SCORE" type="number" value={score2} onChange={(e) => setScore2(e.target.value)} sx={scoreInputStyle} />
                </Stack>
              </Grid>
            </Grid>

            <Divider sx={{ my: 4, bgcolor: "rgba(255,255,255,0.05)" }} />

            <Typography variant="h6" fontWeight={900} mb={2}>TECHNICAL REVIEW</Typography>
            <TextField fullWidth multiline rows={3} placeholder="Provide feedback..." value={review} onChange={(e) => setReview(e.target.value)} sx={darkInputStyle} />

            <Button fullWidth variant="contained" sx={primaryBtnStyle} onClick={handlePostMatch} disabled={saving}>
              {saving ? <CircularProgress size={24} color="inherit" /> : "POST TOURNAMENT RESULT"}
            </Button>
          </CardContent>
        </MotionCard>

        {/* 📜 HISTORICAL DATA SECTION */}
        <Box sx={{ mt: 8 }}>
          <Typography variant="h5" fontWeight={900} mb={4} display="flex" alignItems="center" gap={2}>
            <HistoryIcon sx={{ color: "#ef4444" }} /> MATCH HISTORY
          </Typography>

          {loadingHistory ? (
            <CircularProgress color="error" />
          ) : history.length === 0 ? (
            <Typography sx={{ opacity: 0.5 }}>No matches recorded yet.</Typography>
          ) : (
            <Stack spacing={3}>
              {history.map((match, index) => (
                <MotionCard 
                  key={match.id} 
                  initial={{ opacity: 0, x: -20 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  transition={{ delay: index * 0.1 }}
                  sx={{ ...glassCardStyle, background: "rgba(255,255,255,0.02)" }}
                >
                  <CardContent>
                    <Grid container alignItems="center">
                      <Grid item xs={12} md={4}>
                        <Typography variant="h6" fontWeight={900}>
                          {match.player1} <span style={{color: '#ef4444'}}>vs</span> {match.player2}
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.4 }}>
                          {new Date(match.created_at).toLocaleDateString()}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={2} textAlign="center">
                        <Chip label={match.score} sx={{ bgcolor: "#ef4444", fontWeight: 900, color: "white" }} />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Box sx={{ pl: { md: 4 }, mt: { xs: 2, md: 0 }, borderLeft: { md: "2px solid rgba(255,255,255,0.05)" } }}>
                          <Typography variant="body2" sx={{ fontStyle: 'italic', opacity: 0.8 }}>
                            "{match.review}"
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </MotionCard>
              ))}
            </Stack>
          )}
        </Box>
      </Container>
    </Box>
  );
}

// STYLES (Keep existing ones)
const glassCardStyle = { borderRadius: 6, background: "rgba(255,255,255,0.03)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.08)", color: "white" };
const darkInputStyle = { "& .MuiOutlinedInput-root": { color: "white", bgcolor: "rgba(255,255,255,0.02)", borderRadius: 3, "& fieldset": { borderColor: "rgba(255,255,255,0.1)" }, "&:hover fieldset": { borderColor: "#ef4444" } } };
const scoreInputStyle = { "& .MuiOutlinedInput-root": { color: "#ef4444", fontSize: "1.2rem", textAlign: "center", fontWeight: 900, borderRadius: 3 } };
const primaryBtnStyle = { mt: 4, py: 2, borderRadius: 3, fontWeight: 950, background: "linear-gradient(135deg, #f97316, #ef4444)" };
const alertStyle = (type: string) => ({ mb: 4, borderRadius: 3, bgcolor: type === "success" ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)", color: type === "success" ? "#22c55e" : "#ef4444" });