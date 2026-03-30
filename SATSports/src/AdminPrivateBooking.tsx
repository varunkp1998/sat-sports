import React, { useEffect, useState } from "react";
import {
  Box, Typography, Card, CardContent, Button, Stack, 
  Select, MenuItem, Fade, Paper, Grid, Avatar, Divider, 
  Snackbar, Alert, Chip
} from "@mui/material";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonIcon from "@mui/icons-material/Person";
import API_BASE from "./api";

export default function AdminPrivateBookings() {
  const [rows, setRows] = useState<any[]>([]);
  const [coaches, setCoaches] = useState<any[]>([]);
  const [selectedCoach, setSelectedCoach] = useState<Record<number, string | number>>({});
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" as "success" | "error" });

  const loadData = async () => {
    try {
      const [bRes, cRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/private-bookings`),
        fetch(`${API_BASE}/api/admin/coaches`)
      ]);
      setRows(await bRes.json());
      setCoaches(await cRes.json());
    } catch (err) {
      handleToast("Failed to sync booking data", "error");
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
      handleToast("Booking Approved!", "success");
      loadData();
    }
  };

  const reject = async (id: number) => {
    if (!window.confirm("Reject this booking request?")) return;
    const res = await fetch(`${API_BASE}/api/admin/private-bookings/${id}/reject`, { method: "PUT" });
    if (res.ok) {
      handleToast("Booking Rejected", "error");
      loadData();
    }
  };

  return (
    <Box sx={containerStyle}>
      {/* HEADER */}
      <Box mb={6}>
        <Typography variant="h4" fontWeight={900} letterSpacing="-1.5px" color="#1e293b">
          Private Bookings
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage 1-on-1 session requests and coach assignments
        </Typography>
      </Box>

      {/* BOOKINGS LIST */}
      <Grid container spacing={3}>
        {rows.length === 0 ? (
          <Grid item xs={12}>
            <Paper sx={emptyStateStyle}>No active booking requests found.</Paper>
          </Grid>
        ) : (
          rows.map((r) => (
            <Grid item xs={12} md={6} lg={4} key={r.id}>
              <Fade in timeout={500}>
                <Card sx={bookingCardStyle}>
                  <CardContent sx={{ p: 3 }}>
                    {/* PLAYER INFO */}
                    <Stack direction="row" spacing={2} alignItems="center" mb={3}>
                      <Avatar sx={{ bgcolor: '#3b82f6', fontWeight: 800 }}>{r.name.charAt(0)}</Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight={800} lineHeight={1.2}>{r.name}</Typography>
                        <Chip 
                          label={r.status.toUpperCase()} 
                          size="small" 
                          sx={statusChipStyle(r.status)} 
                        />
                      </Box>
                    </Stack>

                    <Divider sx={{ mb: 2, borderStyle: 'dashed' }} />

                    {/* DETAILS */}
                    <Stack spacing={1.5} mb={3}>
                      <Box display="flex" alignItems="center">
                        <LocationOnIcon sx={iconStyle} />
                        <Typography variant="body2" fontWeight={600} color="#475569">{r.location_name}</Typography>
                      </Box>
                      <Box display="flex" alignItems="center">
                        <EventAvailableIcon sx={iconStyle} />
                        <Typography variant="body2" fontWeight={600} color="#475569">{r.booking_date}</Typography>
                      </Box>
                      <Box display="flex" alignItems="center">
                        <AccessTimeIcon sx={iconStyle} />
                        <Typography variant="body2" fontWeight={600} color="#475569">{r.time_slot}</Typography>
                      </Box>
                    </Stack>

                    {/* ACTION ZONE */}
                    {r.status === "pending" && (
                      <Box sx={actionAreaStyle}>
                        <Typography variant="caption" fontWeight={900} color="text.secondary" sx={{ display: 'block', mb: 1, textTransform: 'uppercase' }}>
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
                          <MenuItem value="" disabled>Select a coach...</MenuItem>
                          {coaches.map(c => (
                            <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                          ))}
                        </Select>

                        <Stack direction="row" spacing={1} mt={2}>
                          <Button 
                            variant="contained" 
                            fullWidth 
                            onClick={() => approve(r.id)}
                            sx={approveBtnStyle}
                          >
                            Approve
                          </Button>
                          <Button 
                            variant="outlined" 
                            color="error" 
                            onClick={() => reject(r.id)}
                            sx={rejectBtnStyle}
                          >
                            Reject
                          </Button>
                        </Stack>
                      </Box>
                    )}

                    {r.status !== "pending" && (
                      <Box sx={{ mt: 2, p: 2, bgcolor: '#f8fafc', borderRadius: 3, textAlign: 'center' }}>
                         <Typography variant="caption" fontWeight={800} color="text.secondary">
                           {r.status === "approved" ? `Assigned to Coach ${r.coach_name || 'Staff'}` : "Request Processed"}
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

      <Snackbar open={toast.open} autoHideDuration={3000} onClose={() => setToast({ ...toast, open: false })}>
        <Alert severity={toast.severity} variant="filled" sx={{ borderRadius: 2 }}>{toast.message}</Alert>
      </Snackbar>
    </Box>
  );
}

// --- REFINED STYLES ---
const containerStyle = { p: { xs: 2, md: 8 }, background: "#f8fafc", minHeight: "100vh" };
const bookingCardStyle = { borderRadius: 5, border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', bgcolor: 'white', overflow: 'visible' };
const iconStyle = { mr: 1.5, fontSize: 18, color: '#94a3b8' };
const selectStyle = { borderRadius: 3, bgcolor: '#f1f5f9', "& .MuiOutlinedInput-notchedOutline": { border: 'none' }, fontWeight: 700, fontSize: '0.85rem' };
const actionAreaStyle = { mt: 2, p: 2, borderRadius: 4, bgcolor: '#f8fafc', border: '1px solid #f1f5f9' };
const approveBtnStyle = { borderRadius: 2.5, fontWeight: 900, textTransform: 'none', background: 'linear-gradient(135deg, #2563eb, #4f46e5)', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)' };
const rejectBtnStyle = { borderRadius: 2.5, fontWeight: 800, textTransform: 'none' };
const emptyStateStyle = { p: 8, textAlign: 'center', color: '#94a3b8', fontWeight: 700, borderRadius: 6, border: '1px dashed #cbd5e1', bgcolor: 'white' };

const statusChipStyle = (status: string) => {
  const colors: any = { approved: { bg: '#dcfce7', text: '#15803d' }, rejected: { bg: '#fee2e2', text: '#b91c1c' }, pending: { bg: '#eff6ff', text: '#1d4ed8' }};
  const config = colors[status] || colors.pending;
  return { bgcolor: config.bg, color: config.text, fontWeight: 900, fontSize: '0.65rem', mt: 0.5 };
};