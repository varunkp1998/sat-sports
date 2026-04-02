import React, { useState, useEffect, useCallback } from "react";
import { 
  Box, Container, Typography, Card, CardContent, TextField, 
  Button, Grid, Stack, Divider, Alert, Fade, CircularProgress, Chip 
} from "@mui/material";
import { motion } from "framer-motion";
import API_BASE from "./api";
import HistoryIcon from '@mui/icons-material/History';

const MotionCard = motion(Card);

export default function PracticeTournaments() {
  const coachId = localStorage.getItem("userId");
  
  // Data States
  const [player1, setPlayer1] = useState("");
  const [player2, setPlayer2] = useState("");
  const [p1Sets, setP1Sets] = useState(["", "", "", "", ""]);
  const [p2Sets, setP2Sets] = useState(["", "", "", "", ""]);
  const [review, setReview] = useState("");
  
  // History States
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // 🔄 Fetch History
  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/coach/tournament-history/${coachId}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setHistory(data);
    } catch (err) {
      console.error("Failed to load history");
    } finally {
      setLoadingHistory(false);
    }
  }, [coachId]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const handleSetChange = (player: 1 | 2, index: number, value: string) => {
    if (player === 1) {
      const newSets = [...p1Sets];
      newSets[index] = value;
      setP1Sets(newSets);
    } else {
      const newSets = [...p2Sets];
      newSets[index] = value;
      setP2Sets(newSets);
    }
  };

  const handlePostMatch = async () => {
    if (!player1 || !player2 || !review) {
      return setMessage({ type: "error", text: "ALL FIELDS REQUIRED" });
    }

    const formattedScore = p1Sets
      .map((s, i) => (s || p2Sets[i] ? `${s || 0}-${p2Sets[i] || 0}` : null))
      .filter(Boolean)
      .join(", ");

    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/coach/post-tournament`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ player1, player2, score: formattedScore, review, coachId }),
      });

      if (res.ok) {
        setMessage({ type: "success", text: "TOURNAMENT DATA SYNCED" });
        setPlayer1(""); setPlayer2(""); setReview("");
        setP1Sets(["", "", "", "", ""]); setP2Sets(["", "", "", "", ""]);
        fetchHistory(); // Refresh the list
      }
    } catch {
      setMessage({ type: "error", text: "SYNC FAILED" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ background: "#020617", minHeight: "100vh", py: 6, color: "white" }}>
      <Container maxWidth="md">
        <Box sx={{ mb: 6 }}>
          <Typography variant="overline" sx={{ color: "#ef4444", fontWeight: 900, letterSpacing: 3 }}>MATCH CENTER</Typography>
          <Typography variant="h3" fontWeight={950} sx={{ letterSpacing: -1.5 }}>5-SET <span style={{ color: "#ef4444" }}>TRACKER</span></Typography>
        </Box>

        {message && (
          <Fade in>
            <Alert severity={message.type} sx={alertStyle(message.type)} onClose={() => setMessage(null)}>
              {message.text.toUpperCase()}
            </Alert>
          </Fade>
        )}

        <MotionCard initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} sx={glassCardStyle}>
          <CardContent sx={{ p: 4 }}>
            <Grid container spacing={3}>
              <Grid item xs={6}><TextField fullWidth label="PLAYER 1" value={player1} onChange={(e) => setPlayer1(e.target.value)} sx={darkInputStyle} InputLabelProps={{ style: { color: 'rgba(255,255,255,0.6)' } }} /></Grid>
              <Grid item xs={6}><TextField fullWidth label="PLAYER 2" value={player2} onChange={(e) => setPlayer2(e.target.value)} sx={darkInputStyle} InputLabelProps={{ style: { color: 'rgba(255,255,255,0.6)' } }} /></Grid>

              <Grid item xs={12}><Divider sx={{ bgcolor: "rgba(255,255,255,0.1)", my: 2 }} /></Grid>

              {[0, 1, 2, 3, 4].map((i) => (
                <Grid item xs={12} key={i}>
                  <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
                    <Typography sx={{ fontWeight: 900, minWidth: 60, opacity: 0.5, color: 'white' }}>SET {i + 1}</Typography>
                    <TextField type="number" placeholder="P1" value={p1Sets[i]} onChange={(e) => handleSetChange(1, i, e.target.value)} sx={miniScoreStyle} />
                    <Typography variant="h6" sx={{ opacity: 0.3, color: 'white' }}>-</Typography>
                    <TextField type="number" placeholder="P2" value={p2Sets[i]} onChange={(e) => handleSetChange(2, i, e.target.value)} sx={miniScoreStyle} />
                  </Stack>
                </Grid>
              ))}

              <Grid item xs={12}>
                <TextField fullWidth multiline rows={3} label="MATCH REVIEW" value={review} onChange={(e) => setReview(e.target.value)} sx={darkInputStyle} InputLabelProps={{ style: { color: 'rgba(255,255,255,0.6)' } }} />
              </Grid>

              <Grid item xs={12}>
                <Button fullWidth variant="contained" onClick={handlePostMatch} sx={primaryBtnStyle} disabled={saving}>
                  {saving ? <CircularProgress size={24} color="inherit" /> : "POST TOURNAMENT RESULT"}
                </Button>
              </Grid>
            </Grid>
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
              {history.map((match, idx) => (
                <MotionCard key={match.id} sx={historyCardStyle}>
                  <CardContent>
                    <Grid container alignItems="center">
                      <Grid item xs={12} md={4}>
                        <Typography variant="h6" fontWeight={900} sx={{ color: 'white' }}>
                          {match.player1} <span style={{color: '#ef4444'}}>vs</span> {match.player2}
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.4, color: 'white' }}>
                          {new Date(match.created_at).toLocaleDateString()}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={4} textAlign="center">
                         <Typography variant="body1" sx={{ fontWeight: 900, color: "#ef4444", letterSpacing: 1 }}>
                            {match.score}
                         </Typography>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Typography variant="body2" sx={{ fontStyle: 'italic', opacity: 0.7, color: 'white', textAlign: 'right' }}>
                          "{match.review}"
                        </Typography>
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

// 🎨 STYLES FIX
const glassCardStyle = { borderRadius: 6, background: "rgba(255,255,255,0.03)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.08)", color: "white" };
const historyCardStyle = { borderRadius: 4, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", color: "white" };
const darkInputStyle = { 
    "& .MuiOutlinedInput-root": { 
        color: "white", 
        bgcolor: "rgba(255,255,255,0.02)", 
        borderRadius: 3, 
        "& fieldset": { borderColor: "rgba(255,255,255,0.1)" },
        "&:hover fieldset": { borderColor: "#ef4444" }
    } 
};
const miniScoreStyle = { 
    width: 80, 
    "& .MuiOutlinedInput-root": { 
        color: "#ef4444", 
        fontWeight: 900, 
        bgcolor: "rgba(255,255,255,0.03)",
        "& fieldset": { borderColor: "rgba(255,255,255,0.1)" }
    },
    "& input": { textAlign: 'center' }
};
const primaryBtnStyle = { py: 2, borderRadius: 3, fontWeight: 950, background: "linear-gradient(135deg, #f97316, #ef4444)" };
const alertStyle = (type: string) => ({ mb: 4, borderRadius: 3, bgcolor: type === "success" ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)", color: type === "success" ? "#22c55e" : "#ef4444" });