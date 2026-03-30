import { useState, useEffect } from "react";
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
  Card,
  Grid,
  CircularProgress
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import PlayerDashboard from "./PlayerDashboard";
import PlayerAttendance from "./PlayerAttendance";
import PlayerLeave from "./PlayerLeave";
import PlayerPayments from "./PlayerPayments";
import API_BASE from "./api"; // Ensure you import your API base URL

// Custom Stat Card Component for reuse
const StatCard = ({ title, value, icon, color = "#ef4444" }: { title: string, value: string | number, icon: string, color?: string }) => (
  <Card sx={{ p: 2, borderRadius: "12px", border: "1px solid #e5e7eb", boxShadow: "none" }}>
    <Box display="flex" alignItems="center" gap={1.5}>
      <Typography variant="h5" sx={{ color }}>{icon}</Typography>
      <Box>
        <Typography variant="caption" color="text.secondary" fontWeight={500}>
          {title}
        </Typography>
        <Typography variant="h6" fontWeight="bold">
          {value}
        </Typography>
      </Box>
    </Box>
  </Card>
);

export default function PlayerLayout() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const [loadingStats, setLoadingStats] = useState(true);
  
  // State for dynamic stats
  const [playerStats, setPlayerStats] = useState({
    programName: "...",
    attendancePercentage: 0,
    paymentStatus: "...",
    paymentColor: "text.primary"
  });

  // Get data from localStorage
  const username = localStorage.getItem("username") || "Player";
  const playerId = localStorage.getItem("userId");

  useEffect(() => {
    if (!playerId) return;

    // Fetch essential stats on load
    Promise.all([
      fetch(`${API_BASE}/api/player/program/${playerId}`).then(res => res.json()),
      fetch(`${API_BASE}/api/player/stats/attendance/${playerId}`).then(res => res.json()),
      fetch(`${API_BASE}/api/player/stats/payments/${playerId}`).then(res => res.json())
    ]).then(([programData, attendanceData, paymentData]) => {
        setPlayerStats({
          programName: programData.name || "None Enrolled",
          attendancePercentage: Math.round(attendanceData.percentage) || 0,
          paymentStatus: paymentData.status || "Check Status",
          paymentColor: paymentData.status === "Overdue" ? "#ef4444" : paymentData.status === "Up-to-Date" ? "#10b981" : "text.primary"
        });
        setLoadingStats(false);
    }).catch(err => {
        console.error("Failed to load dashboard stats:", err);
        setLoadingStats(false);
    });
  }, [playerId]);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  const menuItems = [
    { label: "🏠 Dashboard", path: "/player" },
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
                backgroundColor: isActive ? "rgba(239, 68, 68, 0.1)" : "transparent",
                color: isActive ? "#ef4444" : "#9ca3af",
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
          {/* WELCOME BANNER & QUICK STATS DASHBOARD */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" fontWeight="bold" sx={{ color: '#111827', mb: 1 }}>
              Welcome back, {username}! 👋
            </Typography>
            <Typography variant="body1" sx={{ color: "#6b7280", mb: 3 }}>
              Here's your academy overview at a glance.
            </Typography>
            
            {loadingStats ? (
                <Box display="flex" justifyContent="center" p={4}><CircularProgress size={24} color="error" /></Box>
            ) : (
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={4}>
                        <StatCard 
                            title="My Enrolled Program" 
                            value={playerStats.programName} 
                            icon="🏅" 
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <StatCard 
                            title="Attendance (Last 30 Days)" 
                            value={`${playerStats.attendancePercentage}%`} 
                            icon="📈" 
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <StatCard 
                            title="Last Payment Status" 
                            value={playerStats.paymentStatus} 
                            icon="💳" 
                            color={playerStats.paymentColor} 
                        />
                    </Grid>
                </Grid>
            )}
          </Box>

          <Routes>
            <Route path="/" element={<PlayerDashboard />} />
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