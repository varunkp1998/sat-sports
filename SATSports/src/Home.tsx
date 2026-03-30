import { Box, Typography, Button, Grid, Container, Stack } from "@mui/material";
import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import SportsTennisIcon from '@mui/icons-material/SportsTennis';
import StarIcon from '@mui/icons-material/Star';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const MotionBox = motion(Box);
const MotionTypography = motion(Typography);

export default function Home() {
  const [counts, setCounts] = useState({ players: 0, coaches: 0, courts: 0 });
  const scrollRef = useRef(null);
  const { scrollYProgress } = useScroll();
  const yRange = useTransform(scrollYProgress, [0, 1], [0, -200]);

  // 🔥 Smooth Stat Counter
  useEffect(() => {
    const duration = 2000; // 2 seconds
    const start = Date.now();
    
    const timer = setInterval(() => {
      const timePassed = Date.now() - start;
      const progress = Math.min(timePassed / duration, 1);
      
      setCounts({
        players: Math.floor(progress * 500),
        coaches: Math.floor(progress * 20),
        courts: Math.floor(progress * 10)
      });

      if (progress === 1) clearInterval(timer);
    }, 30);
    return () => clearInterval(timer);
  }, []);

  const sections = [
    { 
      title: "Elite Coaching", 
      desc: "Train with certified ITF professionals who have shaped national champions.", 
      img: "/coach.jpg", // ✅ Path relative to the public folder
      icon: <StarIcon sx={{ color: '#ef4444' }} /> 
    },
    { 
      title: "Modern Infrastructure", 
      desc: "Experience premium synthetic and clay courts equipped with tournament-grade lighting.", 
      img: "/court.jpg", // ✅ Path relative to the public folder
      icon: <SportsTennisIcon sx={{ color: '#ef4444' }} /> 
    },
    { 
      title: "Performance Tracking", 
      desc: "Data-driven insights to monitor your swing speed, accuracy, and physical endurance.", 
      img: "/training.jpg", // ✅ Path relative to the public folder
      icon: <QueryStatsIcon sx={{ color: '#ef4444' }} /> 
    }
  ];

  return (
    <Box sx={{ background: "#020617", color: "white", overflowX: 'hidden' }}>

      {/* 🎾 HERO SECTION */}
      <Box sx={{ position: "relative", height: "100vh", overflow: 'hidden' }}>
        <MotionBox style={{ y: yRange }} sx={{ position: "absolute", inset: 0 }}>
          <video autoPlay muted loop playsInline style={{ width: "100%", height: "120%", objectFit: "cover", filter: "brightness(0.4)" }}>
            <source src="/tennis.mp4" type="video/mp4" />
          </video>
        </MotionBox>

        <Container sx={{ position: "relative", zIndex: 2, height: "100%", display: "flex", alignItems: "center" }}>
          <Box maxWidth="800px">
            <MotionBox initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1 }}>
              <Typography variant="h1" fontWeight={950} sx={{ fontSize: { xs: '3.5rem', md: '6rem' }, lineHeight: 1, mb: 2 }}>
                BEYOND <br /> <span style={{ color: "#ef4444" }}>THE COURT.</span>
              </Typography>
              <Typography variant="h5" sx={{ color: 'rgba(255,255,255,0.7)', mb: 4, maxWidth: '600px' }}>
                Join India's premier tennis academy. Expert coaching, world-class facilities, and a community of champions.
              </Typography>
              <Stack direction="row" spacing={2}>
                <Button variant="contained" endIcon={<ArrowForwardIcon />} sx={heroButtonStyle}>
                  Join Academy
                </Button>
                <Button variant="outlined" sx={outlineButtonStyle}>
                  Explore Courts
                </Button>
              </Stack>
            </MotionBox>
          </Box>
        </Container>
      </Box>

      {/* 📊 STATS STRIP */}
      <Box sx={{ py: 10, bgcolor: '#020617', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <Container>
          <Grid container justifyContent="space-between" spacing={4}>
            {[
              { label: "Active Players", value: counts.players + "+" },
              { label: "Expert Coaches", value: counts.coaches + "+" },
              { label: "Premium Courts", value: counts.courts + "+" }
            ].map((s, i) => (
              <Grid item xs={12} md={4} key={i} sx={{ textAlign: 'center' }}>
                <MotionBox whileInView={{ scale: [0.9, 1], opacity: [0, 1] }}>
                  <Typography variant="h2" sx={statNumberStyle}>{s.value}</Typography>
                  <Typography variant="subtitle1" sx={{ color: "rgba(255,255,255,0.5)", fontWeight: 700, letterSpacing: 2 }}>
                    {s.label.toUpperCase()}
                  </Typography>
                </MotionBox>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* 🔄 ZIG-ZAG SECTIONS */}
      <Container sx={{ py: 10 }}>
        {sections.map((sec, i) => (
          <Grid container key={i} spacing={8} alignItems="center" sx={{ mb: 15, flexDirection: i % 2 === 0 ? "row" : "row-reverse" }}>
            <Grid item xs={12} md={6}>
              <MotionBox initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }}
                sx={{ borderRadius: 8, overflow: "hidden", boxShadow: '0 50px 100px -20px rgba(0,0,0,0.5)', height: 450 }}>
                <img src={sec.img} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt={sec.title} />
              </MotionBox>
            </Grid>
            <Grid item xs={12} md={6}>
              <MotionBox initial={{ opacity: 0, x: i % 2 === 0 ? 50 : -50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
                <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                  {sec.icon}
                  <Typography variant="overline" sx={{ color: "#ef4444", fontWeight: 900, letterSpacing: 2 }}>OUR ADVANTAGE</Typography>
                </Stack>
                <Typography variant="h3" fontWeight={900} mb={2}>{sec.title}</Typography>
                <Typography variant="h6" sx={{ color: "rgba(255,255,255,0.6)", mb: 4, fontWeight: 400 }}>{sec.desc}</Typography>
                <Button variant="text" sx={{ color: 'white', fontWeight: 900, '&:hover': { color: '#ef4444' } }}>LEARN MORE —</Button>
              </MotionBox>
            </Grid>
          </Grid>
        ))}
      </Container>

      {/* 🚀 FEATURE GRID */}
      <Box sx={{ py: 15, background: 'linear-gradient(to bottom, #020617, #0f172a)' }}>
        <Container>
          <Typography variant="h3" textAlign="center" fontWeight={900} mb={8}>ELITE FEATURES</Typography>
          <Grid container spacing={4}>
            {["Expert Coaching", "Flexible Booking", "Match Practice", "Video Analysis", "Strength Training", "Youth Programs"].map((f, i) => (
              <Grid item xs={12} md={4} key={i}>
                <MotionBox whileHover={{ y: -10, bgcolor: 'rgba(255,255,255,0.08)' }}
                  sx={{ p: 5, borderRadius: 6, bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', transition: '0.3s' }}>
                  <Typography variant="h5" fontWeight={800} mb={2}>{f}</Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>Elevate your game with specialized tools and tailored sessions designed for competitive athletes.</Typography>
                </MotionBox>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* 🔥 FINAL CTA */}
      <Box sx={{ py: 20, textAlign: "center", position: 'relative' }}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '300px', height: '300px', bgcolor: '#ef4444', filter: 'blur(150px)', opacity: 0.1, zIndex: 0 }} />
        <Container sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h2" fontWeight={950} mb={2}>READY TO STEP UP?</Typography>
          <Typography variant="h5" mb={6} sx={{ color: 'rgba(255,255,255,0.6)' }}>Book your first session today and join the legacy.</Typography>
          <Button variant="contained" sx={heroButtonStyle}>START TRAINING NOW</Button>
        </Container>
      </Box>

    </Box>
  );
}

// 🎨 CUSTOM STYLES
const heroButtonStyle = {
  px: 6, py: 2, borderRadius: 4, fontWeight: 900, fontSize: '1.1rem',
  background: "linear-gradient(135deg,#f97316,#ef4444)",
  boxShadow: "0 15px 35px rgba(239, 68, 68, 0.4)",
  "&:hover": { transform: "scale(1.05)", filter: 'brightness(1.1)' },
  transition: "all 0.3s"
};

const outlineButtonStyle = {
  px: 6, py: 2, borderRadius: 4, fontWeight: 900, fontSize: '1.1rem',
  borderColor: 'rgba(255,255,255,0.3)', color: 'white',
  "&:hover": { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.05)' }
};

const statNumberStyle = {
  fontWeight: 950, fontSize: '4.5rem', lineHeight: 1,
  background: "linear-gradient(135deg,#f97316,#ef4444)",
  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
};