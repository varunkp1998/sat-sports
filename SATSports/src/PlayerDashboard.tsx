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
  Chip
} from "@mui/material";

import EventIcon from "@mui/icons-material/Event";
import ScheduleIcon from "@mui/icons-material/Schedule";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";

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

  const [data, setData] = useState<any>({
    weeklySessions: [],
    lastSessions: [],
    recentActivities: []
  });

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

  const weekly = data.weeklySessions || [];

  return (
    <Box sx={{ p: 3, background: "#f5f7fb", minHeight: "100vh" }}>

      {/* HEADER */}
      <Typography variant="h5" fontWeight={700} mb={2}>
        🏃 Player Dashboard
      </Typography>

      {/* TABS */}
      <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 3 }}>
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
                  <Typography variant="h6">
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
                    {weekly.reduce((a: number, b: number) => a + b, 0)}
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
                  <Typography mb={2}>
                    Weekly Sessions
                  </Typography>

                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart
                      data={weekly.map((v: number, i: number) => ({
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

          {/* 2 COLUMN */}
          <Grid container spacing={3}>

            {/* RECENT ACTIVITY */}
            <Grid item xs={12} md={6}>
              <Typography fontWeight={600} mb={1}>
                Recent Activity
              </Typography>

              {(data.recentActivities || []).map((a: string, i: number) => (
                <Card key={i} sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography>{a}</Typography>
                    <Chip
                      label="Completed"
                      color="success"
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  </CardContent>
                </Card>
              ))}
            </Grid>

            {/* LAST SESSIONS */}
            <Grid item xs={12} md={6}>
              <Typography fontWeight={600} mb={1}>
                Last Sessions
              </Typography>

              {(data.lastSessions || []).length === 0 && (
                <Typography>No sessions yet</Typography>
              )}

              {(data.lastSessions || []).map((s: any, i: number) => (
                <Card key={i} sx={{ mb: 2 }}>
                  <CardContent>

                    <Typography fontWeight={600}>
                      Session
                    </Typography>

                    <Typography color="text.secondary">
                      {s.date}
                    </Typography>

                    <Typography color="text.secondary">
                      {s.time}
                    </Typography>

                    <Chip
                      label="Completed"
                      color="success"
                      size="small"
                      sx={{ mt: 1 }}
                    />

                    <Box mt={2}>
                      <Button size="small">View Details</Button>
                    </Box>

                  </CardContent>
                </Card>
              ))}
            </Grid>

          </Grid>
        </>
      )}

      {/* ================= SESSIONS TAB ================= */}
      {tab === 1 && (
        <Typography>All sessions coming soon...</Typography>
      )}

      {/* ================= ACTIVITY TAB ================= */}
      {tab === 2 && (
        <Typography>Detailed activity logs coming soon...</Typography>
      )}

    </Box>
  );
}