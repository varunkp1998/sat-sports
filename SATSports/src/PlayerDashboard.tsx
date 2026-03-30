import { useEffect, useState, useMemo } from "react";
import {
  Box, Typography, Grid, Card, CardContent, Tabs, Tab, Chip, Stack, CircularProgress, Fade
} from "@mui/material";
import EventIcon from "@mui/icons-material/Event";
import ScheduleIcon from "@mui/icons-material/Schedule";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip, YAxis } from "recharts";
import dayjs from "dayjs";
import API_BASE from "./api";

export default function PlayerDashboard() {
  const [userId] = useState(() => localStorage.getItem("userId"));
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<any[]>([]);
  const [data, setData] = useState<any>({
    weeklySessions: [0, 0, 0, 0, 0, 0, 0],
    recentActivities: []
  });

  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetching overview and sessions
        const [overviewRes, sessionsRes] = await Promise.all([
          fetch(`${API_BASE}/api/player/overview/${userId}`),
          fetch(`${API_BASE}/api/player/sessions/${userId}`)
        ]);

        const overviewData = await overviewRes.json();
        const sessionsData = await sessionsRes.json();

        setData(overviewData);
        setSessions(Array.isArray(sessionsData) ? sessionsData : []);
      } catch (err) {
        console.error("Dashboard Sync Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  // 🔥 Memoized Next Session logic to prevent jitter
  const nextSession = useMemo(() => {
    return [...sessions]
      .filter(s => dayjs(s.session_date || s.date).isAfter(dayjs().subtract(1, 'hour')))
      .sort((a, b) => dayjs(a.session_date || a.date).unix() - dayjs(b.session_date || b.date).unix())[0];
  }, [sessions]);

  // 🔥 Browser Notification Logic
  useEffect(() => {
    if (!nextSession || Notification.permission === "denied") return;

    const checkNotify = () => {
      const sessionTime = dayjs(`${dayjs(nextSession.session_date).format('YYYY-MM-DD')} ${nextSession.start_time}`);
      const diffMinutes = sessionTime.diff(dayjs(), 'minute');

      if (diffMinutes > 0 && diffMinutes <= 60) {
        if (Notification.permission === "granted") {
          new Notification("Upcoming Arena Session", {
            body: `Starts at ${nextSession.start_time} - ${nextSession.program_title || nextSession.program || 'Training'}`
          });
        } else {
          Notification.requestPermission();
        }
      }
    };

    checkNotify();
  }, [nextSession]);

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
      <CircularProgress color="primary" />
    </Box>
  );

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, background: "#f8fafc", minHeight: "100vh" }}>
      <Typography variant="h4" fontWeight={900} mb={3} sx={{ color: "#1e293b", letterSpacing: -1 }}>
        PLAYER <span style={{ color: "#2563eb" }}>DASHBOARD</span>
      </Typography>

      <Tabs
        value={tab}
        onChange={(e, v) => setTab(v)}
        sx={tabsStyle}
        TabIndicatorProps={{ sx: { height: 3, borderRadius: '3px 3px 0 0' } }}
      >
        <Tab label="OVERVIEW" sx={tabLabelStyle} />
        <Tab label="SCHEDULE" sx={tabLabelStyle} />
        <Tab label="HISTORY" sx={tabLabelStyle} />
      </Tabs>

      {/* ================= MAIN OVERVIEW ================= */}
      {tab === 0 && (
        <Fade in timeout={500}>
          <Box>
            <Card sx={heroCardStyle}>
              <CardContent>
                <Typography variant="overline" sx={{ opacity: 0.8, fontWeight: 700 }}>UPCOMING MISSION</Typography>
                {nextSession ? (
                  <Grid container alignItems="center">
                    <Grid item xs={12} md={8}>
                      <Typography variant="h3" fontWeight={900}>
                        {dayjs(nextSession.session_date || nextSession.date).format("dddd, MMM DD")}
                      </Typography>
                      <Stack direction="row" spacing={3} mt={1}>
                        <Typography variant="h6" fontWeight={600}>⏰ {nextSession.start_time} – {nextSession.end_time}</Typography>
                        <Typography variant="h6" fontWeight={600}>📍 {nextSession.locationName || nextSession.location}</Typography>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} md={4} sx={{ textAlign: { md: 'right' }, mt: { xs: 2, md: 0 } }}>
                      <Chip 
                        label={nextSession.program_title || nextSession.program || "TRAINING"} 
                        sx={heroChipStyle} 
                      />
                    </Grid>
                  </Grid>
                ) : (
                  <Typography variant="h5" fontWeight={700}>STAND BY: NO SESSIONS SCHEDULED</Typography>
                )}
              </CardContent>
            </Card>

            <Grid container spacing={3} mb={4}>
              <KPI_Card title="Total Missions" value={sessions.length} icon={<EventIcon />} color="#f59e0b" />
              <KPI_Card title="This Week" value={data.weeklySessions?.reduce((a:number, b:number) => a + b, 0) || 0} icon={<FitnessCenterIcon />} color="#10b981" />
              <KPI_Card 
                title="T-Minus (Hrs)" 
                value={nextSession ? Math.max(0, dayjs(nextSession.session_date).diff(dayjs(), 'hour')) : "--"} 
                icon={<ScheduleIcon />} 
                color="#6366f1" 
              />
            </Grid>

            <Card sx={chartCardStyle}>
              <CardContent>
                <Typography variant="h6" fontWeight={800} mb={3}>WEEKLY INTENSITY</Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={(data.weeklySessions || [0,0,0,0,0,0,0]).map((v:any, i:number) => ({
                    day: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i],
                    value: v
                  }))}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                    <Area type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Box>
        </Fade>
      )}

      {/* ================= SCHEDULE TAB ================= */}
      {tab === 1 && (
        <Fade in timeout={500}>
          <Stack spacing={2}>
            {sessions.map((s, i) => (
              <Card key={i} sx={sessionItemStyle}>
                <CardContent>
                  <Grid container alignItems="center" spacing={2}>
                    <Grid item xs={12} md={2}>
                      <Typography fontWeight={900} color="primary">
                        {dayjs(s.session_date || s.date).format("DD MMM")}
                      </Typography>
                      {dayjs(s.session_date || s.date).isSame(dayjs(), 'day') && (
                        <Chip label="TODAY" size="small" color="error" sx={{ fontWeight: 900, height: 20, fontSize: 10 }} />
                      )}
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Typography variant="body2" sx={{ opacity: 0.6 }}>TIME</Typography>
                      <Typography fontWeight={700}>{s.start_time} - {s.end_time}</Typography>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Typography variant="body2" sx={{ opacity: 0.6 }}>LOCATION</Typography>
                      <Typography fontWeight={700}>{s.locationName || s.location || "Main Arena"}</Typography>
                    </Grid>
                    <Grid item xs={12} md={4} sx={{ textAlign: { md: 'right' } }}>
                      <Chip label={s.program_title || s.program || "GENERAL"} variant="outlined" sx={{ fontWeight: 800 }} />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Fade>
      )}
    </Box>
  );
}

// 🏛️ KPI COMPONENT
const KPI_Card = ({ title, value, icon, color }: any) => (
  <Grid item xs={12} md={4}>
    <Card sx={{ borderRadius: 4, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="body2" fontWeight={700} color="text.secondary">{title.toUpperCase()}</Typography>
          <Box sx={{ p: 1, borderRadius: 2, bgcolor: `${color}15`, color: color }}>{icon}</Box>
        </Stack>
        <Typography variant="h3" fontWeight={900} mt={1}>{value}</Typography>
      </CardContent>
    </Card>
  </Grid>
);

// 💅 STYLE TOKENS
const tabsStyle = { mb: 4, '& .MuiTab-root': { minWidth: 120 } };
const tabLabelStyle = { fontWeight: 900, fontSize: '0.85rem', letterSpacing: 1 };
const heroCardStyle = { borderRadius: 6, mb: 4, p: 2, background: "linear-gradient(135deg, #1e3a8a, #2563eb)", color: "#fff", boxShadow: "0 20px 25px -5px rgba(37, 99, 235, 0.2)" };
const heroChipStyle = { bgcolor: "rgba(255,255,255,0.2)", color: "#fff", fontWeight: 900, backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.3)' };
const chartCardStyle = { borderRadius: 6, border: '1px solid #e2e8f0', boxShadow: 'none' };
const sessionItemStyle = { borderRadius: 4, border: '1px solid #e2e8f0', boxShadow: 'none', transition: '0.2s', '&:hover': { borderColor: '#2563eb', transform: 'translateY(-2px)' } };