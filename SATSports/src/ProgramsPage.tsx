import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Button
} from "@mui/material";
import { motion } from "framer-motion";
import API_BASE from "./api";

const MotionBox = motion(Box);

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${API_BASE}/api/programs`)
      .then(res => res.json())
      .then(setPrograms);
  }, []);

  // group by category
  const grouped: any = {};
  programs.forEach(p => {
    const cat = p.category || "Programs";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(p);
  });

  return (
    <Box sx={{ background: "#020617", color: "white" }}>

      {/* 🔥 HERO (MATCH HOME STYLE) */}
      <Box
        sx={{
          height: "50vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          textAlign: "center",
          background: "linear-gradient(135deg,#0f172a,#1e293b)"
        }}
      >
        <Typography variant="h2" fontWeight={900}>
          Training Programs 🎾
        </Typography>

        <Typography mt={2} color="gray">
          Structured pathways for every level
        </Typography>
      </Box>

      <Box sx={{ px: { xs: 2, md: 10 }, py: 6 }}>

        {/* 🔥 SECTIONS */}
        {Object.keys(grouped).map((category, i) => (
          <Box key={category} mb={8}>

            {/* CATEGORY TITLE */}
            <MotionBox
              initial={{ opacity: 0, x: -80 }}
              whileInView={{ opacity: 1, x: 0 }}
            >
              <Typography
                variant="h4"
                fontWeight={900}
                mb={3}
                sx={{
                  background: "linear-gradient(135deg,#f97316,#ef4444)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent"
                }}
              >
                {category}
              </Typography>
            </MotionBox>

            {/* PROGRAM CARDS */}
            <Grid container spacing={3}>

              {grouped[category].map((p: any) => (
                <Grid item xs={12} sm={6} md={4} key={p.id}>

                  <MotionBox
                    whileHover={{ y: -10, scale: 1.03 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Box
                      sx={{
                        borderRadius: 4,
                        overflow: "hidden",
                        backdropFilter: "blur(12px)",
                        background: "rgba(255,255,255,0.05)",
                        boxShadow: "0 10px 40px rgba(0,0,0,0.6)",
                        position: "relative"
                      }}
                    >

                      {/* 🔥 TOP STRIP */}
                      <Box
                        sx={{
                          height: 6,
                          background:
                            "linear-gradient(90deg,#f97316,#ef4444)"
                        }}
                      />

                      {/* CONTENT */}
                      <Box sx={{ p: 3 }}>

                        <Typography
                          fontWeight={800}
                          fontSize={20}
                          mb={1}
                        >
                          {p.title}
                        </Typography>

                        <Typography color="gray" mb={2}>
                          Age {p.min_age} – {p.max_age}
                        </Typography>

                        {/* CTA */}
                        <Button
                          fullWidth
                          variant="contained"
                          sx={{
                            borderRadius: 999,
                            py: 1,
                            fontWeight: 700,
                            background:
                              "linear-gradient(135deg,#f97316,#ef4444)",
                            "&:hover": {
                              transform: "scale(1.05)"
                            }
                          }}
                        >
                          View Schedule
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

      {/* 🔥 CTA SECTION */}
      <Box
        sx={{
          py: 10,
          textAlign: "center",
          background: "linear-gradient(135deg,#0f172a,#1e293b)"
        }}
      >
        <Typography variant="h3" fontWeight={900}>
          Ready to Start Training? 🚀
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