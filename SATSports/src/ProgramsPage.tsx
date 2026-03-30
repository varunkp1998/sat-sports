import { useEffect, useState } from "react";
import { Box, Typography, Grid, Button, Stack, Chip, Divider } from "@mui/material";
import { motion } from "framer-motion";
import API_BASE from "./api";

const MotionBox = motion(Box);

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<any[]>([]);

  useEffect(() => {
    // Fetch programs and their subcategories in one go or chain them
    fetch(`${API_BASE}/api/programs`)
      .then(res => res.json())
      .then(async (data) => {
        // Fetch subcategories for each program to show levels (Red Ball, etc.)
        const detailedPrograms = await Promise.all(data.map(async (p: any) => {
          const subRes = await fetch(`${API_BASE}/api/programs/${p.id}/subcategories`);
          const subData = await subRes.json();
          return { ...p, subcategories: subData };
        }));
        setPrograms(detailedPrograms);
      });
  }, []);

  const grouped: any = {};
  programs.forEach(p => {
    const cat = p.category || "General Training";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(p);
  });

  return (
    <Box sx={{ background: "#020617", color: "white", minHeight: "100vh" }}>
      
      {/* 🏆 HERO SECTION */}
      <Box sx={{
        height: "45vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        textAlign: "center",
        background: "linear-gradient(rgba(2, 6, 23, 0.7), rgba(2, 6, 23, 0.9)), url('https://images.unsplash.com/photo-1595435064212-362637875503?auto=format&fit=crop&q=80') center/cover"
      }}>
        <MotionBox initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <Typography variant="h2" fontWeight={900} sx={{ letterSpacing: -2 }}>
            TRAINING PROGRAMS
          </Typography>
          <Typography mt={1} variant="h6" sx={{ color: "rgba(255,255,255,0.6)", fontWeight: 400 }}>
            Professional Coaching for Every Stage of the Game
          </Typography>
        </MotionBox>
      </Box>

      <Box sx={{ px: { xs: 2, md: 10 }, py: 8 }}>
        {Object.keys(grouped).map((category) => (
          <Box key={category} mb={10}>
            
            <Typography variant="h4" fontWeight={900} mb={4} sx={{
              borderLeft: "6px solid #ef4444",
              pl: 2,
              textTransform: "uppercase",
              letterSpacing: 2
            }}>
              {category}
            </Typography>

            <Grid container spacing={4}>
              {grouped[category].map((p: any) => (
                <Grid item xs={12} md={6} lg={4} key={p.id}>
                  <MotionBox whileHover={{ y: -10 }} transition={{ duration: 0.3 }}>
                    <Box sx={{
                      borderRadius: 5,
                      background: "rgba(255,255,255,0.03)",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      overflow: "hidden",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column"
                    }}>
                      
                      <Box sx={{ p: 4, flexGrow: 1 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
                          <Typography variant="h5" fontWeight={900}>{p.title}</Typography>
                          <Chip label={`Ages ${p.min_age}-${p.max_age}`} size="small" 
                                sx={{ bgcolor: "#ef4444", color: "white", fontWeight: 700 }} />
                        </Stack>

                        <Typography color="rgba(255,255,255,0.5)" mb={3} fontSize="0.95rem">
                          {p.description}
                        </Typography>

                        <Divider sx={{ borderColor: "rgba(255,255,255,0.1)", mb: 2 }} />

                        {/* ⚡ SUB-CATEGORIES (STAGES) */}
                        <Typography variant="caption" fontWeight={800} color="primary" sx={{ letterSpacing: 1 }}>
                          AVAILABLE LEVELS
                        </Typography>
                        <Stack spacing={1} mt={1} mb={3}>
                          {p.subcategories?.map((sc: any) => (
                            <Box key={sc.id} sx={{ 
                              display: 'flex', 
                              justifyContent: 'space-between',
                              bgcolor: 'rgba(255,255,255,0.05)',
                              p: 1.5,
                              borderRadius: 2,
                              border: '1px solid rgba(255,255,255,0.05)'
                            }}>
                              <Typography variant="body2" fontWeight={700}>{sc.name}</Typography>
                              <Typography variant="caption" sx={{ opacity: 0.6 }}>
                                {sc.min_age ? `${sc.min_age}-${sc.max_age} yrs` : 'All Ages'}
                              </Typography>
                            </Box>
                          ))}
                        </Stack>
                      </Box>

                      {/* CTA BUTTON */}
                      <Box sx={{ p: 3, pt: 0 }}>
<Button
  fullWidth
  variant="contained"
  onClick={() => {
    // Redirect to registration page with Program ID as a query param
    window.location.href = `/register-player?programId=${p.id}&programName=${encodeURIComponent(p.title)}`;
  }}
  sx={{
    py: 1.5,
    borderRadius: 3,
    fontWeight: 800,
    background: "linear-gradient(135deg,#f97316,#ef4444)",
    boxShadow: "0 10px 20px rgba(239, 68, 68, 0.2)",
    "&:hover": { filter: "brightness(1.2)" }
  }}
>
  View Pricing & Register
</Button>
                      </Box>
                    </Box>
                  </MotionBox>
                </Grid>
              ))}
            </Grid>
          </Box>
        ))}
      </Box>

      {/* 🚀 FOOTER CTA */}
      <Box sx={{ py: 12, textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <Typography variant="h3" fontWeight={900} mb={1}>NOT SURE WHERE TO START?</Typography>
        <Typography variant="h6" color="gray" mb={4}>Book a free assessment with our head coach</Typography>
        <Button variant="outlined" sx={{ 
          color: "white", 
          borderColor: "white", 
          px: 6, 
          py: 2, 
          borderRadius: 999,
          fontWeight: 800,
          "&:hover": { bgcolor: "white", color: "black" }
        }}>
          Contact Head Coach
        </Button>
      </Box>
    </Box>
  );
}