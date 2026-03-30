import React, { useState, useEffect, useRef } from "react";
import {
  Box, Typography, Grid, Paper, Button, Stack, 
  Slider, Chip, Divider, IconButton, CircularProgress,
  useTheme, Alpha
} from "@mui/material";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import ReplayIcon from '@mui/icons-material/Replay';
import LockIcon from '@mui/icons-material/Lock';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import VerifiedIcon from '@mui/icons-material/Verified';
import API_BASE from "./api";

// Mock Pro Data (In a real app, this comes from your /api/pro-models)
const PRO_MODEL = {
  name: "Pro: Roger Federer",
  videoUrl: "https://example.com/fed-serve-model.mp4",
  stats: { elbow: 165, knee: 145, jump: "28cm" }
};

export default function PlayerPerformanceAI() {
  const [isLocked, setIsLocked] = useState(true);
  const [loading, setLoading] = useState(false);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(0.5); // Slow-mo default
  const [isPlaying, setIsPlaying] = useState(false);

  const playerVideoRef = useRef<HTMLVideoElement>(null);
  const proVideoRef = useRef<HTMLVideoElement>(null);

  // Sync Videos
  const togglePlay = () => {
    if (playerVideoRef.current && proVideoRef.current) {
      if (isPlaying) {
        playerVideoRef.current.pause();
        proVideoRef.current.pause();
      } else {
        playerVideoRef.current.play();
        proVideoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (e: any, newValue: number | number[]) => {
    const time = newValue as number;
    if (playerVideoRef.current && proVideoRef.current) {
      playerVideoRef.current.currentTime = time;
      proVideoRef.current.currentTime = time;
    }
  };

  const loadPlayerAnalysis = async () => {
    setLoading(true);
    try {
      // Endpoint that uses the python serve_analyzer logic
      const res = await fetch(`${API_BASE}/api/players/me/latest-analysis`);
      const data = await res.json();
      setAnalysisData(data);
    } catch (err) {
      console.error("Analysis load failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLocked) loadPlayerAnalysis();
  }, [isLocked]);

  return (
    <Box sx={containerStyle}>
      {/* HEADER */}
      <Stack direction="row" justifyContent="space-between" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight={900}>AI Video Analysis</Typography>
          <Typography color="text.secondary">Compare your biomechanics with world-class standards</Typography>
        </Box>
        <Chip 
          icon={<VerifiedIcon />} 
          label="Beta Phase" 
          color="primary" 
          variant="outlined" 
          sx={{ fontWeight: 800 }} 
        />
      </Stack>

      <Grid container spacing={4}>
        {/* LEFT: PLAYER VIDEO */}
        <Grid item xs={12} md={6}>
          <Paper sx={videoPaperStyle}>
            <Typography variant="subtitle2" sx={videoLabelStyle}>YOUR RECENT SERVE</Typography>
            <video 
                ref={playerVideoRef}
                src="https://example.com/user-upload-video.mp4" 
                style={{ width: '100%', borderRadius: '12px' }} 
                muted
                loop
            />
            {/* AI OVERLAY - Hypothetical canvas or SVG layer */}
            {!isLocked && (
               <Box sx={overlayTagStyle}>
                  <Typography variant="caption">ELBOW: 158°</Typography>
                  <Typography variant="caption">HIP: 162°</Typography>
               </Box>
            )}
          </Paper>
        </Grid>

        {/* RIGHT: PRO COMPARISON / LOCK SCREEN */}
        <Grid item xs={12} md={6}>
          <Paper sx={videoPaperStyle}>
            <Typography variant="subtitle2" sx={videoLabelStyle}>{PRO_MODEL.name}</Typography>
            
            {isLocked ? (
              <Box sx={lockOverlayStyle}>
                <LockIcon sx={{ fontSize: 60, mb: 2, color: '#94a3b8' }} />
                <Typography variant="h6" fontWeight={800}>Premium Analysis Locked</Typography>
                <Typography variant="body2" sx={{ mb: 3, opacity: 0.8 }}>
                  Enable Dartfish-style Pro comparison and skeletal tracking for your child.
                </Typography>
                <Button 
                    variant="contained" 
                    onClick={() => setIsLocked(false)}
                    sx={upgradeBtnStyle}
                >
                    Unlock Pro Feature
                </Button>
              </Box>
            ) : (
              <video 
                ref={proVideoRef}
                src={PRO_MODEL.videoUrl} 
                style={{ width: '100%', borderRadius: '12px' }} 
                muted
                loop
              />
            )}
          </Paper>
        </Grid>

        {/* CONTROLS */}
        <Grid item xs={12}>
          <Paper sx={controlsBarStyle}>
            <Stack direction="row" spacing={3} alignItems="center">
              <IconButton onClick={togglePlay} sx={playIconStyle}>
                {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
              </IconButton>
              
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" fontWeight={800}>FRAME SYNCHRONIZER</Typography>
                <Slider 
                  size="small" 
                  defaultValue={0} 
                  max={5} // Video length in seconds
                  step={0.01}
                  onChange={handleSeek}
                />
              </Box>

              <Stack direction="row" spacing={1}>
                {[0.25, 0.5, 1].map((speed) => (
                   <Button 
                    key={speed}
                    size="small"
                    variant={playbackSpeed === speed ? "contained" : "outlined"}
                    onClick={() => {
                        setPlaybackSpeed(speed);
                        if(playerVideoRef.current) playerVideoRef.current.playbackRate = speed;
                        if(proVideoRef.current) proVideoRef.current.playbackRate = speed;
                    }}
                    sx={{ minWidth: 45, borderRadius: 2 }}
                   >
                    {speed}x
                   </Button>
                ))}
              </Stack>
            </Stack>
          </Paper>
        </Grid>

        {/* FEEDBACK DATA (Enabled after unlock) */}
        {!isLocked && (
          <Grid item xs={12}>
            <Fade in>
                <Card sx={analysisCardStyle}>
                    <CardContent>
                        <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                            <AnalyticsIcon color="primary" />
                            <Typography variant="h6" fontWeight={800}>AI Biometric Report</Typography>
                        </Stack>
                        <Divider sx={{ mb: 2 }} />
                        <Grid container spacing={3}>
                            <Grid item xs={4}>
                                <Typography variant="caption" color="text.secondary">SIMILARITY SCORE</Typography>
                                <Typography variant="h4" fontWeight={900}>84%</Typography>
                            </Grid>
                            <Grid item xs={4}>
                                <Typography variant="caption" color="text.secondary">KEY IMPROVEMENT</Typography>
                                <Typography variant="body1" fontWeight={700} color="error.main">Knee Bend Deficiency</Typography>
                            </Grid>
                            <Grid item xs={4}>
                                <Button fullWidth variant="outlined" startIcon={<FileDownloadIcon />}>
                                    Download PDF Report
                                </Button>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            </Fade>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}

// --- STYLING ---
const containerStyle = { p: { xs: 2, md: 8 }, background: "#f8fafc", minHeight: "100vh" };
const videoPaperStyle = { p: 2, borderRadius: 4, position: 'relative', bgcolor: 'white', border: '1px solid #e2e8f0', boxShadow: 'none' };
const videoLabelStyle = { fontWeight: 900, mb: 1.5, color: '#64748b', fontSize: '0.7rem', letterSpacing: '1px' };
const controlsBarStyle = { p: 3, borderRadius: 4, bgcolor: '#1e293b', color: 'white' };
const lockOverlayStyle = { 
    height: 300, display: 'flex', flexDirection: 'column', 
    alignItems: 'center', justifyContent: 'center', textAlign: 'center', p: 4 
};
const upgradeBtnStyle = { 
    borderRadius: 2.5, fontWeight: 900, px: 4, py: 1.5, 
    background: 'linear-gradient(135deg, #6366f1, #a855f7)',
    textTransform: 'none'
};
const overlayTagStyle = {
    position: 'absolute', top: 40, left: 30, display: 'flex', 
    flexDirection: 'column', gap: 1, bgcolor: 'rgba(0,0,0,0.6)', 
    p: 1.5, borderRadius: 2, color: 'white'
};
const playIconStyle = { bgcolor: '#3b82f6', color: 'white', '&:hover': { bgcolor: '#2563eb' } };
const analysisCardStyle = { borderRadius: 4, border: '1px solid #e2e8f0', boxShadow: 'none' };