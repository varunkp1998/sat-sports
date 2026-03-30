import React, { useEffect, useState } from "react";
import {
    Box, Typography, Grid, Tabs, Tab, TextField, Chip, 
    Container, InputAdornment, Fade, Divider, 
    Stack // <--- ADD THIS LINE
  } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import SearchIcon from "@mui/icons-material/Search";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import API_BASE from "./api";

const MotionBox = motion(Box);

export default function NewsPage() {
  const [news, setNews] = useState<any[]>([]);
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch(`${API_BASE}/api/news`)
      .then(res => res.json())
      .then(setNews)
      .catch(err => console.error("Failed to fetch news", err));
  }, []);

  const filtered = news.filter(n => {
    const categoryTarget = tab === 0 ? "Event" : "News";
    const matchesTab = n.category === categoryTarget;
    const matchesSearch =
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.body.toLowerCase().includes(search.toLowerCase());

    return matchesTab && matchesSearch;
  });

  return (
    <Box sx={{ background: "#020617", minHeight: "100vh", color: "white" }}>
      
      {/* ⚡ HERO SECTION */}
      <Box sx={heroSectionStyle}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Typography 
            variant="h2" 
            fontWeight={900} 
            sx={{ letterSpacing: "-2px", mb: 2, fontSize: { xs: "3rem", md: "4.5rem" } }}
          >
            The <span style={{ color: "#f97316" }}>Latest</span> Hub
          </Typography>
          <Typography variant="h6" sx={{ color: "#94a3b8", fontWeight: 400, maxWidth: "600px", mx: "auto" }}>
            Real-time updates, tournament brackets, and academy breakthroughs at SAT Sports.
          </Typography>
        </motion.div>
      </Box>

      <Container maxWidth="lg" sx={{ py: 8 }}>
        
        {/* 🔍 INTERACTIVE CONTROLS */}
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems="center"
          spacing={3}
          sx={{ mb: 6 }}
        >
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            sx={tabsStyle}
            TabIndicatorProps={{ sx: { display: "none" } }}
          >
            <Tab label="Upcoming Events" sx={tabItemStyle} />
            <Tab label="Academy News" sx={tabItemStyle} />
          </Tabs>

          <TextField
            placeholder="Search headlines..."
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: "#64748b" }} /></InputAdornment>,
              sx: { color: "white", borderRadius: "12px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)" }
            }}
            sx={{ width: { xs: "100%", md: "300px" } }}
          />
        </Stack>

        {/* 🧩 NEWS GRID */}
        <Grid container spacing={4}>
          <AnimatePresence mode="popLayout">
            {filtered.map((n, i) => {
              const date = new Date(n.created_at || Date.now());
              const day = date.getDate();
              const month = date.toLocaleString("default", { month: "short" }).toUpperCase();

              return (
                <Grid item xs={12} md={6} key={n.id}>
                  <MotionBox
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3, delay: i * 0.1 }}
                    whileHover={{ y: -10 }}
                  >
                    <Box sx={cardStyle}>
                      {/* DATE BADGE */}
                      <Box sx={dateBadgeStyle}>
                        <Typography variant="h5" fontWeight={900} lineHeight={1}>{day}</Typography>
                        <Typography variant="caption" fontWeight={800}>{month}</Typography>
                      </Box>

                      {/* CARD CONTENT */}
                      <Box sx={{ flex: 1 }}>
                        <Stack direction="row" spacing={1} alignItems="center" mb={1.5}>
                          <Chip 
                            label={n.category} 
                            size="small" 
                            sx={chipStyle} 
                          />
                          <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700 }}>
                            • 5 MIN READ
                          </Typography>
                        </Stack>

                        <Typography variant="h6" fontWeight={800} sx={{ mb: 1.5, color: "#f8fafc" }}>
                          {n.title}
                        </Typography>

                        <Typography variant="body2" sx={{ color: "#94a3b8", lineHeight: 1.7, mb: 2 }}>
                          {n.body}
                        </Typography>

                        <Divider sx={{ borderColor: "rgba(255,255,255,0.05)", mb: 2 }} />

                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "#f97316", cursor: "pointer" }}>
                          <Typography variant="caption" fontWeight={900}>READ FULL STORY</Typography>
                        </Box>
                      </Box>
                    </Box>
                  </MotionBox>
                </Grid>
              );
            })}
          </AnimatePresence>
        </Grid>

        {filtered.length === 0 && (
          <Box sx={{ textAlign: "center", py: 10 }}>
            <Typography variant="h6" color="gray">No results match your search criteria.</Typography>
          </Box>
        )}
      </Container>

      {/* 🚀 CALL TO ACTION */}
      <Box sx={ctaSectionStyle}>
        <Typography variant="h3" fontWeight={900} mb={2}>Ready to Play? 🎾</Typography>
        <Typography variant="h6" sx={{ color: "#94a3b8", mb: 4 }}>Join our elite training programs and make history.</Typography>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={ctaButtonStyle}
        >
          Explore Programs
        </motion.button>
      </Box>
    </Box>
  );
}

// --- REFINED STYLES ---

const heroSectionStyle = {
  height: "60vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexDirection: "column",
  textAlign: "center",
  background: "radial-gradient(circle at center, #1e293b 0%, #020617 100%)",
  borderBottom: "1px solid rgba(255,255,255,0.05)",
  px: 2
};

const tabsStyle = {
  bgcolor: "rgba(255,255,255,0.03)",
  p: 0.5,
  borderRadius: "16px",
  "& .MuiTabs-flexContainer": { gap: 1 }
};

const tabItemStyle = {
  color: "#94a3b8",
  borderRadius: "12px",
  minHeight: "40px",
  fontWeight: 800,
  fontSize: "0.85rem",
  transition: "0.3s",
  "&.Mui-selected": {
    color: "white",
    bgcolor: "#f97316",
    boxShadow: "0 4px 15px rgba(249, 115, 22, 0.4)"
  }
};

const cardStyle = {
  display: "flex",
  gap: 3,
  p: 4,
  borderRadius: "24px",
  background: "linear-gradient(145deg, rgba(30,41,59,0.4) 0%, rgba(15,23,42,0.6) 100%)",
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(255,255,255,0.05)",
  height: "100%",
  boxShadow: "0 20px 40px rgba(0,0,0,0.2)"
};

const dateBadgeStyle = {
  minWidth: 70,
  height: 80,
  borderRadius: "16px",
  background: "linear-gradient(135deg, #f97316, #ea580c)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  color: "white",
  boxShadow: "0 10px 20px -5px rgba(249, 115, 22, 0.5)"
};

const chipStyle = {
  background: "rgba(249,115,22,0.1)",
  color: "#f97316",
  fontWeight: 900,
  fontSize: "0.65rem",
  border: "1px solid rgba(249,115,22,0.2)",
  borderRadius: "6px"
};

const ctaSectionStyle = {
  py: 15,
  textAlign: "center",
  background: "#020617",
  borderTop: "1px solid rgba(255,255,255,0.05)"
};

const ctaButtonStyle = {
  padding: "16px 40px",
  fontSize: "1rem",
  fontWeight: 900,
  color: "white",
  backgroundColor: "#f97316",
  border: "none",
  borderRadius: "12px",
  cursor: "pointer",
  boxShadow: "0 10px 25px rgba(249, 115, 22, 0.4)"
};