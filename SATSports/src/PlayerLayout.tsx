import { useState } from "react";
import {
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Typography,
  Divider,
  Button,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import PlayerDashboard from "./PlayerDashboard";
import PlayerAttendance from "./PlayerAttendance";
import PlayerLeave from "./PlayerLeave";
import PlayerPayments from "./PlayerPayments";
import PlayerProfile from "./PlayerProfile"; // Import the Profile component

export default function PlayerLayout() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  const menuItems = [
    { label: "🏠 Dashboard", path: "/player" },
    { label: "👤 My Profile", path: "/player/profile" }, // New Profile Link
    { label: "📅 Attendance", path: "/player/attendance" },
    { label: "📝 Apply Leave", path: "/player/leave" },
    { label: "💳 Payments", path: "/player/payments" }
  ];

  const SidebarContent = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column", background: "#111827", color: "white" }}>
      <Box sx={{ p: 3, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 2 }}>
        <img src="/logo.png" style={{ height: 30 }} alt="Logo" />
        <Typography variant="h6" fontWeight="bold">Player Panel</Typography>
      </Box>

      <List sx={{ flexGrow: 1, px: 1 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem
              button
              key={item.path}
              component={Link}
              to={item.path}
              onClick={() => setOpen(false)}
              sx={{
                borderRadius: "8px",
                mb: 1,
                backgroundColor: isActive ? "rgba(37, 99, 235, 0.1)" : "transparent",
                color: isActive ? "#60a5fa" : "#9ca3af",
                "&:hover": { background: "#1f2937", color: "white" }
              }}
            >
              <ListItemText 
                primary={item.label} 
                primaryTypographyProps={{ fontWeight: isActive ? 700 : 500, fontSize: '0.9rem' }}
              />
            </ListItem>
          );
        })}
      </List>

      <Box sx={{ p: 2, flexShrink: 0 }}>
        <Divider sx={{ bgcolor: "#374151", mb: 2 }} />
        <Button
          fullWidth
          variant="contained"
          onClick={handleLogout}
          sx={{
            bgcolor: "rgba(239, 68, 68, 0.1)",
            color: "#ef4444",
            fontWeight: "bold",
            textTransform: 'none',
            "&:hover": { bgcolor: "rgba(239, 68, 68, 0.2)" }
          }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ width: "100%", display: "flex", flexDirection: "column" }}>

      {/* MOBILE TOPBAR */}
      <Box
        sx={{
          display: { xs: "flex", md: "none" },
          width: "100%",
          background: "#111827",
          color: "white",
          p: 1.5,
          alignItems: "center",
          position: "sticky",
          top: 0,
          zIndex: 1100
        }}
      >
        <IconButton onClick={() => setOpen(true)} sx={{ color: "white" }}>
          <MenuIcon />
        </IconButton>
        <Typography sx={{ ml: 2, fontWeight: 600 }}>SAT Sports</Typography>
      </Box>

      <Box sx={{ display: "flex", minHeight: "100vh" }}>
        {/* DESKTOP SIDEBAR */}
        <Box
          sx={{
            width: 260,
            display: { xs: "none", md: "block" },
            position: "fixed",
            height: "100vh"
          }}
        >
          {SidebarContent}
        </Box>

        {/* CONTENT AREA */}
        <Box 
          sx={{ 
            flex: 1, 
            p: { xs: 2, md: 4 }, 
            background: "#f8fafc",
            ml: { md: "260px" },
            maxWidth: '100vw'
          }}
        >
          {/* Main Router Logic */}
          <Routes>
            <Route path="/" element={<PlayerDashboard />} />
            <Route path="profile" element={<PlayerProfile />} />
            <Route path="attendance" element={<PlayerAttendance />} />
            <Route path="leave" element={<PlayerLeave />} />
            <Route path="payments" element={<PlayerPayments />} />
          </Routes>
        </Box>
      </Box>

      {/* MOBILE DRAWER */}
      <Drawer 
        anchor="left" 
        open={open} 
        onClose={() => setOpen(false)}
        PaperProps={{ sx: { width: 260, bgcolor: "#111827" } }}
      >
        {SidebarContent}
      </Drawer>

    </Box>
  );
}