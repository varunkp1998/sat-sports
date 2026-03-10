import { Routes, Route, Link } from "react-router-dom";
import PlayerDashboard from "./PlayerDashboard";
import PlayerAttendance from "./PlayerAttendance";
import PlayerLeave from "./PlayerLeave";
function PlayerLayout() {
  return (
    <div className="dashboard">
      <aside className="sidebar">
        <h3>👤 Player Panel</h3>
        <nav>
          <Link to="/player">Dashboard</Link>
          <Link to="/player/attendance">Attendance</Link>
          <Link to="/player/leave">Apply Leave</Link>
        </nav>
      </aside>

      <main className="content">
        <Routes>
          <Route path="/" element={<PlayerDashboard />} />
          <Route path="attendance" element={<PlayerAttendance />} />
          <Route path="leave" element={<PlayerLeave />} />
        </Routes>
      </main>
    </div>
  );
}

export default PlayerLayout;
