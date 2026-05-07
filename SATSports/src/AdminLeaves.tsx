import React, { useEffect, useState, useMemo, useCallback } from "react";
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

// --- HELPERS ---
const dateToShort = (d: string) => new Date(d).toLocaleDateString();

export default function AdminLeaves() {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" as any });

  const load = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/leaves`);
      const data = await res.json();
      setLeaves(Array.isArray(data) ? data : []);
    } catch {
      setToast({ open: true, message: "Sync Error", severity: "error" });
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id: number, status: string) => {
    // Optimistic Update: Change UI immediately
    setLeaves(prev => prev.map(l => l.id === id ? { ...l, status } : l));
    
    const res = await fetch(`${API_BASE}/api/admin/leaves/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (res.ok) {
      setToast({ open: true, message: `Request ${status}`, severity: "success" });
    } else {
      load(); // Revert on failure
    }
  };

  // 🚀 PERFORMANCE: Pre-calculate Approved Dates for Calendar
  const approvedDatesSet = useMemo(() => {
    const dates = new Set();
    leaves.forEach(l => {
      if (l.status === "Approved") {
        let start = new Date(l.start_date);
        const end = new Date(l.end_date);
        while (start <= end) {
          dates.add(start.toDateString());
          start.setDate(start.getDate() + 1);
        }
      }
    });
    return dates;
  }, [leaves]);

  const stats = useMemo(() => [
    { label: "Pending", val: leaves.filter(l => l.status === "Pending").length, col: "#f59e0b", icon: <PendingActionsIcon /> },
    { label: "Approved", val: leaves.filter(l => l.status === "Approved").length, col: "#10b981", icon: <CheckCircleIcon /> },
    { label: "Rejected", val: leaves.filter(l => l.status === "Rejected").length, col: "#ef4444", icon: <CancelIcon /> },
  ], [leaves]);

  const filtered = useMemo(() => 
    filter === "all" ? leaves : leaves.filter(l => l.status === filter),
    [leaves, filter]
  );

  return (
    <Box sx={rootStyle}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={6}>
        <Box>
          <Typography variant="h4" fontWeight={950} sx={{ letterSpacing: -1.5 }}>STAFF <span style={{color: '#4f46e5'}}>LEAVES</span></Typography>
          <Typography variant="body2" sx={{ opacity: 0.6 }}>Operational absence management</Typography>
        </Box>
      </Stack>

      <Grid container spacing={2} mb={4}>
        {stats.map((s) => (
          <Grid item xs={4} key={s.label}>
            <Card sx={statCardStyle}>
              <Stack direction="row" alignItems="center" spacing={2} p={2}>
                <Avatar sx={{ bgcolor: `${s.col}10`, color: s.col, width: 32, height: 32 }}>{s.icon}</Avatar>
                <Box>
                  <Typography variant="h5" fontWeight={900}>{s.val}</Typography>
                  <Typography variant="caption" fontWeight={800} sx={{ opacity: 0.5 }}>{s.label.toUpperCase()}</Typography>
                </Box>
              </Stack>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={panelStyle}>
            <Typography variant="caption" fontWeight={900} display="block" mb={2}>FILTERS</Typography>
            <Stack direction="row" flexWrap="wrap" gap={1} mb={4}>
              {["all", "Pending", "Approved", "Rejected"].map(f => (
                <Chip key={f} label={f} onClick={() => setFilter(f)} sx={filterChip(filter === f)} />
              ))}
            </Stack>

            <Typography variant="caption" fontWeight={900} display="block" mb={2}>CALENDAR VIEW</Typography>
            <Box sx={calendarWrapper}>
              <Calendar tileContent={({ date }) => approvedDatesSet.has(date.toDateString()) ? <div className="dot" /> : null} />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Stack spacing={1.5}>
            {filtered.map((l, i) => (
              <Fade in timeout={200} key={l.id}>
                <Card sx={leaveCardStyle}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" p={2}>
                    <Box>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography fontWeight={900}>{l.username}</Typography>
                        <Chip label={l.leave_type} size="small" sx={typeChip} />
                      </Stack>
                      <Typography variant="caption" fontWeight={700} sx={{ opacity: 0.5 }}>
                        {dateToShort(l.start_date)} — {dateToShort(l.end_date)}
                      </Typography>
                    </Box>

                    <Stack direction="row" spacing={1}>
                      {l.status === "Pending" ? (
                        <>
                          <Button size="small" variant="contained" disableElevation onClick={() => updateStatus(l.id, "Approved")} sx={approveBtn}>Approve</Button>
                          <Button size="small" onClick={() => updateStatus(l.id, "Rejected")} sx={rejectBtn}>Reject</Button>
                        </>
                      ) : (
                        <Chip label={l.status.toUpperCase()} sx={statusTag(l.status)} />
                      )}
                    </Stack>
                  </Stack>
                </Card>
              </Fade>
            ))}
          </Stack>
        </Grid>
      </Grid>

      <Snackbar open={toast.open} autoHideDuration={2000} onClose={() => setToast(p => ({ ...p, open: false }))}>
        <Alert severity={toast.severity} variant="filled" sx={{ fontWeight: 800 }}>{toast.message}</Alert>
      </Snackbar>
    </Box>
  );
}

// --- STATIC STYLES ---
const rootStyle = { p: { xs: 2, md: 5 }, bgcolor: "#f8fafc", minHeight: "100vh" };
const statCardStyle = { borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: 'none' };
const panelStyle = { p: 3, borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: 'none' };
const leaveCardStyle = { borderRadius: 2, border: '1px solid #e2e8f0', boxShadow: 'none', transition: '0.2s', '&:hover': { bgcolor: '#f1f5f9' }};
const approveBtn = { bgcolor: '#10b981', fontWeight: 900, borderRadius: 1.5, fontSize: '0.7rem', '&:hover': { bgcolor: '#059669' }};
const rejectBtn = { color: '#ef4444', fontWeight: 900, fontSize: '0.7rem' };
const typeChip = { fontWeight: 900, fontSize: '0.6rem', height: 20, bgcolor: '#f1f5f9' };

const filterChip = (active: boolean) => ({
  fontWeight: 900, fontSize: '0.7rem',
  bgcolor: active ? '#0f172a' : 'transparent',
  color: active ? 'white' : '#64748b',
  border: active ? 'none' : '1px solid #e2e8f0'
});

const statusTag = (s: string) => {
  const colors: any = { Approved: '#10b981', Rejected: '#ef4444', Pending: '#f59e0b' };
  return { fontWeight: 950, fontSize: '0.65rem', color: colors[s], bgcolor: `${colors[s]}10`, borderRadius: 1 };
};

const calendarWrapper = {
  '& .react-calendar': { border: 'none', width: '100%', fontSize: '0.8rem', bgcolor: 'transparent' },
  '& .react-calendar__tile--now': { bgcolor: '#eff6ff', borderRadius: 1 },
  '& .dot': { height: '4px', width: '4px', bgcolor: '#4f46e5', borderRadius: '50%', margin: '0 auto' }
};