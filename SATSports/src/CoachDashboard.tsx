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

import EventIcon from "@mui/icons-material/Event";
import SportsTennisIcon from "@mui/icons-material/SportsTennis";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ScheduleIcon from "@mui/icons-material/Schedule";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  Tooltip
} from "recharts";

import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

import API_BASE from "./api";

export default function CoachDashboard() {
  const userId = localStorage.getItem("userId");

  const [tab, setTab] = useState(0);
  const [date, setDate] = useState(new Date());
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

  const nextSession = sessions
    .filter(s => new Date(s.date) >= new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date))[0];

  const isToday = (d) =>
    new Date(d).toDateString() === new Date().toDateString();

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, background: "#f5f7fb", minHeight: "100vh" }}>

      <Typography variant="h5" fontWeight={800} mb={2}>
        🎾 Coach Dashboard
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
          {/* HERO */}
          <Card
            sx={{
              borderRadius: 4,
              mb: 3,
              background: "linear-gradient(135deg, #1e3a8a, #2563eb)",
              color: "#fff"
            }}
          >
            <CardContent>
              <Typography sx={{ opacity: 0.8 }}>
                Today’s Sessions
              </Typography>

              <Typography variant="h3" fontWeight={800}>
                {data.todaySessionCount || 0}
              </Typography>

              {nextSession && (
                <Typography sx={{ mt: 1 }}>
                  Next: {nextSession.start_time} @ {nextSession.location}
                </Typography>
              )}
            </CardContent>
          </Card>

          {/* KPI */}
          <Grid container spacing={2} mb={3}>

            <Grid item xs={12} md={3}>
              <Card sx={{
                borderRadius: 4,
                background: "linear-gradient(135deg, #3b82f6, #60a5fa)",
                color: "#fff"
              }}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography>Sessions</Typography>
                    <EventIcon />
                  </Stack>
                  <Typography variant="h3" mt={2}>
                    {sessions.length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card sx={{
                borderRadius: 4,
                background: "linear-gradient(135deg, #10b981, #34d399)",
                color: "#fff"
              }}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography>Players</Typography>
                    <SportsTennisIcon />
                  </Stack>
                  <Typography variant="h3" mt={2}>
                    {data.activePlayers || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card sx={{
                borderRadius: 4,
                background: "linear-gradient(135deg, #f59e0b, #fbbf24)",
                color: "#111"
              }}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography>Check-ins</Typography>
                    <CheckCircleIcon />
                  </Stack>
                  <Typography variant="h3" mt={2}>
                    {data.checkinsToday || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card sx={{
                borderRadius: 4,
                background: "linear-gradient(135deg, #ec4899, #f472b6)",
                color: "#fff"
              }}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography>Next In</Typography>
                    <ScheduleIcon />
                  </Stack>
                  <Typography variant="h4" mt={2}>
                    {nextSession
                      ? Math.floor(
                          (new Date(nextSession.date) - new Date()) /
                          (1000 * 60 * 60)
                        ) + " hrs"
                      : "--"}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

          </Grid>

          {/* CHART + CALENDAR */}
          <Grid container spacing={3} mb={3}>
            <Grid item xs={12} md={8}>
              <Card sx={{ borderRadius: 4 }}>
                <CardContent>
                  <Typography mb={2}>Weekly Sessions</Typography>
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={data.weekly}>
                      <XAxis dataKey="d" />
                      <Tooltip />
                      <Area dataKey="cnt" stroke="#2563eb" fill="#93c5fd" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{ borderRadius: 4 }}>
                <CardContent>
                  <Typography mb={2}>Calendar</Typography>
                  <Calendar value={date} onChange={setDate} />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}

      {/* ================= SESSIONS ================= */}
      {tab === 1 && (
        <Stack spacing={2}>
          {sessions.map(s => (
            <Card key={s.id} sx={{ borderRadius: 3 }}>
              <CardContent>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={3}>
                    <Typography fontWeight={600}>
                      {new Date(s.date).toDateString()}
                    </Typography>
                    {isToday(s.date) && (
                      <Chip label="Today" color="success" size="small" />
                    )}
                  </Grid>

                  <Grid item xs={6} md={3}>
                    ⏰ {s.start_time} – {s.end_time}
                  </Grid>

                  <Grid item xs={6} md={3}>
                    📍 {s.location}
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <Chip label={s.program} />
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
          {[...data.todaySessionList, ...data.ongoing].map((s, i) => (
            <Card key={i}>
              <CardContent>
                <Typography>{s.player_name}</Typography>
                <Typography color="text.secondary">
                  {s.start_time} - {s.end_time}
                </Typography>
                <Chip label="Activity" color="info" size="small" />
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

    </Box>
  );
}