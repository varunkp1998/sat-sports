import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link,Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import "./index.css";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import AdminLocations from "./AdminLocations";
import AdminNews from "./AdminNews.tsx";
import AdminTournaments from "./AdminTournaments.tsx";
import AdminRevenue from "./AdminRevenue.tsx";
import AdminCoaches from "./AdminCoaches.tsx";
import AdminAttendance from "./AdminAttendance.tsx";
import AdminLivePresence from "./AdminLivePresence.tsx";
import CoachAttendance from "./CoachAttendance.tsx";
import AdminPlayers from "./AdminPlayers.tsx";
import { Grid } from "@mui/material";
import AdminCourtBookings from "./AdminCourtBookings.tsx";
import AdminReports from "./AdminReports.tsx";
import PublicCourtBooking from "./PublicCourtBooking.tsx";
import RegisterPlayer from "./RegisterPlayer.tsx";
import AdminSessions from "./AdminSessions.tsx";
import AdminApplications from "./AdminApplications.tsx";
import AdminCoachPayroll from "./AdminCoachPayroll";
import AdminDashboard from "./AdminDashboard.tsx";
import API_BASE from "./api";
import { useNavigate } from "react-router-dom";
import { Avatar } from "@mui/material";
import Signup from "./Signup.tsx";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PrivateBooking from "./PrivateBooking";
import AdminPrivateBookings from "./AdminPrivateBooking";
import PlayerProfile from "./PlayerProfile.tsx";
import Home from "./Home.tsx";
import About from "./About.tsx";
import ProgramsPage from "./ProgramsPage.tsx";
import NewsPage from "./NewsPage.tsx";
import Header from "./Header.tsx";
import Login from "./Login.tsx";
import Contact from "./Contact.tsx";
import { Tabs } from "@mui/material";

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
import {
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Menu
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
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
  {/* --- Public Routes --- */}
  <Route path="/" element={<Home />} />
  <Route path="/about" element={<About />} />
  <Route path="/programs" element={<ProgramsPage items={programs} />} />
  <Route path="/news" element={<NewsPage />} />
  <Route path="/tournaments" element={<TournamentsPage />} />
  <Route path="/tournaments/:id" element={<TournamentDetails />} />
  <Route path="/contact" element={<Contact />} />
  <Route path="/book-court" element={<PublicCourtBooking />} />
  <Route path="/register-player" element={<RegisterPlayer />} />
  <Route path="/book-private-session" element={<PrivateBooking />} />
  <Route path="/login" element={<Login />} />
  <Route path="/signup" element={<Signup />} />
  <Route path="/portal" element={<PlayerPortal />} />

  {/* --- Coach Routes (Properly Nested) --- */}
  <Route path="/coach" element={<CoachLayout />}>
    <Route index element={<CoachDashboard />} />
    <Route path="sessions" element={<CoachSessions />} />
    <Route path="sessions/:sessionId/attendance" element={<CoachAttendance />} />
    <Route path="leave" element={<CoachLeave />} />
    <Route path="profile" element={<CoachProfile />} />
  </Route>

  {/* --- Player Routes --- */}
  <Route path="/player/*" element={<PlayerLayout />} />

  {/* --- Admin Routes --- */}
  <Route
    path="/admin/*"
    element={
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    }
  />
  {/* If PlayerProfile is part of Admin, it should ideally be inside AdminLayout, 
      but if you want it separate, keep this: */}
  <Route path="/admin/players/:id" element={<PlayerProfile />} />
</Routes>        </main>
        <Footer />
      </div>
    </Router>
  );
}

/* ---------- NAVBAR ---------- */

const adminCardStyle = {
  borderRadius: 3,
  boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
  transition: "transform 0.2s ease",
  "&:hover": { transform: "translateY(-4px)" },
};

/* ---------- HOME ---------- */

/* ---------- ABOUT ---------- */

/* ---------- PROGRAMS ---------- */



import AddCircleIcon from "@mui/icons-material/AddCircle";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

 function AdminPrograms() {
  const [programs, setPrograms] = useState<any[]>([]);
  const [editingProgram, setEditingProgram] = useState<any>(null);
  
  // Program Form State
  const [progTitle, setProgTitle] = useState("");
  const [progDesc, setProgDesc] = useState("");
  
  // Sub-Category Form State (Scoped to which program is being expanded)
  const [newSubCat, setNewSubCat] = useState<{ [key: number]: string }>({});

  // Pricing State: [subCategoryId][sessionsPerMonth]
  const [pricingInputs, setPricingInputs] = useState<any>({});

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    const res = await fetch(`${API_BASE}/api/admin/programs`);
    const data = await res.json();
    setPrograms(data);

    // Load subcategories for every program
    data.forEach((p: any) => fetchSubCategories(p.id));
  };

  const fetchSubCategories = async (programId: number) => {
    const res = await fetch(`${API_BASE}/api/programs/${programId}/subcategories`);
    const subcats = await res.json();
    
    setPrograms(prev => prev.map(p => 
      p.id === programId ? { ...p, subcategories: subcats } : p
    ));

    // Fetch pricing for each subcategory
    subcats.forEach((sc: any) => fetchPricing(sc.id));
  };

  const fetchPricing = async (subCatId: number) => {
    const res = await fetch(`${API_BASE}/api/subcategories/${subCatId}/pricing`);
    const data = await res.json();
    
    const formatted: any = {};
    [8, 12].forEach(sessionCount => {
      const match = data.find((d: any) => d.sessions_per_month === sessionCount);
      formatted[sessionCount] = {
        price_weekly: match?.price_weekly || "",
        price_monthly: match?.price_monthly || "",
        price_yearly: match?.price_yearly || ""
      };
    });

    setPricingInputs((prev: any) => ({ ...prev, [subCatId]: formatted }));
  };

  // --- ACTIONS ---

  const handleAddSubCat = async (programId: number) => {
    const name = newSubCat[programId];
    if (!name) return alert("Enter subcategory name");

    await fetch(`${API_BASE}/api/admin/subcategories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ program_id: programId, name })
    });

    setNewSubCat({ ...newSubCat, [programId]: "" });
    fetchSubCategories(programId);
  };

  const handleUpdatePricing = async (subCatId: number, sessions: number) => {
    const prices = pricingInputs[subCatId]?.[sessions];
    await fetch(`${API_BASE}/api/admin/subcategory-pricing`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        subcategory_id: subCatId, 
        sessions_per_month: sessions, 
        ...prices 
      })
    });
    alert("Pricing Saved ✅");
  };

  return (
    <Box sx={{ p: 4, maxWidth: 1400, margin: "0 auto" }}>
      
      {/* 1. HEADER */}
      <Card sx={{ mb: 4, borderRadius: 4, background: "linear-gradient(135deg,#800000,#2a0000)", color: "white" }}>
        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <SportsTennisIcon sx={{ fontSize: 50 }} />
          <Box>
            <Typography variant="h4" fontWeight={900}>PROGRAM & PRICING CONSOLE</Typography>
            <Typography variant="body2" sx={{ opacity: 0.7 }}>Manage Ball Stages (Red, Orange, Green) and Elite Training tiers</Typography>
          </Box>
        </CardContent>
      </Card>

      {/* 2. PROGRAM LIST (WITH SUB-CATEGORIES) */}
      <Stack spacing={4}>
        {programs.map((p) => (
          <Card key={p.id} sx={{ borderRadius: 4, boxShadow: "0 10px 30px rgba(0,0,0,0.05)", border: "1px solid #eee" }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                <Box>
                  <Typography variant="h5" fontWeight={800} color="primary">{p.title}</Typography>
                  <Typography variant="body2" color="text.secondary">{p.description}</Typography>
                </Box>
                <Button variant="outlined" color="error" startIcon={<DeleteOutlineIcon />}>Delete Program</Button>
              </Stack>

              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={3}>
                {/* LEFT: SUB-CATEGORY LIST */}
                <Grid item xs={12} lg={4}>
                  <Typography variant="subtitle2" fontWeight={900} mb={2} sx={{ letterSpacing: 1 }}>
                    LEVELS / SUB-CATEGORIES
                  </Typography>
                  
                  <Stack spacing={1} mb={2}>
                    {p.subcategories?.map((sc: any) => (
                      <Paper key={sc.id} variant="outlined" sx={{ p: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#fcfcfc' }}>
                        <Box>
                          <Typography fontWeight={700} fontSize={14}>{sc.name}</Typography>
                          <Typography variant="caption" color="gray">{sc.min_age}-{sc.max_age} yrs</Typography>
                        </Box>
                        <Chip label={`ID: sc-${sc.id}`} size="small" variant="outlined" />                      </Paper>
                    ))}
                  </Stack>

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField 
                      fullWidth size="small" 
                      placeholder="Add Level (e.g. Yellow Ball)" 
                      value={newSubCat[p.id] || ""}
                      onChange={(e) => setNewSubCat({ ...newSubCat, [p.id]: e.target.value })}
                    />
                    <IconButton color="primary" onClick={() => handleAddSubCat(p.id)}>
                      <AddCircleIcon fontSize="large" />
                    </IconButton>
                  </Box>
                </Grid>

                {/* RIGHT: PRICING TIERS FOR EACH LEVEL */}
                <Grid item xs={12} lg={8}>
                   <Typography variant="subtitle2" fontWeight={900} mb={2} sx={{ letterSpacing: 1 }}>
                    PRICING MANAGEMENT
                  </Typography>

                  <Grid container spacing={2}>
                    {p.subcategories?.map((sc: any) => (
                      <Grid item xs={12} key={sc.id}>
                        <Paper sx={{ p: 2, bgcolor: "#f8f9fa", borderRadius: 3 }}>
                          <Typography variant="body2" fontWeight={800} color="primary" mb={2}>
                            SET PRICING FOR: {sc.name.toUpperCase()}
                          </Typography>

                          <Grid container spacing={3}>
                            {[8, 12].map((sessions) => (
                              <Grid item xs={12} md={6} key={sessions}>
                                <Box sx={{ p: 2, bgcolor: "white", borderRadius: 2, border: "1px solid #ddd" }}>
                                  <Typography variant="caption" fontWeight={900}>{sessions} SESSIONS / MONTH</Typography>
                                  <Stack spacing={1.5} mt={1.5}>
                                    <TextField 
                                      label="Weekly Price" size="small" fullWidth
                                      value={pricingInputs[sc.id]?.[sessions]?.price_weekly || ""}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        setPricingInputs((prev: any) => ({
                                          ...prev,
                                          [sc.id]: {
                                            ...prev[sc.id],
                                            [sessions]: { ...prev[sc.id][sessions], price_weekly: val }
                                          }
                                        }))
                                      }}
                                    />
                                    <TextField 
                                      label="Monthly Price" size="small" fullWidth
                                      value={pricingInputs[sc.id]?.[sessions]?.price_monthly || ""}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        setPricingInputs((prev: any) => ({
                                          ...prev,
                                          [sc.id]: {
                                            ...prev[sc.id],
                                            [sessions]: { ...prev[sc.id][sessions], price_monthly: val }
                                          }
                                        }))
                                      }}
                                    />
                                    <Button 
                                      variant="contained" 
                                      size="small" 
                                      fullWidth 
                                      onClick={() => handleUpdatePricing(sc.id, sessions)}
                                      sx={{ mt: 1, bgcolor: "#444" }}
                                    >
                                      Save {sessions} Sessions
                                    </Button>
                                  </Stack>
                                </Box>
                              </Grid>
                            ))}
                          </Grid>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        ))}
      </Stack>
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

/* ---------- TOURNAMENTS ---------- */
import { 
 Skeleton ,Container
} from "@mui/material";

const MotionBox = motion(Box);

function TournamentsPage() {
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();

  // 📡 FETCH ALL TOURNAMENTS
  useEffect(() => {
    fetch(`${API_BASE}/api/tournaments`)
      .then((res) => {
        if (!res.ok) throw new Error("Server response was not ok");
        return res.json();
      })
      .then((data) => {
        setTournaments(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setLoading(false);
      });
  }, []);

  const filtered = filter === "all" 
    ? tournaments 
    : tournaments.filter((t) => t.status?.toLowerCase() === filter);

  const getStatusColor: any = (status: string) => {
    switch (status?.toLowerCase()) {
      case "live": return "#ef4444";
      case "upcoming": return "#fbbf24";
      case "completed": return "#22c55e";
      default: return "#94a3b8";
    }
  };

  const getCountdown = (date: string) => {
    const diff = new Date(date).getTime() - Date.now();
    if (diff <= 0) return "EVENT LIVE";
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return `${days} DAYS LEFT`;
  };

  return (
    <Box sx={{ background: "#020617", color: "white", minHeight: "100vh", py: 10 }}>
      <Container maxWidth="lg">
        
        {/* 🎾 CINEMATIC HEADER */}
        <Box sx={{ mb: 8, textAlign: "center" }}>
          <Typography variant="overline" sx={{ color: "#ef4444", fontWeight: 900, letterSpacing: 4 }}>
            GLOBAL ARENA
          </Typography>
          <Typography variant="h1" sx={headerTitleStyle}>
            ACTIVE <span style={{ color: "#ef4444" }}>DRAWS</span>
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.5)", fontWeight: 600, mt: 1 }}>
            JOIN THE ELITE. TRACK EVERY MATCH. CLAIM THE CHAMPIONSHIP.
          </Typography>
        </Box>

        {/* 🛠️ NAVIGATION FILTERS */}
        <Stack direction="row" spacing={2} justifyContent="center" sx={{ mb: 8, flexWrap: "wrap", gap: 2 }}>
          {["all", "live", "upcoming", "completed"].map((f) => (
            <Button
              key={f}
              onClick={() => setFilter(f)}
              sx={filterButtonStyle(filter === f)}
            >
              {f.toUpperCase()}
            </Button>
          ))}
        </Stack>

        {/* 🧩 TOURNAMENT GRID */}
        <Grid container spacing={4}>
          {loading ? (
            // Skeleton Loading State
            [1, 2, 3].map((i) => (
              <Grid item xs={12} md={4} key={i}>
                <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 6, bgcolor: "rgba(255,255,255,0.05)" }} />
              </Grid>
            ))
          ) : filtered.length > 0 ? (
            filtered.map((t) => (
              <Grid item xs={12} md={4} key={t.id}>
                <MotionBox whileHover={{ y: -12 }} transition={{ type: "spring", stiffness: 300 }}>
                  <Card sx={glassCardStyle}>
                    {/* Visual Banner */}
                    <Box sx={{ 
                      height: 160, 
                      position: 'relative', 
                      backgroundImage: `linear-gradient(to top, #0f172a, transparent), url(${API_BASE}/uploads/${t.image})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}>
                      <Chip 
                        label={t.status?.toUpperCase()} 
                        sx={statusChipStyle(getStatusColor(t.status))}
                      />
                    </Box>

                    <CardContent sx={{ p: 4 }}>
                      <Typography variant="h5" sx={{ fontWeight: 900, mb: 1, letterSpacing: -0.5 }}>
                        {t.title}
                      </Typography>
                      
                      <Stack spacing={1.5} sx={{ mb: 4 }}>
                        <Typography variant="body2" sx={detailTextStyle}>
                          📅 {new Date(t.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </Typography>
                        <Typography variant="body2" sx={detailTextStyle}>
                          📍 {t.location || "Main Arena"}
                        </Typography>
                        <Typography variant="body2" sx={{ ...detailTextStyle, color: '#fbbf24' }}>
                          ⏳ {getCountdown(t.date)}
                        </Typography>
                        <Typography variant="body2" sx={detailTextStyle}>
                          👥 {t.playerCount || 0} Registered Players
                        </Typography>
                      </Stack>

                      <Button
                        fullWidth
                        variant="contained"
                        onClick={() => navigate(`/tournaments/${t.id}`)}
                        sx={actionButtonStyle}
                      >
                        VIEW BRACKET
                      </Button>
                    </CardContent>
                  </Card>
                </MotionBox>
              </Grid>
            ))
          ) : (
            <Box sx={{ width: '100%', textAlign: 'center', py: 10 }}>
              <Typography variant="h6" sx={{ opacity: 0.3 }}>No tournaments found in this category.</Typography>
            </Box>
          )}
        </Grid>
      </Container>
    </Box>
  );
}

// 💅 DESIGN SYSTEM STYLES
const headerTitleStyle = {
  fontSize: { xs: "3rem", md: "5rem" },
  fontWeight: 950,
  letterSpacing: -2,
  lineHeight: 1,
  textTransform: "uppercase"
};

const filterButtonStyle = (active: boolean) => ({
  borderRadius: "12px",
  px: 4,
  py: 1,
  fontWeight: 900,
  bgcolor: active ? "#ef4444" : "rgba(255,255,255,0.03)",
  color: active ? "white" : "rgba(255,255,255,0.4)",
  border: "1px solid",
  borderColor: active ? "#ef4444" : "rgba(255,255,255,0.1)",
  "&:hover": { bgcolor: active ? "#dc2626" : "rgba(255,255,255,0.08)" },
  transition: "0.3s"
});

const glassCardStyle = {
  borderRadius: 6,
  background: "rgba(255,255,255,0.02)",
  backdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "white",
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: "0 20px 50px rgba(0,0,0,0.5)"
};

const statusChipStyle = (color: string) => ({
  position: 'absolute',
  top: 15,
  right: 15,
  bgcolor: color,
  color: "white",
  fontWeight: 900,
  fontSize: "0.65rem",
  borderRadius: 1
});

const detailTextStyle = {
  display: 'flex',
  alignItems: 'center',
  fontWeight: 700,
  opacity: 0.8,
  fontSize: '0.85rem'
};

const actionButtonStyle = {
  py: 1.8,
  borderRadius: 3,
  fontWeight: 950,
  letterSpacing: 1,
  background: "linear-gradient(135deg, #f97316, #ef4444)",
  boxShadow: "0 10px 25px rgba(239, 68, 68, 0.4)",
  "&:hover": { transform: "translateY(-2px)", boxShadow: "0 15px 30px rgba(239, 68, 68, 0.5)" },
  transition: "0.3s"
};










import {
 Dialog, DialogTitle, DialogContent, DialogActions,
  useMediaQuery
} from "@mui/material";






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



import PeopleIcon from "@mui/icons-material/People";
import Tab from "@mui/material/Tab";





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










import { 
 
  Collapse
} from "@mui/material";
import { useLocation } from "react-router-dom";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";

// --- Grouped Menu Configuration ---
const menuGroups = [
  {
    group: "Main",
    items: [{ label: "📊 Dashboard", path: "/admin" }]
  },
  {
    group: "Academy Management",
    items: [
      { label: "📘 Programs", path: "/admin/programs" },
      { label: "📅 Sessions", path: "/admin/sessions" },
      { label: "📍 Locations", path: "/admin/locations" },
    ]
  },
  {
    group: "People",
    items: [
      { label: "👤 Players", path: "/admin/players" },
      { label: "🎾 Coaches", path: "/admin/coaches" },
      { label: "📄 Applications", path: "/admin/applications" },
    ]
  },
  {
    group: "Operations",
    items: [
      { label: "📅 Attendance", path: "/admin/attendance" },
      { label: "📝 Leave Management", path: "/admin/leaves" },
      { label: "🟢 Live Coaches", path: "/admin/live" },
    ]
  },
  {
    group: "Finance & Reports",
    items: [
      { label: "💰 Revenue", path: "/admin/revenue" },
      { label: "💼 Payroll", path: "/admin/payroll" },
      { label: "📊 Reports", path: "/admin/reports" },
    ]
  },
  {
    group: "Events & Bookings",
    items: [
      { label: "🏆 Tournaments", path: "/admin/tournaments" },
      { label: "🎾 Private Sessions", path: "/admin/private-bookings" },
      { label: "🏟️ Court Bookings", path: "/admin/court-bookings" },
      { label: "📰 News", path: "/admin/news" },
    ]
  }
];

 function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    "Academy Management": true, 
  });
  
  const location = useLocation();
  const navigate = useNavigate();

  const toggleGroup = (groupName: string) => {
    setOpenGroups(prev => ({ ...prev, [groupName]: !prev[groupName] }));
  };

  const handleLogout = () => {
    localStorage.clear(); // Clears token, role, userId
    window.location.href = "/login";
  };

  const NavItem = ({ item, isChild = false }: { item: any, isChild?: boolean }) => {
    const isActive = location.pathname === item.path;
    return (
      <ListItem
        button
        component={Link}
        to={item.path}
        onClick={() => setMobileOpen(false)}
        sx={{
          pl: isChild ? 4 : 2,
          backgroundColor: isActive ? "rgba(239, 68, 68, 0.1)" : "transparent",
          borderLeft: isActive ? "4px solid #ef4444" : "4px solid transparent",
          "&:hover": { backgroundColor: "#1f2937" },
          mb: 0.5,
          mx: 1,
          borderRadius: "4px",
          width: "auto"
        }}
      >
        <ListItemText 
          primary={item.label} 
          primaryTypographyProps={{ 
            fontSize: "0.85rem", 
            fontWeight: isActive ? 600 : 400,
            color: isActive ? "#ef4444" : "#9ca3af"
          }} 
        />
      </ListItem>
    );
  };

  const SidebarContent = (
    <Box sx={{ 
      height: "100%", 
      display: "flex", 
      flexDirection: "column", 
      background: "#111827", 
      color: "white" 
    }}>
      {/* BRAND LOGO */}
      <Box sx={{ p: 3, display: "flex", alignItems: "center", gap: 2, flexShrink: 0 }}>
        <img src="/logo.png" style={{ height: 35 }} alt="Logo" />
        <Typography variant="h6" fontWeight="bold" sx={{ letterSpacing: 1 }}>SAT ADMIN</Typography>
      </Box>

      {/* SCROLLABLE MENU */}
      <List sx={{ 
        flexGrow: 1, 
        overflowY: "auto", 
        px: 1,
        // Custom sleek scrollbar for dark theme
        "&::-webkit-scrollbar": { width: "5px" },
        "&::-webkit-scrollbar-thumb": { background: "#374151", borderRadius: "10px" }
      }}>
        {menuGroups.map((group) => (
          <Box key={group.group} sx={{ mb: 1 }}>
            {group.items.length === 1 && group.group === "Main" ? (
              <NavItem item={group.items[0]} />
            ) : (
              <>
                <ListItem 
                  button 
                  onClick={() => toggleGroup(group.group)}
                  sx={{ py: 1, "&:hover": { background: "transparent" } }}
                >
                  <ListItemText 
                    primary={group.group} 
                    primaryTypographyProps={{ 
                      fontSize: "0.7rem", 
                      fontWeight: 700, 
                      color: "#4b5563", 
                      textTransform: "uppercase",
                      letterSpacing: 1.2
                    }} 
                  />
                  {openGroups[group.group] ? 
                    <ExpandLess sx={{ fontSize: 16, color: "#4b5563" }} /> : 
                    <ExpandMore sx={{ fontSize: 16, color: "#4b5563" }} />
                  }
                </ListItem>
                <Collapse in={openGroups[group.group]} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {group.items.map(item => <NavItem key={item.path} item={item} isChild />)}
                  </List>
                </Collapse>
              </>
            )}
          </Box>
        ))}
      </List>

      {/* LOGOUT BUTTON (FIXED AT BOTTOM) */}
      <Box sx={{ p: 2, flexShrink: 0 }}>
        <Divider sx={{ bgcolor: "#1f2937", mb: 2 }} />
        <ListItem 
          button 
          onClick={handleLogout}
          sx={{ 
            borderRadius: "8px", 
            bgcolor: "rgba(239, 68, 68, 0.1)", 
            "&:hover": { bgcolor: "rgba(239, 68, 68, 0.2)" },
            justifyContent: "center"
          }}
        >
          <ListItemText 
            primary="Logout" 
            primaryTypographyProps={{ 
              fontWeight: 700, 
              color: "#ef4444", 
              textAlign: "center",
              fontSize: "0.9rem"
            }} 
          />
        </ListItem>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f3f4f6" }}>
      
      {/* MOBILE HEADER */}
      <Box sx={{ 
        display: { xs: "flex", md: "none" }, 
        width: "100%", bgcolor: "#111827", color: "white", 
        p: 2, position: "fixed", top: 0, zIndex: 1100,
        justifyContent: "space-between", alignItems: "center",
        boxShadow: "0px 2px 10px rgba(0,0,0,0.3)"
      }}>
        <Typography variant="h6" fontWeight="bold">SAT Sports</Typography>
        <IconButton onClick={() => setMobileOpen(true)} sx={{ color: "white" }}>
          <MenuIcon />
        </IconButton>
      </Box>

      {/* DESKTOP SIDEBAR */}
      <Box sx={{ 
        width: 260, 
        display: { xs: "none", md: "block" }, 
        position: "fixed", 
        height: "100vh",
        borderRight: "1px solid #e5e7eb"
      }}>
        {SidebarContent}
      </Box>

      {/* MOBILE DRAWER */}
      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        PaperProps={{ sx: { width: 260, border: "none" } }}
      >
        {SidebarContent}
      </Drawer>

      {/* MAIN CONTENT AREA */}
      <Box sx={{ 
        flexGrow: 1, 
        p: { xs: 2, md: 4 }, 
        ml: { md: "260px" }, 
        mt: { xs: "64px", md: 0 },
        width: "100%",
        maxWidth: "100vw"
      }}>
        {/* Your application content routes would go here */}
        <Routes>
           {/* Add your specific routes as needed */}
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
  <Route path="private-bookings" element={<AdminPrivateBookings />} />
        </Routes>
      </Box>
    </Box>
  );
}
/* ---------- CONTACT ---------- */




/* ---------- FOOTER ---------- */
function Footer() {
  return (
    <footer className="footer">
      © {new Date().getFullYear()} SAT Sports PVT LTD
    </footer>
  );
}
