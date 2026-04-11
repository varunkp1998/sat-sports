import React, { useEffect, useState, useMemo } from "react";
import {
  Box, Typography, Button, Grid, Card, CardContent,
  Chip, Stack, Skeleton, Container
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import API_BASE from "./api";

const MotionBox = React.memo(motion(Box));

function TournamentsPage() {
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();

  // 🚀 OPTIMIZED FETCH (no memory leaks + faster)
  useEffect(() => {
    let mounted = true;

    fetch(`${API_BASE}/api/tournaments`)
      .then((res) => {
        if (!res.ok) throw new Error("Server error");
        return res.json();
      })
      .then((data) => {
        if (mounted) {
          setTournaments(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        if (mounted) setLoading(false);
      });

    return () => { mounted = false };
  }, []);

  // ⚡ MEMOIZED FILTER (no recalculation on every render)
  const filtered = useMemo(() => {
    if (filter === "all") return tournaments;
    return tournaments.filter(
      (t) => t.status?.toLowerCase() === filter
    );
  }, [filter, tournaments]);

  // ⚡ PURE FUNCTIONS (no re-creation cost)
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "live": return "#ef4444";
      case "upcoming": return "#fbbf24";
      case "completed": return "#22c55e";
      default: return "#94a3b8";
    }
  };

  const getCountdown = (date: string) => {
    const diff = new Date(date).getTime() - Date.now();
    if (diff <= 0) return "EVENT LIVE";
    return `${Math.floor(diff / (1000 * 60 * 60 * 24))} DAYS LEFT`;
  };

  return (
    <Box sx={{ background: "#020617", color: "white", minHeight: "100vh", py: 10 }}>
      <Container maxWidth="lg">

        {/* HEADER */}
        <Box sx={{ mb: 8, textAlign: "center" }}>
          <Typography variant="overline" sx={{ color: "#ef4444", fontWeight: 900, letterSpacing: 4 }}>
            GLOBAL ARENA
          </Typography>
          <Typography variant="h1" sx={headerTitleStyle}>
            ACTIVE <span style={{ color: "#ef4444" }}>DRAWS</span>
          </Typography>
        </Box>

        {/* FILTERS */}
        <Stack direction="row" spacing={2} justifyContent="center" sx={{ mb: 8, flexWrap: "wrap" }}>
          {["all", "live", "upcoming", "completed"].map((f) => (
            <Button
              key={f}
              onClick={() => setFilter(f)}
              sx={filterButtonStyle(filter === f)}
            >
              {f.toUpperCase()}
            </Button>
          ))}
        </Stack>

        {/* GRID */}
        <Grid container spacing={4}>
          {loading ? (
            [1, 2, 3].map((i) => (
              <Grid item xs={12} md={4} key={i}>
                <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 6 }} />
              </Grid>
            ))
          ) : filtered.length > 0 ? (
            filtered.map((t) => (
              <Grid item xs={12} md={4} key={t.id}>
                <MotionBox whileHover={{ y: -12 }}>
                  <Card sx={glassCardStyle}>
                    
                    <Box sx={{
                      height: 160,
                      position: "relative",
                      backgroundImage: `url(${API_BASE}/uploads/${t.image})`,
                      backgroundSize: "cover"
                    }}>
                      <Chip
                        label={t.status?.toUpperCase()}
                        sx={statusChipStyle(getStatusColor(t.status))}
                      />
                    </Box>

                    <CardContent>
                      <Typography variant="h5">{t.title}</Typography>

                      <Stack spacing={1} sx={{ mb: 2 }}>
                        <Typography>📅 {new Date(t.date).toLocaleDateString()}</Typography>
                        <Typography>📍 {t.location || "Arena"}</Typography>
                        <Typography>⏳ {getCountdown(t.date)}</Typography>
                      </Stack>

                      <Button
                        fullWidth
                        onClick={() => navigate(`/tournaments/${t.id}`)}
                        sx={actionButtonStyle}
                      >
                        VIEW BRACKET
                      </Button>

                    </CardContent>
                  </Card>
                </MotionBox>
              </Grid>
            ))
          ) : (
            <Typography>No tournaments found</Typography>
          )}
        </Grid>

      </Container>
    </Box>
  );
}

export default React.memo(TournamentsPage);