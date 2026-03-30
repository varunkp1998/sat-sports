import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Button,
  Stack,
  Chip,
  IconButton,
  CircularProgress,
  InputAdornment,
  Avatar
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
import API_BASE from "./api";

export default function CoachAttendance() {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [players, setPlayers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false); // 🛑 CRITICAL: Prevents accidental wipes on mount

  // 1. LOAD PLAYERS
  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}/api/session/${sessionId}/players`)
      .then(res => res.json())
      .then(data => {
        setPlayers(
          data.map((p: any) => ({
            ...p,
            present: p.present ?? true, // Respect existing DB status if available
            remark: p.remark || ""
          }))
        );
        setHasLoaded(true);
      })
      .finally(() => setLoading(false));
  }, [sessionId]);

  // 2. DEBOUNCED AUTO-SAVE
  useEffect(() => {
    // Only save if data has been fetched AND there are players to save
    if (!hasLoaded || players.length === 0) return;

    const timeout = setTimeout(async () => {
      setSaving(true);
      try {
        await fetch(`${API_BASE}/api/coach/sessions/${sessionId}/attendance`, {
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
        setLastSaved(new Date());
      } catch (err) {
        console.error("Auto-save failed:", err);
      } finally {
        setSaving(false);
      }
    }, 1000); // 1 second debounce

    return () => clearTimeout(timeout);
  }, [players, hasLoaded, sessionId]);

  // UPDATE PLAYER
  const updatePlayer = (id: number, field: string, value: any) => {
    setPlayers(prev =>
      prev.map(p => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const markAll = (val: boolean) => {
    setPlayers(prev => prev.map(p => ({ ...p, present: val })));
  };

  // Memoized Search Filter
  const filtered = useMemo(() => {
    return players.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [players, search]);

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
      <CircularProgress color="error" />
    </Box>
  );

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, background: "#f8fafc", minHeight: "100vh" }}>
      
      {/* HEADER BAR */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="space-between" alignItems={{ xs: "start", sm: "center" }} mb={4}>
        <Stack direction="row" spacing={1} alignItems="center">
          <IconButton onClick={() => navigate(-1)} sx={{ mr: 1, bgcolor: "#fff" }}>
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography variant="h4" fontWeight={900} color="#111827">Roster</Typography>
            <Typography variant="body2" color="text.secondary">Attendance is saved automatically</Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={2} alignItems="center">
          <Chip
            label={saving ? "Saving Changes..." : "All Changes Saved"}
            color={saving ? "warning" : "success"}
            variant={saving ? "filled" : "outlined"}
            sx={{ fontWeight: 700, px: 1 }}
          />
          {lastSaved && (
            <Typography fontSize={12} fontWeight={600} color="text.secondary">
              Last synced: {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Typography>
          )}
        </Stack>
      </Stack>

      {/* ACTION BAR */}
      <Card sx={{ p: 2, mb: 4, borderRadius: 4, border: "1px solid #e2e8f0", boxShadow: "none" }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="center">
          <TextField
            fullWidth
            placeholder="Search by player name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ bgcolor: "#fff" }}
          />

          <Stack direction="row" spacing={1} sx={{ width: { xs: "100%", md: "auto" } }}>
            <Button
              fullWidth
              variant="contained"
              disableElevation
              onClick={() => markAll(true)}
              sx={{ bgcolor: "#22c55e", "&:hover": { bgcolor: "#16a34a" }, whiteSpace: "nowrap" }}
            >
              All Present
            </Button>
            <Button
              fullWidth
              variant="contained"
              disableElevation
              onClick={() => markAll(false)}
              sx={{ bgcolor: "#ef4444", "&:hover": { bgcolor: "#dc2626" }, whiteSpace: "nowrap" }}
            >
              All Absent
            </Button>
          </Stack>
        </Stack>
      </Card>

      {/* PLAYER LIST */}
      <Grid container spacing={3}>
        {filtered.length === 0 ? (
          <Grid item xs={12}>
            <Typography textAlign="center" color="text.secondary" py={10}>No players found.</Typography>
          </Grid>
        ) : (
          filtered.map(p => (
            <Grid item xs={12} md={6} lg={4} key={p.id}>
              <Card
                sx={{
                  borderRadius: 4,
                  border: p.present ? "2px solid #22c55e" : "2px solid #ef4444",
                  bgcolor: p.present ? "rgba(34, 197, 94, 0.02)" : "rgba(239, 68, 68, 0.02)",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                    <Avatar sx={{ bgcolor: p.present ? "#22c55e" : "#ef4444", fontWeight: 800 }}>
                      {p.name.charAt(0)}
                    </Avatar>
                    <Typography variant="h6" fontWeight={800} sx={{ flexGrow: 1 }}>
                      {p.name}
                    </Typography>
                  </Stack>

                  <ToggleButtonGroup
                    fullWidth
                    value={p.present ? "present" : "absent"}
                    exclusive
                    onChange={(e, val) => {
                      if (val !== null) updatePlayer(p.id, "present", val === "present");
                    }}
                    sx={{ mb: 2, bgcolor: "#fff" }}
                  >
                    <ToggleButton value="present" sx={{ fontWeight: 700, "&.Mui-selected": { bgcolor: "#22c55e", color: "white", "&:hover": { bgcolor: "#16a34a" } } }}>
                      PRESENT
                    </ToggleButton>
                    <ToggleButton value="absent" sx={{ fontWeight: 700, "&.Mui-selected": { bgcolor: "#ef4444", color: "white", "&:hover": { bgcolor: "#dc2626" } } }}>
                      ABSENT
                    </ToggleButton>
                  </ToggleButtonGroup>

                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    placeholder="Add performance notes..."
                    value={p.remark}
                    onChange={(e) => updatePlayer(p.id, "remark", e.target.value)}
                    sx={{ bgcolor: "#fff", borderRadius: 2 }}
                  />
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
    </Box>
  );
}