import { Box, Typography, Button, Grid } from "@mui/material";
import { motion } from "framer-motion";

const MotionBox = motion(Box);

export default function Home() {
  return (
    <Box sx={{ background: "#020617", color: "white", overflowX: "hidden" }}>

      {/* 🔥 HERO WITH PARALLAX VIDEO */}
      <Box sx={{ position: "relative", height: "100vh" }}>
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

        <MotionBox
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          sx={{
            position: "relative",
            zIndex: 2,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center"
          }}
        >
          <Typography variant="h2" fontWeight={900}>
            SAT Sports 🎾
          </Typography>

          <Typography mt={2} fontSize={22}>
            Where Champions Are Built
          </Typography>

          <Button
            variant="contained"
            sx={{
              mt: 4,
              px: 5,
              py: 1.5,
              borderRadius: 999,
              fontWeight: 700,
              background: "linear-gradient(135deg,#f97316,#ef4444)",
              transition: "0.3s",
              "&:hover": {
                transform: "scale(1.1)",
                boxShadow: "0 0 30px #f97316"
              }
            }}
          >
            Join Academy
          </Button>
        </MotionBox>
      </Box>

      {/* 🔥 STATS SECTION */}
      <Grid container sx={{ py: 8, textAlign: "center" }}>
        {[
          { label: "Players", value: "500+" },
          { label: "Coaches", value: "20+" },
          { label: "Courts", value: "10+" }
        ].map((s, i) => (
          <Grid item xs={4} key={i}>
            <MotionBox whileHover={{ scale: 1.2 }}>
              <Typography variant="h3">{s.value}</Typography>
              <Typography color="gray">{s.label}</Typography>
            </MotionBox>
          </Grid>
        ))}
      </Grid>

      {/* 🔥 ZIG-ZAG STORY SECTIONS */}
      {[
        {
          title: "Elite Coaching",
          desc: "Train with top certified professionals",
          img: "/coach.jpg"
        },
        {
          title: "Modern Infrastructure",
          desc: "Premium courts with lighting",
          img: "/court.jpg"
        },
        {
          title: "Performance Tracking",
          desc: "Smart analytics & progress tracking",
          img: "/training.jpg"
        }
      ].map((sec, i) => (
        <Grid
          container
          key={i}
          sx={{
            py: 10,
            px: { xs: 2, md: 10 },
            flexDirection: i % 2 === 0 ? "row" : "row-reverse",
            alignItems: "center"
          }}
        >
          <Grid item xs={12} md={6}>
            <MotionBox
              whileHover={{ scale: 1.05 }}
              sx={{
                height: 300,
                borderRadius: 4,
                background: `url(${sec.img}) center/cover`,
                boxShadow: "0 20px 60px rgba(0,0,0,0.7)"
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <MotionBox
              initial={{ opacity: 0, x: i % 2 === 0 ? -100 : 100 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Typography variant="h4" fontWeight={800}>
                {sec.title}
              </Typography>
              <Typography mt={2} color="gray">
                {sec.desc}
              </Typography>
            </MotionBox>
          </Grid>
        </Grid>
      ))}

      {/* 🔥 FLOATING GLASS CARDS */}
      <Grid container spacing={3} sx={{ p: 5 }}>
        {["Expert Coaching", "Flexible Booking", "Match Practice"].map((f, i) => (
          <Grid item xs={12} md={4} key={i}>
            <MotionBox whileHover={{ y: -15 }}>
              <Box
                sx={{
                  p: 4,
                  borderRadius: 4,
                  backdropFilter: "blur(15px)",
                  background: "rgba(255,255,255,0.05)",
                  boxShadow: "0 10px 40px rgba(0,0,0,0.5)"
                }}
              >
                <Typography fontWeight={700}>{f}</Typography>
              </Box>
            </MotionBox>
          </Grid>
        ))}
      </Grid>

      {/* 🔥 FINAL CTA */}
      <Box
        sx={{
          py: 12,
          textAlign: "center",
          background: "linear-gradient(135deg,#0f172a,#1e293b)"
        }}
      >
        <Typography variant="h3" fontWeight={900}>
          Become a Champion 🚀
        </Typography>

        <Button
          variant="contained"
          sx={{
            mt: 3,
            px: 6,
            py: 1.5,
            borderRadius: 999,
            background: "linear-gradient(135deg,#f97316,#ef4444)",
            "&:hover": { transform: "scale(1.1)" }
          }}
        >
          Start Training
        </Button>
      </Box>

    </Box>
  );
}