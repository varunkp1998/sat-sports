import { useState, useEffect } from "react";
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
  Card,
  Grid,
  Avatar
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Link, Outlet, useLocation } from "react-router-dom";

// Simple Reusable Stat Component
const CoachStat = ({ title, value, icon }: { title: string, value: string | number, icon: string }) => (
  <Card sx={{ p: 2, borderRadius: "12px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)", border: "1px solid #e5e7eb" }}>
    <Box display="flex" alignItems="center" gap={2}>
      <Box sx={{ fontSize: "1.5rem", p: 1, bgcolor: "#f3f4f6", borderRadius: "8px" }}>{icon}</Box>
      <Box>
        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>{title}</Typography>
        <Typography variant="h6" fontWeight="bold">{value}</Typography>
      </Box>
    </Box>
  </Card>
);

export default function CoachLayout() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  
  // Get coach info
  const username = localStorage.getItem("username") || "Coach";
  const coachId = localStorage.getItem("userId");

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  const menuItems = [
    { label: "🏠 Dashboard", path: "/coach" },
    { label: "📅 My Sessions", path: "/coach/sessions" },
    { label: "📝 Apply Leave", path: "/coach/leave" },
    { label: "👤 My Profile", path: "/coach/profile" }
  ];

  const SidebarContent = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column", background: "#111827", color: "white" }}>
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <img src="/logo.png" style={{ height: 35 }} alt="Logo" />
        <Typography variant="h6" fontWeight="bold">Coach Panel</Typography>
      </Box>

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
                borderRadius: "8px",
                mb: 1,
                backgroundColor: isActive ? "rgba(239, 68, 68, 0.15)" : "transparent",
                color: isActive ? "#ef4444" : "#9ca3af",
                "&:hover": { background: "#1f2937", color: "white" }
              }}
            >
              <ListItemText 
                primary={item.label} 
                primaryTypographyProps={{ fontWeight: isActive ? 700 : 500 }}
              />
            </ListItem>
          );
        })}
      </List>

      <Box sx={{ p: 2 }}>
        <Divider sx={{ bgcolor: "#374151", mb: 2 }} />
        <Button
          fullWidth
          variant="contained"
          onClick={handleLogout}
          sx={{
            bgcolor: "rgba(239, 68, 68, 0.1)",
            color: "#ef4444",
            fontWeight: "bold",
            "&:hover": { bgcolor: "rgba(239, 68, 68, 0.2)" }
          }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f8fafc" }}>
      
      {/* MOBILE TOP BAR */}
      <Box
        sx={{
          display: { xs: "flex", md: "none" },
          width: "100%",
          background: "#111827",
          color: "white",
          p: 1.5,
          alignItems: "center",
          position: "fixed",
          top: 0,
          zIndex: 1100
        }}
      >
        <IconButton onClick={() => setOpen(true)} sx={{ color: "white" }}>
          <MenuIcon />
        </IconButton>
        <Typography sx={{ ml: 1, fontWeight: 600 }}>Coach Panel</Typography>
      </Box>

      {/* DESKTOP SIDEBAR */}
      <Box
        sx={{
          width: 260,
          minWidth: 260,
          background: "#111827",
          display: { xs: "none", md: "block" },
          position: "fixed",
          height: "100vh"
        }}
      >
        {SidebarContent}
      </Box>

      {/* MAIN CONTENT AREA */}
      <Box
        sx={{
          flex: 1,
          ml: { md: "260px" },
          mt: { xs: "60px", md: 0 },
          p: { xs: 2, md: 4 }
        }}
      >
        {/* COACH WELCOME HEADER */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight="800" color="#111827">
              Welcome, Coach {username.split(' ')[0]}! 🎾
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Ready for your scheduled sessions today?
            </Typography>
          </Box>
          <Avatar 
            sx={{ width: 56, height: 56, bgcolor: '#ef4444', fontWeight: 'bold' }}
          >
            {username.charAt(0)}
          </Avatar>
        </Box>

        {/* COACH QUICK STATS */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={4}>
            <CoachStat title="Sessions Today" value="4" icon="📅" />
          </Grid>
          <Grid item xs={12} sm={4}>
            <CoachStat title="Active Players" value="24" icon="👥" />
          </Grid>
          <Grid item xs={12} sm={4}>
            <CoachStat title="Leave Balance" value="3 Days" icon="📝" />
          </Grid>
        </Grid>

        <Divider sx={{ mb: 4 }} />

        <Outlet />
      </Box>

      {/* MOBILE DRAWER */}
      <Drawer
        anchor="left"
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{ sx: { width: 260, border: "none" } }}
      >
        {SidebarContent}
      </Drawer>

    </Box>
  );
}