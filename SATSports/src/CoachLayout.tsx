import { Link, Outlet } from "react-router-dom";
import { useState } from "react";
import MenuIcon from "@mui/icons-material/Menu";

function CoachLayout() {
  const [open, setOpen] = useState(false);

  return (
    <div className="dashboard">
      
      {/* Mobile Top Bar */}
      <div className="mobileHeader">
        <button className="menuBtn" onClick={() => setOpen(!open)}>
          <MenuIcon />
        </button>
        <h3>🎾 Coach Panel</h3>
      </div>

      {/* Sidebar */}
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <h3>🎾 Coach Panel</h3>

        <nav>
          <Link to="/coach" onClick={() => setOpen(false)}>Dashboard</Link>
          <Link to="/coach/sessions" onClick={() => setOpen(false)}>My Sessions</Link>
          <Link to="/coach/leave" onClick={() => setOpen(false)}>Apply Leave</Link>
          <Link to="/coach/profile" onClick={() => setOpen(false)}>My Profile</Link>
        </nav>
      </aside>

      {/* Content */}
      <main className="content">
        <Outlet />
      </main>

    </div>
  );
}

export default CoachLayout;