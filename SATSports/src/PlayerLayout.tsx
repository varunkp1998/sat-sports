import { Box } from "@mui/material";
import { Routes, Route, Link } from "react-router-dom";
import PlayerAttendance from "./PlayerAttendance";
import PlayerDashboard from "./PlayerDashboard";
import PlayerLeave from "./PlayerLeave";
function PlayerLayout() {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>

      {/* SIDEBAR */}
      <Box
        sx={{
          width: 220,
          background: "#111827",
          color: "white",
          p: 2
        }}
      >
        <h3>👤 Player Panel</h3>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Link to="/player">Dashboard</Link>
          <Link to="/player/attendance">Attendance</Link>
          <Link to="/player/leave">Apply Leave</Link>
        </Box>
      </Box>

      {/* CONTENT */}
      <Box sx={{ flex: 1, background: "#f5f7fb" }}>
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
