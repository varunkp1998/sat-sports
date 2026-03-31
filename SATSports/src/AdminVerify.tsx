import React, { useEffect, useState } from "react";
import {
  Box, Typography, Grid, Card, CardContent, CardMedia, 
  Button, Chip, Stack, CircularProgress, Container, 
  IconButton, Paper, Alert
} from "@mui/material";
import RefreshIcon from '@mui/icons-material/Refresh';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BlockIcon from '@mui/icons-material/Block';

// --- CONFIG ---
const API_BASE = "https://sat-sports.onrender.com";

interface PhotoRecord {
  id: number;
  coach_name: string | null;
  session_date: string;
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
  const [actionId, setActionId] = useState<number | null>(null);

  const fetchPhotos = async () => {
    setLoading(true);
    setError(null);
    try {
      // mode: 'cors' and specific headers prevent CORB blocks
      const response = await fetch(`${API_BASE}/api/admin/checkins/all-photos`, {
        method: 'GET',
        mode: 'cors',
        headers: { 'Accept': 'application/json' }
      });
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const json = await response.json();
      
      // Ensure data is an array before setting state
      setData(Array.isArray(json) ? json : []);
    } catch (err: any) {
      console.error("API Error:", err);
      setError("Connection Blocked (CORB) or Backend Offline.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

  const handleStatus = async (id: number, status: string) => {
    setActionId(id);
    try {
      const res = await fetch(`${API_BASE}/api/admin/checkin/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });
      if (res.ok) {
        setData(prev => prev.map(item => item.id === id ? { ...item, status: status as any } : item));
      }
    } catch (err) {
      alert("Update failed");
    } finally {
      setActionId(null);
    }
  };

  if (loading) return (
    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#020617', color: 'white' }}>
      <CircularProgress color="error" />
      <Typography sx={{ mt: 2, opacity: 0.5 }}>Loading SAT Sports Records...</Typography>
    </Box>
  );

  return (
    <Box sx={{ bgcolor: "#020617", minHeight: "100vh", pb: 10 }}>
      {/* HEADER */}
      <Paper elevation={0} sx={{ bgcolor: "rgba(255,255,255,0.02)", borderBottom: "1px solid rgba(255,255,255,0.05)", py: 3, mb: 4 }}>
        <Container maxWidth="xl">
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h4" sx={{ color: "white", fontWeight: 900 }}>
                PHOTO <span style={{ color: "#ef4444" }}>VERIFICATIONS</span>
              </Typography>
            </Box>
            <IconButton onClick={fetchPhotos} sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.05)' }}>
              <RefreshIcon />
            </IconButton>
          </Stack>
        </Container>
      </Paper>

      <Container maxWidth="xl">
        {error && <Alert severity="error" sx={{ mb: 4, bgcolor: '#450a0a', color: '#fca5a5' }}>{error}</Alert>}

        {data.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 10, color: 'rgba(255,255,255,0.3)', border: '1px dashed #334155', borderRadius: 4 }}>
            <Typography>No photo records found.</Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {data.map((item) => (
              <Grid item xs={12} md={6} lg={4} key={item.id}>
                <Card sx={{ 
                  bgcolor: "#0f172a", 
                  color: "white", 
                  borderRadius: 3, 
                  border: item.status === 'APPROVED' ? '1px solid #22c55e44' : '1px solid #334155' 
                }}>
                  <Box sx={{ position: 'relative' }}>
                    <CardMedia
                      component="img"
                      height="240"
                      image={`${API_BASE}/uploads/${item.verification_photo}`}
                      alt="Proof"
                      sx={{ filter: item.status === 'REJECTED' ? 'grayscale(1) opacity(0.5)' : 'none' }}
                      onError={(e: any) => e.target.src = "https://via.placeholder.com/400x300?text=Image+Missing"}
                    />
                    <Chip 
                      label={item.status} 
                      size="small" 
                      sx={{ position: 'absolute', top: 12, left: 12, fontWeight: 900, bgcolor: item.status === 'APPROVED' ? '#22c55e' : '#f59e0b', color: 'white' }} 
                    />
                  </Box>

                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight={800}>{item.coach_name || "Unknown Coach"}</Typography>
                    <Typography variant="body2" color="#ef4444" sx={{ mb: 2, fontWeight: 700 }}>📍 {item.locationName}</Typography>
                    
                    <Stack direction="row" spacing={2}>
                      <Button
                        fullWidth
                        variant={item.status === 'APPROVED' ? "contained" : "outlined"}
                        color="success"
                        disabled={actionId === item.id}
                        onClick={() => handleStatus(item.id, 'APPROVED')}
                        startIcon={<CheckCircleIcon />}
                        sx={{ borderRadius: 2, fontWeight: 700 }}
                      >
                        Approve
                      </Button>
                      <Button
                        fullWidth
                        variant={item.status === 'REJECTED' ? "contained" : "outlined"}
                        color="error"
                        disabled={actionId === item.id}
                        onClick={() => handleStatus(item.id, 'REJECTED')}
                        startIcon={<BlockIcon />}
                        sx={{ borderRadius: 2, fontWeight: 700 }}
                      >
                        Reject
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