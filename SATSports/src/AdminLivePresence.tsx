import React, { useEffect, useState, useCallback } from "react";
import { 
  Table, TableBody, TableCell, TableHead, TableRow, Paper, 
  TableContainer, Box, Typography, Chip, Avatar, Stack, Fade 
} from "@mui/material";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import API_BASE from "./api";

// --- HELPERS ---
const formatTime = (timeStr: string) => {
  if (!timeStr) return "--:--";
  return new Date(timeStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

function AdminLivePresence() {
  const [coaches, setCoaches] = useState<any[]>([]);
  const [lastSync, setLastSync] = useState(new Date());

  const load = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/live-coaches`);
      const data = await res.json();
      setCoaches(Array.isArray(data) ? data : []);
      setLastSync(new Date());
    } catch (err) {
      console.error("Live Sync Failed");
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [load]);

  return (
    <Box sx={rootStyle}>
      {/* HEADER SECTION */}
      <Stack direction="row" justifyContent="space-between" alignItems="flex-end" mb={4}>
        <Box>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="h4" fontWeight={950} sx={{ letterSpacing: -1.5 }}>
              LIVE <span style={{ color: '#10b981' }}>PRESENCE</span>
            </Typography>
            <Box sx={pulseAnimation}>
              <FiberManualRecordIcon sx={{ fontSize: 12, color: '#10b981' }} />
            </Box>
          </Stack>
          <Typography variant="caption" sx={{ opacity: 0.5, fontWeight: 800 }}>
            AUTO-REFRESHING EVERY 30S • LAST SYNC: {lastSync.toLocaleTimeString()}
          </Typography>
        </Box>
      </Stack>

      <TableContainer component={Paper} sx={tablePaperStyle}>
        <Table size="small">
          <TableHead sx={{ bgcolor: "#f8fafc" }}>
            <TableRow>
              <TableCell sx={thStyle}>COACH / INSTRUCTOR</TableCell>
              <TableCell sx={thStyle}>ASSIGNED LOCATION</TableCell>
              <TableCell sx={thStyle}>CHECK-IN TIMESTAMP</TableCell>
              <TableCell sx={{ ...thStyle, textAlign: 'right' }}>STATUS</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {coaches.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 10 }}>
                  <Typography variant="body2" fontWeight={700} color="text.secondary">
                    No coaches are currently checked in.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              coaches.map((c) => (
                <TableRow key={c.id} hover sx={trStyle}>
                  <TableCell>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Avatar sx={avatarStyle}>{c.name[0]}</Avatar>
                      <Typography variant="body2" fontWeight={800}>{c.name}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <LocationOnIcon sx={{ fontSize: 14, color: '#64748b' }} />
                      <Typography variant="body2" fontWeight={600} color="#475569">
                        {c.location}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={700} color="#1e293b">
                      {formatTime(c.checkin_time)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Chip label="ACTIVE" size="small" sx={statusChipStyle} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

// --- STATIC STYLES ---
const rootStyle = { p: { xs: 2, md: 5 }, bgcolor: "#f8fafc", minHeight: "100vh" };

const tablePaperStyle = { 
  borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: 'none', overflow: 'hidden' 
};

const thStyle = { 
  fontWeight: 900, color: '#64748b', fontSize: '0.65rem', letterSpacing: 1, py: 2 
};

const trStyle = { '&:hover': { bgcolor: '#fcfcfd' }, borderBottom: '1px solid #f1f5f9' };

const avatarStyle = { 
  width: 28, height: 28, fontSize: '0.75rem', fontWeight: 900, bgcolor: '#4f46e5' 
};

const statusChipStyle = { 
  bgcolor: '#ecfdf5', color: '#10b981', fontWeight: 900, fontSize: '0.65rem', borderRadius: 1 
};

const pulseAnimation = {
  display: 'flex',
  alignItems: 'center',
  '@keyframes pulse': {
    '0%': { opacity: 1 },
    '50%': { opacity: 0.3 },
    '100%': { opacity: 1 },
  },
  animation: 'pulse 2s infinite ease-in-out',
};

export default AdminLivePresence;