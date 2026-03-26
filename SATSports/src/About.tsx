import { Box, Typography, Grid } from "@mui/material";
import { motion } from "framer-motion";

const MotionBox = motion(Box);

export default function About() {
  return (
    <Box sx={{ background: "#020617", color: "white" }}>

      {/* 🔥 HERO SECTION */}
      <Box
        sx={{
          height: "50vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          background:
            "linear-gradient(135deg, #0f172a, #1e293b)"
        }}
      >
        <MotionBox
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Typography variant="h3" fontWeight={900}>
            About SAT Sports 🎾
          </Typography>
          <Typography mt={2} color="gray">
            Building Champions. Inspiring Excellence.
          </Typography>
        </MotionBox>
      </Box>

      {/* 🔥 ABOUT TEXT */}
      <Box sx={{ px: { xs: 2, md: 10 }, py: 8 }}>
        <Grid container spacing={4} alignItems="center">

          {/* TEXT */}
          <Grid item xs={12} md={6}>
            <MotionBox
              initial={{ opacity: 0, x: -100 }}
              whileInView={{ opacity: 1, x: 0 }}
            >
              <Typography variant="h4" fontWeight={800}>
                Who We Are
              </Typography>

              <Typography mt={2} color="gray">
                SAT Sports PVT LTD is a professional tennis academy dedicated
                to player development, competitive excellence, and building a
                strong sporting community.
              </Typography>

              <Typography mt={2} color="gray">
                We focus on nurturing talent from grassroots to elite levels
                through structured programs and expert coaching.
              </Typography>
            </MotionBox>
          </Grid>

          {/* IMAGE */}
          <Grid item xs={12} md={6}>
            <MotionBox
              whileHover={{ scale: 1.05 }}
              sx={{
                height: 300,
                borderRadius: 4,
                overflow: "hidden"
              }}
            >
              <img
                src="/coach.jpg"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover"
                }}
              />
            </MotionBox>
          </Grid>
        </Grid>
      </Box>

      {/* 🔥 FEATURES */}
      <Box sx={{ px: { xs: 2, md: 10 }, pb: 10 }}>
        <Typography variant="h4" fontWeight={800} mb={4}>
          What We Offer
        </Typography>

        <Grid container spacing={3}>
          {[
            "Certified Coaches",
            "Performance Tracking",
            "Tournament Pathways",
            "Player Wellness"
          ].map((item, i) => (
            <Grid item xs={12} md={3} key={i}>
              <MotionBox whileHover={{ y: -10 }}>
                <Box
                  sx={{
                    p: 3,
                    borderRadius: 4,
                    backdropFilter: "blur(12px)",
                    background: "rgba(255,255,255,0.05)",
                    textAlign: "center"
                  }}
                >
                  <Typography fontWeight={700}>
                    {item}
                  </Typography>
                </Box>
              </MotionBox>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* 🔥 MISSION SECTION */}
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
          To develop world-class athletes while fostering discipline,
          resilience, and passion for the game.
        </Typography>
      </Box>

    </Box>
  );
}