import React, { useEffect, useState } from "react";
import {
  Box, Typography, Grid, Card, CardContent,
  Button, Stack, Chip, Fade, Paper, Snackbar, Alert, Avatar
} from "@mui/material";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import DateRangeIcon from "@mui/icons-material/DateRange";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import CancelIcon from "@mui/icons-material/Cancel";
import API_BASE from "./api";

export default function AdminLeaves() {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" as "success" | "error" });

  const load = () => {
    fetch(`${API_BASE}/api/admin/leaves`)
      .then(res => res.json())
      .then(setLeaves)
      .catch(() => handleToast("Failed to load leave requests", "error"));
  };

  useEffect(() => { load(); }, []);

  const handleToast = (message: string, severity: "success" | "error") => {
    setToast({ open: true, message, severity });
  };

  const updateStatus = async (id: number, status: string) => {
    const res = await fetch(`${API_BASE}/api/admin/leaves/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      handleToast(`Request ${status}`, "success");
      load();
    }
  };

  const filtered = filter === "all" ? leaves : leaves.filter(l => l.status === filter);

  const stats = [
    { label: "Pending", value: leaves.filter(l => l.status === "Pending").length, color: "#f59e0b", icon: <PendingActionsIcon /> },
    { label: "Approved", value: leaves.filter(l => l.status === "Approved").length, color: "#10b981", icon: <CheckCircleIcon /> },
    { label: "Rejected", value: leaves.filter(l => l.status === "Rejected").length, color: "#ef4444", icon: <CancelIcon /> },
  ];

  return (
    <Box sx={containerStyle}>
      
      {/* HEADER */}
      <Box mb={6}>
        <Typography variant="h4" fontWeight={900} letterSpacing="-1.5px" color="#1e293b">Leave Dashboard</Typography>
        <Typography variant="body2" color="text.secondary">Review and manage staff time-off requests</Typography>
      </Box>

      {/* STATS ROW */}
      <Grid container spacing={3} mb={6}>
        {stats.map((s) => (
          <Grid item xs={12} sm={4} key={s.label}>
            <Card sx={statCardStyle}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                <Avatar sx={{ bgcolor: `${s.color}15`, color: s.color, mr: 2 }}>{s.icon}</Avatar>
                <Box>
                  <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ textTransform: 'uppercase' }}>{s.label}</Typography>
                  <Typography variant="h4" fontWeight={900}>{s.value}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={4}>
        {/* LEFT: CALENDAR & FILTERS */}
        <Grid item xs={12} lg={4}>
          <Stack spacing={3}>
            <Paper sx={filterPaperStyle}>
              <Typography variant="subtitle2" fontWeight={900} mb={2} color="#1e293b">Quick Filter</Typography>
              <Stack direction="row" flexWrap="wrap" gap={1}>
                {["all", "Pending", "Approved", "Rejected"].map(f => (
                  <Chip
                    key={f}
                    label={f}
                    onClick={() => setFilter(f)}
                    sx={filterChipStyle(filter === f)}
                  />
                ))}
              </Stack>
            </Paper>

            <Card sx={glassCardStyle}>
              <CardContent>
                <Typography variant="subtitle2" fontWeight={900} mb={2} display="flex" alignItems="center">
                  <DateRangeIcon sx={{ mr: 1, fontSize: 18 }} /> Absence Overview
                </Typography>
                <Box sx={calendarWrapper}>
                  <Calendar
                    tileContent={({ date }) => {
                      const hasLeave = leaves.some(l => 
                        l.status === "Approved" && 
                        new Date(date) >= new Date(l.start_date) && 
                        new Date(date) <= new Date(l.end_date)
                      );
                      return hasLeave ? <div className="dot" /> : null;
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Stack>
        </Grid>

        {/* RIGHT: LEAVE CARDS */}
        <Grid item xs={12} lg={8}>
          <Grid container spacing={2}>
            {filtered.map(l => (
              <Grid item xs={12} key={l.id}>
                <Fade in timeout={400}>
                  <Card sx={leaveCardStyle}>
                    <CardContent sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                          <Typography fontWeight={900} color="#1e293b">{l.username}</Typography>
                          <Chip label={l.leave_type} size="small" variant="outlined" sx={{ fontWeight: 700, fontSize: '0.65rem' }} />
                        </Stack>
                        <Typography variant="body2" color="text.secondary" fontWeight={600}>
                          {new Date(l.start_date).toLocaleDateString()} — {new Date(l.end_date).toLocaleDateString()}
                        </Typography>
                      </Box>

                      <Stack direction="row" spacing={2} alignItems="center">
                        <Chip 
                          label={l.status} 
                          sx={statusChipStyle(l.status)}
                        />
                        {l.status === "Pending" && (
                          <Stack direction="row" spacing={1}>
                            <Button size="small" variant="contained" color="success" onClick={() => updateStatus(l.id, "Approved")} sx={actionBtnStyle}>
                              Approve
                            </Button>
                            <Button size="small" variant="outlined" color="error" onClick={() => updateStatus(l.id, "Rejected")} sx={{ borderRadius: 2, fontWeight: 800 }}>
                              Reject
                            </Button>
                          </Stack>
                        )}
                      </Stack>
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>

      <Snackbar open={toast.open} autoHideDuration={3000} onClose={() => setToast({ ...toast, open: false })}>
        <Alert severity={toast.severity} variant="filled" sx={{ borderRadius: 2 }}>{toast.message}</Alert>
      </Snackbar>
    </Box>
  );
}

// --- STYLES ---
const containerStyle = { p: { xs: 2, md: 8 }, background: "#f8fafc", minHeight: "100vh" };
const statCardStyle = { borderRadius: 4, border: '1px solid #e2e8f0', boxShadow: 'none' };
const filterPaperStyle = { p: 3, borderRadius: 4, border: '1px solid #e2e8f0', boxShadow: 'none' };
const glassCardStyle = { borderRadius: 4, border: '1px solid #e2e8f0', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.04)' };
const leaveCardStyle = { borderRadius: 3, border: '1px solid #e2e8f0', transition: '0.2s', '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }};
const actionBtnStyle = { borderRadius: 2, fontWeight: 800, textTransform: 'none', px: 3 };

const filterChipStyle = (active: boolean) => ({
  fontWeight: 800,
  bgcolor: active ? '#2563eb' : '#f1f5f9',
  color: active ? 'white' : '#64748b',
  '&:hover': { bgcolor: active ? '#1d4ed8' : '#e2e8f0' }
});

const statusChipStyle = (status: string) => {
  const colors: any = { Approved: { bg: '#dcfce7', text: '#15803d' }, Rejected: { bg: '#fee2e2', text: '#b91c1c' }, Pending: { bg: '#fef3c7', text: '#b45309' }};
  const theme = colors[status] || colors.Pending;
  return { bgcolor: theme.bg, color: theme.text, fontWeight: 900, borderRadius: 1.5, fontSize: '0.7rem' };
};

const calendarWrapper = {
  '& .react-calendar': { border: 'none', width: '100%', fontFamily: 'inherit' },
  '& .dot': { height: '6px', width: '6px', backgroundColor: '#ef4444', borderRadius: '50%', margin: '0 auto', marginTop: '2px' }
};