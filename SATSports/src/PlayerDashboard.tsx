import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Divider,
  Stack,
  Chip,
} from "@mui/material";
import API_BASE from "./api";

import EventIcon from "@mui/icons-material/Event";
import ScheduleIcon from "@mui/icons-material/Schedule";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";

type Overview = {
  playerName: string;
  totalSessions: number;
  nextSession: {
    start_time: string;
    end_time: string;
    session_date: string;
  } | null;
  weeklySessions: number[];
  lastSessions: { date: string; time: string }[];
  recentActivities: string[];
};

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <Card
      sx={{
        borderRadius: 3,
        boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
      }}
    >
      <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Box sx={{ fontSize: 40, color }}>{icon}</Box>
        <Box>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
          <Typography variant="h5" fontWeight={700}>
            {value}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

function PlayerDashboard() {
  const userId = localStorage.getItem("userId");
  const [data, setData] = useState<Overview | null>(null);

  useEffect(() => {
    if (!userId) return;

    fetch(`${API_BASE}/api/player/overview/${userId}`)
      .then((res) => res.json())
      .then(setData);
  }, [userId]);

  if (!data) return <p>Loading dashboard...</p>;

  const weekly = data.weeklySessions || [];

  return (
    <section style={{ background: "#f5f7fb", minHeight: "100vh", padding: 16 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={800}>
          Welcome, {data.playerName}
        </Typography>
        <Typography color="text.secondary">
          Here’s your training overview
        </Typography>
      </Box>

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Total Sessions"
            value={data.totalSessions}
            icon={<FitnessCenterIcon fontSize="inherit" />}
            color="#1976d2"
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <StatCard
            title="Next Session"
            value={
              data.nextSession
                ? `${data.nextSession.start_time} – ${data.nextSession.end_time}`
                : "No upcoming session"
            }
            icon={<ScheduleIcon fontSize="inherit" />}
            color="#2e7d32"
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <StatCard
            title="This Week"
            value={weekly.reduce((a, b) => a + b, 0)}
            icon={<EventIcon fontSize="inherit" />}
            color="#ed6c02"
          />
        </Grid>
      </Grid>

      {/* Weekly mini chart */}
      <Card sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent>
          <Typography fontWeight={700} mb={1}>
            Sessions This Week
          </Typography>
          <Box
            sx={{
              display: "flex",
              gap: 1,
              alignItems: "flex-end",
              height: 120,
            }}
          >
            {weekly.map((v, i) => (
              <Box
                key={i}
                sx={{
                  width: 24,
                  height: `${v * 20}px`,
                  background:
                    "linear-gradient(180deg, #42a5f5, #1e88e5)",
                  borderRadius: 1,
                }}
                title={`${v} sessions`}
              />
            ))}
          </Box>
        </CardContent>
      </Card>

      <Grid container spacing={2}>
        {/* Recent Activity */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography fontWeight={700}>Recent Activity</Typography>
              <Divider sx={{ my: 1 }} />
              <Stack spacing={1}>
                {(data.recentActivities || []).map((a, i) => (
                  <Typography key={i}>• {a}</Typography>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Last Sessions */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography fontWeight={700}>Last Sessions</Typography>
              <Divider sx={{ my: 1 }} />
              {(data.lastSessions || []).length === 0 && (
                <Typography color="text.secondary">
                  No sessions yet
                </Typography>
              )}
              {(data.lastSessions || []).map((s, i) => (
                <Typography key={i}>
                  • {s.date} ({s.time})
                </Typography>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </section>
  );
}

export default PlayerDashboard;
