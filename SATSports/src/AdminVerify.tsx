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

type PendingCheckIn = {
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
  const [data, setData] = useState<PendingCheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<number | null>(null);

  const fetchPending = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/admin/checkins/pending`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError("FAILED TO SYNC WITH FIELD DATA");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
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
        // Remove from list or update local state
        setData(prev => prev.filter(item => item.id !== id));
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
            <Typography variant="h3" fontWeight={950} sx={{ letterSpacing: -1.5 }}>PHOTO <span style={{ color: "#ef4444" }}>VERIFICATIONS</span></Typography>
          </Box>
          <IconButton onClick={fetchPending} sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.05)', p: 2 }}>
            <RefreshIcon />
          </IconButton>
        </Box>

        {error && <Alert severity="error" sx={errorAlertStyle}>{error}</Alert>}

        {data.length === 0 ? (
          <Box sx={emptyStateStyle}>
            <Typography variant="h5" fontWeight={800} sx={{ opacity: 0.3 }}>ALL FIELD AGENTS VERIFIED</Typography>
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
                    exit={{ opacity: 0, scale: 0.8 }}
                    sx={verifyCardStyle}
                  >
                    {/* PHOTO PREVIEW */}
                    <Box sx={{ position: 'relative' }}>
                      <CardMedia
                        component="img"
                        height="280"
                        image={`${API_BASE}/uploads/${item.verification_photo}`}
                        alt="Coach Proof"
                        sx={{ filter: 'brightness(0.8) contrast(1.1)' }}
                      />
                      <Tooltip title="View Original">
                        <IconButton 
                          onClick={() => window.open(`${API_BASE}/uploads/${item.verification_photo}`, '_blank')}
                          sx={openBtnStyle}
                        >
                          <OpenInNewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {item.is_late === 1 && <Chip label="LATE ARRIVAL" sx={lateChipStyle} />}
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

                      {/* ACTION BUTTONS */}
                      <Stack direction="row" spacing={2}>
                        <Button
                          fullWidth
                          variant="contained"
                          startIcon={<CheckCircleIcon />}
                          disabled={updating === item.id}
                          onClick={() => handleStatusUpdate(item.id, 'APPROVED')}
                          sx={approveBtnStyle}
                        >
                          APPROVE
                        </Button>
                        <Button
                          fullWidth
                          variant="outlined"
                          startIcon={<CancelIcon />}
                          disabled={updating === item.id}
                          onClick={() => handleStatusUpdate(item.id, 'REJECTED')}
                          sx={rejectBtnStyle}
                        >
                          FLAG
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
  border: "1px solid rgba(255,255,255,0.08)",
  color: "white",
  overflow: 'hidden'
};

const openBtnStyle = {
  position: 'absolute',
  top: 15,
  right: 15,
  bgcolor: 'rgba(0,0,0,0.6)',
  color: 'white',
  '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' }
};

const lateChipStyle = {
  position: 'absolute',
  bottom: 15,
  left: 15,
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