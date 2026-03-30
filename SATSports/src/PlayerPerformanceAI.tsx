import React, { useState } from "react";
import {
  Box, Typography, Grid, Card, CardContent, Button, Stack, 
  Paper, Divider, Alert, CircularProgress, Chip, IconButton
} from "@mui/material";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import CloseIcon from '@mui/icons-material/Close';
import PsychologyIcon from '@mui/icons-material/Psychology';
import InsightsIcon from '@mui/icons-material/Insights';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

export default function PlayerPerformanceAI() {
  const [uploading, setUploading] = useState(false);
  const [showSample, setShowSample] = useState(false);

  // --- SAMPLE DATA (Derived from your serve_analyzer.py & PDF) ---
  const sampleData = {
    title: "Pro Analysis: Contact Phase",
    metrics: [
      { label: "Elbow Angle", value: "176°", desc: "Full extension reached", color: "#10b981" },
      { label: "Hip Angle", value: "166°", desc: "Optimal power posture", color: "#10b981" },
      { label: "Knee Angle", value: "217°", desc: "Excellent vertical drive", color: "#6366f1" }
    ],
    feedback: [
      "Detected: Contact Phase",
      "Knee bend is providing maximum vertical thrust.",
      "Arm extension is within the 'Pro Range' (170°-180°).",
      "Hip opening is timed perfectly for torso rotation."
    ]
  };

  const handleFakeUpload = () => {
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      setShowSample(true); // After "upload", show the sample as the result
    }, 2000);
  };

  return (
    <Box sx={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* HEADER */}
      <Box mb={4}>
        <Typography variant="h4" fontWeight={900} sx={{ color: '#1e293b', letterSpacing: '-1px' }}>
          AI Performance Lab
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Upload serve videos to get biomechanical feedback using SAT Sports AI.
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* LEFT SIDE: UPLOAD & SAMPLE TOGGLE */}
        <Grid item xs={12} md={7}>
          {!showSample ? (
            <Card sx={cardStyle}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" fontWeight={800} mb={3}>Analyze Your Serve</Typography>
                
                <Box sx={uploadZoneStyle}>
                  {uploading ? (
                    <Box textAlign="center">
                      <CircularProgress size={50} sx={{ mb: 2, color: '#6366f1' }} />
                      <Typography variant="subtitle1" fontWeight={700}>AI Processing...</Typography>
                      <Typography variant="caption" color="text.secondary">Calculating joint angles & phase detection</Typography>
                    </Box>
                  ) : (
                    <>
                      <CloudUploadIcon sx={{ fontSize: 60, color: '#6366f1', mb: 2, opacity: 0.8 }} />
                      <Typography variant="body2" color="text.secondary" mb={3} textAlign="center">
                        Drag and drop your serve video here <br /> or click to browse.
                      </Typography>
                      <Button variant="contained" onClick={handleFakeUpload} sx={primaryBtnStyle}>
                        Upload & Analyze
                      </Button>
                    </>
                  )}
                </Box>

                <Divider sx={{ my: 4 }}>
                  <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700 }}>OR EXPERIENCE THE AI</Typography>
                </Divider>

                <Button 
                  fullWidth 
                  variant="outlined" 
                  startIcon={<PsychologyIcon />}
                  onClick={() => setShowSample(true)}
                  sx={{ py: 2, borderRadius: 3, fontWeight: 700, textTransform: 'none', borderColor: '#e2e8f0' }}
                >
                  Run "Pro Athlete" Sample Analysis
                </Button>
              </CardContent>
            </Card>
          ) : (
            /* --- THE ACTIVE SAMPLE REPORT --- */
            <Card sx={{ ...cardStyle, border: '2px solid #6366f1' }}>
              <CardContent sx={{ p: 4 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                  <Box>
                    <Chip label="PRO SAMPLE" color="primary" size="small" sx={{ fontWeight: 900, mb: 1 }} />
                    <Typography variant="h5" fontWeight={900}>{sampleData.title}</Typography>
                  </Box>
                  <IconButton onClick={() => setShowSample(false)} sx={{ bgcolor: '#f1f5f9' }}>
                    <CloseIcon />
                  </IconButton>
                </Stack>

                <Grid container spacing={2} mb={4}>
                  {sampleData.metrics.map((m, i) => (
                    <Grid item xs={4} key={i}>
                      <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', borderRadius: 3, bgcolor: '#f8fafc' }}>
                        <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ textTransform: 'uppercase' }}>{m.label}</Typography>
                        <Typography variant="h4" fontWeight={900} sx={{ color: m.color, my: 0.5 }}>{m.value}</Typography>
                        <Typography variant="caption" sx={{ fontSize: '10px', display: 'block' }}>{m.desc}</Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>

                <Box sx={{ p: 3, bgcolor: '#0f172a', borderRadius: 4, color: 'white', mb: 3 }}>
                  <Typography variant="overline" sx={{ color: '#6366f1', fontWeight: 900 }}>AI Coach Insights</Typography>
                  <Stack spacing={1.5} mt={1}>
                    {sampleData.feedback.map((text, i) => (
                      <Stack key={i} direction="row" spacing={1.5} alignItems="flex-start">
                        <CheckCircleOutlineIcon sx={{ fontSize: 18, color: '#10b981', mt: 0.3 }} />
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>{text}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Box>

                <Button variant="contained" fullWidth startIcon={<PictureAsPdfIcon />} sx={primaryBtnStyle}>
                  Download Sample PDF Report
                </Button>
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* RIGHT SIDE: EDUCATIONAL CONTENT */}
        <Grid item xs={12} md={5}>
          <Box sx={{ position: 'sticky', top: 20 }}>
            <Typography variant="h6" fontWeight={800} mb={3}>How our AI helps you</Typography>
            
            <Stack spacing={4}>
              <FeatureItem 
                icon={<InsightsIcon />} 
                title="Biomechanical Accuracy" 
                desc="Detects joint angles with 98% precision compared to manual video review." 
              />
              <FeatureItem 
                icon={<PlayCircleOutlineIcon />} 
                title="Phase Identification" 
                desc="Automatically separates Backswing, Loading, and Contact phases." 
              />
            </Stack>

            <Box mt={6} p={3} sx={{ bgcolor: '#eff6ff', borderRadius: 4, border: '1px solid #bfdbfe' }}>
              <Typography variant="subtitle2" fontWeight={800} color="#1e40af">Want this for your child?</Typography>
              <Typography variant="body2" color="#1e40af" sx={{ opacity: 0.8, mt: 1 }}>
                Individual AI analysis is available for Premium Plan subscribers. Enable it in settings.
              </Typography>
              <Button sx={{ mt: 2, fontWeight: 700, textTransform: 'none' }} color="primary">Contact Admin</Button>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}

// Sub-component for features
function FeatureItem({ icon, title, desc }: any) {
  return (
    <Stack direction="row" spacing={2.5}>
      <Box sx={{ width: 48, height: 48, borderRadius: 3, bgcolor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1' }}>
        {icon}
      </Box>
      <Box>
        <Typography variant="subtitle1" fontWeight={800}>{title}</Typography>
        <Typography variant="body2" color="text.secondary">{desc}</Typography>
      </Box>
    </Stack>
  );
}

// --- STYLES ---
const cardStyle = { borderRadius: 6, boxShadow: '0 10px 40px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0' };
const uploadZoneStyle = { 
  height: 220, border: '2px dashed #cbd5e1', borderRadius: 5, 
  display: 'flex', flexDirection: 'column', alignItems: 'center', 
  justifyContent: 'center', bgcolor: '#f8fafc', transition: '0.2s',
  '&:hover': { borderColor: '#6366f1', bgcolor: '#f5f7ff' }
};
const primaryBtnStyle = { 
  px: 4, py: 1.5, borderRadius: 3, fontWeight: 900, textTransform: 'none', 
  boxShadow: '0 8px 20px rgba(37, 99, 235, 0.2)',
  background: 'linear-gradient(135deg, #2563eb, #4f46e5)' 
};