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

  const [data, setData] = useState<any>({
    weekly: [],
    todaySessionList: [],
    upcoming: [],
    ongoing: []
  });

  useEffect(() => {
    fetch(`${API_BASE}/api/coach/overview/${userId}`)
      .then(res => res.json())
      .then(res =>
        setData({
          weekly: [],
          todaySessionList: [],
          upcoming: [],
          ongoing: [],
          ...res
        })
      );
  }, []);

  return (
    <Box sx={{ p: 3, background: "#f5f7fb", minHeight: "100vh" }}>

      {/* HEADER */}
      <Typography variant="h5" fontWeight={700} mb={2}>
        🎾 Coach Dashboard
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
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary">
                    Today's Sessions
                  </Typography>
                  <Typography variant="h4">
                    {data.todaySessionCount || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary">
                    Active Players
                  </Typography>
                  <Typography variant="h4">
                    {data.activePlayers || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary">
                    Check-ins
                  </Typography>
                  <Typography variant="h4">
                    {data.checkinsToday || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary">
                    Next Session
                  </Typography>
                  <Typography variant="h6">
                    {data.nextSession?.start_time || "None"}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* CHART + CALENDAR */}
          <Grid container spacing={3} mb={3}>
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Typography mb={2}>
                    Weekly Sessions
                  </Typography>

                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={data.weekly}>
                      <XAxis dataKey="d" />
                      <Tooltip />
                      <Area dataKey="cnt" />
                    </AreaChart>
                  </ResponsiveContainer>

                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography mb={2}>
                    Calendar
                  </Typography>
                  <Calendar value={date} onChange={setDate} />
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* 3 COLUMN WORKFLOW */}
          <Grid container spacing={3}>

            {/* TODAY */}
            <Grid item xs={12} md={4}>
              <Typography fontWeight={600} mb={1}>
                Today's Sessions
              </Typography>

              {data.todaySessionList?.map((s: any) => (
                <Card key={s.id} sx={{ mb: 2 }}>
                  <CardContent>

                    <Typography fontWeight={600}>
                      {s.player_name || "Player"}
                    </Typography>

                    <Typography color="text.secondary">
                      {s.start_time} - {s.end_time}
                    </Typography>

                    <Chip
                      label="Pending"
                      color="warning"
                      size="small"
                      sx={{ mt: 1 }}
                    />

                    <Box mt={2} display="flex" justifyContent="space-between">
                      <Button size="small">Details</Button>
                      <Button variant="contained" size="small">
                        Start
                      </Button>
                    </Box>

                  </CardContent>
                </Card>
              ))}
            </Grid>

            {/* ONGOING */}
            <Grid item xs={12} md={4}>
              <Typography fontWeight={600} mb={1}>
                Ongoing
              </Typography>

              {data.ongoing?.map((s: any, i: number) => (
                <Card key={i} sx={{ mb: 2 }}>
                  <CardContent>

                    <Typography fontWeight={600}>
                      {s.player_name}
                    </Typography>

                    <Typography color="text.secondary">
                      Ends at {s.end_time}
                    </Typography>

                    <Chip
                      label="Active"
                      color="success"
                      size="small"
                      sx={{ mt: 1 }}
                    />

                    <Box mt={2}>
                      <Button size="small">View</Button>
                    </Box>

                  </CardContent>
                </Card>
              ))}
            </Grid>

            {/* UPCOMING */}
            <Grid item xs={12} md={4}>
              <Typography fontWeight={600} mb={1}>
                Upcoming
              </Typography>

              {data.upcoming?.map((s: any, i: number) => (
                <Card key={i} sx={{ mb: 2 }}>
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

                    <Chip
                      label="Scheduled"
                      color="info"
                      size="small"
                      sx={{ mt: 1 }}
                    />

                  </CardContent>
                </Card>
              ))}
            </Grid>

          </Grid>
        </>
      )}

      {/* ================= SESSIONS TAB ================= */}
      {tab === 1 && (
        <Typography>Sessions view coming soon...</Typography>
      )}

      {/* ================= ACTIVITY TAB ================= */}
      {tab === 2 && (
        <Typography>Activity logs coming soon...</Typography>
      )}

    </Box>
  );
}