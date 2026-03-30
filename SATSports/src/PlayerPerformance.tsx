import React, { useState } from "react";
import {
  Box, Typography, Grid, Card, CardContent, Button, Stack, 
  LinearProgress, List, ListItem, ListItemIcon, ListItemText,
  Paper, Divider, Alert, CircularProgress
} from "@mui/material";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InsightsIcon from '@mui/icons-material/Insights';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';

export default function PlayerPerformance() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileUpload = (event: any) => {
    setUploading(true);
    // Simulate upload progress
    let timer = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress === 100) {
          clearInterval(timer);
          setUploading(false);
          return 100;
        }
        return Math.min(oldProgress + 10, 100);
      });
    }, 400);
  };

  return (
    <Box>
      <Box mb={4}>
        <Typography variant="h4" fontWeight={900} letterSpacing="-1.5px">AI Performance Lab</Typography>
        <Typography variant="body2" color="text.secondary">Upload your practice videos for biomechanical serve analysis</Typography>
      </Box>

      <Grid container spacing={4}>
        {/* LEFT: UPLOAD & SAMPLE */}
        <Grid item xs={12} md={7}>
          <Card sx={glassCardStyle}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" fontWeight={800} mb={1}>Analyze New Serve</Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                For best results, record from the side-view at 60fps.
              </Typography>

              <Box sx={uploadZoneStyle}>
                {uploading ? (
                  <Box textAlign="center" width="100%">
                    <CircularProgress variant="determinate" value={progress} sx={{ mb: 2 }} />
                    <Typography variant="h6">{progress}% Processing...</Typography>
                    <Typography variant="caption" color="text.secondary">AI is calculating joint angles...</Typography>
                  </Box>
                ) : (
                  <>
                    <CloudUploadIcon sx={{ fontSize: 48, color: '#6366f1', mb: 2 }} />
                    <Button variant="contained" component="label" sx={primaryBtnStyle}>
                      Select Video
                      <input type="file" hidden accept="video/*" onChange={handleFileUpload} />
                    </Button>
                    <Typography variant="caption" sx={{ mt: 2, color: 'text.secondary' }}>
                      Supported formats: MP4, MOV (Max 50MB)
                    </Typography>
                  </>
                )}
              </Box>

              <Divider sx={{ my: 4 }}>OR</Divider>

              <Box>
                <Typography variant="subtitle1" fontWeight={700} mb={2}>See How it Works</Typography>
                <Paper sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 3, border: '1px dashed #cbd5e1' }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Stack direction="row" spacing={2} alignItems="center">
                      <PlayCircleOutlineIcon color="primary" />
                      <Box>
                        <Typography variant="body2" fontWeight={700}>Sample_Analysis_Pro.mp4</Typography>
                        <Typography variant="caption" color="text.secondary">Watch AI detect knee flex and hip drive</Typography>
                      </Box>
                    </Stack>
                    <Button size="small" variant="outlined" sx={{ borderRadius: 2 }}>Preview</Button>
                  </Stack>
                </Paper>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* RIGHT: ANALYSIS LOGS */}
        <Grid item xs={12} md={5}>
          <Typography variant="h6" fontWeight={800} mb={2} display="flex" alignItems="center">
            <InsightsIcon sx={{ mr: 1, color: '#6366f1' }} /> Recent Reports
          </Typography>
          
          <Stack spacing={2}>
            {[
              { date: 'Oct 24, 2025', score: '8.4/10', status: 'Improved' },
              { date: 'Oct 10, 2025', score: '7.2/10', status: 'Stable' },
            ].map((report, i) => (
              <Card key={i} sx={{ borderRadius: 3, boxShadow: 'none', border: '1px solid #e2e8f0' }}>
                <CardContent sx={{ py: 2 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="caption" fontWeight={800} color="text.secondary">{report.date}</Typography>
                      <Typography variant="body1" fontWeight={700}>Serve Performance Index</Typography>
                    </Stack>
                    <Box textAlign="right">
                      <Typography variant="h6" fontWeight={900} color="#6366f1">{report.score}</Typography>
                      <Chip label={report.status} size="small" sx={{ fontSize: '10px', height: 18, bgcolor: '#eff6ff' }} />
                    </Box>
                  </Stack>
                  <Button 
                    fullWidth 
                    size="small" 
                    startIcon={<PictureAsPdfIcon />} 
                    sx={{ mt: 2, justifyContent: 'start', color: '#64748b' }}
                  >
                    Download Analysis PDF
                  </Button>
                </CardContent>
              </Card>
            ))}
            
            <Alert severity="info" sx={{ borderRadius: 3 }}>
              Upgrade to <b>Pro Plan</b> to unlock Side-by-Side comparison with Pro Players.
            </Alert>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}

// --- STYLING ---
const glassCardStyle = { borderRadius: 5, border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', bgcolor: 'white' };
const uploadZoneStyle = { 
  height: 200, 
  border: '2px dashed #e2e8f0', 
  borderRadius: 4, 
  display: 'flex', 
  flexDirection: 'column', 
  alignItems: 'center', 
  justifyContent: 'center',
  bgcolor: '#f8fafc',
  transition: '0.3s',
  '&:hover': { bgcolor: '#eff6ff', borderColor: '#6366f1' }
};
const primaryBtnStyle = { px: 4, borderRadius: 2.5, fontWeight: 900, textTransform: 'none', background: 'linear-gradient(135deg, #2563eb, #4f46e5)' };