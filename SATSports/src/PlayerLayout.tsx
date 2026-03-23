import { Box, IconButton, Drawer } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import PlayerAttendance from "./PlayerAttendance";
import PlayerDashboard from "./PlayerDashboard";
import PlayerLeave from "./PlayerLeave";
function PlayerLayout() {
  const [open, setOpen] = useState(false);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>

      {/* MOBILE TOPBAR */}
      <Box
        sx={{
          display: { xs: "flex", md: "none" },
          alignItems: "center",
          p: 1,
          background: "#111827",
          color: "white",
          width: "100%"
        }}
      >
        <IconButton onClick={() => setOpen(true)} sx={{ color: "white" }}>
          <MenuIcon />
        </IconButton>
        <span style={{ marginLeft: 10 }}>Player Panel</span>
      </Box>

      {/* DESKTOP SIDEBAR */}
      <Box
        sx={{
          width: 220,
          background: "#111827",
          color: "white",
          p: 2,
          display: { xs: "none", md: "block" }
        }}
      >
        <h3>👤 Player Panel</h3>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Link to="/player">Dashboard</Link>
          <Link to="/player/attendance">Attendance</Link>
          <Link to="/player/leave">Apply Leave</Link>
        </Box>
      </Box>

      {/* MOBILE DRAWER */}
      <Drawer open={open} onClose={() => setOpen(false)}>
        <Box sx={{ width: 220, p: 2 }}>
          <h3>👤 Player Panel</h3>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Link to="/player" onClick={() => setOpen(false)}>Dashboard</Link>
            <Link to="/player/attendance" onClick={() => setOpen(false)}>Attendance</Link>
            <Link to="/player/leave" onClick={() => setOpen(false)}>Apply Leave</Link>
          </Box>
        </Box>
      </Drawer>

      {/* CONTENT */}
      <Box sx={{ flex: 1, p: 2 }}>
        <Routes>
          <Route path="/" element={<PlayerDashboard />} />
          <Route path="attendance" element={<PlayerAttendance />} />
          <Route path="leave" element={<PlayerLeave />} />
        </Routes>
      </Box>

    </Box>
  );
}

export default PlayerLayout;