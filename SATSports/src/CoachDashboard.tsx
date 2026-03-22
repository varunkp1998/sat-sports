import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  Button
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

import { motion } from "framer-motion";

import API_BASE from "./api";

function GlassCard({ children }: any) {
  return (
    <Card
      sx={{
        backdropFilter: "blur(12px)",
        background: "rgba(255,255,255,0.7)",
        borderRadius: 4,
        boxShadow: "0 8px 25px rgba(0,0,0,0.15)"
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

export default function CoachDashboard() {

  const userId = localStorage.getItem("userId");

  const [data, setData] = useState<any>({
    weekly: [],
    todaySessionList: [],
    upcoming: []
  });

  const [date, setDate] = useState(new Date());

  useEffect(() => {
    fetch(`${API_BASE}/api/coach/overview/${userId}`)
      .then(res => res.json())
      .then(res => setData({
        weekly: [],
        todaySessionList: [],
        upcoming: [],
        ...res
      }));
  }, []);

  return (
    <Box sx={{ p: 3, background: "#f5f7fb", minHeight: "100vh" }}>

      {/* Header */}
      <Typography variant="h5" fontWeight={700} mb={2}>
        Coach Dashboard
      </Typography>

      {/* Tabs */}
      <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="Main" />
        <Tab label="Sessions" />
        <Tab label="Activity" />
      </Tabs>

      {/* Top Stats */}
      <Grid container spacing={2} mb={3}>
        {[
          { label: "Today's Sessions", value: data.todaySessionCount || 0 },
          { label: "Active Players", value: data.activePlayers || 0 },
          { label: "Check-ins", value: data.checkinsToday || 0 },
          { label: "Upcoming", value: data.upcoming?.length || 0 }
        ].map((item, i) => (
          <Grid item xs={12} md={3} key={i}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography color="text.secondary">
                  {item.label}
                </Typography>
                <Typography variant="h4" fontWeight={700}>
                  {item.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* 3 Column Layout */}
      <Grid container spacing={3}>

        {/* Column 1 - Today */}
        <Grid item xs={12} md={4}>
          <Typography fontWeight={600} mb={1}>
            Today's Sessions
          </Typography>

          {data.todaySessionList?.map((s: any) => (
            <Card key={s.id} sx={{ mb: 2, borderRadius: 3 }}>
              <CardContent>

                <Typography fontWeight={600}>
                  {s.player_name || "Player"}
                </Typography>

                <Typography color="text.secondary">
                  {s.start_time} - {s.end_time}
                </Typography>

                <Box mt={2} display="flex" justifyContent="space-between">
                  <Button size="small">Details</Button>
                  <Button
                    size="small"
                    variant="contained"
                    color="success"
                  >
                    Start
                  </Button>
                </Box>

              </CardContent>
            </Card>
          ))}
        </Grid>

        {/* Column 2 - Ongoing */}
        <Grid item xs={12} md={4}>
          <Typography fontWeight={600} mb={1}>
            Ongoing Sessions
          </Typography>

          {(data.ongoing || []).map((s: any, i: number) => (
            <Card key={i} sx={{ mb: 2, borderRadius: 3 }}>
              <CardContent>

                <Typography fontWeight={600}>
                  {s.player_name}
                </Typography>

                <Typography color="text.secondary">
                  Ends at {s.end_time}
                </Typography>

                <Box mt={2}>
                  <Button size="small">View</Button>
                </Box>

              </CardContent>
            </Card>
          ))}
        </Grid>

        {/* Column 3 - Upcoming */}
        <Grid item xs={12} md={4}>
          <Typography fontWeight={600} mb={1}>
            Upcoming Sessions
          </Typography>

          {(data.upcoming || []).map((s: any, i: number) => (
            <Card key={i} sx={{ mb: 2, borderRadius: 3 }}>
              <CardContent>

                <Typography fontWeight={600}>
                  {s.player_name}
                </Typography>

                <Typography color="text.secondary">
                  {s.session_date}
                </Typography>

                <Typography color="text.secondary">
                  {s.start_time}
                </Typography>

              </CardContent>
            </Card>
          ))}
        </Grid>

      </Grid>

    </Box>
  );
}