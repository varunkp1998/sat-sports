import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  Divider,
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
        boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
      }}
    >
      <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Box sx={{ fontSize: 42, opacity: 0.9 }}>{icon}</Box>
        <Box>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            {title}
          </Typography>
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

  if (!data) return <p>Loading overview...</p>;

  return (
    <section style={{ background: "#f5f7fb", minHeight: "100vh", padding: 16 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={800}>
          Welcome, {data.coachName || "Coach"} 👋
        </Typography>
        <Typography color="text.secondary">
          Here’s your coaching dashboard for today
        </Typography>
      </Box>

      {/* Top Stats */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr 1fr" },
          gap: 2,
          mb: 3,
        }}
      >
        <StatCard
          title="Today's Sessions"
          value={data.todaySessionCount || 0}
          icon={<EventIcon fontSize="inherit" />}
          color="linear-gradient(135deg, #667eea, #764ba2)"
        />

        <StatCard
          title="Check-in Status"
          value={
            <Chip
              label={data.checkedInToday ? "Checked In" : "Not Checked In"}
              color={data.checkedInToday ? "success" : "warning"}
            />
          }
          icon={<CheckCircleIcon fontSize="inherit" />}
          color="linear-gradient(135deg, #43cea2, #185a9d)"
        />

        <StatCard
          title="Pending Leaves"
          value={data.pendingLeaves || 0}
          icon={<HourglassEmptyIcon fontSize="inherit" />}
          color="linear-gradient(135deg, #ff9966, #ff5e62)"
        />

        <StatCard
          title="Next Session"
          value={
            data.nextSession
              ? `${data.nextSession.start_time} – ${data.nextSession.end_time}`
              : "No more today 🎉"
          }
          icon={<ScheduleIcon fontSize="inherit" />}
          color="linear-gradient(135deg, #56ab2f, #a8e063)"
        />
      </Box>

      {/* Middle Section */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" },
          gap: 2,
          mb: 3,
        }}
      >
        {/* Weekly Sessions Mini Chart */}
        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={700} mb={2}>
              Sessions This Week
            </Typography>

            <Box sx={{ display: "flex", alignItems: "flex-end", gap: 1, height: 120 }}>
              {(data.weeklySessions || []).map((v, i) => (
                <Box
                  key={i}
                  sx={{
                    width: 20,
                    height: v * 25 + 10,
                    background: "#667eea",
                    borderRadius: 1,
                  }}
                />
              ))}
              {(data.weeklySessions || []).length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  No data
                </Typography>
              )}
            </Box>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={700} mb={2}>
              Recent Activity
            </Typography>

            {(data.recentActivities || []).map((a, i) => (
              <Typography key={i} variant="body2" sx={{ mb: 1 }}>
                • {a}
              </Typography>
            ))}

            {(data.recentActivities || []).length === 0 && (
              <Typography variant="body2" color="text.secondary">
                No recent activity
              </Typography>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* Bottom Section */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: 2,
        }}
      >
        {/* Last Sessions */}
        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={700} mb={2}>
              Last Sessions
            </Typography>

            {(data.lastSessions || []).map((s, i) => (
              <Typography key={i} variant="body2">
                • {s.date} — {s.time}
              </Typography>
            ))}

            {(data.lastSessions || []).length === 0 && (
              <Typography variant="body2" color="text.secondary">
                No sessions yet
              </Typography>
            )}
          </CardContent>
        </Card>

        {/* Last Leaves */}
        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={700} mb={2}>
              Leave Requests
            </Typography>

            {(data.lastLeaves || []).map((l, i) => (
              <Typography key={i} variant="body2">
                • {l.from} → {l.to} ({l.status})
              </Typography>
            ))}

            {(data.lastLeaves || []).length === 0 && (
              <Typography variant="body2" color="text.secondary">
                No leave requests
              </Typography>
            )}
          </CardContent>
        </Card>
      </Box>
    </section>
  );
}

export default CoachDashboard;
