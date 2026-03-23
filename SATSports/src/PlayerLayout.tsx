import { useState } from "react";
import {
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Routes, Route, Link } from "react-router-dom";
import PlayerDashboard from "./PlayerDashboard";
import PlayerAttendance from "./PlayerAttendance";
import PlayerLeave from "./PlayerLeave";
export default function PlayerLayout() {
  const [open, setOpen] = useState(false);

  const menuItems = [
    { label: "🏠 Dashboard", path: "/player" },
    { label: "📅 Attendance", path: "/player/attendance" },
    { label: "📝 Apply Leave", path: "/player/leave" }
  ];

  return (
    <Box sx={{ width: "100%" }}>

      {/* 🔝 MOBILE TOPBAR (OUTSIDE FLEX ROW) */}
      <Box
        sx={{
          display: { xs: "flex", md: "none" },
          width: "100%",
          background: "#111827",
          color: "white",
          p: 1.5,
          alignItems: "center"
        }}
      >
        <IconButton onClick={() => setOpen(true)} sx={{ color: "white" }}>
          <MenuIcon />
        </IconButton>

        <span style={{ marginLeft: 10 }}>Player Panel</span>
      </Box>

      {/* 🔥 MAIN LAYOUT */}
      <Box sx={{ display: "flex", minHeight: "100vh" }}>

        {/* 🖥️ SIDEBAR */}
        <Box
          sx={{
            width: 240,
            background: "#111827",
            color: "white",
            p: 2,
            display: { xs: "none", md: "block" }
          }}
        >
          <h3>👤 Player Panel</h3>

          <List>
            {menuItems.map((item) => (
              <ListItem
                button
                key={item.path}
                component={Link}
                to={item.path}
              >
                <ListItemText primary={item.label} />
              </ListItem>
            ))}
          </List>
        </Box>

        {/* 📄 CONTENT */}
        <Box sx={{ flex: 1, p: 2, background: "#f5f7fb" }}>
          <Routes>
            <Route path="/" element={<PlayerDashboard />} />
            <Route path="attendance" element={<PlayerAttendance />} />
            <Route path="leave" element={<PlayerLeave />} />
          </Routes>
        </Box>
      </Box>

      {/* 📱 MOBILE DRAWER */}
      <Drawer anchor="right" open={open} onClose={() => setOpen(false)}>
        <Box sx={{ width: 240, p: 2 }}>
          <List>
            {menuItems.map((item) => (
              <ListItem
                button
                key={item.path}
                component={Link}
                to={item.path}
                onClick={() => setOpen(false)}
              >
                <ListItemText primary={item.label} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

    </Box>
  );
}