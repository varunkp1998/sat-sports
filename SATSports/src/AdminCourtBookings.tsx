import React, { useEffect, useState, useCallback, useMemo } from "react";
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

// --- HELPERS (outside for speed) ---
const formatDate = (d: string) => new Date(d).toLocaleDateString(undefined, { dateStyle: 'medium' });

export default function AdminCourtBookings() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const load = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/court-bookings`);
      const data = await res.json();
      setRows(Array.isArray(data) ? data : []);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // 🚀 OPTIMISTIC DELETE: UI feels instant
  const cancel = useCallback(async (id: number) => {
    if (!window.confirm("Release this court?")) return;
    
    // Remove from UI immediately
    setRows(prev => prev.filter(r => r.id !== id));

    try {
      await fetch(`${API_BASE}/api/admin/court-bookings/${id}`, { method: "DELETE" });
    } catch {
      // Revert if API fails
      load();
    }
  }, [load]);

  return (
    <Box sx={containerStyle}>
      <Box mb={4}>
        <Typography variant="h4" fontWeight={950} sx={{ letterSpacing: -1 }}>COURT <span style={{color: '#4f46e5'}}>OPS</span></Typography>
        <Typography variant="body2" sx={{ opacity: 0.6 }}>Manage real-time court availability and athlete slots</Typography>
      </Box>

      <Chip 
        icon={<EventAvailableIcon sx={{ fontSize: '1rem !important' }} />} 
        label={`${rows.length} LIVE BOOKINGS`} 
        sx={statChipStyle} 
      />

      <Box mt={4}>
        {isMobile ? (
          <Stack spacing={2}>
            {rows.length === 0 && !loading && <Paper sx={emptyStateStyle}>No active reservations</Paper>}
            {rows.map((r, i) => (
              <Fade in timeout={300} key={r.id}>
                <Card sx={mobileCardStyle}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="subtitle1" fontWeight={900} color="primary">{r.court_name}</Typography>
                      <Avatar sx={avatarStyle}><CalendarTodayIcon fontSize="inherit" /></Avatar>
                    </Stack>
                    
                    <Typography variant="caption" sx={timeBadgeStyle}>{r.start_time} – {r.end_time}</Typography>
                    
                    <Divider sx={{ my: 2, opacity: 0.5 }} />

                    <Box mb={2}>
                      <Typography variant="body2" fontWeight={800}>{r.name}</Typography>
                      <Typography variant="caption" sx={contactStyle}>
                        <PhoneIcon sx={{ fontSize: 12, mr: 0.5 }} /> {r.phone || "No contact"}
                      </Typography>
                      <Typography variant="caption" display="block" sx={{ mt: 0.5, fontWeight: 700, opacity: 0.7 }}>
                        📅 {formatDate(r.booking_date)}
                      </Typography>
                    </Box>

                    <Button fullWidth onClick={() => cancel(r.id)} sx={cancelBtnMobile}>RELEASE COURT</Button>
                  </CardContent>
                </Card>
              </Fade>
            ))}
          </Stack>
        ) : (
          <Paper sx={tablePaperStyle}>
            <Table size="small">
              <TableHead sx={{ bgcolor: "#f8fafc" }}>
                <TableRow>
                  <TableCell sx={thStyle}>COURT</TableCell>
                  <TableCell sx={thStyle}>DATE</TableCell>
                  <TableCell sx={thStyle}>TIMELINE</TableCell>
                  <TableCell sx={thStyle}>ATHLETE</TableCell>
                  <TableCell sx={{ ...thStyle, textAlign: 'right' }}>ACTION</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id} sx={trStyle}>
                    <TableCell sx={{ fontWeight: 900 }}>{r.court_name}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{formatDate(r.booking_date)}</TableCell>
                    <TableCell>
                      <Chip label={`${r.start_time} – ${r.end_time}`} size="small" sx={gridTimeStyle} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={800}>{r.name}</Typography>
                      <Typography variant="caption" sx={{ opacity: 0.5 }}>{r.phone || "N/A"}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Button color="error" size="small" onClick={() => cancel(r.id)} sx={releaseBtnStyle}>Release</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        )}
      </Box>
    </Box>
  );
}

// --- LIGHTWEIGHT STYLES (EXTRACTED) ---
const containerStyle = { p: { xs: 2, md: 5 }, background: "#f8fafc", minHeight: "100vh" };
const tablePaperStyle = { borderRadius: 3, overflow: "hidden", border: '1px solid #e2e8f0', boxShadow: 'none' };
const thStyle = { fontWeight: 900, color: '#64748b', fontSize: '0.65rem', letterSpacing: 1, py: 2 };
const trStyle = { '&:hover': { bgcolor: '#fcfcfd' } };
const mobileCardStyle = { borderRadius: 4, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' };
const statChipStyle = { fontWeight: 900, fontSize: '0.7rem', bgcolor: 'white', border: '1px solid #e2e8f0', color: '#475569', py: 2 };
const timeBadgeStyle = { bgcolor: '#4f46e5', color: 'white', px: 1.2, py: 0.4, borderRadius: 1.5, fontWeight: 900, fontSize: '0.7rem' };
const cancelBtnMobile = { borderRadius: 2, fontWeight: 900, bgcolor: '#fff1f2', color: '#e11d48', '&:hover': { bgcolor: '#ffe4e6' } };
const emptyStateStyle = { p: 4, textAlign: 'center', color: '#94a3b8', borderRadius: 4, border: '1px dashed #cbd5e1', bgcolor: 'transparent', fontWeight: 700 };
const avatarStyle = { bgcolor: '#f1f5f9', color: '#64748b', width: 32, height: 32, fontSize: '1rem' };
const contactStyle = { display: 'flex', alignItems: 'center', fontWeight: 700, opacity: 0.6, mt: 0.5 };
const gridTimeStyle = { fontWeight: 900, bgcolor: '#eff6ff', color: '#2563eb', fontSize: '0.65rem' };
const releaseBtnStyle = { fontWeight: 900, textTransform: 'uppercase', fontSize: '0.7rem' };