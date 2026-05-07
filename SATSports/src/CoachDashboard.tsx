import React, { useEffect, useState } from "react";
import {
  Box, Typography, Grid, Card, CardContent, Tabs, Tab, Chip, Stack, 
  Container, Button, IconButton, Fade
} from "@mui/material";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [date, setDate] = useState(new Date());
  const [sessions, setSessions] = useState<any[]>([]);
  const [data, setData] = useState<any>({ 
    weekly: [], 
    todaySessionCount: 0, 
    activePlayers: 0, 
    checkinsToday: 0 
  });

  useEffect(() => {
    if (!userId) return;
    
    // Fetch Overview Stats
    fetch(`${API_BASE}/api/coach/overview/${userId}`)
      .then(res => res.json())
      .then(json => setData(json))
      .catch(err => console.error("Stats fetch error:", err));

    // Fetch Full Schedule
    fetch(`${API_BASE}/api/coach/sessions/${userId}`)
      .then(res => res.json())
      .then(json => setSessions(Array.isArray(json) ? json : []))
      .catch(err => console.error("Sessions fetch error:", err));
  }, [userId]);

  // Find the very next upcoming session
  const nextSession = sessions
    .filter(s => new Date(s.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

  return (
    <Box sx={{ background: "#020617", color: "white", minHeight: "100vh", py: { xs: 4, md: 6 } }}>
      <Container maxWidth="xl">
        
        {/* --- HEADER --- */}
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }} spacing={2} mb={6}>
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
          onChange={(_, v) => setTab(v)}
          sx={tabsStyle}
          TabIndicatorProps={{ sx: { display: 'none' } }}
        >
          <Tab label="OVERVIEW" sx={tabItemStyle} />
          <Tab label="SESSION SCHEDULE" sx={tabItemStyle} />
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
                      <Typography variant="h1" fontWeight={950} sx={{ my: 1, fontSize: { xs: '4rem', md: '6rem' } }}>
                        {data.todaySessionCount || 0}
                      </Typography>
                      {nextSession ? (
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ opacity: 0.9 }}>
                          <ScheduleIcon fontSize="small" />
                          <Typography fontWeight={700}>Next: {nextSession.start_time} @ {nextSession.location}</Typography>
                        </Stack>
                      ) : (
                        <Typography fontWeight={700} sx={{ opacity: 0.6 }}>No more sessions today</Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                {/* KPI MINI GRIDS */}
                <Grid item xs={12} md={6}>
                  <Grid container spacing={2}>
                    <KpiCard title="Active Players" value={data.activePlayers || 0} icon={<SportsTennisIcon />} color="#3b82f6" />
                    <KpiCard title="Total Sessions" value={sessions.length} icon={<EventIcon />} color="#10b981" />
                    <KpiCard title="Check-ins Today" value={data.checkinsToday || 0} icon={<CheckCircleIcon />} color="#f59e0b" />
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
                      <Box sx={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                          <AreaChart data={data.weekly || []}>
                            <defs>
                              <linearGradient id="colorCnt" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <XAxis dataKey="d" stroke="rgba(255,255,255,0.3)" tick={{fill: 'white', fontSize: 12}} />
                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }} />
                            <Area type="monotone" dataKey="cnt" stroke="#ef4444" strokeWidth={4} fillOpacity={1} fill="url(#colorCnt)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Card sx={glassCardStyle}>
                    <CardContent sx={{ ".react-calendar": calendarOverride }}>
                      <Typography variant="h6" fontWeight={900} mb={2}>SCHEDULE SELECTOR</Typography>
                      <Calendar value={date} onChange={(val: any) => setDate(val)} />
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
              {sessions.length > 0 ? sessions.map(s => (
                <MotionBox key={s.id} whileHover={{ scale: 1.01 }}>
                  <Card sx={sessionRowStyle}>
                    <CardContent>
                      <Grid container alignItems="center" spacing={2}>
                        <Grid item xs={12} md={3}>
                          <Typography variant="h6" fontWeight={900}>
                            {new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </Typography>
                          <Chip label={s.program} size="small" sx={programChipStyle} />
                        </Grid>
                        <Grid item xs={6} md={3}>
                           <Typography sx={{ opacity: 0.5, fontSize: '0.7rem', fontWeight: 900 }}>TIME</Typography>
                           <Typography fontWeight={700}>⏰ {s.start_time} - {s.end_time}</Typography>
                        </Grid>
                        <Grid item xs={6} md={3}>
                           <Typography sx={{ opacity: 0.5, fontSize: '0.7rem', fontWeight: 900 }}>LOCATION</Typography>
                           <Typography fontWeight={700}>📍 {s.location || "Main Court"}</Typography>
                        </Grid>
                        <Grid item xs={12} md={3} textAlign={{ xs: "left", md: "right" }}>
                           <Button 
                             variant="outlined" 
                             sx={actionBtnSmall}
                             onClick={() => navigate(`/coach/sessions/${s.id}/attendance`)}
                           >
                             Take Attendance
                           </Button>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </MotionBox>
              )) : (
                <Typography sx={{ opacity: 0.5, textAlign: 'center', py: 10 }}>No sessions scheduled found.</Typography>
              )}
            </Stack>
          </Fade>
        )}
      </Container>
    </Box>
  );
}

// 🏛️ KPI COMPONENT
function KpiCard({ title, value, icon, color }: any) {
  return (
    <Grid item xs={6}>
      <Card sx={{ ...glassCardStyle, borderLeft: `4px solid ${color}`, height: '100%' }}>
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

// 💅 DESIGN SYSTEM
const liveStatusStyle = { px: 2, py: 0.5, borderRadius: "99px", bgcolor: "rgba(34,197,94,0.1)", color: "#22c55e", fontWeight: 900, fontSize: "0.7rem", border: "1px solid rgba(34,197,94,0.2)" };
const tabsStyle = { bgcolor: "rgba(255,255,255,0.03)", borderRadius: 3, p: 0.5, mb: 4, minHeight: 'auto' };
const tabItemStyle = { fontWeight: 900, color: "rgba(255,255,255,0.4)", borderRadius: 2, "&.Mui-selected": { color: "white", bgcolor: "#ef4444" }, minHeight: '40px', px: 4 };
const heroCardStyle = { borderRadius: 6, background: "linear-gradient(135deg, #1e3a8a, #2563eb)", color: "#fff", height: '100%', boxShadow: "0 20px 40px rgba(37, 99, 235, 0.3)" };
const glassCardStyle = { borderRadius: 6, background: "rgba(255,255,255,0.03)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.08)", color: "white" };
const sessionRowStyle = { borderRadius: 4, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", color: "white", mb: 2, transition: '0.3s' };
const programChipStyle = { bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontWeight: 900, borderRadius: 1, mt: 1 };
const actionBtnSmall = { borderRadius: 2, fontWeight: 900, fontSize: '0.75rem', color: 'white', borderColor: 'rgba(255,255,255,0.2)', px: 3, "&:hover": { bgcolor: 'white', color: 'black', borderColor: 'white' } };
const calendarOverride = { 
    width: '100%',
    background: "transparent !important", 
    border: "none !important", 
    color: "white !important", 
    fontFamily: 'inherit',
    ".react-calendar__tile--now": { background: "rgba(239, 68, 68, 0.3) !important", borderRadius: '8px' }, 
    ".react-calendar__tile--active": { background: "#ef4444 !important", borderRadius: '8px', color: 'white !important' }, 
    ".react-calendar__navigation button": { color: "white !important", minWidth: '44px', background: 'none' }, 
    ".react-calendar__month-view__weekdays__weekday": { color: "#ef4444 !important", textDecoration: 'none', fontWeight: 900 },
    ".react-calendar__tile:enabled:hover": { background: "rgba(255,255,255,0.1)", borderRadius: '8px' }
};