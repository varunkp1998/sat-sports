import { Box, Typography, Grid, Button } from "@mui/material";
import { motion } from "framer-motion";

const MotionBox = motion(Box);

export default function About() {
  return (
    <Box sx={{ background: "#020617", color: "white" }}>

      {/* 🎥 HERO VIDEO */}
      <Box sx={{ position: "relative", height: "70vh" }}>
        <video
          autoPlay
          muted
          loop
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "brightness(0.5)"
          }}
        >
          <source src="/tennis.mp4" />
        </video>

        <Box
          sx={{
            position: "relative",
            zIndex: 2,
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center"
          }}
        >
          <MotionBox
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Typography variant="h2" fontWeight={900}>
              About SAT Sports 🎾
            </Typography>
            <Typography mt={2}>
              Building Champions. Inspiring Excellence.
            </Typography>
          </MotionBox>
        </Box>
      </Box>

      {/* 🔥 WHO WE ARE */}
      <Grid container spacing={4} sx={{ px: 10, py: 10 }}>
        <Grid item xs={12} md={6}>
          <MotionBox
            initial={{ opacity: 0, x: -100 }}
            whileInView={{ opacity: 1, x: 0 }}
          >
            <Typography variant="h4" fontWeight={800}>
              Who We Are
            </Typography>

            <Typography mt={2} color="gray">
              SAT Sports PVT LTD is a professional tennis academy focused on
              elite training, competitive growth, and developing future champions.
            </Typography>

            <Typography mt={2} color="gray">
              From beginners to professionals, we provide structured training,
              analytics-driven improvement, and tournament pathways.
            </Typography>
          </MotionBox>
        </Grid>

        <Grid item xs={12} md={6}>
          <MotionBox
            whileHover={{ scale: 1.05 }}
            sx={{ borderRadius: 4, overflow: "hidden" }}
          >
            <img
              src="/coach.jpg"
              style={{ width: "100%", height: 300, objectFit: "cover" }}
            />
          </MotionBox>
        </Grid>
      </Grid>

      {/* 🔥 STATS */}
      <Grid container justifyContent="center" gap={6} sx={{ pb: 10 }}>
        {[
          { value: "500+", label: "Players Trained" },
          { value: "20+", label: "Certified Coaches" },
          { value: "10+", label: "Premium Courts" }
        ].map((s, i) => (
          <Grid item key={i}>
            <MotionBox whileHover={{ scale: 1.2 }}>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 900,
                  background: "linear-gradient(135deg,#f97316,#ef4444)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent"
                }}
              >
                {s.value}
              </Typography>
              <Typography color="gray">{s.label}</Typography>
            </MotionBox>
          </Grid>
        ))}
      </Grid>

      {/* 🔥 FEATURES */}
      <Grid container spacing={3} sx={{ px: 10 }}>
        {[
          "Certified Coaches",
          "Performance Analytics",
          "Tournament Pathways",
          "Player Wellness"
        ].map((item, i) => (
          <Grid item xs={12} md={3} key={i}>
            <MotionBox whileHover={{ y: -15 }}>
              <Box
                sx={{
                  p: 3,
                  borderRadius: 4,
                  background: "rgba(255,255,255,0.05)",
                  backdropFilter: "blur(10px)",
                  textAlign: "center"
                }}
              >
                <Typography fontWeight={700}>{item}</Typography>
              </Box>
            </MotionBox>
          </Grid>
        ))}
      </Grid>

      {/* 🔥 TRAINING VISUAL */}
      <Box sx={{ px: 10, py: 10 }}>
        <MotionBox whileHover={{ scale: 1.03 }}>
          <img
            src="/training.jpg"
            style={{
              width: "100%",
              borderRadius: 20,
              height: 400,
              objectFit: "cover"
            }}
          />
        </MotionBox>
      </Box>

      {/* 🔥 MISSION */}
      <Box
        sx={{
          py: 10,
          textAlign: "center",
          background: "linear-gradient(135deg,#0f172a,#1e293b)"
        }}
      >
        <Typography variant="h4" fontWeight={900}>
          Our Mission 🚀
        </Typography>

        <Typography mt={2} maxWidth={600} mx="auto" color="gray">
          To build world-class athletes with discipline, resilience, and
          a winning mindset.
        </Typography>
      </Box>

      {/* 🔥 CTA */}
      <Box sx={{ py: 10, textAlign: "center" }}>
        <Typography variant="h3" fontWeight={900}>
          Ready to Train Like a Pro?
        </Typography>

        <Button
          variant="contained"
          sx={{
            mt: 3,
            px: 5,
            py: 1.5,
            borderRadius: 999,
            background: "linear-gradient(135deg,#f97316,#ef4444)",
            "&:hover": { transform: "scale(1.1)" }
          }}
        >
          Join Academy
        </Button>
      </Box>

    </Box>
  );
}