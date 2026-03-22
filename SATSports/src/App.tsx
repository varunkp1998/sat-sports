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
import TournamentDetails from "./TournamentDetails.tsx";
import SportsTennisIcon from "@mui/icons-material/SportsTennis";
import PersonIcon from "@mui/icons-material/Person";
import AddIcon from "@mui/icons-material/Add";
import UploadIcon from "@mui/icons-material/Upload";
import TournamentBracket from "./TournamentBracket";
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
<Route path="/tournaments/:id" element={<TournamentDetails />} />
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
import {
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
function Header() {
  const role = localStorage.getItem("role");
  const username = localStorage.getItem("username");

  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  const menuItems = [
    { label: "Home", path: "/" },
    { label: "About", path: "/about" },
    { label: "Programs", path: "/programs" },
    { label: "News", path: "/news" },
    { label: "Tournaments", path: "/tournaments" },
    { label: "Contact", path: "/contact" },
    { label: "Book Court", path: "/book-court" },
    { label: "Join Academy", path: "/register-player" }
  ];

  return (
    <header
    style={{
      position: "sticky",   // ✅ ADD THIS
      top: 0,
      zIndex: 1100,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "10px 20px",
      background: "#111827",
      color: "white"
    }}
  >
      {/* LOGO */}
      <Box display="flex" alignItems="center" gap={1}>
        <img src="/logo.png" alt="logo" style={{ height: 40 }} />
        <span style={{ fontWeight: 700 }}>SAT Sports</span>
      </Box>

      {/* DESKTOP MENU */}
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          gap: 2,
          alignItems: "center"
        }}
      >
        {menuItems.map(item => (
          <Link key={item.path} to={item.path} style={{ color: "white" }}>
            {item.label}
          </Link>
        ))}

        {!role ? (
          <Button
            variant="contained"
            onClick={() => (window.location.href = "/login")}
          >
            Login
          </Button>
        ) : (
          <>
            <span>Hi, {username}</span>

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

            <Button variant="outlined" onClick={handleLogout}>
              Logout
            </Button>
          </>
        )}
      </Box>

      {/* MOBILE MENU BUTTON */}
      <IconButton
        sx={{ display: { xs: "block", md: "none" }, color: "white" }}
        onClick={() => setOpen(true)}
      >
        <MenuIcon />
      </IconButton>

      {/* MOBILE DRAWER */}
      <Drawer anchor="right" open={open} onClose={() => setOpen(false)}>
        <Box sx={{ width: 250, p: 2 }}>
          <List>

            {menuItems.map(item => (
              <ListItem
                button
                key={item.path}
                component={Link}
                to={item.path}
                onClick={() => setOpen(false)}
              >
                <ListItemText primary={item.label} />
              </ListItem>
            ))}

            {!role ? (
              <ListItem button onClick={() => (window.location.href = "/login")}>
                <ListItemText primary="Login" />
              </ListItem>
            ) : (
              <>
                <ListItem>
                  <ListItemText primary={`Hi, ${username}`} />
                </ListItem>

                <ListItem
                  button
                  component={Link}
                  to={
                    role === "admin"
                      ? "/admin"
                      : role === "coach"
                      ? "/coach/profile"
                      : "/portal"
                  }
                >
                  <ListItemText primary="Profile" />
                </ListItem>

                <ListItem button onClick={handleLogout}>
                  <ListItemText primary="Logout" />
                </ListItem>
              </>
            )}

          </List>
        </Box>
      </Drawer>
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
  const [programs, setPrograms] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${API_BASE}/api/programs`)
      .then(res => res.json())
      .then(setPrograms);
  }, []);

  // group by category
  const grouped: any = {};
  programs.forEach(p => {
    const cat = p.category || "Programs";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(p);
  });

  return (
    <Box sx={{ background: "#0f172a", minHeight: "100vh", color: "white" }}>

      {/* HERO */}
      <Box
        sx={{
          height: 240,
          background:
            "linear-gradient(135deg,#dc2626,#991b1b)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column"
        }}
      >
        <Typography variant="h3" fontWeight={900}>
          🎾 Elite Training Programs
        </Typography>

        <Typography sx={{ opacity: 0.8 }}>
          Build champions. Train like a pro.
        </Typography>
      </Box>

      <Box sx={{ p: 3 }}>

        {/* SECTIONS */}
        {Object.keys(grouped).map(category => (
          <Box key={category} mb={5}>

            <Typography
              variant="h5"
              fontWeight={800}
              mb={2}
              sx={{ borderLeft: "4px solid #ef4444", pl: 1 }}
            >
              {category}
            </Typography>

            <Grid container spacing={3}>

              {grouped[category].map((p: any) => (
                <Grid item xs={12} sm={6} md={4} key={p.id}>

                  <Box
                    sx={{
                      borderRadius: 4,
                      overflow: "hidden",
                      background:
                        "linear-gradient(180deg,#1f2937,#111827)",
                      boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
                      transition: "0.3s",
                      "&:hover": {
                        transform: "scale(1.04)"
                      }
                    }}
                  >

                    {/* CARD HEADER */}
                    <Box
                      sx={{
                        p: 2,
                        fontWeight: 700,
                        fontSize: 18
                      }}
                    >
                      {p.title}
                    </Box>

                    {/* AGE */}
                    <Box sx={{ px: 2, opacity: 0.7 }}>
                      Age {p.min_age} – {p.max_age}
                    </Box>

                    {/* CTA */}
                    <Box sx={{ p: 2 }}>
                      <Button
                        fullWidth
                        variant="contained"
                        sx={{
                          borderRadius: 3,
                          background:
                            "linear-gradient(90deg,#ef4444,#dc2626)",
                          fontWeight: 700
                        }}
                      >
                        View Schedule
                      </Button>
                    </Box>

                  </Box>

                </Grid>
              ))}

            </Grid>
          </Box>
        ))}

      </Box>
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
  const inputStyle = {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ddd"
  };
  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setBody("");
    setCategory("News");
    setIsPublished(true);
  };

  return (
    <Box sx={{ p: 3, background: "#f5f7fb", minHeight: "100vh" }}>
  
      {/* HEADER */}
      <Typography variant="h5" fontWeight={700} mb={2}>
        Events & News
      </Typography>
  
      {/* FILTER BAR */}
      <Box display="flex" gap={2} mb={3}>
        <input
          placeholder="Search..."
          style={{
            flex: 1,
            padding: 10,
            borderRadius: 8,
            border: "1px solid #ddd"
          }}
        />
  
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          style={{
            padding: 10,
            borderRadius: 8,
            border: "1px solid #ddd"
          }}
        >
          <option value="News">News</option>
          <option value="Event">Event</option>
        </select>
      </Box>
  
      {/* FORM */}
      <Card sx={{ mb: 4, borderRadius: 3 }}>
        <CardContent>
  
          <Typography fontWeight={600} mb={2}>
            {editingId ? "Edit Item" : "Add New"}
          </Typography>
  
          <Grid container spacing={2}>
  
            <Grid item xs={12} md={4}>
              <input
                placeholder="Title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                style={inputStyle}
              />
            </Grid>
  
            <Grid item xs={12} md={6}>
              <input
                placeholder="Content"
                value={body}
                onChange={e => setBody(e.target.value)}
                style={inputStyle}
              />
            </Grid>
  
            <Grid item xs={12} md={2}>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                style={inputStyle}
              >
                <option value="News">News</option>
                <option value="Event">Event</option>
              </select>
            </Grid>
  
          </Grid>
  
          <Box mt={2} display="flex" justifyContent="space-between">
  
            <label>
              <input
                type="checkbox"
                checked={isPublished}
                onChange={e => setIsPublished(e.target.checked)}
              />{" "}
              Published
            </label>
  
            <Box display="flex" gap={1}>
              <Button variant="contained" onClick={saveItem}>
                {editingId ? "Update" : "Add"}
              </Button>
  
              {editingId && (
                <Button variant="outlined" onClick={resetForm}>
                  Cancel
                </Button>
              )}
            </Box>
  
          </Box>
  
        </CardContent>
      </Card>
  
      {/* LIST (LIKE IMAGE STYLE) */}
      <Grid container spacing={3}>
  
        {items.map(n => {
          const date = new Date(n.created_at || Date.now());
          const day = date.getDate();
          const month = date.toLocaleString("default", { month: "short" });
  
          return (
            <Grid item xs={12} md={6} key={n.id}>
  
              <Card sx={{ borderRadius: 3 }}>
                <CardContent sx={{ display: "flex", gap: 2 }}>
  
                  {/* DATE BOX */}
                  <Box
                    sx={{
                      minWidth: 70,
                      height: 70,
                      background: "#6d28d9",
                      color: "white",
                      borderRadius: 2,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    <Typography fontWeight={700}>
                      {day}
                    </Typography>
                    <Typography fontSize={12}>
                      {month}
                    </Typography>
                  </Box>
  
                  {/* CONTENT */}
                  <Box flex={1}>
  
                    <Typography fontWeight={600}>
                      {n.title}
                    </Typography>
  
                    <Typography color="text.secondary" fontSize={14}>
                      {n.body}
                    </Typography>
  
                    <Box mt={1} display="flex" gap={1}>
                      <Chip
                        label={n.category}
                        size="small"
                        color="primary"
                      />
                      <Chip
                        label={n.isPublished ? "Published" : "Draft"}
                        size="small"
                        color={n.isPublished ? "success" : "default"}
                      />
                    </Box>
  
                    <Box mt={2} display="flex" gap={1}>
                      <Button size="small" onClick={() => editItem(n)}>
                        Edit
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        onClick={() => deleteItem(n.id)}
                      >
                        Delete
                      </Button>
                    </Box>
  
                  </Box>
  
                </CardContent>
              </Card>
  
            </Grid>
          );
        })}
  
      </Grid>
  
    </Box>
  );
}
import {
 
  Alert,
  InputAdornment,
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";

import {
 
  Fade
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";


function Login() {
  const navigate = useNavigate();

  // LOGIN STATE
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // GLOBAL STATE
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // FORGOT PASSWORD STATE
  const [forgotMode, setForgotMode] = useState(false);
  const [otpStep, setOtpStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // 🔐 LOGIN
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

        localStorage.setItem("role", data.role);
        localStorage.setItem("userId", String(data.userId));
        localStorage.setItem("username", data.username || data.name || "User");
        console.log(data.username );
        if (data.coachId) localStorage.setItem("coachId", String(data.coachId));
        if (data.playerId) localStorage.setItem("playerId", String(data.playerId));

        if (data.role === "admin") window.location.href = "/admin";
        if (data.role === "coach") window.location.href = "/coach";
        if (data.role === "player") window.location.href = "/player";
      })
      .catch(() => {
        setLoading(false);
        setError("Network error. Please try again.");
      });
  };

  // 🔥 SEND OTP
  const sendOtp = async () => {
    await fetch(`${API_BASE}/api/auth/send-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email })
    });

    setOtpStep(2);
  };

  // 🔥 RESET PASSWORD
  const resetPassword = async () => {
    const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        otp,
        newPassword
      })
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.message);
      return;
    }

    alert("Password reset successful ✅");

    // reset UI
    setForgotMode(false);
    setOtpStep(1);
    setOtp("");
    setNewPassword("");
  };

  return (
    <Box
    sx={{
      minHeight: "100vh",
      backgroundImage: `
        linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.7)),
        url('/tennis-bg.jpg')
      `,
      backgroundSize: "cover",
      backgroundPosition: "center",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      p: 2
    }}
  >
      <Card
  sx={{
    width: "100%",
    maxWidth: 420,
    borderRadius: 4,
    backdropFilter: "blur(25px)",
    background: "rgba(255, 255, 255, 0.08)",
    border: "1px solid rgba(255,255,255,0.2)",
    color: "white",
    boxShadow: "0 25px 60px rgba(0,0,0,0.6)",
    transition: "0.3s",
    "&:hover": {
      transform: "scale(1.01)"
    }
  }}
>
        <CardContent sx={{ p: 4 }}>

          {/* HEADER */}
          <Box textAlign="center" mb={3}>
          <Box
  display="flex"
  justifyContent="center"
  alignItems="center"
  mb={2}
>
  <img
    src="/logo.png"
    alt="SAT Sports"
    style={{
      height: 60,
      width: 60,
      objectFit: "contain"
    }}
  />
</Box>
            <Typography color="gray">
              {forgotMode ? "Reset your password" : "Login to your account"}
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Fade in={!forgotMode}>
            <Stack spacing={2} display={forgotMode ? "none" : "flex"}>

            <TextField
  label="Username / Email"
  value={username}
  onChange={e => setUsername(e.target.value)}
  fullWidth
  variant="outlined"
  sx={{
    input: { color: "white" },
    label: { color: "#ccc" },
    "& .MuiOutlinedInput-root": {
      background: "rgba(255,255,255,0.05)",
      borderRadius: 2,
      "& fieldset": {
        borderColor: "rgba(255,255,255,0.2)"
      },
      "&:hover fieldset": {
        borderColor: "#60a5fa"
      },
      "&.Mui-focused fieldset": {
        borderColor: "#3b82f6"
      }
    }
  }}
/>

              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                fullWidth
                variant="outlined"
                sx={{
                  input: { color: "white" },
                  label: { color: "#ccc" },
                  "& .MuiOutlinedInput-root": {
                    background: "rgba(255,255,255,0.05)",
                    borderRadius: 2,
                    "& fieldset": {
                      borderColor: "rgba(255,255,255,0.2)"
                    },
                    "&:hover fieldset": {
                      borderColor: "#60a5fa"
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#3b82f6"
                    }
                  }
                }}                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon />
                    </InputAdornment>
                  ),
                }}
              />

<Button
  fullWidth
  size="large"
  variant="contained"
  onClick={handleLogin}
  sx={{
    mt: 1,
    borderRadius: 3,
    background: "linear-gradient(90deg,#3b82f6,#2563eb)",
    fontWeight: 700,
    boxShadow: "0 10px 30px rgba(37,99,235,0.5)",
    "&:hover": {
      background: "linear-gradient(90deg,#2563eb,#1d4ed8)",
      boxShadow: "0 15px 40px rgba(37,99,235,0.7)"
    }
  }}
>
                {loading ? "Logging in..." : "Login"}
              </Button>

              <Typography
                textAlign="center"
                sx={{ cursor: "pointer", color: "#60a5fa" }}
                onClick={() => setForgotMode(true)}
              >
                Forgot Password?
              </Typography>

              <Button
                fullWidth
                variant="outlined"
                sx={{ borderRadius: 3 }}
                onClick={() => navigate("/signup")}
              >
                Create Account
              </Button>
            </Stack>
          </Fade>

          {/* 🔐 FORGOT PASSWORD */}
          <Fade in={forgotMode}>
            <Stack spacing={2} display={!forgotMode ? "none" : "flex"}>

              <TextField
                label="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon />
                    </InputAdornment>
                  ),
                }}
              />

              {otpStep === 1 && (
                <Button variant="contained" onClick={sendOtp}>
                  Send OTP
                </Button>
              )}

              {otpStep === 2 && (
                <>
                  <TextField
                    label="OTP"
                    value={otp}
                    onChange={e => setOtp(e.target.value)}
                  />

                  <TextField
                    label="New Password"
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                  />

                  <Button
                    variant="contained"
                    color="error"
                    onClick={resetPassword}
                  >
                    Reset Password
                  </Button>
                </>
              )}

              <Typography
                textAlign="center"
                sx={{ cursor: "pointer", color: "gray" }}
                onClick={() => {
                  setForgotMode(false);
                  setOtpStep(1);
                }}
              >
                ← Back to Login
              </Typography>

            </Stack>
          </Fade>

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
import {
 
  Tabs,
  Tab,
 
} from "@mui/material";
function NewsPage() {
  const [news, setNews] = React.useState<any[]>([]);
  const [tab, setTab] = React.useState(0);
  const [search, setSearch] = React.useState("");

  React.useEffect(() => {
    fetch(`${API_BASE}/api/news`)
      .then(res => res.json())
      .then(setNews);
  }, []);

  // FILTER LOGIC
  const filtered = news.filter(n => {
    const matchesTab =
      tab === 0 ? n.category === "Event" : n.category === "News";

    const matchesSearch =
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.body.toLowerCase().includes(search.toLowerCase());

    return matchesTab && matchesSearch;
  });

  return (
    <Box sx={{ p: 4, background: "#f9fafb", minHeight: "100vh" }}>

      {/* HEADER */}
      <Typography variant="h4" fontWeight={700} mb={3}>
        Events & News
      </Typography>

      {/* TABS */}
      <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Events" />
        <Tab label="News" />
      </Tabs>

      {/* SEARCH */}
      <TextField
        placeholder="What are you looking for?"
        fullWidth
        size="small"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 3 }}
      />

      {/* LIST */}
      <Grid container spacing={3}>
        {filtered.map((n) => {
          const date = new Date(n.created_at || Date.now());
          const day = date.getDate();
          const month = date.toLocaleString("default", { month: "short" });

          return (
            <Grid item xs={12} md={6} key={n.id}>
              <Card sx={{ borderRadius: 3 }}>
                <CardContent sx={{ display: "flex", gap: 2 }}>

                  {/* DATE BOX */}
                  <Box
                    sx={{
                      minWidth: 70,
                      height: 70,
                      background: "#6d28d9",
                      color: "white",
                      borderRadius: 2,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    <Typography fontWeight={700}>
                      {day}
                    </Typography>
                    <Typography fontSize={12}>
                      {month}
                    </Typography>
                  </Box>

                  {/* CONTENT */}
                  <Box flex={1}>
                    <Typography fontWeight={600}>
                      {n.title}
                    </Typography>

                    <Typography
                      color="text.secondary"
                      fontSize={14}
                      sx={{ mt: 0.5 }}
                    >
                      {n.body}
                    </Typography>

                    <Box mt={1}>
                      <Chip
                        label={n.category}
                        size="small"
                        color="primary"
                      />
                    </Box>
                  </Box>

                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

    </Box>
  );
}
/* ---------- TOURNAMENTS ---------- */
 function TournamentsPage() {
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_BASE}/api/tournaments`)
      .then(res => res.json())
      .then(setTournaments);
  }, []);

  const filtered =
    filter === "all"
      ? tournaments
      : tournaments.filter(t => t.status === filter);

  const getStatusColor = (status: string) => {
    if (status === "live") return "error";
    if (status === "upcoming") return "warning";
    return "success";
  };

  const getCountdown = (date: string) => {
    const diff = new Date(date).getTime() - Date.now();
    if (diff <= 0) return "Started";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return `${days} days left`;
  };

  return (
    <Box sx={{ p: 3, background: "#f5f7fb", minHeight: "100vh" }}>

      {/* HERO */}
      <Box mb={3}>
        <Typography variant="h4" fontWeight={800}>
          🏆 Tournaments
        </Typography>
        <Typography color="text.secondary">
          Compete, track, and win
        </Typography>
      </Box>

      {/* FILTERS */}
      <Stack direction="row" spacing={1} mb={3}>
        {["all", "live", "upcoming", "completed"].map(f => (
          <Chip
            key={f}
            label={f.toUpperCase()}
            color={filter === f ? "primary" : "default"}
            onClick={() => setFilter(f)}
            clickable
          />
        ))}
      </Stack>

      {/* GRID */}
      <Grid container spacing={3}>
        {filtered.map((t) => (
          <Grid item xs={12} md={4} key={t.id}>
            <Card
              sx={{
                borderRadius: 4,
                overflow: "hidden",
                transition: "0.3s",
                "&:hover": {
                  transform: "translateY(-6px)"
                }
              }}
            >

              {/* BANNER */}
              <Box
                sx={{
                  height: 140,
                  background:
                    "linear-gradient(135deg,#ef4444,#b91c1c)",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700
                }}
              >
                {t.name}
              </Box>

              <CardContent>

                {/* STATUS */}
                <Chip
                  label={t.status}
                  color={getStatusColor(t.status)}
                  size="small"
                />

                {/* DETAILS */}
                <Typography mt={1}>
                  📅 {t.date}
                </Typography>

                <Typography>
                  📍 {t.location}
                </Typography>

                {/* COUNTDOWN */}
                <Typography color="text.secondary" mt={1}>
                  ⏳ {getCountdown(t.date)}
                </Typography>

                {/* PLAYERS */}
                <Typography mt={1}>
                  👥 {t.playerCount || 0} players
                </Typography>

                {/* ACTION */}
                <Button
                  fullWidth
                  variant="contained"
                  sx={{ mt: 2, borderRadius: 3 }}
                >
                  {t.status === "completed"
                    ? "View Results"
                    : "Register"}
                </Button>
                <Button
  fullWidth
  variant="contained"
  sx={{ mt: 2, borderRadius: 3 }}
  onClick={() => navigate(`/tournaments/${t.id}`)}
>
  View Tournament
</Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filtered.length === 0 && (
        <Typography mt={4} color="text.secondary">
          No tournaments found
        </Typography>
      )}

    </Box>
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

  const [items, setItems] = useState([]);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    date: "",
    location: "",
    status: "upcoming"
  });

  const loadItems = () => {
    fetch(`${API_BASE}/api/admin/tournaments`)
      .then(res => res.json())
      .then(setItems);
  };

  useEffect(() => {
    loadItems();
  }, []);

  const save = async () => {
    await fetch(`${API_BASE}/api/tournaments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(form)
    });

    setForm({ name: "", date: "", location: "", status: "upcoming" });
    loadItems();
  };

  const deleteItem = async (id) => {
    if (!window.confirm("Delete tournament?")) return;

    await fetch(`${API_BASE}/api/tournaments/${id}`, {
      method: "DELETE"
    });

    loadItems();
  };

  const generateBrackets = async (id) => {
    await fetch(`${API_BASE}/api/admin/tournaments/${id}/generate-brackets`, {
      method: "POST"
    });

    alert("Brackets generated 🎯");
  };
  const shuffleSeeding = () => {
    setSelected(prev => [...prev].sort(() => Math.random() - 0.5));
  };
  const statusColor = (status) => {
    if (status === "live") return "error";
    if (status === "upcoming") return "warning";
    return "success";
  };

  return (
    <Box sx={{ p: 3 }}>

      {/* HEADER */}
      <Typography variant="h4" fontWeight={800} mb={3}>
        🏆 Tournament Management
      </Typography>

      {/* CREATE FORM */}
      <Card sx={{ mb: 4, borderRadius: 3 }}>
        <CardContent>
          <Typography fontWeight={700} mb={2}>
            Create Tournament
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Name"
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                type="date"
                value={form.date}
                onChange={(e) =>
                  setForm({ ...form, date: e.target.value })
                }
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Location"
                value={form.location}
                onChange={(e) =>
                  setForm({ ...form, location: e.target.value })
                }
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <Button
                fullWidth
                variant="contained"
                sx={{ height: "56px" }}
                onClick={save}
              >
                Create
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* LIST */}
      <Grid container spacing={3}>
        {items.map((t) => (
          <Grid item xs={12} md={4} key={t.id}>
            <Card
              sx={{
                borderRadius: 4,
                transition: "0.3s",
                "&:hover": {
                  transform: "translateY(-6px)"
                }
              }}
            >
              <CardContent>

                {/* TITLE */}
                <Typography fontWeight={700} fontSize={18}>
                  {t.name}
                </Typography>

                {/* META */}
                <Typography mt={1}>
                  📅 {t.date}
                </Typography>

                <Typography>
                  📍 {t.location}
                </Typography>

                {/* STATUS */}
                <Chip
                  label={t.status}
                  color={statusColor(t.status)}
                  size="small"
                  sx={{ mt: 1 }}
                />
<Select
  size="small"
  fullWidth
  value={t.status}
  onChange={async (e) => {
    await fetch(`${API_BASE}/api/tournaments/${t.id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: e.target.value })
    });

    loadItems();
  }}
  sx={{ mt: 2 }}
>
  <MenuItem value="upcoming">Upcoming</MenuItem>
  <MenuItem value="live">Live</MenuItem>
  <MenuItem value="completed">Completed</MenuItem>
</Select>
                {/* ACTIONS */}
                <Stack spacing={1} mt={2}>

                  <Button
                    variant="contained"
                    onClick={() => generateBrackets(t.id)}
                  >
                    Generate Brackets
                  </Button>
                  <Button
  variant="outlined"
  onClick={() => navigate(`/admin/tournaments/${t.id}/players`)}
>
  Manage Players
</Button>
<Button onClick={shuffleSeeding}>Auto Seed</Button>
                  <Button
                    variant="outlined"
                    onClick={() =>
                      navigate(`/admin/tournaments/${t.id}/matches`)
                    }
                  >
                    View Matches
                  </Button>

                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => deleteItem(t.id)}
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


import {
 Dialog, DialogTitle, DialogContent, DialogActions,
  useMediaQuery
} from "@mui/material";

function AdminPlayers() {
  const [players, setPlayers] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    age: "",
    program_id: ""
  });

  const isMobile = useMediaQuery("(max-width:768px)");

  const load = () => {
    fetch(`${API_BASE}/api/admin/players`)
      .then(res => res.json())
      .then(setPlayers);

    fetch(`${API_BASE}/api/admin/programs`)
      .then(res => res.json())
      .then(setPrograms);
  };

  useEffect(() => {
    load();
  }, []);

  // 🔍 SEARCH
  const filtered = players.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.email.toLowerCase().includes(search.toLowerCase())
  );

  // ➕ ADD
  const openAdd = () => {
    setEditing(null);
    setForm({ name: "", email: "", age: "", program_id: "" });
    setOpen(true);
  };

  // ✏️ EDIT
  const openEdit = (p: any) => {
    setEditing(p);
    setForm({
      name: p.name,
      email: p.email,
      age: p.age,
      program_id: p.program_id || ""
    });
    setOpen(true);
  };

  // 💾 SAVE
  const save = async () => {
    const url = editing
      ? `${API_BASE}/api/admin/players/${editing.id}`
      : `${API_BASE}/api/admin/players`;

    const method = editing ? "PUT" : "POST";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    setOpen(false);
    load();
  };

  // ❌ DELETE
  const remove = async (id: number) => {
    if (!window.confirm("Delete player?")) return;

    await fetch(`${API_BASE}/api/admin/players/${id}`, {
      method: "DELETE"
    });

    load();
  };

  // 🎯 ASSIGN PROGRAM
  const assignProgram = async (id: number, program_id: number) => {
    await fetch(`${API_BASE}/api/admin/players/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ program_id })
    });

    load();
  };

  // ⚡ AUTO ASSIGN (RESTORED)
  const autoAssign = async (p: any) => {
    const program = programs.find(pr =>
      p.age >= pr.min_age && p.age <= pr.max_age
    );

    if (!program) {
      alert("No matching program");
      return;
    }

    await assignProgram(p.id, program.id);
  };

  return (
    <Box sx={{ p: 2 }}>

      {/* HEADER */}
      <Stack direction="row" justifyContent="space-between" mb={2}>
        <Typography variant="h5">Players</Typography>
        <Button variant="contained" onClick={openAdd}>
          + Add
        </Button>
      </Stack>

      {/* SEARCH */}
      <TextField
        fullWidth
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 2 }}
      />

      {/* 📱 MOBILE VIEW */}
      {isMobile ? (
        <Stack spacing={2}>
          {filtered.map(p => (
            <Card key={p.id}>
              <CardContent>

                <Typography fontWeight={600}>{p.name}</Typography>
                <Typography color="text.secondary">{p.email}</Typography>
                <Typography>Age: {p.age}</Typography>

                <Select
                  fullWidth
                  size="small"
                  sx={{ mt: 1 }}
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

                <Stack direction="row" spacing={1} mt={1}>
                  <Button fullWidth onClick={() => openEdit(p)}>
                    Edit
                  </Button>

                  <Button
                    fullWidth
                    color="error"
                    onClick={() => remove(p.id)}
                  >
                    Delete
                  </Button>
                </Stack>

                {/* ✅ AUTO ASSIGN BUTTON */}
                <Button
                  fullWidth
                  sx={{ mt: 1 }}
                  variant="contained"
                  color="warning"
                  onClick={() => autoAssign(p)}
                >
                  Auto Assign
                </Button>

              </CardContent>
            </Card>
          ))}
        </Stack>
      ) : (
        /* 💻 DESKTOP TABLE */
        <Paper sx={{ overflowX: "auto" }}>
          <Table sx={{ minWidth: 800 }}>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Age</TableCell>
                <TableCell>Program</TableCell>
                <TableCell>Auto</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filtered.map(p => (
                <TableRow key={p.id}>
                  <TableCell>{p.name}</TableCell>
                  <TableCell>{p.email}</TableCell>
                  <TableCell>{p.age}</TableCell>

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

                  {/* ✅ AUTO BUTTON */}
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

                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Button size="small" onClick={() => openEdit(p)}>
                        Edit
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        onClick={() => remove(p.id)}
                      >
                        Delete
                      </Button>
                    </Stack>
                  </TableCell>

                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      {/* MODAL */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
        <DialogTitle>{editing ? "Edit" : "Add"} Player</DialogTitle>

        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Name"
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
            />
            <TextField
              label="Email"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
            />
            <TextField
              label="Age"
              type="number"
              value={form.age}
              onChange={(e) =>
                setForm({ ...form, age: e.target.value })
              }
            />
            <Select
              value={form.program_id}
              onChange={(e) =>
                setForm({ ...form, program_id: e.target.value })
              }
              displayEmpty
            >
              <MenuItem value="">Select Program</MenuItem>
              {programs.map(p => (
                <MenuItem key={p.id} value={p.id}>
                  {p.title}
                </MenuItem>
              ))}
            </Select>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={save}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

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





import {
  ResponsiveContainer,
  LineChart,
  XAxis,
} from "recharts";







import EventIcon from "@mui/icons-material/Event";
import PercentIcon from "@mui/icons-material/Percent";
import WarningIcon from "@mui/icons-material/Warning";




import SearchIcon from "@mui/icons-material/Search";






import { DataGrid } from "@mui/x-data-grid";

 function AdminDashboard() {
  const username = localStorage.getItem("username") || "Admin";

  const [players, setPlayers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [applications, setApplications] = useState([]);

  ///////////////////////////////////////////////////////
  // 🔥 FETCH REAL DATA
  ///////////////////////////////////////////////////////

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/api/admin/players`).then(r => r.json()),
      fetch(`${API_BASE}/api/admin/court-bookings`).then(r => r.json()),
      fetch(`${API_BASE}/api/admin/applications`).then(r => r.json())
    ]).then(([p, b, a]) => {
      setPlayers(p);
      setBookings(b);
      setApplications(a);
    });
  }, []);

  ///////////////////////////////////////////////////////
  // 📊 REAL STATS (NO DUMMY)
  ///////////////////////////////////////////////////////

  const stats = [
    {
      label: "Total Players",
      value: players.length,
      gradient: "linear-gradient(135deg,#6366f1,#4f46e5)"
    },
    {
      label: "Bookings",
      value: bookings.length,
      gradient: "linear-gradient(135deg,#06b6d4,#3b82f6)"
    },
    {
      label: "Applications",
      value: applications.length,
      gradient: "linear-gradient(135deg,#ec4899,#f43f5e)"
    },
    {
      label: "Programs",
      value: [...new Set(players.map(p => p.program_id))].length,
      gradient: "linear-gradient(135deg,#f97316,#ef4444)"
    }
  ];

  ///////////////////////////////////////////////////////
  // 📊 TABLE COLUMNS
  ///////////////////////////////////////////////////////

  const columns = [
    {
      field: "name",
      headerName: "Name",
      flex: 1
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
      renderCell: (params) => (
        <span style={{ color: "#2563eb" }}>
          {params.value || "-"}
        </span>
      )
    },
    {
      field: "programTitle",
      headerName: "Program",
      flex: 1,
      renderCell: (params) => params.value || "-"
    },
    {
      field: "category",
      headerName: "Category",
      flex: 1,
      renderCell: (params) => (
        <span
          style={{
            padding: "4px 10px",
            borderRadius: "999px",
            background: "#f3f4f6",
            fontSize: "12px"
          }}
        >
          {params.value || "General"}
        </span>
      )
    }
  ];

  ///////////////////////////////////////////////////////

  return (
    <Box
    sx={{
      width: "100%",
      maxWidth: "100vw",
      overflowX: "hidden",   // ✅ prevent horizontal scroll
      px: { xs: 2, md: 4 },
      py: 2
    }}
  >

      {/* 🔝 HEADER */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4
        }}
      >
        <Typography variant="h4" fontWeight={700}>
          Welcome, {username} 👋
        </Typography>

        <Avatar sx={{ bgcolor: "#4f46e5", width: 40, height: 40 }}>
          {username[0]}
        </Avatar>
      </Box>

      {/* 💎 BIG FULL WIDTH CARDS */}
      <Grid container spacing={2}>
  {stats.map((s) => (
    <Grid item xs={12} sm={6} lg={3} key={s.label}>
            <Box
  sx={{
    width: "100%",           // ✅ FULL WIDTH
    minHeight: 160,
    p: 3,
    borderRadius: 4,
    color: "white",
    background: s.gradient,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between"
  }}
>
              <Typography fontSize={14}>{s.label}</Typography>

              <Typography variant="h3" fontWeight={800}>
                {s.value}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* 📊 TABLE */}
      <Card
        sx={{
          borderRadius: 4,
          p: 2,
          boxShadow: "0 10px 30px rgba(0,0,0,0.05)"
        }}
      >
        <Typography variant="h6" mb={2}>
          Players
        </Typography>

        <Box sx={{ width: "100%", overflowX: "auto" }}>
  <Box sx={{ minWidth: 600 }}>  {/* force scroll instead of break */}
    <DataGrid
      rows={players}
      columns={columns}
      getRowId={(row) => row.id}
      autoHeight
      pageSize={5}
      sx={{
        border: "none",
        "& .MuiDataGrid-columnHeaders": {
          background: "#f9fafb"
        },
        "& .MuiDataGrid-cell": {
          whiteSpace: "nowrap"   // ✅ prevents breaking
        }
      }}
    />
  </Box>
</Box>
      </Card>
    </Box>
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
  const navigate = useNavigate();

  const [profile, setProfile] = useState<any>(null);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [revenue, setRevenue] = useState<any[]>([]);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
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
  const changePassword = async () => {
    if (!oldPassword || !newPassword) {
      alert("Enter both passwords");
      return;
    }
  
    const res = await fetch(`${API_BASE}/api/player/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userId,
        oldPassword,
        newPassword
      })
    });
  
    const data = await res.json();
  
    if (!res.ok) {
      alert(data.message);
      return;
    }
  
    alert("Password updated ✅");
    setOldPassword("");
    setNewPassword("");
  };
  return (
    <Box sx={{ p: 2, maxWidth: 500, margin: "auto" }}>
<Box display="flex" alignItems="center" mb={2}>
  <Button
    onClick={() => navigate("/player/dashboard")}
    sx={{
      textTransform: "none",
      fontWeight: 600
    }}
  >
    ← Back to Dashboard
  </Button>

  <Typography ml={1} color="text.secondary">
    Dashboard
  </Typography>
</Box>      {/* HERO PROFILE */}
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
      <Card sx={{ borderRadius: 3, mt: 2 }}>
  <CardContent>
    <Typography fontWeight={700} mb={2}>
      🔐 Change Password
    </Typography>

    <Stack spacing={2}>
      <TextField
        label="Old Password"
        type="password"
        value={oldPassword}
        onChange={(e) => setOldPassword(e.target.value)}
        fullWidth
      />

      <TextField
        label="New Password"
        type="password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        fullWidth
      />

      <Button
        variant="contained"
        color="error"
        onClick={changePassword}
      >
        Update Password
      </Button>
    </Stack>
  </CardContent>
</Card>
    </Box>
  );
}




function AdminCoaches() {
  const [coaches, setCoaches] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: ""
  });

  const isMobile = useMediaQuery("(max-width:768px)");

  const load = () => {
    fetch(`${API_BASE}/api/admin/coaches`)
      .then(res => res.json())
      .then(setCoaches);
  };

  useEffect(() => {
    load();
  }, []);

  // 🔍 SEARCH
  const filtered = coaches.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  // ➕ ADD
  const openAdd = () => {
    setEditing(null);
    setForm({ name: "", email: "", phone: "" });
    setOpen(true);
  };

  // ✏️ EDIT
  const openEdit = (c: any) => {
    setEditing(c);
    setForm({
      name: c.name || "",
      email: c.email || "",
      phone: c.phone || ""
    });
    setOpen(true);
  };

  // 💾 SAVE
  const save = async () => {
    if (!form.name || !form.email) {
      alert("Name & Email required");
      return;
    }

    const url = editing
      ? `${API_BASE}/api/admin/coaches/${editing.id}`
      : `${API_BASE}/api/admin/coaches`;

    const method = editing ? "PUT" : "POST";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    setOpen(false);
    load();
  };

  // ❌ DELETE
  const remove = async (id: number) => {
    if (!window.confirm("Delete coach?")) return;

    const res = await fetch(`${API_BASE}/api/admin/coaches/${id}`, {
      method: "DELETE"
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.message || "Delete failed");
      return;
    }

    load();
  };

  return (
    <Box sx={{ p: 2 }}>

      {/* HEADER */}
      <Stack direction="row" justifyContent="space-between" mb={2}>
        <Typography variant="h5">Coaches</Typography>
        <Button variant="contained" onClick={openAdd}>
          + Add Coach
        </Button>
      </Stack>

      {/* SEARCH */}
      <TextField
        fullWidth
        placeholder="Search coaches..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 2 }}
      />

      {/* 📱 MOBILE VIEW */}
      {isMobile ? (
        <Stack spacing={2}>
          {filtered.map(c => (
            <Card key={c.id}>
              <CardContent>

                <Typography fontWeight={600}>
                  {c.name}
                </Typography>

                <Typography color="text.secondary">
                  {c.email}
                </Typography>

                <Typography>
                  {c.phone || "-"}
                </Typography>

                <Stack direction="row" spacing={1} mt={1}>
                  <Button fullWidth onClick={() => openEdit(c)}>
                    Edit
                  </Button>

                  <Button
                    fullWidth
                    color="error"
                    onClick={() => remove(c.id)}
                  >
                    Delete
                  </Button>
                </Stack>

              </CardContent>
            </Card>
          ))}
        </Stack>
      ) : (
        /* 💻 DESKTOP TABLE */
        <Paper sx={{ overflowX: "auto" }}>
          <Table sx={{ minWidth: 600 }}>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filtered.map(c => (
                <TableRow key={c.id} hover>

                  <TableCell>{c.name}</TableCell>
                  <TableCell>{c.email}</TableCell>
                  <TableCell>{c.phone || "-"}</TableCell>

                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button size="small" onClick={() => openEdit(c)}>
                        Edit
                      </Button>

                      <Button
                        size="small"
                        color="error"
                        onClick={() => remove(c.id)}
                      >
                        Delete
                      </Button>
                    </Stack>
                  </TableCell>

                </TableRow>
              ))}

              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No coaches found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Paper>
      )}

      {/* MODAL */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
        <DialogTitle>
          {editing ? "Edit Coach" : "Add Coach"}
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2} mt={1}>

            <TextField
              label="Name"
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
            />

            <TextField
              label="Email"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
            />

            <TextField
              label="Phone"
              value={form.phone}
              onChange={(e) =>
                setForm({ ...form, phone: e.target.value })
              }
            />

          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={save}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
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
  const [open, setOpen] = useState(false);

  const menuItems = [
    { label: "📊 Dashboard", path: "/admin" },
    { label: "📘 Programs", path: "/admin/programs" },
    { label: "👤 Players", path: "/admin/players" },
    { label: "🎾 Coaches", path: "/admin/coaches" },
    { label: "📅 Attendance", path: "/admin/attendance" },
    { label: "💰 Revenue", path: "/admin/revenue" },
    { label: "📊 Reports", path: "/admin/reports" },
    { label: "📅 Sessions", path: "/admin/sessions" },
    { label: "📝 Leave Management", path: "/admin/leaves" },
    { label: "📍 Locations", path: "/admin/locations" },
    { label: "🏆 Tournaments", path: "/admin/tournaments" },
    { label: "📰 News", path: "/admin/news" },
    { label: "🟢 Live Coaches", path: "/admin/live" },
    { label: "Court Bookings", path: "/admin/court-bookings" },
    { label: "📄 Applications", path: "/admin/applications" },
    { label: "💼 Payroll", path: "/admin/payroll" }
  ];

  return (
    <Box sx={{ display: "flex",    flexDirection: { xs: "column", md: "row" }   // ✅ ADD THIS
  }}>

      {/* MOBILE TOP BAR */}
      <Box
  sx={{
    display: { xs: "flex", md: "none" },
    position: "sticky",   // ✅ FIX
    top: 0,               // ✅ stick to top
    zIndex: 1000,         // ✅ stay above content
    width: "100%",
    background: "#111827",
    color: "white",
    p: 1,
    alignItems: "center",
    justifyContent: "space-between"
  }}
>
  <span style={{ fontWeight: 600 }}>Admin</span>

  <IconButton onClick={() => setOpen(true)} sx={{ color: "white" }}>
    <MenuIcon />
  </IconButton>
</Box>

      {/* DESKTOP SIDEBAR */}
      <Box
        sx={{
          width: 250,
          background: "#111827",
          color: "white",
          height: "100vh",
          position: "fixed",
          overflowY: "auto",
          overflowX: "hidden",
          display: { xs: "none", md: "block" }
        }}
      >
        <Box sx={{ p: 2 }}>
          <img src="/logo.png" style={{ height: 40 }} />
          <h3>SAT Sports</h3>
        </Box>

        <List>
          {menuItems.map(item => (
            <ListItem
              button
              key={item.path}
              component={Link}
              to={item.path}
            >
              <ListItemText primary={item.label} />
            </ListItem>
          ))}
        </List>
      </Box>

      {/* MOBILE DRAWER */}
      <Drawer
  anchor="right"   // ✅ ADD THIS
  open={open}
  onClose={() => setOpen(false)}
>
          <Box sx={{ width: 250 }}>
          <List>
            {menuItems.map(item => (
              <ListItem
                button
                key={item.path}
                component={Link}
                to={item.path}
                onClick={() => setOpen(false)}
              >
                <ListItemText primary={item.label} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* MAIN CONTENT */}
      <Box
        sx={{
          flexGrow: 1,
          p: 3,
          ml: { md: "250px" },
        }}
      >
        <h2>Admin Dashboard</h2>

        <AdminBreadcrumbs />

        <Routes>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="programs" element={<AdminPrograms />} />
          <Route path="news" element={<AdminNews />} />
          <Route path="players" element={<AdminPlayers />} />
          <Route path="coaches" element={<AdminCoaches />} />
          <Route path="attendance" element={<AdminAttendance />} />
          <Route path="revenue" element={<AdminRevenue />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="sessions" element={<AdminSessions />} />
          <Route path="leaves" element={<AdminLeaves />} />
          <Route path="locations" element={<AdminLocations />} />
          <Route path="tournaments" element={<AdminTournaments />} />
          <Route path="tournaments/:id/matches" element={<TournamentBracket />} />
          <Route path="live" element={<AdminLivePresence />} />
          <Route path="court-bookings" element={<AdminCourtBookings />} />
          <Route path="applications" element={<AdminApplications />} />
          <Route path="payroll" element={<AdminCoachPayroll />} />
        </Routes>
      </Box>

    </Box>
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
