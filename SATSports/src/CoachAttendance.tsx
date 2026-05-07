import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box, Typography, Grid, Card, CardContent, TextField, ToggleButton, ToggleButtonGroup, 
  Button, Stack, Chip, IconButton, CircularProgress, InputAdornment, Avatar, Container, Fade
} from "@mui/material";
import { motion } from "framer-motion";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
import API_BASE from "./api";

const MotionBox = motion(Box);

export default function CoachAttendance() {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [players, setPlayers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);

  // 1. INITIAL LOAD
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetch(`${API_BASE}/api/session/${sessionId}/players`)
      .then(res => res.json())
      .then(data => {
        if (isMounted) {
          setPlayers(data.map((p: any) => ({
            ...p,
            present: p.present ?? true,
            remark: p.remark || ""
          })));
          setHasLoaded(true);
        }
      })
      .catch(err => console.error("Roster load failed:", err))
      .finally(() => { if (isMounted) setLoading(false); });

    return () => { isMounted = false; };
  }, [sessionId]);

  // 2. DEBOUNCED AUTO-SAVE
  useEffect(() => {
    if (!hasLoaded || players.length === 0) return;

    const timeout = setTimeout(async () => {
      setSaving(true);
      try {
        const response = await fetch(`${API_BASE}/api/coach/sessions/${sessionId}/attendance`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            attendance: players.map(p => ({ 
              playerId: p.id, 
              present: p.present, 
              remark: p.remark 
            }))
          })
        });
        if (response.ok) setLastSaved(new Date());
      } catch (err) { 
        console.error("Auto-sync failed:", err); 
      } finally { 
        setSaving(false); 
      }
    }, 1500); // 1.5s delay to allow for typing remarks

    return () => clearTimeout(timeout);
  }, [players, hasLoaded, sessionId]);

  const updatePlayer = useCallback((id: number, field: string, value: any) => {
    setPlayers(prev => prev.map(p => (p.id === id ? { ...p, [field]: value } : p)));
  }, []);

  const markAll = (val: boolean) => {
    setPlayers(prev => prev.map(p => ({ ...p, present: val })));
  };

  const filtered = useMemo(() => {
    return players.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  }, [players, search]);

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" height="100vh" bgcolor="#020617">
      <Stack alignItems="center" spacing={2}>
        <CircularProgress color="error" thickness={5} />
        <Typography variant="overline" color="rgba(255,255,255,0.4)" sx={{ letterSpacing: 2 }}>
          Initializing Roster...
        </Typography>
      </Stack>
    </Box>
  );

  return (
    <Box sx={{ background: "#020617", color: "white", minHeight: "100vh", py: { xs: 4, md: 6 } }}>
      <Container maxWidth="xl">
        
        {/* HEADER SECTION */}
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="space-between" alignItems="center" mb={6}>
          <Stack direction="row" spacing={3} alignItems="center">
            <IconButton 
              onClick={() => navigate(-1)} 
              sx={{ bgcolor: "rgba(255,255,255,0.05)", color: "white", "&:hover": { bgcolor: "#ef4444" } }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Box>
              <Typography variant="overline" sx={{ color: "#ef4444", fontWeight: 900, letterSpacing: 2 }}>SESSION ROSTER</Typography>
              <Typography variant="h3" fontWeight={950} sx={{ letterSpacing: -1.5, fontSize: { xs: '2rem', md: '3rem' } }}>
                PLAYER <span style={{ color: "#ef4444" }}>LOG</span>
              </Typography>
            </Box>
          </Stack>

          <Stack alignItems={{ xs: "center", sm: "flex-end" }} spacing={1}>
            <Chip 
              icon={saving ? <CircularProgress size={14} color="inherit" /> : undefined}
              label={saving ? "SYNCING..." : "RECORDS SECURE"} 
              sx={syncChipStyle(saving)} 
            />
            {lastSaved && (
              <Typography sx={{ opacity: 0.4, fontWeight: 800, fontSize: '0.7rem' }}>
                LAST CLOUD SYNC: {lastSaved.toLocaleTimeString()}
              </Typography>
            )}
          </Stack>
        </Stack>

        {/* BULK ACTIONS */}
        <Box sx={actionBarBoxStyle}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="FIND PLAYER..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={searchFieldStyle}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: "#ef4444" }} /></InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Stack direction="row" spacing={2}>
                <Button fullWidth onClick={() => markAll(true)} sx={bulkBtnStyle("#22c55e")}>ALL PRESENT</Button>
                <Button fullWidth onClick={() => markAll(false)} sx={bulkBtnStyle("#ef4444")}>ALL ABSENT</Button>
              </Stack>
            </Grid>
          </Grid>
        </Box>

        {/* ROSTER GRID */}
        <Grid container spacing={3}>
          {filtered.length === 0 ? (
            <Box sx={{ width: '100%', textAlign: 'center', py: 10, opacity: 0.3 }}>
              <Typography variant="h5" fontWeight={900}>NO MATCHING RECORDS</Typography>
            </Box>
          ) : (
            filtered.map(p => (
              <Grid item xs={12} md={6} lg={4} key={p.id}>
                <MotionBox 
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -5 }}
                >
                  <Card sx={playerCardStyle(p.present)}>
                    <CardContent sx={{ p: 3 }}>
                      <Stack direction="row" spacing={2} alignItems="center" mb={3}>
                        <Avatar sx={avatarStyle(p.present)}>{p.name.charAt(0)}</Avatar>
                        <Box>
                          <Typography variant="h6" fontWeight={900}>{p.name.toUpperCase()}</Typography>
                          <Typography variant="caption" sx={{ opacity: 0.5, fontWeight: 700 }}>PLAYER ID: #{p.id}</Typography>
                        </Box>
                      </Stack>

                      <ToggleButtonGroup
                        fullWidth
                        value={p.present ? "present" : "absent"}
                        exclusive
                        onChange={(_, val) => { if (val !== null) updatePlayer(p.id, "present", val === "present"); }}
                        sx={toggleGroupStyle}
                      >
                        <ToggleButton value="present" sx={toggleBtnStyle("#22c55e")}>PRESENT</ToggleButton>
                        <ToggleButton value="absent" sx={toggleBtnStyle("#ef4444")}>ABSENT</ToggleButton>
                      </ToggleButtonGroup>

                      <TextField
                        fullWidth
                        multiline
                        rows={2}
                        placeholder="Drill progress or performance notes..."
                        value={p.remark}
                        onChange={(e) => updatePlayer(p.id, "remark", e.target.value)}
                        sx={remarkFieldStyle}
                      />
                    </CardContent>
                  </Card>
                </MotionBox>
              </Grid>
            ))
          )}
        </Grid>
      </Container>
    </Box>
  );
}

// --- REFINED STYLES ---
const syncChipStyle = (saving: boolean) => ({
  bgcolor: saving ? "rgba(245, 158, 11, 0.1)" : "rgba(34, 197, 94, 0.1)",
  color: saving ? "#f59e0b" : "#22c55e",
  fontWeight: 900,
  border: `1px solid ${saving ? "#f59e0b" : "#22c55e"}`,
  borderRadius: 2,
  letterSpacing: 1,
  px: 1,
  "& .MuiChip-icon": { color: "inherit" }
});

const actionBarBoxStyle = { 
  background: "rgba(255,255,255,0.02)", 
  p: 3, 
  borderRadius: 4, 
  mb: 6, 
  border: "1px solid rgba(255,255,255,0.05)",
  backdropFilter: "blur(10px)"
};

const searchFieldStyle = {
  "& .MuiOutlinedInput-root": {
    color: "white", bgcolor: "rgba(0,0,0,0.2)", borderRadius: 3, fontWeight: 800,
    "& fieldset": { borderColor: "rgba(255,255,255,0.1)" },
    "&:hover fieldset": { borderColor: "#ef4444" }
  }
};

const bulkBtnStyle = (color: string) => ({
  bgcolor: "rgba(255,255,255,0.03)", color: color, fontWeight: 900, borderRadius: 3, py: 1.5,
  border: `1px solid ${color}44`,
  "&:hover": { bgcolor: color, color: "white", boxShadow: `0 0 20px ${color}33` }
});

const playerCardStyle = (present: boolean) => ({
  borderRadius: 5,
  background: "rgba(255,255,255,0.03)",
  backdropFilter: "blur(15px)",
  border: `1px solid ${present ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)"}`,
  color: "white",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
});

const avatarStyle = (present: boolean) => ({
  bgcolor: present ? "#22c55e" : "#ef4444",
  fontWeight: 900,
  width: 52, height: 52,
  boxShadow: `0 8px 16px ${present ? "#22c55e33" : "#ef444433"}`,
  transition: "0.3s"
});

const toggleGroupStyle = { 
  mb: 3, bgcolor: "rgba(0,0,0,0.3)", p: 0.5, borderRadius: 3,
  "& .MuiToggleButton-root": { border: "none", borderRadius: 2, mx: 0.5 }
};

const toggleBtnStyle = (color: string) => ({
  fontWeight: 900, color: "rgba(255,255,255,0.2)",
  "&.Mui-selected": { bgcolor: color, color: "white", "&:hover": { bgcolor: color } }
});

const remarkFieldStyle = {
  "& .MuiOutlinedInput-root": {
    color: "white", bgcolor: "rgba(0,0,0,0.2)", borderRadius: 3, fontSize: '0.8rem', fontWeight: 600,
    "& fieldset": { borderColor: "rgba(255,255,255,0.05)" },
    "&:hover fieldset": { borderColor: "rgba(255,255,255,0.2)" }
  }
};