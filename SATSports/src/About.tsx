import React from "react";
import { Box, Typography, Grid, Container } from "@mui/material";
import { motion } from "framer-motion";
import GroupsIcon from '@mui/icons-material/Groups';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import InsightsIcon from '@mui/icons-material/Insights';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';

// 1. Move styles to the top to avoid hoisting issues during build
const statNumberStyle = {
  fontWeight: 950,
  fontSize: { xs: '3.5rem', md: '4.5rem' },
  background: "linear-gradient(135deg,#f97316,#ef4444)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent"
};

const FEATURES = [
  { title: "Certified Coaches", icon: <GroupsIcon sx={{ fontSize: 40, color: "#ef4444" }} />, desc: "ITF and AITA certified professionals." },
  { title: "Performance Analytics", icon: <InsightsIcon sx={{ fontSize: 40, color: "#ef4444" }} />, desc: "Video analysis and swing data tracking." },
  { title: "Tournament Pathways", icon: <EmojiEventsIcon sx={{ fontSize: 40, color: "#ef4444" }} />, desc: "Clear routes from amateur to pro circuits." },
  { title: "Player Wellness", icon: <FitnessCenterIcon sx={{ fontSize: 40, color: "#ef4444" }} />, desc: "Focus on injury prevention and mental grit." }
];

const MotionBox = React.memo(motion(Box));

function About() {
  return (
    <Box sx={{ background: "#020617", color: "white", overflowX: "hidden" }}>

      {/* 🎥 HERO SECTION */}
      <Box sx={{ position: "relative", height: "75vh", display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          poster="/poster.jpg" // Ensure this is lowercase in your public folder
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "brightness(0.3)",
            willChange: "transform"
          }}
        >
          <source src="/tennis.mp4" type="video/mp4" />
        </video>

        <Container sx={{ position: "relative", zIndex: 2, textAlign: 'center' }}>
          <MotionBox
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Typography variant="overline" sx={{ color: "#ef4444", fontWeight: 900, letterSpacing: 4 }}>
              ESTABLISHED 2012
            </Typography>

            <Typography variant="h1" fontWeight={950}
              sx={{ fontSize: { xs: '3rem', md: '5.5rem' }, mb: 2 }}>
              THE ACADEMY <span style={{ color: "#ef4444" }}>LIFE</span>
            </Typography>

            <Typography variant="h6"
              sx={{ color: "rgba(255,255,255,0.7)", maxWidth: '700px', mx: 'auto' }}>
              Building world-class athletes through a fusion of traditional discipline and modern data analytics.
            </Typography>
          </MotionBox>
        </Container>
      </Box>

      {/* STATS SECTION */}
      <Box sx={{ py: 10, bgcolor: 'rgba(255,255,255,0.02)' }}>
        <Container>
          <Grid container justifyContent="center" spacing={4} textAlign="center">
            {[
              { value: "500+", label: "Players Trained" },
              { value: "20+", label: "Certified Coaches" },
              { value: "10+", label: "Premium Courts" }
            ].map((s, i) => (
              <Grid item xs={12} md={4} key={i}>
                <MotionBox whileHover={{ y: -5 }}>
                  <Typography variant="h2" sx={statNumberStyle}>{s.value}</Typography>
                  <Typography sx={{ color: "rgba(255,255,255,0.5)", fontWeight: 800 }}>
                    {s.label.toUpperCase()}
                  </Typography>
                </MotionBox>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* WHO WE ARE SECTION */}
      <Container sx={{ py: 15 }}>
        <Grid container spacing={8} alignItems="center">
          <Grid item xs={12} md={6}>
            <MotionBox
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <Typography variant="h3" fontWeight={900} mb={3}>WHO WE ARE</Typography>
              <Typography variant="h6" sx={{ color: "#ef4444", fontWeight: 700, mb: 2 }}>
                SAT Sports PVT LTD is India's fastest-growing tennis ecosystem.
              </Typography>
              <Typography sx={{ color: "rgba(255,255,255,0.6)", fontSize: '1.1rem', lineHeight: 1.8 }}>
                Champions are engineered through systematic training, relentless conditioning, and a community that breeds competition.
              </Typography>
            </MotionBox>
          </Grid>

          <Grid item xs={12} md={6}>
            <MotionBox
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.5 }}
              sx={{ borderRadius: 8, overflow: "hidden", boxShadow: '0 40px 80px rgba(0,0,0,0.6)' }}
            >
              <img
                src="/coach.jpg"
                loading="lazy"
                decoding="async"
                style={{ width: "100%", height: 500, objectFit: "cover" }}
                alt="Coaching Team"
              />
            </MotionBox>
          </Grid>
        </Grid>
      </Container>

      {/* CORE PILLARS SECTION */}
      <Container sx={{ py: 15 }}>
        <Typography variant="h3" textAlign="center" fontWeight={900} mb={8}>
          CORE PILLARS
        </Typography>
        <Grid container spacing={3}>
          {FEATURES.map((item, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <MotionBox
                whileHover={{ y: -10, bgcolor: 'rgba(255,255,255,0.08)' }}
                sx={{
                  p: 4, borderRadius: 6, bgcolor: "rgba(255,255,255,0.03)",
                  height: '100%', textAlign: 'center'
                }}
              >
                <Box mb={2}>{item.icon}</Box>
                <Typography fontWeight={800}>{item.title}</Typography>
                <Typography sx={{ color: "rgba(255,255,255,0.5)" }}>{item.desc}</Typography>
              </MotionBox>
            </Grid>
          ))}
        </Grid>
      </Container>

    </Box>
  );
}

export default React.memo(About);