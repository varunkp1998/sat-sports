import React from "react";
import {
  Box,
  Typography,
  Grid,
  Tabs,
  Tab,
  TextField,
  Chip
} from "@mui/material";
import { motion } from "framer-motion";
import API_BASE from "./api";

const MotionBox = motion(Box);

export default function NewsPage() {
  const [news, setNews] = React.useState<any[]>([]);
  const [tab, setTab] = React.useState(0);
  const [search, setSearch] = React.useState("");

  React.useEffect(() => {
    fetch(`${API_BASE}/api/news`)
      .then(res => res.json())
      .then(setNews);
  }, []);

  const filtered = news.filter(n => {
    const matchesTab =
      tab === 0 ? n.category === "Event" : n.category === "News";

    const matchesSearch =
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.body.toLowerCase().includes(search.toLowerCase());

    return matchesTab && matchesSearch;
  });

  return (
    <Box sx={{ background: "#020617", color: "white" }}>

      {/* 🔥 HERO */}
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
          News & Events 📰
        </Typography>

        <Typography mt={2} color="gray">
          Stay updated with SAT Sports
        </Typography>
      </Box>

      <Box sx={{ px: { xs: 2, md: 10 }, py: 6 }}>

        {/* 🔥 CONTROLS */}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            mb: 4,
            alignItems: "center"
          }}
        >
          <Tabs
            value={tab}
            onChange={(e, v) => setTab(v)}
            textColor="inherit"
            indicatorColor="secondary"
          >
            <Tab label="Events" />
            <Tab label="News" />
          </Tabs>

          <TextField
            placeholder="Search..."
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{
              ml: "auto",
              background: "rgba(255,255,255,0.05)",
              borderRadius: 2,
              input: { color: "white" }
            }}
          />
        </Box>

        {/* 🔥 GRID */}
        <Grid container spacing={3}>
          {filtered.map((n, i) => {
            const date = new Date(n.created_at || Date.now());
            const day = date.getDate();
            const month = date.toLocaleString("default", {
              month: "short"
            });

            return (
              <Grid item xs={12} md={6} key={n.id}>
                <MotionBox
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  <Box
                    sx={{
                      borderRadius: 4,
                      p: 3,
                      backdropFilter: "blur(12px)",
                      background: "rgba(255,255,255,0.05)",
                      boxShadow: "0 10px 40px rgba(0,0,0,0.6)",
                      display: "flex",
                      gap: 2
                    }}
                  >

                    {/* DATE */}
                    <Box
                      sx={{
                        minWidth: 70,
                        height: 70,
                        borderRadius: 3,
                        background:
                          "linear-gradient(135deg,#f97316,#ef4444)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700
                      }}
                    >
                      <Typography>{day}</Typography>
                      <Typography fontSize={12}>{month}</Typography>
                    </Box>

                    {/* CONTENT */}
                    <Box flex={1}>
                      <Typography fontWeight={700} mb={1}>
                        {n.title}
                      </Typography>

                      <Typography
                        color="gray"
                        fontSize={14}
                        mb={1}
                      >
                        {n.body}
                      </Typography>

                      <Chip
                        label={n.category}
                        size="small"
                        sx={{
                          background:
                            "linear-gradient(135deg,#f97316,#ef4444)",
                          color: "white"
                        }}
                      />
                    </Box>

                  </Box>
                </MotionBox>
              </Grid>
            );
          })}
        </Grid>

      </Box>

      {/* 🔥 CTA */}
      <Box
        sx={{
          py: 10,
          textAlign: "center",
          background: "linear-gradient(135deg,#0f172a,#1e293b)"
        }}
      >
        <Typography variant="h3" fontWeight={900}>
          Join the Action 🎾
        </Typography>

        <Typography mt={2} color="gray">
          Be part of upcoming events and tournaments
        </Typography>
      </Box>

    </Box>
  );
}