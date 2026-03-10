import { Link, Outlet } from "react-router-dom";


function CoachLayout() {
  return (
    <div className="dashboard">
      <aside className="sidebar">
        <h3>🎾 Coach Panel</h3>
        <nav>
          <Link to="/coach">Dashboard</Link>
          <Link to="/coach/sessions">My Sessions</Link>
          <Link to="/coach/leave">Apply Leave</Link>
          <Link to="/coach/profile">My Profile</Link>
        </nav>
      </aside>

      <main className="content" style={{ padding: 20 }}>
        {/* 👇 THIS IS CRITICAL */}
        <Outlet />
      </main>
    </div>
  );
}

export default CoachLayout;
