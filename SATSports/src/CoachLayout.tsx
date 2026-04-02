import React, { useState } from "react";
import {
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Typography,
  Divider,
  Button,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";

export default function CoachLayout() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const menuItems = [
    { label: "🏠 Dashboard", path: "/coach" },
    { label: "📅 My Sessions", path: "/coach/sessions" },
    { label: "🏆 Practice Tournaments", path: "/coach/tournaments" }, // 🟢 Added
    { label: "📝 Apply Leave", path: "/coach/leave" },
    { label: "👤 My Profile", path: "/coach/profile" }
  ];

  const SidebarContent = (
    <Box sx={{ 
      height: "100%", 
      display: "flex", 
      flexDirection: "column", 
      background: "#020617", // Matches the Dashboard background
      color: "white",
      borderRight: "1px solid rgba(255,255,255,0.05)"
    }}>
      {/* LOGO SECTION */}
      <Box sx={{ p: 4, mb: 2, textAlign: 'center' }}>
        <Typography variant="h5" fontWeight={950} sx={{ letterSpacing: -1 }}>
          SAT <span style={{ color: "#ef4444" }}>COACH</span>
        </Typography>
      </Box>

      {/* NAVIGATION */}
      <List sx={{ flexGrow: 1, px: 2 }}>
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
                borderRadius: "12px",
                mb: 1,
                py: 1.5,
                backgroundColor: isActive ? "#ef4444" : "transparent",
                color: "white",
                transition: "0.3s",
                "&:hover": { 
                  background: isActive ? "#ef4444" : "rgba(255,255,255,0.05)",
                }
              }}
            >
              <ListItemText 
                primary={item.label.toUpperCase()} 
                primaryTypographyProps={{ 
                  fontWeight: 900, 
                  fontSize: '0.85rem',
                  letterSpacing: 1 
                }}
              />
            </ListItem>
          );
        })}
      </List>

      {/* BOTTOM ACTION */}
      <Box sx={{ p: 3 }}>
        <Divider sx={{ bgcolor: "rgba(255,255,255,0.1)", mb: 2 }} />
        <Button
          fullWidth
          variant="outlined"
          onClick={handleLogout}
          sx={{
            borderColor: "rgba(255,255,255,0.2)",
            color: "white",
            fontWeight: 900,
            borderRadius: "10px",
            "&:hover": { bgcolor: "#ef4444", borderColor: "#ef4444" }
          }}
        >
          LOGOUT
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#020617" }}>
      
      {/* MOBILE HEADER (Visible only on small screens) */}
      <Box sx={{
          display: { xs: "flex", md: "none" },
          width: "100%", 
          background: "rgba(2, 6, 23, 0.8)", 
          backdropFilter: "blur(10px)",
          color: "white",
          p: 2, 
          alignItems: "center", 
          position: "fixed", 
          top: 0, 
          zIndex: 1100,
          borderBottom: "1px solid rgba(255,255,255,0.05)"
      }}>
        <IconButton onClick={() => setOpen(true)} sx={{ color: "white" }}>
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" sx={{ ml: 2, fontWeight: 900, fontSize: '1rem' }}>
          COACH PORTAL
        </Typography>
      </Box>

      {/* DESKTOP SIDEBAR (Static) */}
      <Box sx={{ 
        width: 280, 
        display: { xs: "none", md: "block" }, 
        position: "fixed", 
        height: "100vh",
        zIndex: 1200
      }}>
        {SidebarContent}
      </Box>

      {/* MAIN CONTENT AREA */}
      <Box sx={{ 
        flex: 1, 
        ml: { md: "280px" }, // Offset by sidebar width
        mt: { xs: "70px", md: 0 }, // Offset by mobile header
        minHeight: "100vh",
        background: "#020617" // Seamless transition to Dashboard
      }}>
        {/* Your CoachDashboard.tsx will render inside this Outlet */}
        <Outlet />
      </Box>

      {/* MOBILE DRAWER */}
      <Drawer 
        anchor="left" 
        open={open} 
        onClose={() => setOpen(false)} 
        PaperProps={{ sx: { width: 280, border: "none" } }}
      >
        {SidebarContent}
      </Drawer>

    </Box>
  );
}