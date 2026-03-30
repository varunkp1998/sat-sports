import { useEffect, useState } from "react";
import {
  Box, Typography, Grid, Card, CardContent, Tabs, Tab, Chip, Stack, Container, IconButton, Fade
} from "@mui/material";
import { motion } from "framer-motion";
import EventIcon from "@mui/icons-material/Event";
import SportsTennisIcon from "@mui/icons-material/SportsTennis";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ScheduleIcon from "@mui/icons-material/Schedule";
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip } from "recharts";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import API_BASE from "./api";

const MotionBox = motion(Box);

export default function CoachDashboard() {
  const userId = localStorage.getItem("userId");
  const [tab, setTab] = useState(0);
  const [date, setDate] = useState(new Date());
  const [sessions, setSessions] = useState<any[]>([]);
  const [data, setData] = useState<any>({ weekly: [], todaySessionList: [], upcoming: [], ongoing: [] });

  useEffect(() => {
    fetch(`${API_BASE}/api/coach/overview/${userId}`).then(res => res.json()).then(setData);
    fetch(`${API_BASE}/api/coach/sessions/${userId}`).then(res => res.json()).then(setSessions);
  }, [userId]);

  const nextSession = sessions
    .filter(s => new Date(s.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

  return (
    <Box sx={{ background: "#020617", color: "white", minHeight: "100vh", py: 6 }}>
      <Container maxWidth="xl">
        
        {/* --- HEADER --- */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={6}>
          <Box>
            <Typography variant="overline" sx={{ color: "#ef4444", fontWeight: 900, letterSpacing: 3 }}>
              COACH TERMINAL
            </Typography>
            <Typography variant="h3" fontWeight={950} sx={{ letterSpacing: -1.5 }}>
              WELCOME BACK, <span style={{ color: "#ef4444" }}>COACH</span>
            </Typography>
          </Box>
          <Box sx={liveStatusStyle}>● SYSTEM LIVE</Box>
        </Stack>

        {/* --- STYLIZED TABS --- */}
        <Tabs
          value={tab}
          onChange={(e, v) => setTab(v)}
          sx={tabsStyle}
          TabIndicatorProps={{ sx: { display: 'none' } }}
        >
          <Tab label="OVERVIEW" sx={tabItemStyle} />
          <Tab label="SESSION SCHEDULE" sx={tabItemStyle} />
          <Tab label="PLAYER ACTIVITY" sx={tabItemStyle} />
        </Tabs>

        {/* ================= MAIN OVERVIEW ================= */}
        {tab === 0 && (
          <Fade in timeout={800}>
            <Box>
              <Grid container spacing={3} mb={4}>
                {/* HERO STAT CARD */}
                <Grid item xs={12} md={6}>
                  <Card sx={heroCardStyle}>
                    <CardContent sx={{ p: 4 }}>
                      <Typography sx={{ opacity: 0.6, fontWeight: 800, letterSpacing: 1 }}>TODAY'S WORKLOAD</Typography>
                      <Typography variant="h1" fontWeight={950} sx={{ my: 1 }}>{data.todaySessionCount || 0}</Typography>
                      {nextSession && (
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ opacity: 0.8 }}>
                          <ScheduleIcon fontSize="small" />
                          <Typography fontWeight={700}>Next: {nextSession.start_time} @ {nextSession.location}</Typography>
                        </Stack>
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                {/* KPI MINI GRIDS */}
                <Grid item xs={12} md={6}>
                  <Grid container spacing={2}>
                    <KpiCard title="Active Players" value={data.activePlayers || 0} icon={<SportsTennisIcon />} color="#3b82f6" />
                    <KpiCard title="Total Sessions" value={sessions.length} icon={<EventIcon />} color="#10b981" />
                    <KpiCard title="Check-ins" value={data.checkinsToday || 0} icon={<CheckCircleIcon />} color="#f59e0b" />
                    <KpiCard title="Efficiency" value="94%" icon={<TrendingUpIcon />} color="#ec4899" />
                  </Grid>
                </Grid>
              </Grid>

              {/* CHART & CALENDAR */}
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Card sx={glassCardStyle}>
                    <CardContent>
                      <Typography variant="h6" fontWeight={900} mb={3}>WEEKLY PERFORMANCE</Typography>
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={data.weekly}>
                          <defs>
                            <linearGradient id="colorCnt" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="d" stroke="rgba(255,255,255,0.3)" tick={{fill: 'white', fontSize: 12}} />
                          <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                          <Area type="monotone" dataKey="cnt" stroke="#ef4444" strokeWidth={4} fillOpacity={1} fill="url(#colorCnt)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Card sx={glassCardStyle}>
                    <CardContent sx={{ ".react-calendar": calendarOverride }}>
                      <Typography variant="h6" fontWeight={900} mb={2}>SCHEDULE SELECTOR</Typography>
                      <Calendar value={date} onChange={setDate} />
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          </Fade>
        )}

        {/* ================= SESSIONS TAB ================= */}
        {tab === 1 && (
          <Fade in timeout={500}>
            <Stack spacing={2}>
              {sessions.map(s => (
                <MotionBox key={s.id} whileHover={{ x: 10 }}>
                  <Card sx={sessionRowStyle}>
                    <CardContent>
                      <Grid container alignItems="center">
                        <Grid item xs={12} md={3}>
                          <Typography variant="h6" fontWeight={900}>{new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Typography>
                          <Chip label={s.program} size="small" sx={programChipStyle} />
                        </Grid>
                        <Grid item xs={6} md={3}>
                           <Typography sx={{ opacity: 0.5, fontSize: '0.7rem', fontWeight: 900 }}>TIME</Typography>
                           <Typography fontWeight={700}>⏰ {s.start_time} - {s.end_time}</Typography>
                        </Grid>
                        <Grid item xs={6} md={3}>
                           <Typography sx={{ opacity: 0.5, fontSize: '0.7rem', fontWeight: 900 }}>LOCATION</Typography>
                           <Typography fontWeight={700}>📍 {s.location}</Typography>
                        </Grid>
                        <Grid item xs={12} md={3} textAlign="right">
                           <Button variant="outlined" sx={actionBtnSmall}>Manage</Button>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </MotionBox>
              ))}
            </Stack>
          </Fade>
        )}
      </Container>
    </Box>
  );
}

// 🏛️ INTERNAL COMPONENTS
function KpiCard({ title, value, icon, color }: any) {
  return (
    <Grid item xs={6}>
      <Card sx={{ ...glassCardStyle, borderLeft: `4px solid ${color}` }}>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" color={color} mb={1}>
            <Typography variant="caption" fontWeight={900} sx={{ opacity: 0.8 }}>{title.toUpperCase()}</Typography>
            {icon}
          </Stack>
          <Typography variant="h4" fontWeight={900}>{value}</Typography>
        </CardContent>
      </Card>
    </Grid>
  );
}

// 💅 DESIGN SYSTEM (Aligned with Tournament/Home)
const liveStatusStyle = { px: 2, py: 0.5, borderRadius: "99px", bgcolor: "rgba(34,197,94,0.1)", color: "#22c55e", fontWeight: 900, fontSize: "0.7rem", border: "1px solid rgba(34,197,94,0.2)" };
const tabsStyle = { bgcolor: "rgba(255,255,255,0.03)", borderRadius: 3, p: 0.5, mb: 4, minHeight: 'auto' };
const tabItemStyle = { fontWeight: 900, color: "rgba(255,255,255,0.4)", borderRadius: 2, "&.Mui-selected": { color: "white", bgcolor: "#ef4444" }, minHeight: '40px' };
const heroCardStyle = { borderRadius: 6, background: "linear-gradient(135deg, #1e3a8a, #2563eb)", color: "#fff", height: '100%', boxShadow: "0 20px 40px rgba(37, 99, 235, 0.3)" };
const glassCardStyle = { borderRadius: 6, background: "rgba(255,255,255,0.03)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.08)", color: "white" };
const sessionRowStyle = { borderRadius: 4, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", color: "white", mb: 2 };
const programChipStyle = { bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontWeight: 900, borderRadius: 1, mt: 1 };
const actionBtnSmall = { borderRadius: 2, fontWeight: 900, fontSize: '0.7rem', color: 'white', borderColor: 'rgba(255,255,255,0.2)', "&:hover": { bgcolor: 'white', color: 'black' } };
const calendarOverride = { background: "transparent !important", border: "none !important", color: "white !important", ".react-calendar__tile--now": { background: "#ef4444 !important", borderRadius: '8px' }, ".react-calendar__tile--active": { background: "#2563eb !important", borderRadius: '8px' }, ".react-calendar__navigation button": { color: "white !important" }, ".react-calendar__month-view__weekdays__weekday": { color: "#ef4444 !important" } };