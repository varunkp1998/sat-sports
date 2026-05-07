import { useEffect, useState, useMemo } from "react";
import { Box, Typography, Button, Grid, Container, Stack } from "@mui/material";
import { motion, useScroll, useTransform } from "framer-motion";
import SportsTennisIcon from '@mui/icons-material/SportsTennis';
import StarIcon from '@mui/icons-material/Star';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

// Static style objects to prevent re-creation on render
const heroStyles = {
  background: "#020617",
  color: "white",
  overflowX: 'hidden',
  "& *": { userSelect: 'none' }
};

export default function Home() {
  const [counts, setCounts] = useState({ players: 0, coaches: 0, courts: 0 });
  const { scrollYProgress } = useScroll();
  const yRange = useTransform(scrollYProgress, [0, 0.5], [0, -100]);

  // 🚀 Hyper-Efficient Counter
  useEffect(() => {
    let start = 0;
    const duration = 1500;
    const animate = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      
      setCounts({
        players: Math.floor(progress * 500),
        coaches: Math.floor(progress * 20),
        courts: Math.floor(progress * 10)
      });

      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, []);

  const sections = useMemo(() => [
    { 
      title: "Elite Coaching", 
      desc: "Train with certified ITF professionals who have shaped national champions.", 
      img: "/coach.jpg",
      icon: <StarIcon sx={{ color: '#ef4444' }} /> 
    },
    { 
      title: "Modern Infrastructure", 
      desc: "Experience premium synthetic and clay courts equipped with tournament-grade lighting.", 
      img: "/court.jpg",
      icon: <SportsTennisIcon sx={{ color: '#ef4444' }} /> 
    },
    { 
      title: "Performance Tracking", 
      desc: "Data-driven insights to monitor your swing speed and accuracy.", 
      img: "/training.jpg",
      icon: <QueryStatsIcon sx={{ color: '#ef4444' }} /> 
    }
  ], []);

  return (
    <Box sx={heroStyles}>
      {/* 🎾 HERO SECTION */}
      <Box sx={{ position: "relative", height: "100vh", overflow: 'hidden' }}>
        <motion.div style={{ y: yRange, height: '120%', willChange: 'transform' }}>
          <video 
            autoPlay 
            muted 
            loop 
            playsInline 
            poster="/hero-fallback.jpg" // Speed optimization: shows before video loads
            style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.3)" }}
          >
            <source src="/tennis.mp4" type="video/mp4" />
          </video>
        </motion.div>

        <Container sx={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", alignItems: "center", zIndex: 2 }}>
          <Box maxWidth="800px">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <Typography variant="h1" fontWeight={950} sx={{ fontSize: { xs: '3.2rem', md: '5.5rem' }, lineHeight: 1, mb: 2 }}>
                BEYOND <br /> <span style={{ color: "#ef4444" }}>THE COURT.</span>
              </Typography>
              <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.6)', mb: 4, maxWidth: '550px', fontWeight: 400 }}>
                Join India's premier tennis academy. Expert coaching and world-class technology.
              </Typography>
              <Stack direction={{xs: "column", sm: "row"}} spacing={2}>
                <Button variant="contained" endIcon={<ArrowForwardIcon />} sx={heroButtonStyle}>Join Academy</Button>
                <Button variant="outlined" sx={outlineButtonStyle}>Explore Courts</Button>
              </Stack>
            </motion.div>
          </Box>
        </Container>
      </Box>

      {/* 📊 STATS STRIP */}
      <Box sx={{ py: 8, bgcolor: '#020617', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <Container>
          <Grid container spacing={4}>
            {[
              { label: "Active Players", value: `${counts.players}+` },
              { label: "Expert Coaches", value: `${counts.coaches}+` },
              { label: "Premium Courts", value: `${counts.courts}+` }
            ].map((s, i) => (
              <Grid item xs={12} md={4} key={i} sx={{ textAlign: 'center' }}>
                <Typography variant="h2" sx={statNumberStyle}>{s.value}</Typography>
                <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.4)", fontWeight: 800, letterSpacing: 2 }}>
                  {s.label.toUpperCase()}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* 🔄 ZIG-ZAG SECTIONS (Optimized Viewport) */}
      <Container sx={{ py: 10 }}>
        {sections.map((sec, i) => (
          <Grid container key={i} spacing={8} alignItems="center" sx={{ mb: 12, flexDirection: i % 2 === 0 ? "row" : "row-reverse" }}>
            <Grid item xs={12} md={6}>
              <motion.div 
                initial={{ opacity: 0, y: 30 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true, margin: "-100px" }}
                style={{ borderRadius: '24px', overflow: 'hidden', height: 400, background: '#0f172a' }}
              >
                <img src={sec.img} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} alt={sec.title} />
              </motion.div>
            </Grid>
            <Grid item xs={12} md={6}>
              <Stack spacing={2}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  {sec.icon}
                  <Typography variant="overline" sx={{ color: "#ef4444", fontWeight: 900 }}>ADVANTAGE</Typography>
                </Stack>
                <Typography variant="h3" fontWeight={900}>{sec.title}</Typography>
                <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.5)", lineHeight: 1.8 }}>{sec.desc}</Typography>
                <Button variant="text" sx={{ color: '#ef4444', fontWeight: 900, alignSelf: 'start', p: 0 }}>LEARN MORE —</Button>
              </Stack>
            </Grid>
          </Grid>
        ))}
      </Container>

      {/* 🔥 FAST FINAL CTA */}
      <Box sx={{ py: 15, textAlign: "center", background: 'radial-gradient(circle at center, rgba(239, 68, 68, 0.05) 0%, transparent 70%)' }}>
        <Container>
          <Typography variant="h2" fontWeight={950} mb={2} sx={{ fontSize: {xs: '2.5rem', md: '4rem'} }}>READY TO STEP UP?</Typography>
          <Button variant="contained" sx={heroButtonStyle}>START TRAINING NOW</Button>
        </Container>
      </Box>
    </Box>
  );
}

// 🎨 HIGH-PERFORMANCE CSS
const heroButtonStyle = {
  px: 5, py: 1.8, borderRadius: 3, fontWeight: 900, fontSize: '1rem',
  background: "linear-gradient(135deg,#f97316,#ef4444)",
  boxShadow: "0 10px 30px rgba(239, 68, 68, 0.3)",
  "&:hover": { transform: "translateY(-2px)", boxShadow: "0 15px 40px rgba(239, 68, 68, 0.4)" },
  transition: "all 0.2s ease-out"
};

const outlineButtonStyle = {
  px: 5, py: 1.8, borderRadius: 3, fontWeight: 900,
  borderColor: 'rgba(255,255,255,0.2)', color: 'white',
  "&:hover": { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.05)' }
};

const statNumberStyle = {
  fontWeight: 950, fontSize: { xs: '3.5rem', md: '5rem' }, lineHeight: 1,
  color: "#ef4444", // Solid color is faster to render than gradients
};