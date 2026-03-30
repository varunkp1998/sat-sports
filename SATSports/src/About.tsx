import { Box, Typography, Grid, Button, Container, Stack, Divider } from "@mui/material";
import { motion } from "framer-motion";
import GroupsIcon from '@mui/icons-material/Groups';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import InsightsIcon from '@mui/icons-material/Insights';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';

const MotionBox = motion(Box);

export default function About() {
  const features = [
    { title: "Certified Coaches", icon: <GroupsIcon sx={{ fontSize: 40, color: "#ef4444" }} />, desc: "ITF and AITA certified professionals." },
    { title: "Performance Analytics", icon: <InsightsIcon sx={{ fontSize: 40, color: "#ef4444" }} />, desc: "Video analysis and swing data tracking." },
    { title: "Tournament Pathways", icon: <EmojiEventsIcon sx={{ fontSize: 40, color: "#ef4444" }} />, desc: "Clear routes from amateur to pro circuits." },
    { title: "Player Wellness", icon: <FitnessCenterIcon sx={{ fontSize: 40, color: "#ef4444" }} />, desc: "Focus on injury prevention and mental grit." }
  ];

  return (
    <Box sx={{ background: "#020617", color: "white", overflowX: "hidden" }}>

      {/* 🎥 HERO SECTION */}
      <Box sx={{ position: "relative", height: "75vh", display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <video
          autoPlay muted loop playsInline
          style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.3)" }}
        >
          <source src="/tennis.mp4" type="video/mp4" />
        </video>

        <Container sx={{ position: "relative", zIndex: 2, textAlign: 'center' }}>
          <MotionBox initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <Typography variant="overline" sx={{ color: "#ef4444", fontWeight: 900, letterSpacing: 4 }}>
              ESTABLISHED 2024
            </Typography>
            <Typography variant="h1" fontWeight={950} sx={{ fontSize: { xs: '3rem', md: '5.5rem' }, mb: 2 }}>
              THE ACADEMY <span style={{ color: "#ef4444" }}>LIFE</span>
            </Typography>
            <Typography variant="h6" sx={{ color: "rgba(255,255,255,0.7)", maxWidth: '700px', mx: 'auto' }}>
              Building world-class athletes through a fusion of traditional discipline and modern data analytics.
            </Typography>
          </MotionBox>
        </Container>
      </Box>

      {/* 🔥 WHO WE ARE: EDITORIAL LAYOUT */}
      <Container sx={{ py: 15 }}>
        <Grid container spacing={8} alignItems="center">
          <Grid item xs={12} md={6}>
            <MotionBox initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
              <Typography variant="h3" fontWeight={900} mb={3}>WHO WE ARE</Typography>
              <Typography variant="h6" sx={{ color: "#ef4444", fontWeight: 700, mb: 2 }}>
                SAT Sports PVT LTD is India's fastest-growing tennis ecosystem.
              </Typography>
              <Typography sx={{ color: "rgba(255,255,255,0.6)", fontSize: '1.1rem', lineHeight: 1.8, mb: 3 }}>
                We believe that champions aren't just born on the court—they are engineered through systematic training, 
                relentless physical conditioning, and a community that breeds competition.
              </Typography>
              <Typography sx={{ color: "rgba(255,255,255,0.6)", fontSize: '1.1rem', lineHeight: 1.8 }}>
                Our infrastructure is designed for high-performance training, offering everything from 
                synthetic match courts to smart tracking systems used by professional ATP/WTA players.
              </Typography>
            </MotionBox>
          </Grid>

          <Grid item xs={12} md={6}>
            <MotionBox whileHover={{ scale: 1.02 }} transition={{ duration: 0.5 }}
              sx={{ borderRadius: 8, overflow: "hidden", boxShadow: '0 40px 80px rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <img src="/coach.jpg" style={{ width: "100%", height: 500, objectFit: "cover" }} alt="Our Coaching Team" />
            </MotionBox>
          </Grid>
        </Grid>
      </Container>

      {/* 📊 STATS SECTION */}
      <Box sx={{ py: 10, bgcolor: 'rgba(255,255,255,0.02)', borderY: '1px solid rgba(255,255,255,0.05)' }}>
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
                  <Typography sx={{ color: "rgba(255,255,255,0.5)", fontWeight: 800, letterSpacing: 2 }}>{s.label.toUpperCase()}</Typography>
                </MotionBox>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* 🛡️ CORE PILLARS (FEATURES) */}
      <Container sx={{ py: 15 }}>
        <Typography variant="h3" textAlign="center" fontWeight={900} mb={8}>CORE PILLARS</Typography>
        <Grid container spacing={3}>
          {features.map((item, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <MotionBox whileHover={{ y: -10, bgcolor: 'rgba(255,255,255,0.08)' }}
                sx={{ 
                  p: 4, borderRadius: 6, bgcolor: "rgba(255,255,255,0.03)", 
                  border: "1px solid rgba(255,255,255,0.08)", height: '100%', 
                  transition: '0.3s', textAlign: 'center' 
                }}>
                <Box mb={2}>{item.icon}</Box>
                <Typography variant="h6" fontWeight={800} mb={1}>{item.title}</Typography>
                <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.5)" }}>{item.desc}</Typography>
              </MotionBox>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* 🖼️ PANORAMIC VISUAL */}
      <Box sx={{ px: { xs: 2, md: 10 }, mb: 15 }}>
        <MotionBox whileInView={{ opacity: [0, 1], scale: [0.95, 1] }} transition={{ duration: 1 }}
          sx={{ borderRadius: 10, overflow: "hidden", position: 'relative', height: 500 }}>
          <img src="/training.jpg" style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="Training in Action" />
          <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(2,6,23,0.8), transparent)' }} />
          <Typography variant="h4" sx={{ position: 'absolute', bottom: 40, left: 40, fontWeight: 900 }}>
            UNLEASH THE <br /> CHAMPION WITHIN.
          </Typography>
        </MotionBox>
      </Box>

      {/* 🚀 MISSION & CTA */}
      <Box sx={{ py: 15, textAlign: "center", bgcolor: "#0f172a" }}>
        <Container maxWidth="md">
          <Typography variant="h3" fontWeight={900} mb={3}>OUR MISSION</Typography>
          <Typography variant="h5" sx={{ color: "rgba(255,255,255,0.6)", mb: 6, lineHeight: 1.6 }}>
            "To cultivate an environment where discipline meets talent, turning athletic potential into 
            world-class dominance on the global tennis stage."
          </Typography>
          
          <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 10 }} />

          <Typography variant="h2" fontWeight={950} mb={4}>READY TO START?</Typography>
          <Button
            variant="contained"
            sx={{
              px: 8, py: 2, borderRadius: 4, fontWeight: 900, fontSize: '1.2rem',
              background: "linear-gradient(135deg,#f97316,#ef4444)",
              boxShadow: "0 15px 40px rgba(239, 68, 68, 0.4)",
              "&:hover": { transform: "scale(1.05)", filter: 'brightness(1.1)' },
              transition: '0.3s'
            }}
          >
            JOIN THE ACADEMY 🎾
          </Button>
        </Container>
      </Box>

    </Box>
  );
}

// 🎨 CUSTOM STYLES
const statNumberStyle = {
  fontWeight: 950, fontSize: { xs: '3.5rem', md: '4.5rem' }, lineHeight: 1,
  background: "linear-gradient(135deg,#f97316,#ef4444)",
  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
  mb: 1
};