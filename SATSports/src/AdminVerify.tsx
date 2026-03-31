import React, { useEffect, useState } from "react";
import {
  Box, Typography, Grid, Card, CardContent, CardMedia, 
  Button, Chip, Stack, CircularProgress, Container, 
  IconButton, Divider, Paper
} from "@mui/material";
import RefreshIcon from '@mui/icons-material/Refresh';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

// --- CONFIG ---
const API_BASE = "https://sat-sports.onrender.com";

interface PhotoRecord {
  id: number;
  coach_name: string | null;
  session_date: string;
  start_time: string;
  locationName: string;
  verification_photo: string;
  checkin_time: string;
  is_late: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export default function AdminVerify() {
  const [data, setData] = useState<PhotoRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [btnLoading, setBtnLoading] = useState<number | null>(null);

  const fetchPhotos = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/api/admin/checkins/all-photos`);
      if (!response.ok) throw new Error(`Server Error: ${response.status}`);
      const json = await response.json();
      setData(json);
    } catch (err: any) {
      console.error("Fetch failed:", err);
      setError(err.message || "Failed to connect to backend");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

  const updateStatus = async (id: number, newStatus: string) => {
    setBtnLoading(id);
    try {
      const res = await fetch(`${API_BASE}/api/admin/checkin/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus })
      });
      if (res.ok) {
        setData(prev => prev.map(item => item.id === id ? { ...item, status: newStatus as any } : item));
      }
    } catch (err) {
      alert("Update failed. Check console.");
    } finally {
      setBtnLoading(null);
    }
  };

  // --- RENDER HELPERS ---
  if (loading) return (
    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#020617', color: 'white' }}>
      <CircularProgress color="error" />
      <Typography sx={{ mt: 2, opacity: 0.6 }}>Syncing SAT Sports Field Data...</Typography>
    </Box>
  );

  return (
    <Box sx={{ bgcolor: "#020617", minHeight: "100vh", pb: 10 }}>
      {/* HEADER BAR */}
      <Paper elevation={0} sx={{ bgcolor: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.1)", py: 3, mb: 5 }}>
        <Container maxWidth="xl">
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="overline" sx={{ color: "#ef4444", fontWeight: 900, letterSpacing: 2 }}>ADMIN PANEL</Typography>
              <Typography variant="h4" sx={{ color: "white", fontWeight: 900 }}>PHOTO <span style={{ color: "#ef4444" }}>HISTORY</span></Typography>
            </Box>
            <Button 
              variant="outlined" 
              color="inherit" 
              startIcon={<RefreshIcon />} 
              onClick={fetchPhotos}
              sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.2)' }}
            >
              Refresh
            </Button>
          </Stack>
        </Container>
      </Paper>

      <Container maxWidth="xl">
        {error && (
          <Box sx={{ bgcolor: "rgba(239, 68, 68, 0.1)", p: 2, borderRadius: 2, mb: 4, border: "1px solid #ef4444" }}>
            <Typography color="#ef4444">⚠️ {error}</Typography>
          </Box>
        )}

        {data.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 10, border: '2px dashed rgba(255,255,255,0.1)', borderRadius: 4 }}>
            <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '1.2rem' }}>No verification records found in database.</Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {data.map((item) => (
              <Grid item xs={12} md={6} lg={4} key={item.id}>
                <Card sx={{ 
                  bgcolor: "#1e293b", 
                  color: "white", 
                  borderRadius: 4, 
                  overflow: 'hidden',
                  border: item.status === 'APPROVED' ? '1px solid #22c55e' : '1px solid rgba(255,255,255,0.1)',
                  transition: '0.3s',
                  '&:hover': { transform: 'translateY(-5px)' }
                }}>
                  {/* IMAGE SECTION */}
                  <Box sx={{ position: 'relative', height: 260 }}>
                    <CardMedia
                      component="img"
                      height="260"
                      image={`${API_BASE}/uploads/${item.verification_photo}`}
                      alt="Check-in Proof"
                      sx={{ filter: item.status === 'REJECTED' ? 'grayscale(1)' : 'none' }}
                      onError={(e: any) => e.target.src = "https://via.placeholder.com/400x300?text=Image+Not+Found"}
                    />
                    <IconButton 
                      href={`${API_BASE}/uploads/${item.verification_photo}`} 
                      target="_blank"
                      sx={{ position: 'absolute', top: 10, right: 10, bgcolor: 'rgba(0,0,0,0.5)', color: 'white', '&:hover': { bgcolor: '#000' } }}
                    >
                      <OpenInNewIcon fontSize="small" />
                    </IconButton>
                    
                    <Stack direction="row" spacing={1} sx={{ position: 'absolute', bottom: 10, left: 10 }}>
                      <Chip 
                        label={item.status} 
                        size="small" 
                        sx={{ fontWeight: 900, bgcolor: item.status === 'APPROVED' ? '#22c55e' : '#f97316', color: 'white' }} 
                      />
                      {item.is_late === 1 && <Chip label="LATE" size="small" color="error" sx={{ fontWeight: 900 }} />}
                    </Stack>
                  </Box>

                  {/* CONTENT SECTION */}
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight={900}>{item.coach_name || "Unknown Coach"}</Typography>
                    <Typography variant="body2" sx={{ color: "#ef4444", mb: 2, fontWeight: 700 }}>📍 {item.locationName || "Unknown Location"}</Typography>
                    
                    <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)', mb: 2 }} />
                    
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 3 }}>
                      <Box>
                        <Typography variant="caption" sx={{ opacity: 0.5 }}>Check-in Time</Typography>
                        <Typography variant="body2">{new Date(item.checkin_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="caption" sx={{ opacity: 0.5 }}>Session Date</Typography>
                        <Typography variant="body2">{new Date(item.session_date).toLocaleDateString()}</Typography>
                      </Box>
                    </Stack>

                    {/* ACTION BUTTONS */}
                    <Stack direction="row" spacing={2}>
                      <Button
                        fullWidth
                        variant={item.status === 'APPROVED' ? "contained" : "outlined"}
                        color="success"
                        disabled={btnLoading === item.id}
                        onClick={() => updateStatus(item.id, 'APPROVED')}
                        startIcon={<CheckCircleIcon />}
                        sx={{ borderRadius: 2, fontWeight: 800 }}
                      >
                        {item.status === 'APPROVED' ? "APPROVED" : "APPROVE"}
                      </Button>
                      <Button
                        fullWidth
                        variant={item.status === 'REJECTED' ? "contained" : "outlined"}
                        color="error"
                        disabled={btnLoading === item.id}
                        onClick={() => updateStatus(item.id, 'REJECTED')}
                        startIcon={<ErrorOutlineIcon />}
                        sx={{ borderRadius: 2, fontWeight: 800 }}
                      >
                        FLAG
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
}