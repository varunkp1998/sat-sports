import React, { useState, useEffect, useCallback } from "react";
import { 
  Box, Container, Typography, Card, CardContent, TextField, 
  Button, Grid, Stack, Divider, Alert, Fade, CircularProgress, Chip 
} from "@mui/material";
import { motion } from "framer-motion";
import API_BASE from "./api";

export default function PracticeTournaments() {
  const coachId = localStorage.getItem("userId");
  
  // Players
  const [player1, setPlayer1] = useState("");
  const [player2, setPlayer2] = useState("");
  
  // 🟢 5-Set Scores State (Initialized with empty strings)
  const [p1Sets, setP1Sets] = useState(["", "", "", "", ""]);
  const [p2Sets, setP2Sets] = useState(["", "", "", "", ""]);
  
  const [review, setReview] = useState("");
  const [history, setHistory] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

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
      return setMessage({ type: "error", text: "NAMES AND REVIEW REQUIRED" });
    }

    // 🟢 Format the scores (e.g., "6-4, 2-6, 7-5")
    const formattedScore = p1Sets
      .map((s, i) => (s || p2Sets[i] ? `${s || 0}-${p2Sets[i] || 0}` : null))
      .filter(Boolean)
      .join(", ");

    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/coach/post-tournament`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          player1, player2,
          score: formattedScore,
          review,
          coachId
        }),
      });

      if (res.ok) {
        setMessage({ type: "success", text: "5-SET MATCH POSTED" });
        setPlayer1(""); setPlayer2(""); setReview("");
        setP1Sets(["", "", "", "", ""]); setP2Sets(["", "", "", "", ""]);
        // fetchHistory(); // Call your history fetch function here
      }
    } catch {
      setMessage({ type: "error", text: "FAILED TO POST" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ background: "#020617", minHeight: "100vh", py: 6, color: "white" }}>
      <Container maxWidth="md">
        <Typography variant="h3" fontWeight={950} sx={{ mb: 4 }}>5-SET <span style={{ color: "#ef4444" }}>MATCH TRACKER</span></Typography>

        <Card sx={glassCardStyle}>
          <CardContent sx={{ p: 4 }}>
            <Grid container spacing={3}>
              {/* PLAYER NAMES */}
              <Grid item xs={6}><TextField fullWidth label="PLAYER 1" value={player1} onChange={(e) => setPlayer1(e.target.value)} sx={darkInputStyle} /></Grid>
              <Grid item xs={6}><TextField fullWidth label="PLAYER 2" value={player2} onChange={(e) => setPlayer2(e.target.value)} sx={darkInputStyle} /></Grid>

              <Grid item xs={12}><Divider sx={{ bgcolor: "rgba(255,255,255,0.1)", my: 2 }} /></Grid>

              {/* 🟢 5 SET INPUTS */}
              {[0, 1, 2, 3, 4].map((setIndex) => (
                <Grid item xs={12} key={setIndex}>
                  <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
                    <Typography sx={{ fontWeight: 900, minWidth: 60, opacity: 0.5 }}>SET {setIndex + 1}</Typography>
                    <TextField 
                      type="number" 
                      placeholder="P1" 
                      value={p1Sets[setIndex]} 
                      onChange={(e) => handleSetChange(1, setIndex, e.target.value)} 
                      sx={miniScoreStyle} 
                    />
                    <Typography variant="h6" sx={{ opacity: 0.3 }}>-</Typography>
                    <TextField 
                      type="number" 
                      placeholder="P2" 
                      value={p2Sets[setIndex]} 
                      onChange={(e) => handleSetChange(2, setIndex, e.target.value)} 
                      sx={miniScoreStyle} 
                    />
                  </Stack>
                </Grid>
              ))}

              <Grid item xs={12}>
                <TextField 
                  fullWidth multiline rows={3} label="MATCH REVIEW" 
                  value={review} onChange={(e) => setReview(e.target.value)} 
                  sx={darkInputStyle} 
                />
              </Grid>

              <Grid item xs={12}>
                <Button fullWidth variant="contained" onClick={handlePostMatch} sx={primaryBtnStyle} disabled={saving}>
                  {saving ? <CircularProgress size={24} /> : "POST 5-SET RESULT"}
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

// Styles
const glassCardStyle = { borderRadius: 6, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "white" };
const darkInputStyle = { "& .MuiOutlinedInput-root": { color: "white", borderRadius: 3, "& fieldset": { borderColor: "rgba(255,255,255,0.1)" } } };
const miniScoreStyle = { width: 80, "& .MuiOutlinedInput-root": { color: "#ef4444", fontWeight: 900, textAlign: 'center', bgcolor: "rgba(255,255,255,0.02)" } };
const primaryBtnStyle = { py: 2, borderRadius: 3, fontWeight: 950, background: "linear-gradient(135deg, #f97316, #ef4444)" };