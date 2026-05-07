import React, { useState } from "react";
import {
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  Divider,
  Button,
  useMediaQuery,
  useTheme
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";

export default function CoachLayout() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const menuItems = [
    { label: "🏠 Dashboard", path: "/coach" },
    { label: "📅 My Sessions", path: "/coach/sessions" },
    { label: "🏆 Practice Tournaments", path: "/coach/tournaments" },
    { label: "📝 Apply Leave", path: "/coach/leave" },
    { label: "👤 My Profile", path: "/coach/profile" }
  ];

  const SidebarContent = (
    <Box sx={{ 
      height: "100%", 
      display: "flex", 
      flexDirection: "column", 
      background: "#020617", 
      color: "white",
      borderRight: "1px solid rgba(255,255,255,0.05)"
    }}>
      {/* LOGO SECTION */}
      <Box sx={{ p: 4, mb: 2, textAlign: 'center' }}>
        <Typography variant="h5" fontWeight={950} sx={{ letterSpacing: -1 }}>
          SAT <span style={{ color: "#ef4444" }}>COACH</span>
        </Typography>
        <Typography variant="caption" sx={{ opacity: 0.5, fontWeight: 800, letterSpacing: 2 }}>
          ELITE PERFORMANCE
        </Typography>
      </Box>

      {/* NAVIGATION */}
      <List sx={{ flexGrow: 1, px: 2 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                component={Link}
                to={item.path}
                onClick={() => setOpen(false)}
                sx={{
                  borderRadius: "12px",
                  py: 1.5,
                  backgroundColor: isActive ? "#ef4444" : "transparent",
                  color: "white",
                  transition: "all 0.2s ease-in-out",
                  boxShadow: isActive ? "0 4px 15px rgba(239, 68, 68, 0.3)" : "none",
                  "&:hover": { 
                    background: isActive ? "#ef4444" : "rgba(255,255,255,0.05)",
                    transform: isActive ? "none" : "translateX(5px)"
                  }
                }}
              >
                <ListItemText 
                  primary={item.label.toUpperCase()} 
                  primaryTypographyProps={{ 
                    fontWeight: 900, 
                    fontSize: '0.8rem',
                    letterSpacing: 1.2,
                    color: isActive ? "white" : "rgba(255,255,255,0.7)"
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* BOTTOM ACTION */}
      <Box sx={{ p: 3 }}>
        <Divider sx={{ bgcolor: "rgba(255,255,255,0.05)", mb: 2 }} />
        <Button
          fullWidth
          variant="outlined"
          onClick={handleLogout}
          sx={{
            py: 1.5,
            borderColor: "rgba(255,255,255,0.1)",
            color: "rgba(255,255,255,0.7)",
            fontWeight: 900,
            borderRadius: "10px",
            fontSize: '0.75rem',
            letterSpacing: 1,
            "&:hover": { 
                bgcolor: "#ef4444", 
                borderColor: "#ef4444",
                color: "white",
                boxShadow: "0 10px 20px rgba(239, 68, 68, 0.2)"
            }
          }}
        >
          SECURE LOGOUT
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#020617" }}>
      
      {/* MOBILE HEADER */}
      <Box sx={{
          display: { xs: "flex", md: "none" },
          width: "100%", 
          background: "rgba(2, 6, 23, 0.9)", 
          backdropFilter: "blur(12px)",
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
        <Typography variant="h6" sx={{ ml: 2, fontWeight: 950, fontSize: '0.9rem', letterSpacing: 1 }}>
          SAT <span style={{ color: "#ef4444" }}>COACH</span>
        </Typography>
      </Box>

      {/* DESKTOP SIDEBAR */}
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
        ml: { md: "280px" },
        mt: { xs: "70px", md: 0 },
        p: { xs: 2, md: 0 }, // Extra padding for the dashboard container
        background: "#020617",
        minHeight: "100vh"
      }}>
        <Outlet />
      </Box>

      {/* MOBILE DRAWER */}
      <Drawer 
        anchor="left" 
        open={open} 
        onClose={() => setOpen(false)} 
        PaperProps={{ sx: { width: 280, border: "none", bgcolor: "#020617" } }}
      >
        {SidebarContent}
      </Drawer>
    </Box>
  );
}