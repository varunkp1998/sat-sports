import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  Button,
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

  const [data, setData] = useState({
    weeklySessions: [],
    lastSessions: [],
    recentActivities: []
  });

  const [sessions, setSessions] = useState([]);

  // 🔥 Load overview
  useEffect(() => {
    fetch(`${API_BASE}/api/player/overview/${userId}`)
      .then(res => res.json())
      .then(res =>
        setData({
          weeklySessions: [],
          lastSessions: [],
          recentActivities: [],
          ...res
        })
      );
  }, []);

  // 🔥 Load sessions when tab opens
  useEffect(() => {
    if (tab === 1) {
      fetch(`${API_BASE}/api/player/sessions/${userId}`)
        .then(res => res.json())
        .then(setSessions);
    }
  }, [tab]);

  const weekly = data.weeklySessions || [];

  // 🔥 Helpers
  const isToday = (date) =>
    new Date(date).toDateString() === new Date().toDateString();

  const upcoming = sessions.filter(
    (s) => new Date(s.date) >= new Date()
  );

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, background: "#f5f7fb", minHeight: "100vh" }}>

      {/* HEADER */}
      <Typography variant="h5" fontWeight={700} mb={2}>
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

      {/* ================= MAIN TAB ================= */}
      {tab === 0 && (
        <>
          {/* STATS */}
          <Grid container spacing={2} mb={3}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary">
                    Total Sessions
                  </Typography>
                  <Typography variant="h4">
                    {data.totalSessions || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary">
                    Next Session
                  </Typography>
                  <Typography variant="body1">
                    {data.nextSession
                      ? `${data.nextSession.start_time} - ${data.nextSession.end_time}`
                      : "None"}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary">
                    This Week
                  </Typography>
                  <Typography variant="h4">
                    {weekly.reduce((a, b) => a + b, 0)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* CHART */}
          <Grid container spacing={3} mb={3}>
            <Grid item xs={12}>
              <Card>
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
            </Grid>
          </Grid>

          {/* ACTIVITY + LAST */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography fontWeight={600} mb={1}>
                Recent Activity
              </Typography>

              {(data.recentActivities || []).map((a, i) => (
                <Card key={i} sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography>{a}</Typography>
                    <Chip label="Completed" color="success" size="small" sx={{ mt: 1 }} />
                  </CardContent>
                </Card>
              ))}
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography fontWeight={600} mb={1}>
                Last Sessions
              </Typography>

              {(data.lastSessions || []).length === 0 && (
                <Typography>No sessions yet</Typography>
              )}

              {(data.lastSessions || []).map((s, i) => (
                <Card key={i} sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography fontWeight={600}>Session</Typography>
                    <Typography color="text.secondary">{s.date}</Typography>
                    <Typography color="text.secondary">{s.time}</Typography>
                    <Chip label="Completed" color="success" size="small" sx={{ mt: 1 }} />
                  </CardContent>
                </Card>
              ))}
            </Grid>
          </Grid>
        </>
      )}

      {/* ================= SESSIONS TAB ================= */}
      {tab === 1 && (
        <Stack spacing={2}>

          {/* EMPTY */}
          {sessions.length === 0 && (
            <Typography>No sessions scheduled</Typography>
          )}

          {/* SESSION CARDS */}
          {sessions.map((s) => (
            <Card key={s.id}>
              <CardContent>

                <Stack spacing={1}>

                  <Typography fontWeight={700}>
                    {new Date(s.date).toDateString()}
                  </Typography>

                  {isToday(s.date) && (
                    <Chip label="Today" color="success" size="small" />
                  )}

                  <Typography>
                    ⏰ {s.start_time} – {s.end_time}
                  </Typography>

                  <Typography>
                    📍 {s.location}
                  </Typography>

                  <Typography>
                    👨‍🏫 {s.coach}
                  </Typography>

                  <Typography>
                    🎾 {s.program}
                  </Typography>

                </Stack>

              </CardContent>
            </Card>
          ))}

        </Stack>
      )}

      {/* ================= ACTIVITY TAB ================= */}
      {tab === 2 && (
        <Typography>Detailed activity logs coming soon...</Typography>
      )}

    </Box>
  );
}