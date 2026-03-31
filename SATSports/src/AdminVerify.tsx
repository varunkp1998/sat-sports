import { useEffect, useState } from "react";
import {
  Box, Typography, Grid, Card, CardContent, CardMedia, Button, Chip, Stack, CircularProgress, Alert, Container, IconButton, Tooltip
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import RefreshIcon from '@mui/icons-material/Refresh';
import API_BASE from "./api";
import dayjs from "dayjs";

const MotionCard = motion(Card);

type CheckInRecord = {
  id: number;
  coach_name: string;
  session_date: string;
  start_time: string;
  locationName: string;
  verification_photo: string;
  checkin_time: string;
  is_late: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
};

export default function AdminVerify() {
  const [data, setData] = useState<CheckInRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<number | null>(null);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      // Updated to fetch ALL photos
      const res = await fetch(`${API_BASE}/api/admin/checkins/all-photos`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError("FAILED TO SYNC WITH FIELD DATA");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleStatusUpdate = async (id: number, newStatus: 'APPROVED' | 'REJECTED') => {
    setUpdating(id);
    try {
      const res = await fetch(`${API_BASE}/api/admin/checkin/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus })
      });
      if (res.ok) {
        // Update local state instead of filtering out, so the card stays visible with new status
        setData(prev => prev.map(item => 
          item.id === id ? { ...item, status: newStatus } : item
        ));
      }
    } catch (err) {
      alert("ACTION FAILED: DATABASE REJECTED UPDATE");
    } finally {
      setUpdating(null);
    }
  };

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#020617' }}>
      <CircularProgress color="error" />
    </Box>
  );

  return (
    <Box sx={{ background: "#020617", color: "white", minHeight: "100vh", py: 6 }}>
      <Container maxWidth="xl">
        {/* HEADER */}
        <Box sx={{ mb: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <Box>
            <Typography variant="overline" sx={{ color: "#ef4444", fontWeight: 900, letterSpacing: 3 }}>COMMAND CENTER</Typography>
            <Typography variant="h3" fontWeight={950} sx={{ letterSpacing: -1.5 }}>PHOTO <span style={{ color: "#ef4444" }}>HISTORY</span></Typography>
          </Box>
          <IconButton onClick={fetchHistory} sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.05)', p: 2 }}>
            <RefreshIcon />
          </IconButton>
        </Box>

        {error && <Alert severity="error" sx={errorAlertStyle}>{error}</Alert>}

        {data.length === 0 ? (
          <Box sx={emptyStateStyle}>
            <Typography variant="h5" fontWeight={800} sx={{ opacity: 0.3 }}>NO PHOTO RECORDS FOUND</Typography>
          </Box>
        ) : (
          <Grid container spacing={4}>
            <AnimatePresence mode="popLayout">
              {data.map((item) => (
                <Grid item xs={12} md={6} lg={4} key={item.id}>
                  <MotionCard
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    sx={{
                      ...verifyCardStyle,
                      // Add subtle border colors based on status
                      border: item.status === 'APPROVED' ? '1px solid rgba(34, 197, 94, 0.3)' : 
                              item.status === 'REJECTED' ? '1px solid rgba(239, 68, 68, 0.3)' : 
                              '1px solid rgba(255,255,255,0.08)'
                    }}
                  >
                    {/* PHOTO PREVIEW */}
                    <Box sx={{ position: 'relative' }}>
                      <CardMedia
                        component="img"
                        height="280"
                        image={`${API_BASE}/uploads/${item.verification_photo}`}
                        alt="Coach Proof"
                        sx={{ 
                          filter: item.status === 'REJECTED' ? 'grayscale(1) brightness(0.5)' : 'brightness(0.8) contrast(1.1)',
                          transition: 'filter 0.3s ease'
                        }}
                      />
                      
                      {/* Floating Status Badges */}
                      <Stack direction="row" spacing={1} sx={{ position: 'absolute', top: 15, left: 15 }}>
                         <Chip 
                            label={item.status} 
                            size="small"
                            sx={statusChipStyle(item.status)} 
                          />
                         {item.is_late === 1 && <Chip label="LATE" size="small" sx={lateChipStyle} />}
                      </Stack>

                      <Tooltip title="View Original">
                        <IconButton 
                          onClick={() => window.open(`${API_BASE}/uploads/${item.verification_photo}`, '_blank')}
                          sx={openBtnStyle}
                        >
                          <OpenInNewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>

                    <CardContent sx={{ p: 3 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
                        <Box>
                          <Typography variant="h6" fontWeight={900}>{item.coach_name}</Typography>
                          <Typography variant="body2" sx={{ color: '#ef4444', fontWeight: 700 }}>📍 {item.locationName}</Typography>
                        </Box>
                        <Typography variant="caption" sx={{ opacity: 0.5, fontWeight: 800 }}>
                          {dayjs(item.checkin_time).format("HH:mm A")}
                        </Typography>
                      </Stack>

                      <Typography variant="body2" sx={{ opacity: 0.6, mb: 3, fontSize: '0.8rem' }}>
                        Session Date: {dayjs(item.session_date).format("DD MMM YYYY")}
                      </Typography>

                      {/* ACTION BUTTONS: Only show if PENDING or to allow re-evaluation */}
                      <Stack direction="row" spacing={2}>
                        <Button
                          fullWidth
                          variant={item.status === 'APPROVED' ? "contained" : "outlined"}
                          startIcon={<CheckCircleIcon />}
                          disabled={updating === item.id}
                          onClick={() => handleStatusUpdate(item.id, 'APPROVED')}
                          sx={item.status === 'APPROVED' ? approveBtnStyle : { ...approveBtnStyle, bgcolor: 'transparent', border: '1px solid #22c55e' }}
                        >
                          {item.status === 'APPROVED' ? "APPROVED" : "APPROVE"}
                        </Button>
                        <Button
                          fullWidth
                          variant={item.status === 'REJECTED' ? "contained" : "outlined"}
                          startIcon={<CancelIcon />}
                          disabled={updating === item.id}
                          onClick={() => handleStatusUpdate(item.id, 'REJECTED')}
                          sx={item.status === 'REJECTED' ? { ...rejectBtnStyle, bgcolor: '#ef4444', color: 'white' } : rejectBtnStyle}
                        >
                          {item.status === 'REJECTED' ? "FLAGGED" : "FLAG"}
                        </Button>
                      </Stack>
                    </CardContent>
                  </MotionCard>
                </Grid>
              ))}
            </AnimatePresence>
          </Grid>
        )}
      </Container>
    </Box>
  );
}

// --- STYLE TOKENS ---
const verifyCardStyle = {
  borderRadius: 6,
  background: "rgba(255,255,255,0.03)",
  backdropFilter: "blur(20px)",
  color: "white",
  overflow: 'hidden',
  transition: 'all 0.3s ease'
};

const statusChipStyle = (status: string) => ({
  bgcolor: status === 'APPROVED' ? '#22c55e' : status === 'REJECTED' ? '#ef4444' : '#f97316',
  color: 'white',
  fontWeight: 900,
  fontSize: '0.65rem',
  borderRadius: 1
});

const openBtnStyle = {
  position: 'absolute',
  top: 15,
  right: 15,
  bgcolor: 'rgba(0,0,0,0.6)',
  color: 'white',
  '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' }
};

const lateChipStyle = {
  bgcolor: '#ef4444',
  color: 'white',
  fontWeight: 900,
  fontSize: '0.65rem',
  borderRadius: 1
};

const approveBtnStyle = {
  bgcolor: '#22c55e',
  color: 'white',
  fontWeight: 900,
  borderRadius: 3,
  '&:hover': { bgcolor: '#16a34a' }
};

const rejectBtnStyle = {
  borderColor: 'rgba(255,255,255,0.1)',
  color: 'rgba(255,255,255,0.5)',
  fontWeight: 900,
  borderRadius: 3,
  '&:hover': { borderColor: '#ef4444', color: '#ef4444' }
};

const errorAlertStyle = {
  mb: 4,
  borderRadius: 3,
  bgcolor: 'rgba(239, 68, 68, 0.1)',
  color: '#ff4444',
  border: '1px solid rgba(239, 68, 68, 0.2)'
};

const emptyStateStyle = {
  textAlign: 'center',
  py: 15,
  border: '2px dashed rgba(255,255,255,0.05)',
  borderRadius: 8
};