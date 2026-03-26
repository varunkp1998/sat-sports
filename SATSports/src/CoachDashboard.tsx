import { useEffect, useState } from "react";
import {
  Box, Typography, Grid, Card, CardContent,
  Tabs, Tab, Chip, Stack, Button
} from "@mui/material";
import { motion } from "framer-motion";
import API_BASE from "./api";

const MotionBox = motion(Box);

export default function CoachDashboard() {
  const userId = localStorage.getItem("userId");

  const [tab, setTab] = useState(0);
  const [sessions, setSessions] = useState([]);
  const [data, setData] = useState({
    weekly: [],
    todaySessionList: [],
    upcoming: [],
    ongoing: []
  });

  useEffect(() => {
    fetch(`${API_BASE}/api/coach/overview/${userId}`)
      .then(res => res.json())
      .then(setData);

    fetch(`${API_BASE}/api/coach/sessions/${userId}`)
      .then(res => res.json())
      .then(setSessions);
  }, []);

  ///////////////////////////////////////////////////////
  // 🔥 SMART LOGIC
  ///////////////////////////////////////////////////////

  const nextSession = sessions?.[0];

  const urgentSessions = sessions.filter(s => {
    const diff =
      (new Date(s.session_date) - new Date()) / (1000 * 60);
    return diff < 60 && diff > 0;
  });

  ///////////////////////////////////////////////////////

  return (
    <Box sx={{
      p: { xs: 2, md: 3 },
      background: "#020617",
      minHeight: "100vh",
      color: "white"
    }}>

      <Typography variant="h4" fontWeight={900} mb={3}>
        🎾 Coach Command Center
      </Typography>

      {/* 🔥 TABS */}
      <Tabs
        value={tab}
        onChange={(e, v) => setTab(v)}
        textColor="inherit"
        sx={{ mb: 3 }}
      >
        <Tab label="Overview" />
        <Tab label="Sessions" />
        <Tab label="Activity" />
      </Tabs>

      {/* ================= OVERVIEW ================= */}
      {tab === 0 && (
        <>
          {/* 🔥 NEXT SESSION (MOST IMPORTANT) */}
          {nextSession && (
            <MotionBox whileHover={{ scale: 1.02 }}>
              <Card sx={{
                mb: 3,
                borderRadius: 4,
                p: 3,
                background:
                  "linear-gradient(135deg,#f97316,#ef4444)"
              }}>
                <Typography>Next Session</Typography>
                <Typography variant="h4" fontWeight={900}>
                  {nextSession.start_time}
                </Typography>
                <Typography>
                  📍 {nextSession.locationName}
                </Typography>
              </Card>
            </MotionBox>
          )}

          {/* 🔥 ALERT */}
          {urgentSessions.length > 0 && (
            <Card sx={{
              mb: 3,
              p: 2,
              borderRadius: 4,
              background: "#7c2d12"
            }}>
              ⚠️ {urgentSessions.length} session(s) starting soon
            </Card>
          )}

          {/* 🔥 KPI CARDS */}
          <Grid container spacing={2} mb={3}>

            {[
              { label: "Sessions", value: sessions.length },
              { label: "Players", value: data.activePlayers || 0 },
              { label: "Check-ins", value: data.checkinsToday || 0 },
              { label: "Today", value: data.todaySessionCount || 0 }
            ].map((k, i) => (
              <Grid item xs={6} md={3} key={i}>
                <MotionBox whileHover={{ y: -8 }}>
                  <Card sx={{
                    borderRadius: 4,
                    backdropFilter: "blur(10px)",
                    background: "rgba(255,255,255,0.05)"
                  }}>
                    <CardContent>
                      <Typography color="gray">
                        {k.label}
                      </Typography>
                      <Typography variant="h4" fontWeight={900}>
                        {k.value}
                      </Typography>
                    </CardContent>
                  </Card>
                </MotionBox>
              </Grid>
            ))}
          </Grid>

          {/* 🔥 TODAY FOCUS */}
          <Typography fontWeight={800} mb={2}>
            Today’s Sessions
          </Typography>

          <Stack spacing={2}>
            {data.todaySessionList?.map((s, i) => (
              <MotionBox key={i} whileHover={{ scale: 1.02 }}>
                <Card sx={{
                  borderRadius: 3,
                  p: 2,
                  background: "rgba(255,255,255,0.05)"
                }}>
                  <Typography fontWeight={700}>
                    ⏰ {s.start_time} – {s.end_time}
                  </Typography>

                  <Stack direction="row" spacing={1} mt={1}>
                    <Chip label="Session" />
                    <Button size="small" variant="contained">
                      Mark Attendance
                    </Button>
                  </Stack>
                </Card>
              </MotionBox>
            ))}
          </Stack>
        </>
      )}

      {/* ================= SESSIONS ================= */}
      {tab === 1 && (
        <Grid container spacing={2}>
          {sessions.map((s) => (
            <Grid item xs={12} md={6} key={s.id}>
              <MotionBox whileHover={{ scale: 1.02 }}>
                <Card sx={{
                  borderRadius: 4,
                  p: 2,
                  background: "rgba(255,255,255,0.05)"
                }}>
                  <Typography fontWeight={700}>
                    {s.session_date}
                  </Typography>

                  <Typography color="gray">
                    {s.start_time} – {s.end_time}
                  </Typography>

                  <Typography mt={1}>
                    📍 {s.locationName}
                  </Typography>

                  <Button
                    fullWidth
                    sx={{ mt: 2 }}
                    variant="contained"
                  >
                    View Details
                  </Button>
                </Card>
              </MotionBox>
            </Grid>
          ))}
        </Grid>
      )}

      {/* ================= ACTIVITY ================= */}
      {tab === 2 && (
        <Stack spacing={2}>
          {[
            ...(data.todaySessionList || []),
            ...(data.ongoing || [])
          ].map((s, i) => (
            <MotionBox key={i} whileHover={{ scale: 1.02 }}>
              <Card sx={{
                borderRadius: 3,
                p: 2,
                background: "rgba(255,255,255,0.05)"
              }}>
                <Typography fontWeight={700}>
                  {s.player_name || "Player"}
                </Typography>

                <Typography color="gray">
                  {s.start_time} - {s.end_time}
                </Typography>

                <Chip label="Activity" size="small" />
              </Card>
            </MotionBox>
          ))}
        </Stack>
      )}

    </Box>
  );
}