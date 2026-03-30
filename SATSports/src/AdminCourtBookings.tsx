import React, { useEffect, useState } from "react";
import {
  Table, TableHead, TableRow, TableCell, TableBody, Button, Paper,
  Box, useTheme, useMediaQuery, Card, CardContent, Stack,
  Typography, Avatar, Chip, Fade, Divider
} from "@mui/material";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PhoneIcon from "@mui/icons-material/Phone";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import API_BASE from "./api";

export default function AdminCourtBookings() {
  const [rows, setRows] = useState<any[]>([]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const load = () => {
    fetch(`${API_BASE}/api/admin/court-bookings`)
      .then(res => res.json())
      .then(data => setRows(Array.isArray(data) ? data : []))
      .catch(() => setRows([]));
  };

  useEffect(() => { load(); }, []);

  const cancel = async (id: number) => {
    if (!window.confirm("Are you sure you want to release this court booking?")) return;
    await fetch(`${API_BASE}/api/admin/court-bookings/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <Box sx={containerStyle}>
      {/* HEADER */}
      <Box mb={4}>
        <Typography variant="h4" fontWeight={900} letterSpacing="-1px">
          Court Schedule
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Monitor active court reservations and facility utilization
        </Typography>
      </Box>

      {/* QUICK STATS PILLS */}
      <Stack direction="row" spacing={1} mb={4}>
        <Chip 
          icon={<EventAvailableIcon sx={{ fontSize: '1rem !important' }} />} 
          label={`${rows.length} Active Bookings`} 
          sx={statChipStyle} 
        />
      </Stack>

      {isMobile ? (
        <Stack spacing={2}>
          {rows.length === 0 && (
            <Paper sx={emptyStateStyle}>No active court bookings found.</Paper>
          )}

          {rows.map((r, i) => (
            <Fade in timeout={400 + i * 100} key={r.id}>
              <Card sx={mobileCardStyle}>
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" justifyContent="space-between" mb={2}>
                    <Box>
                      <Typography variant="h6" fontWeight={800} color="primary">{r.court_name}</Typography>
                      <Typography variant="caption" sx={timeBadgeStyle}>
                        {r.start_time} – {r.end_time}
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: '#f1f5f9', color: '#64748b' }}>
                      <CalendarTodayIcon fontSize="small" />
                    </Avatar>
                  </Stack>

                  <Divider sx={{ my: 2, borderStyle: 'dashed' }} />

                  <Stack spacing={1} mb={2}>
                    <Typography variant="body2" fontWeight={700}>{r.name}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                      <PhoneIcon sx={{ fontSize: 14, mr: 0.5 }} /> {r.phone || "No contact provided"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      📅 {new Date(r.booking_date).toLocaleDateString(undefined, { dateStyle: 'full' })}
                    </Typography>
                  </Stack>

                  <Button
                    variant="contained"
                    color="error"
                    fullWidth
                    startIcon={<DeleteSweepIcon />}
                    onClick={() => cancel(r.id)}
                    sx={cancelBtnMobile}
                  >
                    Cancel Reservation
                  </Button>
                </CardContent>
              </Card>
            </Fade>
          ))}
        </Stack>
      ) : (
        <Paper sx={tablePaperStyle}>
          <Table>
            <TableHead sx={{ bgcolor: "#f8fafc" }}>
              <TableRow>
                <TableCell sx={thStyle}>FACILITY / COURT</TableCell>
                <TableCell sx={thStyle}>RESERVATION DATE</TableCell>
                <TableCell sx={thStyle}>TIME SLOT</TableCell>
                <TableCell sx={thStyle}>ATHLETE NAME</TableCell>
                <TableCell sx={thStyle}>CONTACT</TableCell>
                <TableCell sx={{ ...thStyle, textAlign: 'right' }}>MANAGEMENT</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8, color: 'text.secondary' }}>
                    No court bookings found in the system.
                  </TableCell>
                </TableRow>
              )}

              {rows.map((r) => (
                <TableRow key={r.id} hover sx={{ '&:hover': { bgcolor: '#fcfcfd' } }}>
                  <TableCell>
                    <Typography variant="body2" fontWeight={800} color="#1e293b">{r.court_name}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {new Date(r.booking_date).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={`${r.start_time} – ${r.end_time}`} 
                      size="small" 
                      sx={{ fontWeight: 700, bgcolor: '#eff6ff', color: '#2563eb' }} 
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>{r.name}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" fontWeight={700} color="text.secondary">
                      {r.phone || "N/A"}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      variant="text"
                      color="error"
                      size="small"
                      startIcon={<DeleteSweepIcon />}
                      onClick={() => cancel(r.id)}
                      sx={{ fontWeight: 800, textTransform: 'none' }}
                    >
                      Release
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}
    </Box>
  );
}

// --- STYLES ---

const containerStyle = { p: { xs: 2, md: 5 }, background: "#f8fafc", minHeight: "100vh" };

const tablePaperStyle = { 
  borderRadius: 5, overflow: "hidden", border: '1px solid #e2e8f0', boxShadow: 'none' 
};

const thStyle = { fontWeight: 800, color: '#64748b', fontSize: '0.75rem', letterSpacing: 1 };

const mobileCardStyle = { 
  borderRadius: 5, border: '1px solid #e2e8f0', boxShadow: 'none' 
};

const statChipStyle = { 
  fontWeight: 800, bgcolor: 'white', border: '1px solid #e2e8f0', color: '#475569' 
};

const timeBadgeStyle = { 
  bgcolor: '#4f46e5', color: 'white', px: 1, py: 0.5, borderRadius: 1.5, fontWeight: 800 
};

const cancelBtnMobile = { 
  borderRadius: 2.5, fontWeight: 800, textTransform: 'none', py: 1.2, boxShadow: 'none' 
};

const emptyStateStyle = { 
  p: 4, textAlign: 'center', color: 'text.secondary', borderRadius: 4, 
  border: '1px dashed #cbd5e1', bgcolor: 'transparent' 
};