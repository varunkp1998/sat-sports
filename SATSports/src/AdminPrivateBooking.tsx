import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Box, Typography, Card, CardContent, Button, Stack,
  Select, MenuItem, Grid, Avatar, Divider,
  Snackbar, Alert, Chip, Fade, Tooltip
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import API_BASE from "./api";
import dayjs from "dayjs";

export default function AdminPrivateBookings() {
  const [rows, setRows] = useState<any[]>([]);
  const [coaches, setCoaches] = useState<any[]>([]);
  const [selectedCoach, setSelectedCoach] = useState<Record<number, string>>({});
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" as any });

  const loadData = useCallback(async () => {
    try {
      const [bRes, cRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/private-bookings`),
        fetch(`${API_BASE}/api/admin/coaches`)
      ]);
      const [bookings, coachList] = await Promise.all([bRes.json(), cRes.json()]);
      setRows(Array.isArray(bookings) ? bookings : []);
      setCoaches(Array.isArray(coachList) ? coachList : []);
    } catch (err) {
      setToast({ open: true, message: "Sync Error", severity: "error" });
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleAction = async (id: number, action: 'approve' | 'reject') => {
    const coach_id = selectedCoach[id];
    if (action === 'approve' && !coach_id) {
      setToast({ open: true, message: "Assign a coach first", severity: "error" });
      return;
    }

    // Optimistic Update
    const status = action === 'approve' ? 'approved' : 'rejected';
    setRows(prev => prev.map(r => r.id === id ? { ...r, status } : r));

    const res = await fetch(`${API_BASE}/api/admin/private-bookings/${id}/${action}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: action === 'approve' ? JSON.stringify({ coach_id }) : undefined
    });

    if (res.ok) {
      setToast({ open: true, message: `Booking ${status}`, severity: action === 'approve' ? "success" : "error" });
      loadData();
    }
  };

  const formatTime = (t: string) => dayjs(`2000-01-01 ${t}`).format("hh:mm A");

  return (
    <Box sx={rootStyle}>
      <Box mb={4}>
        <Typography variant="h4" fontWeight={950} sx={{ letterSpacing: -1.5 }}>
          PRIVATE <span style={{ color: "#4f46e5" }}>RESERVATIONS</span>
        </Typography>
        <Typography variant="caption" sx={{ fontWeight: 800, opacity: 0.5 }}>
          MANAGE PREMIUM COURT BOOKINGS AND COACH ASSIGNMENTS
        </Typography>
      </Box>

      <Grid container spacing={2.5}>
        {rows.map((r) => (
          <Grid item xs={12} md={6} lg={4} key={r.id}>
            <Fade in>
              <Card sx={bookingCard(r.status)}>
                <CardContent sx={{ p: 2.5 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Avatar sx={avatarStyle}>{r.name[0]}</Avatar>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={900}>{r.name}</Typography>
                        <Typography variant="caption" fontWeight={700} sx={{ opacity: 0.5 }}>{r.phone}</Typography>
                      </Box>
                    </Stack>
                    <Chip label={`₹${r.amount}`} size="small" sx={priceTag} />
                  </Stack>

                  <Box sx={detailsGrid}>
                    <Box sx={detailItem}>
                      <LocationOnIcon sx={iconStyle} />
                      <Typography variant="caption" fontWeight={800}>{r.location_name}</Typography>
                    </Box>
                    <Box sx={detailItem}>
                      <AccessTimeIcon sx={iconStyle} />
                      <Typography variant="caption" fontWeight={800}>
                        {dayjs(r.booking_date).format("DD MMM")} • {formatTime(r.start_time)}
                      </Typography>
                    </Box>
                  </Box>

                  <Stack direction="row" spacing={1} my={2}>
                    <Chip 
                      label={r.payment_status?.toUpperCase() || 'UNPAID'} 
                      sx={paymentChip(r.payment_status === 'paid')} 
                    />
                    {r.razorpay_payment_id && (
                      <Typography variant="caption" sx={txIdStyle}>
                        TX: {r.razorpay_payment_id.slice(-8)}
                      </Typography>
                    )}
                  </Stack>

                  <Divider sx={{ my: 2, opacity: 0.5 }} />

                  {r.status === "pending" ? (
                    <Box>
                      <Select
                        fullWidth
                        size="small"
                        displayEmpty
                        value={selectedCoach[r.id] || ""}
                        onChange={(e) => setSelectedCoach({ ...selectedCoach, [r.id]: e.target.value })}
                        sx={coachSelect}
                      >
                        <MenuItem value="" disabled><Typography variant="caption" fontWeight={800}>Assign Instructor</Typography></MenuItem>
                        {coaches.map((c) => (
                          <MenuItem key={c.id} value={c.id}><Typography variant="caption" fontWeight={800}>{c.name}</Typography></MenuItem>
                        ))}
                      </Select>

                      <Stack direction="row" spacing={1} mt={2}>
                        <Button
                          fullWidth
                          variant="contained"
                          disableElevation
                          disabled={r.payment_status !== "paid"}
                          onClick={() => handleAction(r.id, 'approve')}
                          sx={approveBtn}
                        >
                          Approve
                        </Button>
                        <Button
                          fullWidth
                          variant="outlined"
                          onClick={() => handleAction(r.id, 'reject')}
                          sx={rejectBtn}
                        >
                          Reject
                        </Button>
                      </Stack>
                    </Box>
                  ) : (
                    <Box sx={statusBanner(r.status)}>
                      <Typography variant="caption" fontWeight={950}>{r.status.toUpperCase()}</Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Fade>
          </Grid>
        ))}
      </Grid>

      <Snackbar open={toast.open} autoHideDuration={2000} onClose={() => setToast({ ...toast, open: false })}>
        <Alert severity={toast.severity} variant="filled" sx={{ fontWeight: 800 }}>{toast.message}</Alert>
      </Snackbar>
    </Box>
  );
}

// --- STATIC STYLES ---
const rootStyle = { p: { xs: 2, md: 5 }, bgcolor: "#f8fafc", minHeight: "100vh" };
const bookingCard = (status: string) => ({
  borderRadius: 4, border: '1px solid #e2e8f0', boxShadow: 'none',
  bgcolor: status === 'pending' ? 'white' : '#f8fafc',
  transition: '0.2s', '&:hover': { borderColor: '#4f46e5' }
});

const avatarStyle = { bgcolor: '#4f46e5', fontWeight: 900, width: 36, height: 36, fontSize: '0.9rem' };
const priceTag = { bgcolor: '#1e293b', color: 'white', fontWeight: 900, fontSize: '0.7rem' };
const detailsGrid = { display: 'flex', flexDirection: 'column', gap: 0.5, mt: 1 };
const detailItem = { display: 'flex', alignItems: 'center', gap: 1, color: '#64748b' };
const iconStyle = { fontSize: 14 };

const paymentChip = (isPaid: boolean) => ({
  height: 20, fontSize: '0.6rem', fontWeight: 900,
  bgcolor: isPaid ? '#dcfce7' : '#fee2e2',
  color: isPaid ? '#15803d' : '#b91c1c'
});

const txIdStyle = { fontSize: '0.6rem', fontWeight: 700, opacity: 0.4, pt: 0.3 };
const coachSelect = { borderRadius: 2, bgcolor: '#f8fafc', "& .MuiOutlinedInput-notchedOutline": { border: '1px solid #e2e8f0' } };
const approveBtn = { borderRadius: 2, fontWeight: 900, textTransform: 'none', bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' } };
const rejectBtn = { borderRadius: 2, fontWeight: 900, textTransform: 'none', color: '#ef4444', borderColor: '#fee2e2' };

const statusBanner = (status: string) => ({
  p: 1, borderRadius: 2, textAlign: 'center',
  bgcolor: status === 'approved' ? '#dcfce7' : '#fee2e2',
  color: status === 'approved' ? '#15803d' : '#b91c1c'
});