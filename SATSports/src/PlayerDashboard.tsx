import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  Chip,
  Stack
} from "@mui/material";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  Tooltip
} from "recharts";

import API_BASE from "./api";

export default function PlayerDashboard() {
  const userId = localStorage.getItem("userId");

  const [tab, setTab] = useState(0);
  const [sessions, setSessions] = useState([]);
  const [data, setData] = useState({
    weeklySessions: [],
    recentActivities: []
  });

  // 🔥 Load overview
  useEffect(() => {
    fetch(`${API_BASE}/api/player/overview/${userId}`)
      .then(res => res.json())
      .then(setData);
  }, []);

  // 🔥 Load sessions once
  useEffect(() => {
    fetch(`${API_BASE}/api/player/sessions/${userId}`)
      .then(res => res.json())
      .then(setSessions);
  }, []);

  const weekly = data.weeklySessions || [];

  // 🔥 Compute next session
  const nextSession = sessions
    .filter(s => new Date(s.date) >= new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date))[0];

  const isToday = (date) =>
    new Date(date).toDateString() === new Date().toDateString();

  // 🔔 BASIC NOTIFICATION (browser)
  useEffect(() => {
    if (!nextSession) return;

    const sessionTime = new Date(nextSession.date);
    const now = new Date();

    const diff = sessionTime - now;

    // 1 hour before reminder
    if (diff > 0 && diff < 3600000) {
      if (Notification.permission === "granted") {
        new Notification("Upcoming Session", {
          body: `${nextSession.start_time} - ${nextSession.program}`
        });
      } else {
        Notification.requestPermission();
      }
    }
  }, [nextSession]);

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, background: "#f5f7fb", minHeight: "100vh" }}>

      <Typography variant="h5" fontWeight={800} mb={2}>
        🏃 Player Dashboard
      </Typography>

      {/* TABS */}
      <Tabs
        value={tab}
        onChange={(e, v) => setTab(v)}
        variant="fullWidth"
        sx={{ mb: 3 }}
      >
        <Tab label="Main" />
        <Tab label="Sessions" />
        <Tab label="Activity" />
      </Tabs>

      {/* ================= MAIN ================= */}
      {tab === 0 && (
        <>
          {/* BIG CARDS */}
          <Grid container spacing={2} mb={3}>

            {/* NEXT SESSION (HIGHLIGHT) */}
            <Grid item xs={12}>
              <Card sx={{ borderRadius: 3, background: "#0f172a", color: "#fff" }}>
                <CardContent>

                  <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>
                    Next Session
                  </Typography>

                  {nextSession ? (
                    <>
                      <Typography variant="h5" fontWeight={700}>
                        {new Date(nextSession.date).toDateString()}
                      </Typography>

                      <Typography>
                        ⏰ {nextSession.start_time} – {nextSession.end_time}
                      </Typography>

                      <Typography>
                        📍 {nextSession.location}
                      </Typography>

                      <Typography>
                        🎾 {nextSession.program}
                      </Typography>
                    </>
                  ) : (
                    <Typography>No upcoming sessions</Typography>
                  )}

                </CardContent>
              </Card>
            </Grid>

            {/* STATS */}
            <Grid item xs={12} md={6}>
              <Card sx={{ height: "100%" }}>
                <CardContent>
                  <Typography color="text.secondary">
                    Total Sessions
                  </Typography>
                  <Typography variant="h3">
                    {sessions.length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card sx={{ height: "100%" }}>
                <CardContent>
                  <Typography color="text.secondary">
                    This Week
                  </Typography>
                  <Typography variant="h3">
                    {weekly.reduce((a, b) => a + b, 0)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

          </Grid>

          {/* CHART */}
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography mb={2}>Weekly Sessions</Typography>

              <ResponsiveContainer width="100%" height={250}>
                <AreaChart
                  data={weekly.map((v, i) => ({
                    day: i,
                    value: v
                  }))}
                >
                  <XAxis dataKey="day" />
                  <Tooltip />
                  <Area dataKey="value" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}

      {/* ================= SESSIONS ================= */}
      {tab === 1 && (
        <Stack spacing={2}>

          {sessions.length === 0 && (
            <Typography>No sessions scheduled</Typography>
          )}

          {sessions.map((s) => (
            <Card key={s.id} sx={{ borderRadius: 3 }}>
              <CardContent>

                <Grid container spacing={2} alignItems="center">

                  <Grid item xs={12} md={3}>
                    <Typography fontWeight={700}>
                      {new Date(s.date).toDateString()}
                    </Typography>
                    {isToday(s.date) && (
                      <Chip label="Today" color="success" size="small" />
                    )}
                  </Grid>

                  <Grid item xs={6} md={3}>
                    ⏰ {s.start_time} – {s.end_time}
                  </Grid>

                  <Grid item xs={6} md={2}>
                    📍 {s.location}
                  </Grid>

                  <Grid item xs={6} md={2}>
                    👨‍🏫 {s.coach}
                  </Grid>

                  <Grid item xs={6} md={2}>
                    🎾 {s.program}
                  </Grid>

                </Grid>

              </CardContent>
            </Card>
          ))}

        </Stack>
      )}

      {/* ================= ACTIVITY ================= */}
      {tab === 2 && (
        <Stack spacing={2}>

          {(data.recentActivities || []).length === 0 && (
            <Typography>No activity yet</Typography>
          )}

          {(data.recentActivities || []).map((a, i) => (
            <Card key={i}>
              <CardContent>
                <Typography>{a}</Typography>
                <Chip label="Completed" color="success" size="small" sx={{ mt: 1 }} />
              </CardContent>
            </Card>
          ))}

        </Stack>
      )}

    </Box>
  );
}