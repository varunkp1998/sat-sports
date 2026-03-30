import React, { useEffect, useState } from "react";
import { 
  Box, Typography, Grid, Card, CardContent, Avatar, 
  Chip, Stack, Divider, CircularProgress, Fade, Paper 
} from "@mui/material";
import { useParams } from "react-router-dom";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import VerifiedIcon from "@mui/icons-material/Verified";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import API_BASE from "./api";
import dayjs from "dayjs";

export default function PlayerProfile() {
  const { id: playerId } = useParams(); // Using React Router params is cleaner
  
  const [loading, setLoading] = useState(true);
  const [player, setPlayer] = useState<any>(null);
  const [attendance, setAttendance] = useState<any[]>([]);

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        setLoading(true);
        // Fetch specific player and their attendance in parallel
        const [playerRes, attendanceRes] = await Promise.all([
          fetch(`${API_BASE}/api/player/details/${playerId}`),
          fetch(`${API_BASE}/api/player/attendance/${playerId}`)
        ]);

        const playerData = await playerRes.json();
        const attendanceData = await attendanceRes.json();

        setPlayer(playerData);
        setAttendance(Array.isArray(attendanceData) ? attendanceData : []);
      } catch (err) {
        console.error("Profile Load Error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (playerId) loadProfileData();
  }, [playerId]);

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" height="60vh">
      <CircularProgress size={40} thickness={5} sx={{ color: "#2563eb" }} />
    </Box>
  );

  if (!player) return <Typography sx={{ p: 4 }}>Player profile not found.</Typography>;

  // Statistics Calculations
  const totalSessions = attendance.length;
  const totalPresent = attendance.filter(a => a.present === 1 || a.status === "Present").length;
  const attendanceRate = totalSessions > 0 ? Math.round((totalPresent / totalSessions) * 100) : 0;

  return (
    <Fade in timeout={800}>
      <Box sx={{ p: { xs: 2, md: 0 } }}>
        
        {/* HEADER SECTION */}
        <Paper sx={profileHeaderStyle}>
          <Grid container spacing={3} alignItems="center">
            <Grid item>
              <Avatar sx={{ width: 100, height: 100, bgcolor: "#fff", color: "#2563eb", boxShadow: 3 }}>
                <AccountCircleIcon sx={{ fontSize: 80 }} />
              </Avatar>
            </Grid>
            <Grid item xs={12} sm>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="h3" fontWeight={900}>{player.name}</Typography>
                <VerifiedIcon sx={{ color: "#60a5fa" }} />
              </Stack>
              <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 500 }}>
                {player.program_title || "Elite Program Participant"}
              </Typography>
              <Stack direction="row" spacing={1} mt={1}>
                <Chip label={`Age: ${player.age || 'N/A'}`} size="small" sx={chipStyle} />
                <Chip label={`Coach: ${player.coach_name || 'Assigned Soon'}`} size="small" sx={chipStyle} />
              </Stack>
            </Grid>
            <Grid item xs={12} md="auto">
               <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                <CircularProgress variant="determinate" value={attendanceRate} size={80} thickness={5} sx={{ color: "#4ade80" }} />
                <Box sx={progressTextStyle}>
                  <Typography variant="caption" component="div" fontWeight={900} color="white">
                    {attendanceRate}%
                  </Typography>
                </Box>
              </Box>
              <Typography textAlign="center" variant="caption" display="block" sx={{ mt: 1, opacity: 0.8, fontWeight: 700 }}>
                ATTENDANCE
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        <Grid container spacing={3} mt={1}>
          {/* LEFT: Stats Summary */}
          <Grid item xs={12} md={4}>
            <Card sx={statCardStyle}>
              <CardContent>
                <Typography variant="h6" fontWeight={800} mb={3} display="flex" alignItems="center" gap={1}>
                  <TrendingUpIcon color="primary" /> Performance Summary
                </Typography>
                <Stack spacing={2.5}>
                  <StatRow label="Total Sessions" value={totalSessions} />
                  <StatRow label="Present Count" value={totalPresent} color="#10b981" />
                  <StatRow label="Absent Count" value={totalSessions - totalPresent} color="#ef4444" />
                  <Divider />
                  <StatRow label="Joining Date" value={dayjs(player.created_at).format("MMM DD, YYYY")} />
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* RIGHT: Recent Attendance Log */}
          <Grid item xs={12} md={8}>
            <Typography variant="h6" fontWeight={800} mb={2} color="#1e293b">Recent Attendance Log</Typography>
            {attendance.length === 0 ? (
              <Typography color="text.secondary">No activity recorded yet.</Typography>
            ) : (
              <Stack spacing={1.5}>
                {attendance.slice(0, 5).map((log, i) => (
                  <Paper key={i} sx={logItemStyle}>
                    <Typography fontWeight={700}>{dayjs(log.session_date).format("ddd, MMM DD")}</Typography>
                    <Chip 
                      label={log.status?.toUpperCase() || (log.present ? "PRESENT" : "ABSENT")} 
                      size="small" 
                      sx={{ 
                        fontWeight: 900, fontSize: 10,
                        bgcolor: (log.present || log.status === "Present") ? "#dcfce7" : "#fee2e2",
                        color: (log.present || log.status === "Present") ? "#166534" : "#991b1b"
                      }} 
                    />
                  </Paper>
                ))}
              </Stack>
            )}
          </Grid>
        </Grid>
      </Box>
    </Fade>
  );
}

// Helper Components & Styles
const StatRow = ({ label, value, color }: any) => (
  <Box display="flex" justifyContent="space-between" alignItems="center">
    <Typography variant="body2" fontWeight={600} color="text.secondary">{label}</Typography>
    <Typography variant="body1" fontWeight={800} sx={{ color: color || "#1e293b" }}>{value}</Typography>
  </Box>
);

const profileHeaderStyle = {
  p: 4, borderRadius: 6, 
  background: "linear-gradient(135deg, #1e3a8a, #2563eb)", 
  color: "white", mb: 4,
  boxShadow: "0 20px 25px -5px rgba(37, 99, 235, 0.1)"
};

const chipStyle = { bgcolor: "rgba(255,255,255,0.15)", color: "white", fontWeight: 700, border: '1px solid rgba(255,255,255,0.3)' };

const progressTextStyle = {
  top: 0, left: 0, bottom: 0, right: 0, position: 'absolute',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
};

const statCardStyle = { borderRadius: 5, border: '1px solid #e2e8f0', boxShadow: 'none' };

const logItemStyle = {
  p: 2, borderRadius: 3, display: 'flex', justifyContent: 'space-between',
  alignItems: 'center', border: '1px solid #f1f5f9', boxShadow: 'none'
};