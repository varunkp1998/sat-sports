import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent
} from "@mui/material";

import EventIcon from "@mui/icons-material/Event";
import ScheduleIcon from "@mui/icons-material/Schedule";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";

import { motion } from "framer-motion";
import API_BASE from "./api";

function GlassCard({ children }: any) {
  return (
    <Card
      sx={{
        backdropFilter: "blur(12px)",
        background: "rgba(255,255,255,0.08)",
        borderRadius: 4,
        boxShadow: "0 8px 25px rgba(0,0,0,0.4)",
        color: "white"
      }}
    >
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function Stat({ icon, title, value }: any) {
  return (
    <GlassCard>
      <Box display="flex" alignItems="center" gap={2}>
        {icon}
        <Box>
          <Typography variant="body2">{title}</Typography>
          <Typography variant="h4" fontWeight={700}>
            {value}
          </Typography>
        </Box>
      </Box>
    </GlassCard>
  );
}

export default function PlayerDashboard() {
  const userId = localStorage.getItem("userId");

  const [data, setData] = useState<any>({
    weeklySessions: [],
    lastSessions: [],
    recentActivities: []
  });

  useEffect(() => {
    fetch(`${API_BASE}/api/player/overview/${userId}`)
      .then(res => res.json())
      .then(res => setData({
        weeklySessions: [],
        lastSessions: [],
        recentActivities: [],
        ...res
      }));
  }, []);

  const weekly = data.weeklySessions || [];

  return (
    <Box
      sx={{
        p: 4,
        background: "linear-gradient(135deg,#1f2937,#111827)",
        minHeight: "100vh",
        color: "white"
      }}
    >

      {/* Header */}
      <Typography variant="h3" fontWeight={800} mb={4}>
        🏃 Welcome {data.playerName || "Player"}
      </Typography>

      {/* Stats */}
      <Grid container spacing={3} mb={4}>

        <Grid item xs={12} md={4}>
          <Stat
            icon={<FitnessCenterIcon />}
            title="Total Sessions"
            value={data.totalSessions || 0}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <Stat
            icon={<ScheduleIcon />}
            title="Next Session"
            value={
              data.nextSession
                ? `${data.nextSession.start_time} - ${data.nextSession.end_time}`
                : "None"
            }
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <Stat
            icon={<EventIcon />}
            title="This Week"
            value={weekly.reduce((a: number, b: number) => a + b, 0)}
          />
        </Grid>

      </Grid>

      {/* Weekly Chart */}
      <Grid container spacing={3} mb={4}>

        <Grid item xs={12}>

          <GlassCard>

            <Typography variant="h6" mb={2}>
              Weekly Sessions
            </Typography>

            <Box
              sx={{
                display: "flex",
                gap: 2,
                alignItems: "flex-end",
                height: 150
              }}
            >
              {weekly.map((v: number, i: number) => (
                <Box
                  key={i}
                  sx={{
                    width: 30,
                    height: `${v * 25}px`,
                    background: "#4ade80",
                    borderRadius: 2
                  }}
                />
              ))}
            </Box>

          </GlassCard>

        </Grid>

      </Grid>

      {/* Activity + History */}
      <Grid container spacing={3}>

        {/* Recent Activity */}
        <Grid item xs={12} md={6}>

          <GlassCard>

            <Typography variant="h6" mb={2}>
              Recent Activity
            </Typography>

            {(data.recentActivities || []).map((a: string, i: number) => (
              <Typography key={i} sx={{ mb: 1 }}>
                • {a}
              </Typography>
            ))}

          </GlassCard>

        </Grid>

        {/* Last Sessions */}
        <Grid item xs={12} md={6}>

          <GlassCard>

            <Typography variant="h6" mb={2}>
              Last Sessions
            </Typography>

            {(data.lastSessions || []).length === 0 && (
              <Typography>No sessions yet</Typography>
            )}

            {(data.lastSessions || []).map((s: any, i: number) => (
              <Typography key={i}>
                {s.date} | {s.time}
              </Typography>
            ))}

          </GlassCard>

        </Grid>

      </Grid>

    </Box>
  );
}