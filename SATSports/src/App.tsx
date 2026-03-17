import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link,Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import "./index.css";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import AdminLocations from "./AdminLocations";
import AdminLivePresence from "./AdminLivePresence.tsx";
import CoachAttendance from "./CoachAttendance.tsx";
import { Grid } from "@mui/material";
import AdminCourtBookings from "./AdminCourtBookings.tsx";
import PublicCourtBooking from "./PublicCourtBooking.tsx";
import RegisterPlayer from "./RegisterPlayer.tsx";
import AdminApplications from "./AdminApplications.tsx";
import AdminCoachPayroll from "./AdminCoachPayroll";
import API_BASE from "./api";
import { useNavigate } from "react-router-dom";
import { Avatar } from "@mui/material";
import Signup from "./Signup.tsx";
import {
  Card,
  CardContent,
  CardActions,
  Select,
  Typography,
  TextField,
  MenuItem,
  FormControlLabel,
  Switch,
  Chip,
  Box,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Checkbox,
  Stack
} from "@mui/material";

import SportsTennisIcon from "@mui/icons-material/SportsTennis";
import PersonIcon from "@mui/icons-material/Person";
import AddIcon from "@mui/icons-material/Add";
import UploadIcon from "@mui/icons-material/Upload";

import dayjs, { Dayjs } from "dayjs";
import { LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import PlayerLayout from "./PlayerLayout";
import AdminLeaves from "./AdminLeaves";
import CoachLayout from "./CoachLayout.tsx";
import CoachSessions from "./CoachSessions";
import CoachLeave from "./CoachLeave";
import CoachProfile from "./CoachProfile";
import CoachDashboard from "./CoachDashboard";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend
);

type Program = {
  id: number;
  name: string;
  desc: string;
};

export default function App() {
  const [programs, setPrograms] = useState<Program[]>([]);
  useEffect(() => {
    setPrograms([
      { id: 1, name: "Junior Program", desc: "Foundations for young players" },
      { id: 2, name: "High Performance", desc: "Elite training & tournaments" },
      { id: 3, name: "Adult Coaching", desc: "Fitness & competitive play" },
    ]);
  }, []);

  return (
    <Router>
      <div>
        <Header />
        <main className="container">
          <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/" element={<Home programs={programs} />} />
            <Route path="/about" element={<About />} />
            <Route path="/programs" element={<ProgramsPage items={programs} />} />
            <Route path="/news" element={<NewsPage />} />
            <Route path="/tournaments" element={<TournamentsPage />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/book-court" element={<PublicCourtBooking />} />
            <Route path="/register-player" element={<RegisterPlayer />} />

            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/portal" element={<PlayerPortal />} />
            <Route path="/coach" element={<CoachLayout />}>
  <Route index element={<CoachDashboard />} />
  <Route path="sessions" element={<CoachSessions />} />
  <Route path="leave" element={<CoachLeave />} />
  <Route path="profile" element={<CoachProfile />} />   {/* 👈 ADD THIS */}
  <Route path="/coach/sessions/:sessionId/attendance" element={<CoachAttendance />} />

</Route>

            <Route path="/player/*" element={<PlayerLayout />} />

            <Route
  path="/admin/*"
  element={
    <ProtectedRoute>
      <AdminLayout />
    </ProtectedRoute>
  }
/>
<Route path="/admin/players/:id" element={<PlayerProfile />} />


          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

/* ---------- NAVBAR ---------- */
function Header() {
  const role = localStorage.getItem("role");
  const username = localStorage.getItem("username");

  const handleLogout = () => {
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    window.location.href = "/";
  };

  return (
    <header className="header">
      <div className="header-brand">
        <img src="/logo.png" alt="SAT Sports" className="header-logo" />
        <h2>SAT Sports PVT LTD</h2>
      </div>

      <nav>
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
        <Link to="/programs">Programs</Link>
        <Link to="/news">News</Link>
        <Link to="/tournaments">Tournaments</Link>
        <Link to="/contact">Contact</Link>
        <Link to="/book-court">Book a Court</Link>
        <Link to="/register-player">Join Academy</Link>

        {!role ? (
          <button onClick={() => (window.location.href = "/login")}>
            Login
          </button>
        ) : (
          <div className="auth-actions">
            <span className="username">Hi, {username}</span>

            <Link
              to={
                role === "admin"
                  ? "/admin"
                  : role === "coach"
                  ? "/coach/profile"
                  : "/portal"
              }
            >
              Profile
            </Link>

            <button className="outline" onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
      </nav>
    </header>
  );
}

const adminCardStyle = {
  borderRadius: 3,
  boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
  transition: "transform 0.2s ease",
  "&:hover": { transform: "translateY(-4px)" },
};

/* ---------- HOME ---------- */
function Home({ programs }: { programs: Program[] }) {
  return (
    <>
      <section className="hero">
        <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          Train. Compete. Succeed.
        </motion.h1>
        <p>High-performance tennis programs for all ages</p>
        <div className="hero-buttons">
          <Link to="/contact">
            <button>Join Now</button>
          </Link>
          <Link to="/programs">
            <button className="outline">View Programs</button>
          </Link>
        </div>
      </section>

      <section className="section">
        <h3>Featured Programs</h3>
        <div className="grid">
          {programs.map((p) => (
            <div key={p.id} className="card">
              <h4>{p.name}</h4>
              <p>{p.desc}</p>
              <Link to="/programs">
                <button>Learn More</button>
              </Link>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

/* ---------- ABOUT ---------- */
function About() {
  return (
    <section className="section">
      <h3>About SAT Sports PVT LTD</h3>
      <div className="card">
        <p>
          SAT Sports PVT LTD is a professional tennis academy focused on player
          development, competitive excellence, and community engagement.
        </p>
        <ul>
          <li>Certified Coaches</li>
          <li>Performance Tracking</li>
          <li>Tournament Pathways</li>
          <li>Player Wellness</li>
        </ul>
      </div>
    </section>
  );
}

/* ---------- PROGRAMS ---------- */
function ProgramsPage() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${API_BASE}/api/programs`)
      .then((res) => res.json())
      .then(setItems)
      .catch((err) => console.error("Failed to load programs", err));
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight={700} mb={3}>
        🎾 Training Programs
      </Typography>

      <Grid container spacing={3}>
        {items.map((p) => (
          <Grid item xs={12} sm={6} md={4} key={p.id}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
                transition: "0.25s",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" alignItems="center" mb={1}>
                  <SportsTennisIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6" fontWeight={600}>
                    {p.title}
                  </Typography>
                </Box>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  {p.description}
                </Typography>

                {/* Optional program details */}
                <Box display="flex" gap={1} flexWrap="wrap">
                  {p.min_age && (
                    <Chip
                      label={`Age ${p.min_age}+`}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  )}

                  {p.category && (
                    <Chip
                      label={p.category}
                      size="small"
                      color="secondary"
                    />
                  )}
                </Box>
              </CardContent>

              <CardActions sx={{ p: 2 }}>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  href={`/programs/${p.id}`}
                >
                  View Schedule
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {items.length === 0 && (
        <Typography mt={4} align="center" color="text.secondary">
          No programs available.
        </Typography>
      )}
    </Box>
  );
}

 function AdminPrograms() {
  const [programs, setPrograms] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [minAge, setMinAge] = useState("");
  const [maxAge, setMaxAge] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  const loadPrograms = () => {
    fetch(`${API_BASE}/api/admin/programs`)
      .then((res) => res.json())
      .then((data) => setPrograms(Array.isArray(data) ? data : []));
  };

  useEffect(() => {
    loadPrograms();
  }, []);

  const saveProgram = () => {
    if (!title || !minAge || !maxAge) {
      alert("Title, Min Age and Max Age are required");
      return;
    }

    const payload = {
      title,
      description,
      min_age: Number(minAge),
      max_age: Number(maxAge),
    };

    if (editingId) {
      fetch(`${API_BASE}/api/programs/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).then(() => {
        resetForm();
        loadPrograms();
      });
    } else {
      fetch(`${API_BASE}/api/programs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).then(() => {
        resetForm();
        loadPrograms();
      });
    }
  };

  const editProgram = (p: any) => {
    setEditingId(p.id);
    setTitle(p.title || "");
    setDescription(p.description || "");
    setMinAge(p.min_age || "");
    setMaxAge(p.max_age || "");
  };

  const deleteProgram = (id: number) => {
    if (!window.confirm("Delete this program?")) return;
    fetch(`${API_BASE}/api/programs/${id}`, { method: "DELETE" }).then(
      () => loadPrograms()
    );
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setMinAge("");
    setMaxAge("");
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Card
        sx={{
          mb: 3,
          borderRadius: 3,
          background: "linear-gradient(135deg, #c31432, #240b36)",
          color: "white",
        }}
      >
        <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <SportsTennisIcon sx={{ fontSize: 40 }} />
          <Box>
            <Typography variant="h5" fontWeight={700}>
              Program Management
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Manage training programs & age groups
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Form */}
      <Card sx={{ mb: 4, borderRadius: 3, boxShadow: "0 8px 20px rgba(0,0,0,0.08)" }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            {editingId ? "✏️ Edit Program" : "➕ Add New Program"}
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Program Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Grid>

            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                type="number"
                label="Min Age"
                value={minAge}
                onChange={(e) => setMinAge(e.target.value)}
              />
            </Grid>

            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                type="number"
                label="Max Age"
                value={maxAge}
                onChange={(e) => setMaxAge(e.target.value)}
              />
            </Grid>

            <Grid item xs={12} md={1} display="flex" alignItems="center">
              <Button
                fullWidth
                variant="contained"
                color="error"
                startIcon={<AddIcon />}
                onClick={saveProgram}
                sx={{ height: 56, borderRadius: 2 }}
              >
                {editingId ? "Save" : "Add"}
              </Button>
            </Grid>
          </Grid>

          {editingId && (
            <Button onClick={resetForm} sx={{ mt: 2 }}>
              Cancel Edit
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Programs Grid */}
      <Grid container spacing={3}>
        {programs.map((p) => (
          <Grid item xs={12} md={4} key={p.id}>
            <Card
              sx={{
                height: "100%",
                borderRadius: 3,
                boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
                transition: "0.2s",
                "&:hover": { transform: "translateY(-4px)" },
              }}
            >
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6" fontWeight={600}>
                    {p.title}
                  </Typography>
                  <Chip
                    label={`${p.min_age} - ${p.max_age} yrs`}
                    color="success"
                    size="small"
                  />
                </Stack>

                <Typography color="text.secondary" sx={{ mt: 1, mb: 2 }}>
                  {p.description || "No description"}
                </Typography>

                <Divider sx={{ mb: 2 }} />

                <Stack direction="row" spacing={1}>
                  <Button
                    variant="contained"
                    color="warning"
                    size="small"
                    onClick={() => editProgram(p)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => deleteProgram(p.id)}
                  >
                    Delete
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

function AdminNews() {
  const [items, setItems] = React.useState<any[]>([]);
  const [title, setTitle] = React.useState("");
  const [body, setBody] = React.useState("");
  const [category, setCategory] = React.useState("News");
  const [isPublished, setIsPublished] = React.useState(true);
  const [editingId, setEditingId] = React.useState<number | null>(null);

  const loadNews = () => {
    fetch(`${API_BASE}/api/admin/news`)
      .then(res => res.json())
      .then(setItems);
  };

  React.useEffect(() => {
    loadNews();
  }, []);

  const saveItem = () => {
    const payload = { title, body, category, isPublished };

    if (editingId) {
      fetch(`${API_BASE}/api/news/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).then(() => {
        resetForm();
        loadNews();
      });
    } else {
      fetch(`${API_BASE}/api/news`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).then(() => {
        resetForm();
        loadNews();
      });
    }
  };

  const editItem = (item: any) => {
    setEditingId(item.id);
    setTitle(item.title);
    setBody(item.body);
    setCategory(item.category);
    setIsPublished(item.isPublished);
  };

  const deleteItem = (id: number) => {
    if (!window.confirm("Delete this item?")) return;
    fetch(`${API_BASE}/api/news/${id}`, {
      method: "DELETE",
    }).then(() => loadNews());
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setBody("");
    setCategory("News");
    setIsPublished(true);
  };

  return (
    <section className="section">
      <h3>Admin Dashboard – Manage News & Events</h3>

      {/* FORM */}
      <div className="card">
        <input
          placeholder="Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <textarea
          placeholder="Content"
          value={body}
          onChange={e => setBody(e.target.value)}
        />

        <select value={category} onChange={e => setCategory(e.target.value)}>
          <option value="News">News</option>
          <option value="Event">Event</option>
        </select>

        <label style={{ display: "block", margin: "8px 0" }}>
          <input
            type="checkbox"
            checked={isPublished}
            onChange={e => setIsPublished(e.target.checked)}
          />{" "}
          Published
        </label>

        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={saveItem}>
            {editingId ? "Update" : "Add"}
          </button>
          {editingId && (
            <button className="outline" onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* LIST */}
      <div className="grid">
        {items.map(n => (
          <div key={n.id} className="card">
            <strong>{n.title}</strong>
            <p className="muted">{n.category}</p>
            <p>{n.body}</p>
            <p>
              Status: {n.isPublished ? "Published" : "Draft"}
            </p>
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={() => editItem(n)}>Edit</button>
              <button className="outline" onClick={() => deleteItem(n.id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

import {
 
  Alert,
  InputAdornment,
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const handleLogin = () => {
    setError("");
    setLoading(true);

    fetch(`${API_BASE}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })
      .then(res => res.json())
      .then(data => {
        setLoading(false);

        if (!data.success) {
          setError(data.message || "Invalid credentials");
          return;
        }

        // ✅ Save session info
        localStorage.setItem("role", data.role);
        localStorage.setItem("userId", String(data.userId));

        if (data.coachId) {
          localStorage.setItem("coachId", String(data.coachId));
        }
        if (data.playerId) {
          localStorage.setItem("playerId", String(data.playerId));
        }

        // ✅ Redirect by role
        if (data.role === "admin") window.location.href = "/admin";
        if (data.role === "coach") window.location.href = "/coach";
        if (data.role === "player") window.location.href = "/player";
      })
      .catch(() => {
        setLoading(false);
        setError("Network error. Please try again.");
      });
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      <Card
        sx={{
          width: "100%",
          maxWidth: 420,
          borderRadius: 4,
          boxShadow: "0 20px 50px rgba(0,0,0,0.6)",
          background: "linear-gradient(180deg, #ffffff 0%, #f7f7f7 100%)",
        }}
      >
        <CardContent sx={{ p: 4 }}>
          {/* Header */}
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <Typography variant="h4" fontWeight={800} color="error">
              SAT Sports
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Login to your dashboard
            </Typography>
          </Box>

          {/* Error */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Username */}
          <TextField
            fullWidth
            label="Username"
            margin="normal"
            value={username}
            onChange={e => setUsername(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon />
                </InputAdornment>
              ),
            }}
          />

          {/* Password */}
          <TextField
            fullWidth
            type="password"
            label="Password"
            margin="normal"
            value={password}
            onChange={e => setPassword(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon />
                </InputAdornment>
              ),
            }}
          />

          {/* Button */}
          <Button
            fullWidth
            size="large"
            variant="contained"
            color="error"
            sx={{
              mt: 3,
              py: 1.5,
              fontWeight: 700,
              borderRadius: 3,
              boxShadow: "0 8px 20px rgba(177,18,38,0.4)",
              transition: "all 0.2s ease",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 12px 28px rgba(177,18,38,0.6)",
              },
            }}
            disabled={loading}
            onClick={handleLogin}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
          <Button
  fullWidth
  variant="outlined"
  sx={{ mt: 2, borderRadius: 3 }}
  onClick={() => navigate("/signup")}
>
  Create New Account
</Button>
          {/* Footer */}
          <Typography
            variant="body2"
            color="text.secondary"
            textAlign="center"
            sx={{ mt: 3 }}
          >
            © {new Date().getFullYear()} SAT Sports Pvt Ltd
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}


function ProtectedRoute({ children }: { children: JSX.Element }) {
  const [authorized, setAuthorized] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    fetch(`${API_BASE}/api/admin/programs`)
      .then(res => {
        if (res.status === 401) {
          window.location.href = "/login";
          return;
        }
        setAuthorized(true);
      })
      .catch(() => window.location.href = "/login");
  }, []);

  if (!authorized) return <p>Checking authentication...</p>;
  return children;
}

/* ---------- NEWS ---------- */
function NewsPage() {
  const [news, setNews] = React.useState<any[]>([]);

  React.useEffect(() => {
    fetch(`${API_BASE}/api/news`)
      .then(res => res.json())
      .then(setNews);
  }, []);

  return (
    <section className="section">
      <h3>News & Events</h3>
      <div className="grid">
        {news.map((n) => (
          <div key={n.id} className="card">
            <strong>{n.title}</strong>
            <p className="muted">{n.category}</p>
            <p>{n.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- TOURNAMENTS ---------- */
function TournamentsPage() {
  const [tournaments, setTournaments] = React.useState<any[]>([]);

  React.useEffect(() => {
    fetch(`${API_BASE}/api/tournaments`)
      .then(res => res.json())
      .then(setTournaments);
  }, []);

  return (
    <section className="section">
      <h3>Tournaments</h3>
      <div className="grid">
        {tournaments.map((t) => (
          <div key={t.id} className="card">
            <strong>{t.name}</strong>
            <p>{t.date}</p>
            <p>{t.location}</p>
            <p>Status: {t.status}</p>
          </div>
        ))}
      </div>
    </section>
  );
}





type PlayerAttendanceRow = {
  session_id: number;
  player_id: number;
  present: number; // 1 or 0
  session_date: string; // ISO string
  playerName: string;
  programTitle: string;
};

type CoachCheckinRow = {
  id: number;
  coachName: string;
  session_date: string;
  start_time: string;
  end_time: string;
  locationName: string;
  checkout_time: string | null;
  work_minutes: number;   // ✅ ADD THIS
};

function AdminAttendance() {
  const [mode, setMode] = React.useState<"players" | "coaches">("players");

  const [playerRows, setPlayerRows] = React.useState<PlayerAttendanceRow[]>([]);
  const [coachRows, setCoachRows] = React.useState<CoachCheckinRow[]>([]);

  const today = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = React.useState(today);

  // Load player attendance by date
  const loadPlayers = () => {
    fetch(`${API_BASE}/api/admin/attendance?date=${selectedDate}`)
      .then(res => res.json())
      .then(setPlayerRows)
      .catch(err => console.error("Failed to load player attendance", err));
  };

  // Load coach check-ins by date
  const loadCoaches = () => {
    fetch(`${API_BASE}/api/admin/coach-checkins?date=${selectedDate}`)
      .then(res => res.json())
      .then(setCoachRows)
      .catch(err => console.error("Failed to load coach check-ins", err));
  };

  // Reload when mode or date changes
  React.useEffect(() => {
    if (mode === "players") {
      loadPlayers();
    } else {
      loadCoaches();
    }
  }, [mode, selectedDate]);

  return (
    <section>
      {/* Header + Controls */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", md: "center" }}
        spacing={2}
        mb={2}
      >
        <Typography variant="h4" fontWeight={700}>
          📊 Attendance Management
        </Typography>

        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            type="date"
            label="Select Date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            size="small"
          />

          <FormControlLabel
            control={
              <Switch
                checked={mode === "coaches"}
                onChange={(e) => setMode(e.target.checked ? "coaches" : "players")}
              />
            }
            label={mode === "coaches" ? "Coach Attendance" : "Player Attendance"}
          />
        </Stack>
      </Stack>

      {/* ================= PLAYER ATTENDANCE ================= */}
      {mode === "players" && (
        <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                <TableCell><strong>Date</strong></TableCell>
                <TableCell><strong>Player</strong></TableCell>
                <TableCell><strong>Program</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {playerRows.map((r, idx) => {
const dateStr = r.session_date.slice(0, 10);

                return (
                  <TableRow key={idx} hover>
                    <TableCell>{dateStr}</TableCell>
                    <TableCell>{r.playerName}</TableCell>
                    <TableCell>
                      <Chip label={r.programTitle} color="primary" size="small" />
                    </TableCell>
                    <TableCell>
                      {r.present ? (
                        <Chip label="Present" color="success" size="small" />
                      ) : (
                        <Chip label="Absent" color="error" size="small" />
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}

              {playerRows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No player attendance records found for this date.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* ================= COACH ATTENDANCE ================= */}
      {mode === "coaches" && (
        <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                <TableCell><strong>Date</strong></TableCell>
                <TableCell><strong>Coach</strong></TableCell>
                <TableCell><strong>Session</strong></TableCell>
                <TableCell><strong>Location</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Work Minutes</strong></TableCell>

              </TableRow>
            </TableHead>

            <TableBody>
              {coachRows.map((r) => {
const dateStr = r.session_date.slice(0, 10);
const isPresent = r.checkout_time === null;

                return (
                  <TableRow key={r.id} hover>
                    <TableCell>{dateStr}</TableCell>
                    <TableCell>{r.coachName}</TableCell>
                    <TableCell>
                      {r.start_time} – {r.end_time}
                    </TableCell>
                    <TableCell>{r.locationName}</TableCell>
                    <TableCell>
                      {isPresent ? (
                        <Chip label="Checked In" color="success" size="small" />
                      ) : (
                        <Chip label="Checked Out" color="default" size="small" />
                      )}
                    </TableCell>
                    <TableCell>
  {r.work_minutes ?? 0} min
</TableCell>

                  </TableRow>
                );
              })}

              {coachRows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No coach check-in records found for this date.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </section>
  );
}


function AdminTournaments() {
  const [items, setItems] = React.useState<any[]>([]);
  const [name, setName] = React.useState("");
  const [date, setDate] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [status, setStatus] = React.useState("Open");
  const [isPublished, setIsPublished] = React.useState(true);
  const [editingId, setEditingId] = React.useState<number | null>(null);

  const loadItems = () => {
    fetch(`${API_BASE}/api/admin/tournaments`)
      .then(res => res.json())
      .then(setItems);
  };

  React.useEffect(() => {
    loadItems();
  }, []);

  const saveItem = () => {
    const payload = { name, date, location, status, isPublished };

    if (editingId) {
      fetch(`${API_BASE}/api/tournaments/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).then(() => {
        resetForm();
        loadItems();
      });
    } else {
      fetch(`${API_BASE}/api/tournaments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).then(() => {
        resetForm();
        loadItems();
      });
    }
  };

  const editItem = (item: any) => {
    setEditingId(item.id);
    setName(item.name);
    setDate(item.date);
    setLocation(item.location);
    setStatus(item.status);
    setIsPublished(item.isPublished);
  };

  const deleteItem = (id: number) => {
    if (!window.confirm("Delete this tournament?")) return;
    fetch(`${API_BASE}/api/tournaments/${id}`, {
      method: "DELETE",
    }).then(() => loadItems());
  };

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setDate("");
    setLocation("");
    setStatus("Open");
    setIsPublished(true);
  };

  return (
    <section className="section">
      <h3>Admin Dashboard – Manage Tournaments</h3>

      {/* FORM */}
      <div className="card">
        <input
          placeholder="Tournament Name"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
        />
        <input
          placeholder="Location"
          value={location}
          onChange={e => setLocation(e.target.value)}
        />

        <select value={status} onChange={e => setStatus(e.target.value)}>
          <option value="Open">Open</option>
          <option value="Closed">Closed</option>
          <option value="Upcoming">Upcoming</option>
        </select>

        <label style={{ display: "block", margin: "8px 0" }}>
          <input
            type="checkbox"
            checked={isPublished}
            onChange={e => setIsPublished(e.target.checked)}
          />{" "}
          Published
        </label>

        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={saveItem}>
            {editingId ? "Update" : "Add"}
          </button>
          {editingId && (
            <button className="outline" onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* LIST */}
      <div className="grid">
        {items.map(t => (
          <div key={t.id} className="card">
            <strong>{t.name}</strong>
            <p>{t.date}</p>
            <p>{t.location}</p>
            <p>Status: {t.status}</p>
            <p>{t.isPublished ? "Published" : "Draft"}</p>
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={() => editItem(t)}>Edit</button>
              <button className="outline" onClick={() => deleteItem(t.id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function AdminPlayers() {
  const [players, setPlayers] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [filter, setFilter] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const loadPlayers = () => {
    fetch(`${API_BASE}/api/admin/players`)
      .then(res => res.json())
      .then(setPlayers);
  };

  const loadPrograms = () => {
    fetch(`${API_BASE}/api/admin/programs`)
      .then(res => res.json())
      .then(setPrograms);
  };

  useEffect(() => {
    loadPlayers();
    loadPrograms();
  }, []);

  // ✅ Excel Upload
  const uploadExcel = async () => {
    if (!file) return alert("Select file");

    const fd = new FormData();
    fd.append("file", file);

    await fetch(`${API_BASE}/api/admin/players/import`, {
      method: "POST",
      body: fd
    });

    alert("Import done");
    setFile(null);
    loadPlayers();
  };

  // ✅ Select Players
  const toggleSelect = (id: number) => {
    setSelected(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : [...prev, id]
    );
  };

  // ✅ Assign Program
  const assignProgram = async (playerId: number, programId: number) => {
    await fetch(`${API_BASE}/api/admin/players/${playerId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ program_id: programId })
    });

    loadPlayers();
  };

  // ✅ Auto Assign (AGE BASED)
  const autoAssign = async (p: any) => {
    const program = programs.find(pr =>
      p.age >= pr.min_age && p.age <= pr.max_age
    );

    if (!program) {
      alert("No matching program for age");
      return;
    }

    await assignProgram(p.id, program.id);
  };

  // ✅ Bulk Assign
  const bulkAssign = async (programId: number) => {
    if (selected.length === 0) return alert("Select players");

    await fetch(`${API_BASE}/api/admin/players/bulk-assign`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        playerIds: selected,
        program_id: programId
      })
    });

    setSelected([]);
    loadPlayers();
  };

  // ✅ Filter Logic
  const filteredPlayers = players.filter(p => {
    if (filter === "unassigned") return !p.programTitle;
    if (filter) return p.programTitle === filter;
    return true;
  });

  return (
    <Box sx={{ p: 3 }}>

      {/* HEADER */}
      <Card sx={{ mb: 3, borderRadius: 3, background: "linear-gradient(135deg,#c31432,#240b36)", color: "#fff" }}>
        <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <SportsTennisIcon sx={{ fontSize: 40 }} />
          <Box>
            <Typography variant="h5" fontWeight={700}>
              Players Management
            </Typography>
            <Typography variant="body2">
              Manage, assign & import players
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* EXCEL UPLOAD */}
      <Card sx={{ mb: 3, p: 2, borderRadius: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            type="file"
            onChange={(e: any) => setFile(e.target.files[0])}
          />
          <Button
            variant="contained"
            color="error"
            startIcon={<UploadIcon />}
            onClick={uploadExcel}
          >
            Import Excel
          </Button>
        </Stack>
      </Card>

      {/* FILTER + BULK */}
      <Card sx={{ mb: 3, p: 2, borderRadius: 3 }}>
        <Stack direction="row" spacing={2}>

          {/* Filter */}
          <Select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            displayEmpty
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="unassigned">Unassigned</MenuItem>
            {programs.map(p => (
              <MenuItem key={p.id} value={p.title}>
                {p.title}
              </MenuItem>
            ))}
          </Select>

          {/* Bulk Assign */}
          <Select
            displayEmpty
            onChange={(e) => bulkAssign(Number(e.target.value))}
          >
            <MenuItem value="">Bulk Assign</MenuItem>
            {programs.map(p => (
              <MenuItem key={p.id} value={p.id}>
                {p.title}
              </MenuItem>
            ))}
          </Select>

        </Stack>
      </Card>

      {/* TABLE */}
      <Paper sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ background: "#f5f5f5" }}>
              <TableCell />
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Age</TableCell>
              <TableCell>Program</TableCell>
              <TableCell>Sub Category</TableCell>
              <TableCell>Auto</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredPlayers.map(p => (
              <TableRow key={p.id} hover>

                {/* CHECKBOX */}
                <TableCell>
                  <Checkbox
                    checked={selected.includes(p.id)}
                    onChange={() => toggleSelect(p.id)}
                  />
                </TableCell>

                <TableCell sx={{ fontWeight: 600, color: "#b11226" }}>
                  {p.name}
                </TableCell>

                <TableCell>{p.email}</TableCell>
                <TableCell>{p.age}</TableCell>

                {/* PROGRAM DROPDOWN */}
                <TableCell>
                  <Select
                    size="small"
                    value={p.program_id || ""}
                    onChange={(e) =>
                      assignProgram(p.id, Number(e.target.value))
                    }
                  >
                    <MenuItem value="">None</MenuItem>
                    {programs.map(pr => (
                      <MenuItem key={pr.id} value={pr.id}>
                        {pr.title}
                      </MenuItem>
                    ))}
                  </Select>
                </TableCell>

                <TableCell>{p.sub_category || "-"}</TableCell>

                {/* AUTO ASSIGN */}
                <TableCell>
                  <Button
                    size="small"
                    variant="contained"
                    color="warning"
                    onClick={() => autoAssign(p)}
                  >
                    Auto
                  </Button>
                </TableCell>

              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}


function PlayerProfile() {
  const params = window.location.pathname.split("/");
  const playerId = params[params.length - 1];

  const [player, setPlayer] = React.useState<any>(null);
  const [attendance, setAttendance] = React.useState<any[]>([]);
  const [programs, setPrograms] = React.useState<any[]>([]);
  const [coaches, setCoaches] = React.useState<any[]>([]);

  React.useEffect(() => {
    // Load player
    fetch(`${API_BASE}/api/admin/players`)
      .then(res => res.json())
      .then(data => {
        const found = data.find((p: any) => p.id == playerId);
        setPlayer(found);
      });

    // Load attendance history
    fetch(`${API_BASE}/api/admin/attendance/player/${playerId}`)
      .then(res => res.json())
      .then(setAttendance);

    // Load programs & coaches for labels
    fetch(`${API_BASE}/api/admin/programs`)
      .then(res => res.json())
      .then(setPrograms);

    fetch(`${API_BASE}/api/admin/coaches`)
      .then(res => res.json())
      .then(setCoaches);
  }, [playerId]);

  if (!player) return <p>Loading player profile...</p>;

  const programName =
    programs.find((p: any) => p.id == player.programId)?.title || "N/A";

  const coachName =
    coaches.find((c: any) => c.id == player.coachId)?.name || "N/A";

  const totalSessions = attendance.length;
  const totalPresent = attendance.filter(a => a.status === "Present").length;
  const totalAbsent = attendance.filter(a => a.status === "Absent").length;
  const attendanceRate =
    totalSessions > 0
      ? Math.round((totalPresent / totalSessions) * 100)
      : 0;

  return (
    <div className="container">
      <h2>Player Profile</h2>

      {/* PLAYER INFO */}
      <div className="card">
        <h3>{player.name}</h3>
        <p><strong>Age:</strong> {player.age || "-"}</p>
        <p><strong>Program:</strong> {programName}</p>
        <p><strong>Coach:</strong> {coachName}</p>
      </div>

      {/* KPI SUMMARY */}
      <div className="grid">
        <div className="card">
          <h4>Total Sessions</h4>
          <p>{totalSessions}</p>
        </div>
        <div className="card">
          <h4>Present</h4>
          <p>{totalPresent}</p>
        </div>
        <div className="card">
          <h4>Absent</h4>
          <p>{totalAbsent}</p>
        </div>
        <div className="card">
          <h4>Attendance %</h4>
          <p>{attendanceRate}%</p>
        </div>
      </div>

      {/* ATTENDANCE HISTORY */}
      <section className="section">
        <h3>Attendance History</h3>

        <div className="grid">
          {attendance.map((a: any) => (
            <div key={a.id} className="card">
              <p><strong>Date:</strong> {a.date}</p>
              <p><strong>Status:</strong> {a.status}</p>
            </div>
          ))}

          {attendance.length === 0 && <p>No attendance records found.</p>}
        </div>
      </section>
    </div>
  );
}
function AdminRevenue() {
  const [items, setItems] = React.useState<any[]>([]);
  const [players, setPlayers] = React.useState<any[]>([]);
  const [programs, setPrograms] = React.useState<any[]>([]);

  const [date, setDate] = React.useState("");
  const [type, setType] = React.useState("CR");
  const [amount, setAmount] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [playerId, setPlayerId] = React.useState("");
  const [programId, setProgramId] = React.useState("");
  const [editingId, setEditingId] = React.useState<number | null>(null);

  const loadItems = () => {
    fetch(`${API_BASE}/api/admin/revenue`)
      .then(res => res.json())
      .then(setItems);
  };

  const loadPlayers = () => {
    fetch(`${API_BASE}/api/admin/players`)
      .then(res => res.json())
      .then(setPlayers);
  };

  const loadPrograms = () => {
    fetch(`${API_BASE}/api/admin/programs`)
      .then(res => res.json())
      .then(setPrograms);
  };

  React.useEffect(() => {
    loadItems();
    loadPlayers();
    loadPrograms();
  }, []);

  const saveItem = () => {
    if (!date || !amount || !description) {
      alert("Date, Amount and Description are required");
      return;
    }

    const payload = {
      date,
      type,
      amount: Number(amount),
      description,
      playerId: playerId || null,
      programId: programId || null,
    };

    if (editingId) {
      fetch(`${API_BASE}/api/revenue/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).then(() => {
        resetForm();
        loadItems();
      });
    } else {
      fetch(`${API_BASE}/api/revenue`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).then(() => {
        resetForm();
        loadItems();
      });
    }
  };

  const editItem = (r: any) => {
    setEditingId(r.id);
    setDate(r.date);
    setType(r.type);
    setAmount(r.amount);
    setDescription(r.description);
    setPlayerId(r.playerId || "");
    setProgramId(r.programId || "");
  };

  const deleteItem = (id: number) => {
    if (!window.confirm("Delete this transaction?")) return;
    fetch(`${API_BASE}/api/revenue/${id}`, {
      method: "DELETE",
    }).then(() => loadItems());
  };

  const resetForm = () => {
    setEditingId(null);
    setDate("");
    setType("CR");
    setAmount("");
    setDescription("");
    setPlayerId("");
    setProgramId("");
  };

  const totalCR = items.filter(i => i.type === "CR").reduce((s, i) => s + i.amount, 0);
  const totalDR = items.filter(i => i.type === "DR").reduce((s, i) => s + i.amount, 0);
  const netBalance = totalCR - totalDR;

  return (
    <section className="section">
      <h3>Admin Dashboard – Revenue</h3>

      {/* KPI */}
      <div className="grid">
        <div className="card">
          <h4>Total Credit (CR)</h4>
          <p>₹ {totalCR}</p>
        </div>
        <div className="card">
          <h4>Total Debit (DR)</h4>
          <p>₹ {totalDR}</p>
        </div>
        <div className="card">
          <h4>Net Balance</h4>
          <p>₹ {netBalance}</p>
        </div>
      </div>

      {/* FORM */}
      <div className="card">
        <label>Date</label>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} />

        <label>Type</label>
        <select value={type} onChange={e => setType(e.target.value)}>
          <option value="CR">Credit (Income)</option>
          <option value="DR">Debit (Expense)</option>
        </select>

        <label>Amount</label>
        <input
          type="number"
          value={amount}
          onChange={e => setAmount(e.target.value)}
        />

        <label>Description</label>
        <input
          value={description}
          onChange={e => setDescription(e.target.value)}
        />

        <label>Player (Optional)</label>
        <select value={playerId} onChange={e => setPlayerId(e.target.value)}>
          <option value="">None</option>
          {players.map((p: any) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        <label>Program (Optional)</label>
        <select value={programId} onChange={e => setProgramId(e.target.value)}>
          <option value="">None</option>
          {programs.map((p: any) => (
            <option key={p.id} value={p.id}>{p.title}</option>
          ))}
        </select>

        <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
          <button onClick={saveItem}>
            {editingId ? "Update Transaction" : "Add Transaction"}
          </button>
          {editingId && (
            <button className="outline" onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>
      </div>

{/* 💰 REVENUE TABLE */}
<TableContainer
  component={Paper}
  sx={{
    borderRadius: 3,
    boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
    mt: 3,
  }}
>
  <Table>
    <TableHead>
      <TableRow>
        <TableCell><strong>Date</strong></TableCell>
        <TableCell><strong>Description</strong></TableCell>
        <TableCell><strong>Type</strong></TableCell>
        <TableCell><strong>Amount</strong></TableCell>
        <TableCell align="right"><strong>Actions</strong></TableCell>
      </TableRow>
    </TableHead>

    <TableBody>
      {items.map((r: any) => (
        <TableRow key={r.id} hover>
          <TableCell>{r.date}</TableCell>
          <TableCell>{r.description}</TableCell>
          <TableCell>{r.type}</TableCell>
          <TableCell>
            <strong>₹ {r.amount}</strong>
          </TableCell>

          <TableCell align="right">
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button
                variant="contained"
                color="error"
                size="small"
                onClick={() => editItem(r)}
              >
                Edit
              </Button>

              <Button
                variant="outlined"
                color="error"
                size="small"
                onClick={() => deleteItem(r.id)}
              >
                Delete
              </Button>
            </Stack>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
</TableContainer>
    </section>
  );
}

function AdminDashboard() {
  const [programs, setPrograms] = React.useState<any[]>([]);
  const [news, setNews] = React.useState<any[]>([]);
  const [tournaments, setTournaments] = React.useState<any[]>([]);
  const [attendance, setAttendance] = React.useState<any[]>([]);

  React.useEffect(() => {
    fetch(`${API_BASE}/api/admin/programs`)
      .then(res => res.json())
      .then(setPrograms);

    fetch(`${API_BASE}/api/admin/news`)
      .then(res => res.json())
      .then(setNews);

    fetch(`${API_BASE}/api/admin/tournaments`)
      .then(res => res.json())
      .then(setTournaments);

    fetch(`${API_BASE}/api/admin/attendance`)
      .then(res => res.json())
      .then(setAttendance);
  }, []);

  const publishedNews = news.filter(n => n.isPublished).length;
  const activeTournaments = tournaments.filter(t => t.isPublished).length;

// Attendance KPIs (Player-based)
const totalSessions = attendance.length;
const totalPresent = attendance.filter(a => a.status === "Present").length;
const totalAbsent = attendance.filter(a => a.status === "Absent").length;
const attendanceRate =
  totalPresent + totalAbsent > 0
    ? Math.round((totalPresent / (totalPresent + totalAbsent)) * 100)
    : 0;

  return (
    <section className="section">
      <h3>Overview</h3>

      <div className="grid">
        <div className="card">
          <h4>Total Programs</h4>
          <p className="kpi-value">{programs.length}</p>
          </div>

        <div className="card">
          <h4>Published News / Events</h4>
          <p>{publishedNews}</p>
        </div>

        <div className="card">
          <h4>Active Tournaments</h4>
          <p>{activeTournaments}</p>
        </div>

        <div className="card">
          <h4>Total Sessions</h4>
          <p className="kpi-value">{totalSessions}</p>
          </div>

        <div className="card">
          <h4>Total Present</h4>
          <p className="kpi-value">{totalPresent}</p>
          </div>

        <div className="card">
          <h4>Total Absent</h4>
          <p className="kpi-value">{totalAbsent}</p>
          </div>

        <div className="card">
          <h4>Attendance %</h4>
          <p className="kpi-value">{attendanceRate}%</p>
          </div>
      </div>
    </section>
  );
}


import "jspdf-autotable";

function AdminReports() {
  const today = new Date().toISOString().slice(0, 10);
  const [from, setFrom] = React.useState(today);
  const [to, setTo] = React.useState(today);

  const [attendance, setAttendance] = React.useState<any[]>([]);
  const [revenue, setRevenue] = React.useState<any[]>([]);

  const loadReports = () => {
    const query = `?from=${from}&to=${to}`;

    fetch(`${API_BASE}/api/admin/reports/attendance` + query)
      .then(res => res.json())
      .then(setAttendance)
      .catch(err => console.error("Attendance report error", err));

    fetch(`${API_BASE}/api/admin/reports/revenue` + query)
      .then(res => res.json())
      .then(setRevenue)
      .catch(err => console.error("Revenue report error", err));
  };

  React.useEffect(() => {
    loadReports();
  }, []);

  // ===== Attendance Calculations =====
  const totalSessions = attendance.length;
  const totalPresent = attendance.filter(a => a.status === "Present").length;
  const totalAbsent = attendance.filter(a => a.status === "Absent").length;
  const attendanceRate =
    totalSessions > 0
      ? Math.round((totalPresent / totalSessions) * 100)
      : 0;

  // Group attendance by date
  const attendanceByDate: any = {};
  attendance.forEach(a => {
    const d = a.date.slice(0, 10);
    if (!attendanceByDate[d]) {
      attendanceByDate[d] = { present: 0, absent: 0 };
    }
    if (a.status === "Present") attendanceByDate[d].present++;
    if (a.status === "Absent") attendanceByDate[d].absent++;
  });

  const attendanceLabels = Object.keys(attendanceByDate);
  const presentData = attendanceLabels.map(d => attendanceByDate[d].present);
  const absentData = attendanceLabels.map(d => attendanceByDate[d].absent);

  // ===== Revenue Calculations =====
  const safeRevenue = Array.isArray(revenue) ? revenue : [];

  const totalCR = safeRevenue.filter(r => r.type === "CR").reduce((s, r) => s + r.amount, 0);
  const totalDR = safeRevenue.filter(r => r.type === "DR").reduce((s, r) => s + r.amount, 0);
  const net = totalCR - totalDR;

  const revenueByDate: any = {};
  revenue.forEach(r => {
    const d = r.date.slice(0, 10);
    if (!revenueByDate[d]) {
      revenueByDate[d] = { CR: 0, DR: 0 };
    }
    if (r.type === "CR") revenueByDate[d].CR += r.amount;
    if (r.type === "DR") revenueByDate[d].DR += r.amount;
  });

  const revenueLabels = Object.keys(revenueByDate);
  const crData = revenueLabels.map(d => revenueByDate[d].CR);
  const drData = revenueLabels.map(d => revenueByDate[d].DR);

  // ===== EXPORT: EXCEL =====
  const exportToExcel = () => {
    const attendanceSheet = XLSX.utils.json_to_sheet(attendance);
    const revenueSheet = XLSX.utils.json_to_sheet(revenue);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, attendanceSheet, "Attendance Report");
    XLSX.utils.book_append_sheet(workbook, revenueSheet, "Revenue Report");

    XLSX.writeFile(workbook, "SAT_Sports_Report.xlsx");
  };

  // ===== EXPORT: PDF =====
  const exportToPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("SAT Sports PVT LTD - Reports", 14, 15);

    doc.setFontSize(12);
    doc.text("Attendance Report", 14, 25);

    (doc as any).autoTable({
      startY: 30,
      head: [["Date", "Player", "Program", "Coach", "Status"]],
      body: attendance.map((a: any) => [
        a.date.slice(0, 10),
        a.playerName,
        a.programTitle,
        a.coachName || "-",
        a.status,
      ]),
    });

    let finalY = (doc as any).lastAutoTable.finalY + 10;

    doc.text("Revenue Report", 14, finalY);

    (doc as any).autoTable({
      startY: finalY + 5,
      head: [["Date", "Type", "Amount", "Description"]],
      body: revenue.map((r: any) => [
        r.date.slice(0, 10),
        r.type,
        `₹ ${r.amount}`,
        r.description || "",
      ]),
    });

    doc.save("SAT_Sports_Report.pdf");
  };

  // ===== Chart Configs =====
  const attendanceChartData = {
    labels: attendanceLabels,
    datasets: [
      { label: "Present", data: presentData },
      { label: "Absent", data: absentData },
    ],
  };

  const revenueChartData = {
    labels: revenueLabels,
    datasets: [
      { label: "Credit (CR)", data: crData },
      { label: "Debit (DR)", data: drData },
    ],
  };

  return (
    <section>
      <Typography variant="h4" fontWeight={700} mb={2}>
        📊 Reports & Analytics
      </Typography>

      {/* FILTERS */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField type="date" label="From" value={from} onChange={e => setFrom(e.target.value)} InputLabelProps={{ shrink: true }} />
          <TextField type="date" label="To" value={to} onChange={e => setTo(e.target.value)} InputLabelProps={{ shrink: true }} />
          <Button variant="contained" onClick={loadReports}>Generate</Button>
          <Button variant="outlined" onClick={exportToExcel}>Export Excel</Button>
          <Button variant="outlined" onClick={exportToPDF}>Export PDF</Button>
        </Stack>
      </Paper>

      {/* KPIs */}
      <Stack direction="row" spacing={2} mb={2}>
        <Paper sx={{ p: 2 }}>Total Sessions: {totalSessions}</Paper>
        <Paper sx={{ p: 2 }}>Present: {totalPresent}</Paper>
        <Paper sx={{ p: 2 }}>Absent: {totalAbsent}</Paper>
        <Paper sx={{ p: 2 }}>Attendance %: {attendanceRate}%</Paper>
      </Stack>

      <Stack direction="row" spacing={2} mb={2}>
        <Paper sx={{ p: 2 }}>Total CR: ₹ {totalCR}</Paper>
        <Paper sx={{ p: 2 }}>Total DR: ₹ {totalDR}</Paper>
        <Paper sx={{ p: 2 }}>Net: ₹ {net}</Paper>
      </Stack>

      {/* ATTENDANCE TABLE */}
      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Player</TableCell>
              <TableCell>Program</TableCell>
              <TableCell>Coach</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {attendance.map((a: any, idx: number) => (
              <TableRow key={idx}>
                <TableCell>{a.date.slice(0, 10)}</TableCell>
                <TableCell>{a.playerName}</TableCell>
                <TableCell>{a.programTitle}</TableCell>
                <TableCell>{a.coachName || "-"}</TableCell>
                <TableCell>{a.status}</TableCell>
              </TableRow>
            ))}
            {attendance.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">No records</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* CHARTS */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography fontWeight={600}>Attendance Trend</Typography>
        <Line data={attendanceChartData} />
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Typography fontWeight={600}>Revenue Trend</Typography>
        <Bar data={revenueChartData} />
      </Paper>
    </section>
  );
}



import {
 
  LinearProgress,
} from "@mui/material";

function PlayerPortal() {
  const userId = localStorage.getItem("userId");

  const [profile, setProfile] = useState<any>(null);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [revenue, setRevenue] = useState<any[]>([]);

  useEffect(() => {
    if (!userId) return;

    fetch(`${API_BASE}/api/player/profile/${userId}`)
      .then(res => res.json())
      .then(setProfile);

    fetch(`${API_BASE}/api/player/attendance/${userId}`)
      .then(res => res.json())
      .then(setAttendance);

    fetch(`${API_BASE}/api/player/revenue/${userId}`)
      .then(res => res.json())
      .then(setRevenue)
      .catch(() => setRevenue([])); // prevent crash
  }, [userId]);

  if (!profile) return <p>Loading...</p>;

  const totalSessions = attendance.length;
  const present = attendance.filter(a => a.status === "present").length;

  const attendanceRate =
    totalSessions > 0
      ? Math.round((present / totalSessions) * 100)
      : 0;

  const totalPaid = revenue
    .filter(r => r.type === "CR")
    .reduce((s, r) => s + r.amount, 0);

  const totalDue = revenue
    .filter(r => r.type === "DR")
    .reduce((s, r) => s + r.amount, 0);

  const balance = totalPaid - totalDue;

  return (
    <Box sx={{ p: 2, maxWidth: 500, margin: "auto" }}>

      {/* HERO PROFILE */}
      <Card sx={{
        borderRadius: 4,
        mb: 2,
        background: "linear-gradient(135deg,#1e3a8a,#2563eb)",
        color: "white"
      }}>
        <CardContent>
          <Stack alignItems="center" spacing={1}>
            <Avatar sx={{ width: 70, height: 70 }}>
              {profile.name?.[0]}
            </Avatar>
            <Typography fontWeight={700}>{profile.name}</Typography>
            <Typography fontSize={14}>{profile.email}</Typography>
            <Chip label={profile.programTitle || "No Program"} color="warning" />
          </Stack>
        </CardContent>
      </Card>

      {/* KPI GRID */}
      <Grid container spacing={2} mb={2}>
        <Grid item xs={6}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography fontSize={12}>Sessions</Typography>
              <Typography variant="h6">{totalSessions}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography fontSize={12}>Balance</Typography>
              <Typography variant="h6">₹{balance}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ATTENDANCE PROGRESS */}
      <Card sx={{ borderRadius: 3, mb: 2 }}>
        <CardContent>
          <Typography fontWeight={700}>
            Attendance ({attendanceRate}%)
          </Typography>

          <LinearProgress
            variant="determinate"
            value={attendanceRate}
            sx={{ height: 10, borderRadius: 5, mt: 1 }}
          />
        </CardContent>
      </Card>

      {/* RECENT ATTENDANCE */}
      <Card sx={{ borderRadius: 3, mb: 2 }}>
        <CardContent>
          <Typography fontWeight={700} mb={1}>
            Recent Sessions
          </Typography>

          {attendance.slice(0, 5).map((a: any) => (
            <Box key={a.id} display="flex" justifyContent="space-between">
              <Typography>{a.date}</Typography>
              <Chip
                label={a.status}
                color={a.status === "present" ? "success" : "error"}
                size="small"
              />
            </Box>
          ))}
        </CardContent>
      </Card>

      {/* PAYMENTS */}
      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <Typography fontWeight={700} mb={1}>
            Payments
          </Typography>

          {revenue.slice(0, 5).map((r: any) => (
            <Box key={r.id} display="flex" justifyContent="space-between">
              <Typography>{r.date}</Typography>
              <Typography
                color={r.type === "CR" ? "green" : "red"}
              >
                ₹{r.amount}
              </Typography>
            </Box>
          ))}
        </CardContent>
      </Card>

    </Box>
  );
}


function AdminCoaches() {
  const [coaches, setCoaches] = React.useState<any[]>([]);
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [editingId, setEditingId] = React.useState<number | null>(null);

  const loadCoaches = () => {
    fetch(`${API_BASE}/api/admin/coaches`)
      .then(res => res.json())
      .then(setCoaches);
  };

  React.useEffect(() => {
    loadCoaches();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setEmail("");
    setPhone("");
  };

  const saveCoach = () => {
    if (!name || !email) {
      alert("Name and email are required");
      return;
    }

    const payload = { name, email, phone };

    if (editingId) {
      fetch(`${API_BASE}/api/admin/coaches/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).then(() => {
        resetForm();
        loadCoaches();
      });
    } else {
      fetch(`${API_BASE}/api/admin/coaches`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).then(() => {
        resetForm();
        loadCoaches();
      });
    }
  };

  const editCoach = (c: any) => {
    setEditingId(c.id);
    setName(c.name || "");
    setEmail(c.email || "");
    setPhone(c.phone || "");
  };

  const deleteCoach = (id: number) => {
    if (!window.confirm("Delete this coach?")) return;
  
    fetch(`${API_BASE}/api/admin/coaches/${id}`, { method: "DELETE" })
      .then(async (res) => {
        if (!res.ok) {
          // Try to read the error message from backend
          let msg = "Failed to delete coach";
          try {
            const data = await res.json();
            if (data?.message) msg = data.message;
          } catch (e) {
            // ignore JSON parse errors
          }
          alert(msg);
          return;
        }
  
        // Success → reload list
        loadCoaches();
      })
      .catch(() => {
        alert("Network error while deleting coach");
      });
  };
  

  return (
    <section>
      <Typography variant="h4" fontWeight={700} mb={2}>
        🎾 Coach Management
      </Typography>

      {/* FORM */}
      <Card sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} mb={2}>
            {editingId ? "✏️ Edit Coach" : "➕ Add Coach"}
          </Typography>

          <Stack spacing={2} direction={{ xs: "column", md: "row" }}>
            <TextField
              label="Name"
              value={name}
              onChange={e => setName(e.target.value)}
              fullWidth
            />

            <TextField
              label="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              fullWidth
            />

            <TextField
              label="Phone"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              fullWidth
            />

            <Button variant="contained" onClick={saveCoach}>
              {editingId ? "Update" : "Add"}
            </Button>

            {editingId && (
              <Button variant="outlined" onClick={resetForm}>
                Cancel
              </Button>
            )}
          </Stack>
        </CardContent>
      </Card>

      {/* TABLE */}
      <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Name</strong></TableCell>
              <TableCell><strong>Email</strong></TableCell>
              <TableCell><strong>Phone</strong></TableCell>
              <TableCell align="right"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {coaches.map((c: any) => (
              <TableRow key={c.id} hover>
                <TableCell>{c.name}</TableCell>
                <TableCell>{c.email || "-"}</TableCell>
                <TableCell>{c.phone || "-"}</TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button size="small" variant="contained" onClick={() => editCoach(c)}>
                      Edit
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      onClick={() => deleteCoach(c.id)}
                    >
                      Delete
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}

            {coaches.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No coaches found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </section>
  );
}


function AdminBreadcrumbs() {
  const path = window.location.pathname.replace("/admin", "");
  const parts = path.split("/").filter(Boolean);

  return (
    <div className="breadcrumbs">
      <span onClick={() => (window.location.href = "/admin")}>
        Dashboard
      </span>

      {parts.map((p, index) => (
        <span key={index}>
          {" "}›{" "}
          <span className="crumb">
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </span>
        </span>
      ))}
    </div>
  );
}
import RestartAltIcon from "@mui/icons-material/RestartAlt";




function AdminSessions() {
  const [sessions, setSessions] = React.useState<any[]>([]);
  const [locations, setLocations] = React.useState<any[]>([]);
  const [coaches, setCoaches] = React.useState<any[]>([]);
  const [programs, setPrograms] = React.useState<any[]>([]);
  const [players, setPlayers] = React.useState<any[]>([]);

  const [editingId, setEditingId] = React.useState<number | null>(null);

  const [date, setDate] = React.useState("");
  const [startTime, setStartTime] = React.useState<Dayjs | null>(null);
  const [endTime, setEndTime] = React.useState<Dayjs | null>(null);
  const [locationId, setLocationId] = React.useState("");
  const [coachId, setCoachId] = React.useState("");
  const [programId, setProgramId] = React.useState("");
  const [selectedPlayers, setSelectedPlayers] = React.useState<number[]>([]);

  const loadSessions = () => {
    fetch(`${API_BASE}/api/admin/sessions`)
      .then(res => res.json())
      .then(setSessions);
  };

  const loadLocations = () => {
    fetch(`${API_BASE}/api/admin/locations`)
      .then(res => res.json())
      .then(setLocations);
  };

  const loadCoaches = () => {
    fetch(`${API_BASE}/api/admin/coaches`)
      .then(res => res.json())
      .then(setCoaches);
  };

  const loadPrograms = () => {
    fetch(`${API_BASE}/api/admin/programs`)
      .then(res => res.json())
      .then(setPrograms);
  };

  const loadPlayersByProgram = (pid: string) => {
    fetch(`${API_BASE}/api/admin/players/program/${pid}`)
      .then(res => res.json())
      .then(setPlayers);
  };

  React.useEffect(() => {
    loadSessions();
    loadLocations();
    loadCoaches();
    loadPrograms();
  }, []);

  const togglePlayer = (id: number) => {
    setSelectedPlayers(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const resetForm = () => {
    setEditingId(null);
    setDate("");
    setStartTime(null);
    setEndTime(null);
    setLocationId("");
    setCoachId("");
    setProgramId("");
    setPlayers([]);
    setSelectedPlayers([]);
  };

  const saveSession = () => {
    if (!date || !startTime || !endTime || !locationId || !coachId || !programId) {
      alert("Please fill all fields");
      return;
    }

    const payload = {
      session_date: dayjs(date).format("YYYY-MM-DD"),  // ✅ important
      start_time: startTime.format("HH:mm:ss"),
      end_time: endTime.format("HH:mm:ss"),
      location_id: Number(locationId),
      coach_id: Number(coachId),
      program_id: Number(programId),
      // If you later want to save players per session, you can send:
      // players: selectedPlayers
    };

    if (editingId) {
      fetch(`${API_BASE}/api/admin/sessions/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).then(() => {
        resetForm();
        loadSessions();
      });
    } else {
      fetch(`${API_BASE}/api/admin/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).then(() => {
        resetForm();
        loadSessions();
      });
    }
  };

  const editSession = (s: any) => {
    setEditingId(s.id);
    setDate(dayjs(s.session_date || s.date).format("YYYY-MM-DD"));
    setStartTime(dayjs(s.start_time || s.startTime, "HH:mm:ss"));
    setEndTime(dayjs(s.end_time || s.endTime, "HH:mm:ss"));
    setLocationId(String(s.location_id));
    setCoachId(String(s.coach_id));
    setProgramId(String(s.program_id || ""));

    setPlayers([]);
    setSelectedPlayers([]);
    if (s.program_id) {
      loadPlayersByProgram(String(s.program_id));
    }
  };

  const deleteSession = (id: number) => {
    if (!window.confirm("Delete this session?")) return;

    fetch(`${API_BASE}/api/admin/sessions/${id}`, { method: "DELETE" })
      .then(async res => {
        if (!res.ok) {
          let msg = "Failed to delete session";
          try {
            const data = await res.json();
            if (data?.message) msg = data.message;
          } catch {}
          alert(msg);
          return;
        }
        loadSessions();
      });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <section>
        {/* Header */}
        <Box
          sx={{
            mb: 3,
            p: 3,
            borderRadius: 3,
            color: "#fff",
            background: "linear-gradient(135deg, #d32f2f, #ff6f00)",
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <SportsTennisIcon sx={{ fontSize: 40 }} />
          <Box>
            <Typography variant="h5" fontWeight={700}>
              Session Management
            </Typography>
            <Typography variant="body2">
              Create, edit, and manage training sessions
            </Typography>
          </Box>
        </Box>

        {/* Create / Edit Card */}
        <Card sx={{ mb: 3, borderRadius: 3, boxShadow: "0 8px 20px rgba(0,0,0,0.1)" }}>
          <CardContent>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              {editingId ? "✏️ Edit Session" : "➕ Create New Session"}
            </Typography>

            <Stack spacing={2}>
              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <TextField
                  type="date"
                  label="Date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />

                <TimePicker
                  label="Start Time"
                  value={startTime}
                  onChange={setStartTime}
                  slotProps={{ textField: { fullWidth: true } }}
                />

                <TimePicker
                  label="End Time"
                  value={endTime}
                  onChange={setEndTime}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Stack>

              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <TextField
                  select
                  label="Location"
                  value={locationId}
                  onChange={e => setLocationId(e.target.value)}
                  fullWidth
                  SelectProps={{ native: true }}
                  InputLabelProps={{ shrink: true }}

                >
                  <option value="">Select Location</option>
                  {locations.map((l: any) => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </TextField>

                <TextField
                  select
                  label="Coach"
                  value={coachId}
                  onChange={e => setCoachId(e.target.value)}
                  fullWidth
                  SelectProps={{ native: true }}
                  InputLabelProps={{ shrink: true }}

                >
                  <option value="">Select Coach</option>
                  {coaches.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </TextField>

                <TextField
                  select
                  label="Program"
                  value={programId}
                  onChange={e => {
                    const pid = e.target.value;
                    setProgramId(pid);
                    setSelectedPlayers([]);
                    if (pid) loadPlayersByProgram(pid);
                    else setPlayers([]);
                  }}
                  fullWidth
                  SelectProps={{ native: true }}
                  InputLabelProps={{ shrink: true }}

                >
                  <option value="">Select Program</option>
                  {programs.map((p: any) => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </TextField>
              </Stack>

              {/* Player Picker */}
              {players.length > 0 && (
                <Box>
                  <Typography fontWeight={600} sx={{ mb: 1 }}>
                    Select Players
                  </Typography>
                  <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell />
                          <TableCell>Name</TableCell>
                          <TableCell>Age</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {players.map((p: any) => (
                          <TableRow key={p.id} hover>
                            <TableCell>
                              <input
                                type="checkbox"
                                checked={selectedPlayers.includes(p.id)}
                                onChange={() => togglePlayer(p.id)}
                              />
                            </TableCell>
                            <TableCell>{p.name}</TableCell>
                            <TableCell>{p.age || "-"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}

              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  sx={{ background: "linear-gradient(135deg, #d32f2f, #ff6f00)" }}
                  onClick={saveSession}
                >
                  {editingId ? "Update Session" : "Create Session"}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<RestartAltIcon />}
                  color="error"
                  onClick={resetForm}
                >
                  Reset
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {/* Sessions List */}
        <Card sx={{ borderRadius: 3, boxShadow: "0 8px 20px rgba(0,0,0,0.1)" }}>
          <CardContent>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              📅 All Sessions
            </Typography>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Time</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Coach</TableCell>
                    <TableCell>Program</TableCell>
                    <TableCell>Players</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sessions.map((s: any) => (
                    <TableRow key={s.id} hover>
                      <TableCell>{s.session_date || s.date}</TableCell>
                      <TableCell>
                        {s.start_time || s.startTime} – {s.end_time || s.endTime}
                      </TableCell>
                      <TableCell>{s.locationName}</TableCell>
                      <TableCell>{s.coachName}</TableCell>
                      <TableCell>
                        <Chip label={s.programTitle || "—"} color="warning" size="small" />
                      </TableCell>
                      <TableCell>{s.playerCount || 0}</TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Button size="small" variant="contained" color="warning" onClick={() => editSession(s)}>
                            Edit
                          </Button>
                          <Button size="small" variant="outlined" color="error" onClick={() => deleteSession(s.id)}>
                            Delete
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}

                  {sessions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        No sessions found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </section>
    </LocalizationProvider>
  );
}

function AdminLayout() {
  return (
    <div className="admin-layout">
      
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo-box">
          <img src="/logo.png" alt="SAT Sports" className="logo" />
          <h2>SAT Sports</h2>
        </div>

        <nav>
          <a href="/admin">📘 Programs</a>
          <a href="/admin/players">👤 Players</a>
          <a href="/admin/coaches">🎾 Coaches</a>
          <a href="/admin/attendance">📅 Attendance</a>
          <a href="/admin/revenue">💰 Revenue</a>
          <a href="/admin/reports">📊 Reports</a>
          <a href="/admin/sessions">📅 Sessions</a>
          <a href="/admin/leaves">📝 Leave Management</a>
          <a href="/admin/locations">📍 Locations (QR)</a>
          <Link to="/admin/live">🟢 Live Coaches</Link>
          <Link to="/admin/court-bookings">Court Bookings</Link>
          <a href="/admin/applications">Applications</a>
          <a href="/admin/payroll">Payroll</a>


        </nav>
      </aside>

      {/* Main Content */}
      <div className="admin-content">
        <h2>Admin Dashboard</h2>
{/* Breadcrumbs */}
<AdminBreadcrumbs />

        <Routes>
          <Route
            path="/"
            element={
              <>
                <AdminDashboard />
                <AdminPrograms />
              </>
            }
          />
          <Route path="news" element={<AdminNews />} />
          <Route path="tournaments" element={<AdminTournaments />} />
          <Route path="attendance" element={<AdminAttendance />} />
          <Route path="players" element={<AdminPlayers />} />
          <Route path="coaches" element={<AdminCoaches />} />
          <Route path="revenue" element={<AdminRevenue />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="sessions" element={<AdminSessions />} />
          <Route path="leaves" element={<AdminLeaves />} />
          <Route path="locations" element={<AdminLocations />} />
          <Route path="live" element={<AdminLivePresence />} />
          <Route path="court-bookings" element={<AdminCourtBookings />} />
          <Route path="applications" element={<AdminApplications />} />
          <Route path="/admin/payroll" element={<AdminCoachPayroll />} />

        </Routes>
      </div>

    </div>
  );
}

/* ---------- CONTACT ---------- */
function Contact() {
  return (
    <section className="section">
      <h3>Contact Us</h3>
      <div className="card">
        <p>
          <strong>SAT Sports PVT LTD</strong>
        </p>
        <p>info@satsports.com</p>
        <form>
          <input placeholder="Name" />
          <input placeholder="Email" />
          <textarea placeholder="Message" />
          <button>Send Enquiry</button>
        </form>
      </div>
    </section>
  );
}

/* ---------- FOOTER ---------- */
function Footer() {
  return (
    <footer className="footer">
      © {new Date().getFullYear()} SAT Sports PVT LTD
    </footer>
  );
}
