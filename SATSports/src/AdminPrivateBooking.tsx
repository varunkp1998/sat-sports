import React, { useEffect, useState } from "react";
import {
  Box, Typography, Card, CardContent, Button, Stack, 
  Select, MenuItem, Fade, Paper, Grid, Avatar, Divider, 
  Snackbar, Alert, Chip, CircularProgress
} from "@mui/material";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonIcon from "@mui/icons-material/Person";
import API_BASE from "./api";
import dayjs from "dayjs";

export default function AdminPrivateBookings() {
  const [rows, setRows] = useState<any[]>([]);
  const [coaches, setCoaches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCoach, setSelectedCoach] = useState<Record<number, string | number>>({});
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" as "success" | "error" });

  const loadData = async () => {
    try {
      setLoading(true);
      const [bRes, cRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/private-bookings`),
        fetch(`${API_BASE}/api/admin/coaches`)
      ]);
      const bookings = await bRes.json();
      const coachList = await cRes.json();
      
      setRows(bookings);
      setCoaches(coachList);
    } catch (err) {
      handleToast("Failed to sync booking data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleToast = (message: string, severity: "success" | "error") => {
    setToast({ open: true, message, severity });
  };

  const approve = async (id: number) => {
    const coach_id = selectedCoach[id];
    if (!coach_id) return handleToast("Please assign a coach first", "error");

    const res = await fetch(`${API_BASE}/api/admin/private-bookings/${id}/approve`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ coach_id })
    });

    if (res.ok) {
      handleToast("Booking Approved & Session Created! ✅", "success");
      loadData();
    } else {
      handleToast("Approval failed", "error");
    }
  };

  const reject = async (id: number) => {
    if (!window.confirm("Reject this booking request? Email will be sent to user.")) return;
    const res = await fetch(`${API_BASE}/api/admin/private-bookings/${id}/reject`, { method: "PUT" });
    if (res.ok) {
      handleToast("Booking Rejected", "error");
      loadData();
    }
  };

  // Helper to format "09:00:00" to "9:00 AM"
  const formatTimeDisplay = (timeStr: string) => {
    if (!timeStr) return "N/A";
    return dayjs(`2000-01-01 ${timeStr}`).format("hh:mm A");
  };

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#f8fafc' }}>
      <CircularProgress />
    </Box>
  );

  return (
    <Box sx={containerStyle}>
      {/* HEADER */}
      <Box mb={6} sx={{ borderLeft: '6px solid #2563eb', pl: 3 }}>
        <Typography variant="h4" fontWeight={900} letterSpacing="-1.5px" color="#1e293b">
          Private Booking Manager
        </Typography>
        <Typography variant="body2" color="text.secondary" fontWeight={600}>
          Assign coaches and approve personalized 1-on-1 sessions
        </Typography>
      </Box>

      {/* BOOKINGS LIST */}
      <Grid container spacing={4}>
        {rows.length === 0 ? (
          <Grid item xs={12}>
            <Paper sx={emptyStateStyle}>No active booking requests found.</Paper>
          </Grid>
        ) : (
          rows.map((r) => (
            <Grid item xs={12} md={6} lg={4} key={r.id}>
              <Fade in timeout={500}>
                <Card sx={bookingCardStyle(r.status)}>
                  <CardContent sx={{ p: 3 }}>
                    {/* PLAYER INFO */}
                    <Stack direction="row" spacing={2} alignItems="center" mb={3}>
                      <Avatar sx={{ bgcolor: r.status === 'pending' ? '#3b82f6' : '#cbd5e1', fontWeight: 800 }}>
                        {r.name.charAt(0)}
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" fontWeight={800} lineHeight={1.2} color="#1e293b">{r.name}</Typography>
                        <Typography variant="caption" color="text.secondary" fontWeight={700}>{r.phone || r.email}</Typography>
                      </Box>
                      <Chip 
                        label={r.status.toUpperCase()} 
                        size="small" 
                        sx={statusChipStyle(r.status)} 
                      />
                    </Stack>

                    <Divider sx={{ mb: 2, borderStyle: 'dashed' }} />

                    {/* SESSION LOGISTICS */}
                    <Stack spacing={1.5} mb={3}>
                      <Box display="flex" alignItems="center">
                        <LocationOnIcon sx={iconStyle} />
                        <Typography variant="body2" fontWeight={700} color="#475569">{r.location_name}</Typography>
                      </Box>
                      <Box display="flex" alignItems="center">
                        <EventAvailableIcon sx={iconStyle} />
                        <Typography variant="body2" fontWeight={700} color="#475569">
                          {dayjs(r.booking_date).format("dddd, MMM DD")}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center">
                        <AccessTimeIcon sx={iconStyle} />
                        <Typography variant="body2" fontWeight={800} color="#1e293b">
                          {formatTimeDisplay(r.start_time)} - {formatTimeDisplay(r.end_time)}
                        </Typography>
                      </Box>
                    </Stack>

                    {/* ACTION ZONE */}
                    {r.status === "pending" && (
                      <Box sx={actionAreaStyle}>
                        <Typography variant="caption" fontWeight={900} color="#64748b" sx={{ display: 'block', mb: 1.5, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                          Assign Available Coach
                        </Typography>
                        <Select
                          fullWidth
                          size="small"
                          displayEmpty
                          value={selectedCoach[r.id] || ""}
                          onChange={(e) => setSelectedCoach({ ...selectedCoach, [r.id]: e.target.value })}
                          sx={selectStyle}
                          startAdornment={<PersonIcon sx={{ mr: 1, fontSize: 18, color: '#94a3b8' }} />}
                        >
                          <MenuItem value="" disabled>Search coach list...</MenuItem>
                          {coaches.map(c => (
                            <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                          ))}
                        </Select>

                        <Stack direction="row" spacing={2} mt={2.5}>
                          <Button 
                            variant="contained" 
                            fullWidth 
                            onClick={() => approve(r.id)}
                            sx={approveBtnStyle}
                          >
                            Confirm & Sync
                          </Button>
                          <Button 
                            variant="text" 
                            color="error" 
                            onClick={() => reject(r.id)}
                            sx={{ fontWeight: 800, fontSize: '0.8rem' }}
                          >
                            Reject
                          </Button>
                        </Stack>
                      </Box>
                    )}

                    {r.status === "approved" && (
                      <Box sx={finalizedBoxStyle('#dcfce7')}>
                         <Typography variant="caption" fontWeight={900} color="#15803d">
                           ✓ ASSIGNED TO: {r.coach_name?.toUpperCase() || 'STAFF'}
                         </Typography>
                      </Box>
                    )}

                    {r.status === "rejected" && (
                      <Box sx={finalizedBoxStyle('#fee2e2')}>
                         <Typography variant="caption" fontWeight={900} color="#b91c1c">
                           ✕ REQUEST REJECTED
                         </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Fade>
            </Grid>
          ))
        )}
      </Grid>

      <Snackbar open={toast.open} autoHideDuration={4000} onClose={() => setToast({ ...toast, open: false })}>
        <Alert severity={toast.severity} variant="filled" sx={{ borderRadius: 3, fontWeight: 700 }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

// --- REFINED STYLES ---
const containerStyle = { p: { xs: 3, md: 6 }, background: "#f1f5f9", minHeight: "100vh" };

const bookingCardStyle = (status: string) => ({ 
  borderRadius: 5, 
  border: status === 'pending' ? '2px solid #e2e8f0' : '1px solid transparent', 
  boxShadow: status === 'pending' ? '0 10px 25px -5px rgba(0,0,0,0.05)' : 'none', 
  bgcolor: status === 'pending' ? 'white' : 'rgba(255,255,255,0.6)', 
  transition: 'all 0.3s ease',
  '&:hover': { transform: status === 'pending' ? 'translateY(-4px)' : 'none' }
});

const iconStyle = { mr: 1.5, fontSize: 20, color: '#94a3b8' };

const selectStyle = { 
  borderRadius: 3, 
  bgcolor: 'white', 
  border: '1px solid #e2e8f0',
  "& .MuiOutlinedInput-notchedOutline": { border: 'none' }, 
  fontWeight: 700, 
  fontSize: '0.9rem' 
};

const actionAreaStyle = { 
  mt: 2, p: 2.5, borderRadius: 4, 
  bgcolor: '#f8fafc', 
  border: '1px solid #e2e8f0' 
};

const approveBtnStyle = { 
  borderRadius: 3, 
  py: 1,
  fontWeight: 900, 
  textTransform: 'none', 
  background: 'linear-gradient(135deg, #2563eb, #1e40af)', 
  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
  '&:hover': { background: '#1e40af' }
};

const finalizedBoxStyle = (bgColor: string) => ({ 
  mt: 2, p: 1.5, 
  bgcolor: bgColor, 
  borderRadius: 3, 
  textAlign: 'center',
  border: `1px solid ${bgColor}`
});

const emptyStateStyle = { p: 10, textAlign: 'center', color: '#94a3b8', fontWeight: 800, borderRadius: 8, border: '2px dashed #cbd5e1', bgcolor: 'transparent' };

const statusChipStyle = (status: string) => {
  const colors: any = { 
    approved: { bg: '#dcfce7', text: '#15803d' }, 
    rejected: { bg: '#fee2e2', text: '#b91c1c' }, 
    pending: { bg: '#eff6ff', text: '#1d4ed8' }
  };
  const config = colors[status] || colors.pending;
  return { bgcolor: config.bg, color: config.text, fontWeight: 900, fontSize: '0.6rem', px: 1 };
};