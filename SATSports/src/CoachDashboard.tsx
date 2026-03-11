import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  Divider,
  Grid,
} from "@mui/material";
import API_BASE from "./api";

import EventIcon from "@mui/icons-material/Event";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import ScheduleIcon from "@mui/icons-material/Schedule";

type Overview = {
  coachName: string;
  todaySessionCount: number;
  checkedInToday: boolean;
  pendingLeaves: number;
  nextSession: { start_time: string; end_time: string } | null;
  weeklySessions?: number[];
  recentActivities?: string[];
  lastSessions?: { date: string; time: string }[];
  lastLeaves?: { from: string; to: string; status: string }[];
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
        color: "#fff",
        background: color,
        height: "100%",
      }}
    >
      <CardContent
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
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
      .then((res) => res.json())
      .then((res) =>
        setData({
          weeklySessions: [],
          recentActivities: [],
          lastSessions: [],
          lastLeaves: [],
          ...res,
        })
      );
  }, [userId]);

  if (!data) return <p>Loading dashboard...</p>;

  return (
    <Box
      sx={{
        background: "#f5f7fb",
        minHeight: "100vh",
        p: { xs: 2, md: 4 },
      }}
    >
      {/* Header */}
      <Box mb={4}>
        <Typography
          variant="h4"
          fontWeight={800}
          sx={{ fontSize: { xs: 26, md: 32 } }}
        >
          Welcome, {data.coachName || "Coach"} 👋
        </Typography>

        <Typography color="text.secondary">
          Here's your coaching dashboard
        </Typography>
      </Box>

      {/* Stats */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Today's Sessions"
            value={data.todaySessionCount || 0}
            icon={<EventIcon />}
            color="linear-gradient(135deg,#667eea,#764ba2)"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Check-in Status"
            value={
              <Chip
                label={data.checkedInToday ? "Checked In" : "Not Checked In"}
                color={data.checkedInToday ? "success" : "warning"}
              />
            }
            icon={<CheckCircleIcon />}
            color="linear-gradient(135deg,#43cea2,#185a9d)"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pending Leaves"
            value={data.pendingLeaves || 0}
            icon={<HourglassEmptyIcon />}
            color="linear-gradient(135deg,#ff9966,#ff5e62)"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Next Session"
            value={
              data.nextSession
                ? `${data.nextSession.start_time} – ${data.nextSession.end_time}`
                : "No more today 🎉"
            }
            icon={<ScheduleIcon />}
            color="linear-gradient(135deg,#56ab2f,#a8e063)"
          />
        </Grid>
      </Grid>

      {/* Middle Section */}
      <Grid container spacing={3} mb={3}>
        {/* Weekly Chart */}
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography fontWeight={700} mb={2}>
                Sessions This Week
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-end",
                  gap: 1,
                  height: 140,
                }}
              >
                {(data.weeklySessions || []).map((v, i) => (
                  <Box
                    key={i}
                    sx={{
                      width: 25,
                      height: v * 25 + 10,
                      background: "#667eea",
                      borderRadius: 1,
                    }}
                  />
                ))}

                {(data.weeklySessions || []).length === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    No weekly data
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Activity */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography fontWeight={700} mb={2}>
                Recent Activity
              </Typography>

              {(data.recentActivities || []).map((a, i) => (
                <Typography key={i} variant="body2">
                  • {a}
                </Typography>
              ))}

              {(data.recentActivities || []).length === 0 && (
                <Typography color="text.secondary">
                  No activity yet
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Bottom Section */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography fontWeight={700} mb={2}>
                Last Sessions
              </Typography>

              {(data.lastSessions || []).map((s, i) => (
                <Typography key={i}>
                  • {s.date} — {s.time}
                </Typography>
              ))}

              {(data.lastSessions || []).length === 0 && (
                <Typography color="text.secondary">
                  No sessions yet
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography fontWeight={700} mb={2}>
                Leave Requests
              </Typography>

              {(data.lastLeaves || []).map((l, i) => (
                <Typography key={i}>
                  • {l.from} → {l.to} ({l.status})
                </Typography>
              ))}

              {(data.lastLeaves || []).length === 0 && (
                <Typography color="text.secondary">
                  No leave requests
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default CoachDashboard;