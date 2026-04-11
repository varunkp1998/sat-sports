import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  Box, Button, Typography, Card, CardContent,
  Grid, Stack, Avatar, Chip, TextField, LinearProgress
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import API_BASE from "./api";

function PlayerPortal() {
  const userId = localStorage.getItem("userId");
  const navigate = useNavigate();

  const [profile, setProfile] = useState<any>(null);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [revenue, setRevenue] = useState<any[]>([]);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // 🚀 OPTIMIZED PARALLEL FETCH (BIG SPEED BOOST)
  useEffect(() => {
    if (!userId) return;

    let mounted = true;

    Promise.all([
      fetch(`${API_BASE}/api/player/profile/${userId}`).then(r => r.json()),
      fetch(`${API_BASE}/api/player/attendance/${userId}`).then(r => r.json()),
      fetch(`${API_BASE}/api/player/revenue/${userId}`)
        .then(r => r.json())
        .catch(() => [])
    ])
      .then(([profileData, attendanceData, revenueData]) => {
        if (!mounted) return;

        setProfile(profileData);
        setAttendance(attendanceData);
        setRevenue(revenueData);
      })
      .catch((err) => console.error("Player load error", err));

    return () => { mounted = false };
  }, [userId]);

  // ⚡ MEMOIZED CALCULATIONS (no recalculation every render)
  const stats = useMemo(() => {
    const totalSessions = attendance.length;
    const present = attendance.filter(a => a.status === "present").length;

    const attendanceRate =
      totalSessions > 0
        ? Math.round((present / totalSessions) * 100)
        : 0;

    const totalPaid = revenue
      .filter(r => r.type === "CR")
      .reduce((s, r) => s + Number(r.amount), 0);

    const totalDue = revenue
      .filter(r => r.type === "DR")
      .reduce((s, r) => s + Number(r.amount), 0);

    return {
      totalSessions,
      attendanceRate,
      balance: totalPaid - totalDue
    };
  }, [attendance, revenue]);

  // ⚡ OPTIMIZED PASSWORD HANDLER
  const changePassword = useCallback(async () => {
    if (!oldPassword || !newPassword) {
      alert("Enter both passwords");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/player/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, oldPassword, newPassword })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message);
        return;
      }

      alert("Password updated ✅");
      setOldPassword("");
      setNewPassword("");

    } catch (err) {
      console.error("Password error", err);
    }
  }, [oldPassword, newPassword, userId]);

  if (!profile) return <p>Loading...</p>;

  return (
    <Box sx={{ p: 2, maxWidth: 500, margin: "auto" }}>

      {/* NAV */}
      <Box display="flex" alignItems="center" mb={2}>
        <Button onClick={() => navigate("/player/dashboard")}>
          ← Back to Dashboard
        </Button>
        <Typography ml={1} color="text.secondary">Dashboard</Typography>
      </Box>

      {/* PROFILE */}
      <Card sx={{ borderRadius: 4, mb: 2, background: "linear-gradient(135deg,#1e3a8a,#2563eb)", color: "white" }}>
        <CardContent>
          <Stack alignItems="center">
            <Avatar sx={{ width: 70, height: 70 }}>
              {profile.name?.[0]}
            </Avatar>
            <Typography fontWeight={700}>{profile.name}</Typography>
            <Typography>{profile.email}</Typography>
            <Chip label={profile.programTitle || "No Program"} />
          </Stack>
        </CardContent>
      </Card>

      {/* STATS */}
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Card><CardContent>
            <Typography>Sessions</Typography>
            <Typography>{stats.totalSessions}</Typography>
          </CardContent></Card>
        </Grid>

        <Grid item xs={6}>
          <Card><CardContent>
            <Typography>Balance</Typography>
            <Typography>₹{stats.balance}</Typography>
          </CardContent></Card>
        </Grid>
      </Grid>

      {/* ATTENDANCE */}
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography>Attendance ({stats.attendanceRate}%)</Typography>
          <LinearProgress value={stats.attendanceRate} variant="determinate" />
        </CardContent>
      </Card>

      {/* RECENT */}
      <Card sx={{ mt: 2 }}>
        <CardContent>
          {attendance.slice(0, 5).map((a: any) => (
            <Box key={a.id} display="flex" justifyContent="space-between">
              <Typography>{a.date}</Typography>
              <Chip label={a.status} />
            </Box>
          ))}
        </CardContent>
      </Card>

      {/* PAYMENTS */}
      <Card sx={{ mt: 2 }}>
        <CardContent>
          {revenue.slice(0, 5).map((r: any) => (
            <Box key={r.id} display="flex" justifyContent="space-between">
              <Typography>{r.date}</Typography>
              <Typography>₹{r.amount}</Typography>
            </Box>
          ))}
        </CardContent>
      </Card>

      {/* PASSWORD */}
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Stack spacing={2}>
            <TextField
              label="Old Password"
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
            <TextField
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <Button onClick={changePassword}>Update Password</Button>
          </Stack>
        </CardContent>
      </Card>

    </Box>
  );
}

export default React.memo(PlayerPortal);