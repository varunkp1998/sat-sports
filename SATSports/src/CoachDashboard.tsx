import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button
} from "@mui/material";

import EventIcon from "@mui/icons-material/Event";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import ScheduleIcon from "@mui/icons-material/Schedule";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  Tooltip
} from "recharts";

import API_BASE from "./api";

type Overview = {
  coachName: string;
  todaySessionCount: number;
  todaySessionList?: any[];
  upcoming?: any[];
  weekly?: any[];
  pendingLeaves?: number;
  nextSession?: any;
};

function StatCard({ title, value, icon, color }: any) {
  return (
    <Card
      sx={{
        borderRadius: 4,
        color: "#fff",
        background: color,
        boxShadow: "0 10px 25px rgba(0,0,0,0.15)"
      }}
    >
      <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Box sx={{ fontSize: 40 }}>{icon}</Box>

        <Box>
          <Typography variant="body2">{title}</Typography>
          <Typography variant="h4" fontWeight={700}>
            {value}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

function CoachDashboard() {
  const userId = localStorage.getItem("userId");
  const [data, setData] = useState<Overview | null>(null);

  useEffect(() => {
    if (!userId) return;

    fetch(`${API_BASE}/api/coach/overview/${userId}`)
      .then(res => res.json())
      .then(res => {
        setData({
          todaySessionList: [],
          upcoming: [],
          weekly: [],
          ...res
        });
      });
  }, [userId]);

  if (!data) return <p>Loading dashboard...</p>;

  return (
    <Box sx={{ p: 3 }}>

      {/* Header */}
      <Typography variant="h4" fontWeight={800} mb={3}>
        Welcome {data.coachName || "Coach"} 👋
      </Typography>

      {/* Stat Cards */}
      <Grid container spacing={3} mb={3}>

        <Grid item xs={12} md={3}>
          <StatCard
            title="Today's Sessions"
            value={data.todaySessionCount || 0}
            icon={<EventIcon fontSize="inherit" />}
            color="linear-gradient(135deg,#667eea,#764ba2)"
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <StatCard
            title="Check In"
            value={<Button variant="contained">CHECK IN</Button>}
            icon={<CheckCircleIcon fontSize="inherit" />}
            color="linear-gradient(135deg,#43cea2,#185a9d)"
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <StatCard
            title="Pending Leaves"
            value={data.pendingLeaves || 0}
            icon={<HourglassEmptyIcon fontSize="inherit" />}
            color="linear-gradient(135deg,#ff9966,#ff5e62)"
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <StatCard
            title="Next Session"
            value={
              data.nextSession
                ? `${data.nextSession.start_time}`
                : "None"
            }
            icon={<ScheduleIcon fontSize="inherit" />}
            color="linear-gradient(135deg,#56ab2f,#a8e063)"
          />
        </Grid>

      </Grid>

      {/* Weekly Sessions Chart */}
      <Card sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent>

          <Typography variant="h6" fontWeight={700} mb={2}>
            Sessions This Week
          </Typography>

          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.weekly}>
              <XAxis dataKey="d" />
              <Tooltip />
              <Bar dataKey="cnt" fill="#667eea" />
            </BarChart>
          </ResponsiveContainer>

        </CardContent>
      </Card>

      {/* Today's Sessions */}
      <Card sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent>

          <Typography variant="h6" fontWeight={700} mb={2}>
            Today's Sessions
          </Typography>

          {(data.todaySessionList || []).length === 0 && (
            <Typography color="text.secondary">
              No sessions scheduled
            </Typography>
          )}

          {(data.todaySessionList || []).map((s: any) => (
            <Box
              key={s.id}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                p: 1,
                borderBottom: "1px solid #eee"
              }}
            >
              <span>
                {s.start_time} - {s.end_time}
              </span>

              <Button size="small" variant="contained">
                Start
              </Button>
            </Box>
          ))}

        </CardContent>
      </Card>

      {/* Upcoming Sessions */}
      <Card sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent>

          <Typography variant="h6" fontWeight={700} mb={2}>
            Upcoming Sessions
          </Typography>

          {(data.upcoming || []).length === 0 && (
            <Typography color="text.secondary">
              No upcoming sessions
            </Typography>
          )}

          {(data.upcoming || []).map((s: any, i: number) => (
            <Typography key={i} sx={{ p: 1 }}>
              {s.session_date} | {s.start_time} - {s.end_time}
            </Typography>
          ))}

        </CardContent>
      </Card>

      {/* Activity */}
      <Card sx={{ borderRadius: 3 }}>
        <CardContent>

          <Typography variant="h6" fontWeight={700} mb={2}>
            Recent Activity
          </Typography>

          <Typography variant="body2">
            ✔ Checked in today
          </Typography>

          <Typography variant="body2">
            🎾 Completed training session
          </Typography>

        </CardContent>
      </Card>

    </Box>
  );
}

export default CoachDashboard;