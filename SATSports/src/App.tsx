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
import AssignmentIcon from "@mui/icons-material/Assignment";
import PrivateBooking from "./PrivateBooking";
import AdminPrivateBookings from "./AdminPrivateBooking";
import Home from "./Home.tsx";
import About from "./About.tsx";
import ProgramsPage from "./ProgramsPage.tsx";
import NewsPage from "./NewsPage.tsx";
import Header from "./Header.tsx";
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
  const handleLogin = async () => {
    setError("");
    setLoading(true);
  
    try {
      const res = await fetch(`${API_BASE}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: username,   // 🔥 backend should expect email
          password
        })
      });
  
      const data = await res.json();
      setLoading(false);
  
      if (!res.ok) {
        setError(data.message || "Invalid credentials");
        return;
      }
  
      // 🔐 SAVE JWT TOKEN
      localStorage.setItem("token", data.token);
  
      // 🔓 DECODE TOKEN (to get role, name etc.)
      const payload = JSON.parse(atob(data.token.split(".")[1]));
  
      localStorage.setItem("role", payload.role);
      localStorage.setItem("userId", String(payload.id));
      localStorage.setItem("username", payload.name || "User");
  
      console.log("JWT Payload:", payload);
  
      // 🚀 REDIRECT BASED ON ROLE
      if (payload.role === "admin") window.location.href = "/admin";
      else if (payload.role === "coach") window.location.href = "/coach";
      else if (payload.role === "player") window.location.href = "/player";
      else window.location.href = "/dashboard"; // for viewer or others
  
    } catch (err) {
      setLoading(false);
      setError("Network error. Please try again.");
    }
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
        background: `
          radial-gradient(circle at 20% 20%, rgba(59,130,246,0.25), transparent 40%),
          radial-gradient(circle at 80% 80%, rgba(249,115,22,0.2), transparent 40%),
          linear-gradient(180deg, #020617, #0f172a)
        `,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
        position: "relative",
        overflow: "hidden"
      }}
    >
  
      {/* 🎾 BACKGROUND IMAGE */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          backgroundImage: "url('/tennis-bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.15
        }}
      />
  
      {/* ✨ GLOW EFFECT */}
      <Box
        sx={{
          position: "absolute",
          width: 400,
          height: 400,
          background: "radial-gradient(circle, #3b82f6, transparent)",
          filter: "blur(120px)",
          top: -100,
          left: -100
        }}
      />
  
      <Card
        sx={{
          width: "100%",
          maxWidth: 380,
          borderRadius: 6,
          p: 3,
          backdropFilter: "blur(40px)",
          background: "rgba(255,255,255,0.07)",
          border: "1px solid rgba(255,255,255,0.15)",
          boxShadow: "0 30px 80px rgba(0,0,0,0.7)",
          position: "relative"
        }}
      >
        <CardContent>
  
          {/* 🏆 HERO */}
          <Box textAlign="center" mb={4}>
  
            <img
              src="/logo.png"
              alt="logo"
              style={{
                height: 60,
                marginBottom: 12,
                filter: "drop-shadow(0 5px 10px rgba(0,0,0,0.5))"
              }}
            />
  
            <Typography variant="h5" fontWeight={800}>
              Welcome Back
            </Typography>
  
            <Typography sx={{ opacity: 0.7, fontSize: 14 }}>
              {forgotMode ? "Reset your password" : "Access your training"}
            </Typography>
  
          </Box>
  
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
  
          {/* 🔐 LOGIN */}
          {!forgotMode && (
            <Stack spacing={2}>
  
              {/* EMAIL */}
              <TextField
                placeholder="Email"
                value={username}
                onChange={e => setUsername(e.target.value)}
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.08)",
                    transition: "0.3s",
                    "&:hover": {
                      background: "rgba(255,255,255,0.12)"
                    },
                    "&.Mui-focused": {
                      boxShadow: "0 0 0 2px #3b82f6"
                    },
                    "& fieldset": { border: "none" }
                  }
                }}
              />
  
              {/* PASSWORD */}
              <TextField
                placeholder="Password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.08)",
                    transition: "0.3s",
                    "&:hover": {
                      background: "rgba(255,255,255,0.12)"
                    },
                    "&.Mui-focused": {
                      boxShadow: "0 0 0 2px #3b82f6"
                    },
                    "& fieldset": { border: "none" }
                  }
                }}
              />
  
              {/* 🚀 BUTTON */}
              <Button
                fullWidth
                size="large"
                onClick={handleLogin}
                sx={{
                  borderRadius: 999,
                  py: 1.5,
                  fontWeight: 700,
                  background: "linear-gradient(90deg,#f97316,#ef4444)",
                  boxShadow: "0 15px 40px rgba(249,115,22,0.5)",
                  transition: "0.3s",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 20px 50px rgba(249,115,22,0.7)"
                  }
                }}
              >
                {loading ? "Logging in..." : "Login"}
              </Button>
  
              <Typography
                textAlign="center"
                sx={{ cursor: "pointer", fontSize: 14, opacity: 0.7 }}
                onClick={() => setForgotMode(true)}
              >
                Forgot Password?
              </Typography>
  
              <Button
                fullWidth
                variant="text"
                sx={{ opacity: 0.6 }}
                onClick={() => navigate("/signup")}
              >
                Create Account
              </Button>
  
            </Stack>
          )}
  
          {/* 🔁 FORGOT */}
          {forgotMode && (
            <Stack spacing={2}>
  
              <TextField
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.08)",
                    "& fieldset": { border: "none" }
                  }
                }}
              />
  
              {otpStep === 1 && (
                <Button
                  fullWidth
                  onClick={sendOtp}
                  sx={{
                    borderRadius: 999,
                    background: "#22c55e"
                  }}
                >
                  Send OTP
                </Button>
              )}
  
              {otpStep === 2 && (
                <>
                  <TextField
                    placeholder="OTP"
                    value={otp}
                    onChange={e => setOtp(e.target.value)}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 999,
                        background: "rgba(255,255,255,0.08)",
                        "& fieldset": { border: "none" }
                      }
                    }}
                  />
  
                  <TextField
                    placeholder="New Password"
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 999,
                        background: "rgba(255,255,255,0.08)",
                        "& fieldset": { border: "none" }
                      }
                    }}
                  />
  
                  <Button
                    fullWidth
                    onClick={resetPassword}
                    sx={{
                      borderRadius: 999,
                      background: "#ef4444"
                    }}
                  >
                    Reset Password
                  </Button>
                </>
              )}
  
              <Typography
                textAlign="center"
                sx={{ cursor: "pointer", opacity: 0.7 }}
                onClick={() => {
                  setForgotMode(false);
                  setOtpStep(1);
                }}
              >
                ← Back to Login
              </Typography>
  
            </Stack>
          )}
  
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

/* ---------- TOURNAMENTS ---------- */
import { 
 Skeleton 
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

  ///////////////////////////////////////////////////////
  // STATE
  ///////////////////////////////////////////////////////

  const [players, setPlayers] = useState([]);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [externalName, setExternalName] = useState("");
  const [image, setImage] = useState(null);

  const [items, setItems] = useState([]);
  const [activeTournament, setActiveTournament] = useState(null);
  const [matches, setMatches] = useState([]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    status: "upcoming"
  });

  ///////////////////////////////////////////////////////
  // LOAD DATA
  ///////////////////////////////////////////////////////

  useEffect(() => {
    fetch(`${API_BASE}/api/admin/players`)
      .then(res => res.json())
      .then(setPlayers);

    loadTournaments();
  }, []);

  const loadTournaments = () => {
    fetch(`${API_BASE}/api/admin/tournaments`)
      .then(res => res.json())
      .then(setItems);
  };

  ///////////////////////////////////////////////////////
  // PLAYER LOGIC
  ///////////////////////////////////////////////////////

  const togglePlayer = (p) => {
    if (selectedPlayers.find(sp => sp.id === p.id)) {
      setSelectedPlayers(prev => prev.filter(sp => sp.id !== p.id));
    } else {
      setSelectedPlayers(prev => [...prev, p]);
    }
  };

  const selectAll = () => {
    setSelectedPlayers(players);
  };

  const addExternal = () => {
    if (!externalName) return;

    setSelectedPlayers(prev => [
      ...prev,
      { id: Date.now(), name: externalName, external: true }
    ]);

    setExternalName("");
  };

  const removePlayer = (id) => {
    setSelectedPlayers(prev => prev.filter(p => p.id !== id));
  };

  ///////////////////////////////////////////////////////
  // CREATE TOURNAMENT
  ///////////////////////////////////////////////////////

  const saveTournament = async () => {
    const formData = new FormData();
  
    Object.entries(form).forEach(([k, v]) => formData.append(k, v));
    if (image) formData.append("image", image);
  
    const res = await fetch(`${API_BASE}/api/admin/tournaments`, {
      method: "POST",
      body: formData
    });
  
    const data = await res.json();
  
    if (!data.id) {
      alert("Backend not returning ID ❌");
      return;
    }
  
    const tournamentId = data.id; // ✅ FIXED
  
    await fetch(`${API_BASE}/api/admin/tournaments/${tournamentId}/players`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        players: selectedPlayers.map(p => ({
          player_id: p.external ? null : p.id,
          name: p.name
        }))
      })
    });
    alert("Tournament Created ✅");
    openDashboard(tournamentId);

  };
  ///////////////////////////////////////////////////////
  // BRACKETS (FIXED)
  ///////////////////////////////////////////////////////

  const openDashboard = async (id) => {

    // 🔥 FIRST: check if matches already exist
    const res = await fetch(`${API_BASE}/api/admin/tournaments/${id}/matches`);
    let data = await res.json();
  
    // 🔥 IF EMPTY → generate
    if (!data || data.length === 0) {
      await fetch(`${API_BASE}/api/admin/tournaments/${id}/generate-brackets`, {
        method: "POST"
      });
  
      const res2 = await fetch(`${API_BASE}/api/admin/tournaments/${id}/matches`);
      data = await res2.json();
    }
  
    setMatches(data);
    setActiveTournament(id);
  };
  ///////////////////////////////////////////////////////
  // WINNER
  ///////////////////////////////////////////////////////

  const pickWinner = async (matchId, player) => {

    await fetch(`${API_BASE}/api/admin/matches/${matchId}/winner`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ winner: player })
    });
  
    // 🔥 RE-FETCH MATCHES (NOT generate again blindly)
    const res = await fetch(
      `${API_BASE}/api/admin/tournaments/${activeTournament}/matches`
    );
  
    const data = await res.json();
  
    setMatches(data); // ✅ THIS UPDATES UI
  };

  ///////////////////////////////////////////////////////

  return (
    <Box sx={{ p: 3 }}>

      <Typography variant="h4" fontWeight={800} mb={3}>
        🏆 Tournament Management System
      </Typography>

      {/* ================= CREATE ================= */}
      <Card sx={{ mb: 4 }}>
        <CardContent>

          <Typography fontWeight={700}>Create Tournament</Typography>

          <Grid container spacing={2} mt={1}>

            <Grid item xs={12} md={3}>
              <TextField fullWidth label="Title"
                onChange={e=>setForm({...form,title:e.target.value})}/>
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField fullWidth label="Location"
                onChange={e=>setForm({...form,location:e.target.value})}/>
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField type="date" fullWidth
                InputLabelProps={{ shrink:true }}
                onChange={e=>setForm({...form,date:e.target.value})}/>
            </Grid>

            <Grid item xs={12} md={3}>
              <Select fullWidth value={form.status}
                onChange={e=>setForm({...form,status:e.target.value})}>
                <MenuItem value="upcoming">Upcoming</MenuItem>
                <MenuItem value="live">Live</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
              </Select>
            </Grid>

            <Grid item xs={12}>
              <TextField fullWidth multiline label="Description"
                onChange={e=>setForm({...form,description:e.target.value})}/>
            </Grid>

            <Grid item xs={12}>
              <Button component="label">
                Upload Image
                <input hidden type="file" onChange={e=>setImage(e.target.files[0])}/>
              </Button>
            </Grid>

          </Grid>

          {/* PLAYERS */}
          <Typography mt={3}>Players</Typography>

          <Button onClick={selectAll}>Select All</Button>

          <Stack direction="row" flexWrap="wrap" gap={1} mt={1}>
            {players.map(p => (
              <Chip
                key={p.id}
                label={p.name}
                color={selectedPlayers.find(sp=>sp.id===p.id)?"primary":"default"}
                onClick={()=>togglePlayer(p)}
              />
            ))}
          </Stack>

          {/* EXTERNAL */}
          <Stack direction="row" mt={2}>
            <TextField fullWidth placeholder="External player"
              value={externalName}
              onChange={e=>setExternalName(e.target.value)}/>
            <Button onClick={addExternal}>Add</Button>
          </Stack>

          {/* SELECTED */}
          <Stack direction="row" flexWrap="wrap" gap={1} mt={2}>
            {selectedPlayers.map(p=>(
              <Chip
                key={p.id}
                label={p.name}
                onDelete={()=>removePlayer(p.id)}
              />
            ))}
          </Stack>

          <Button variant="contained" fullWidth sx={{ mt:2 }}
            onClick={saveTournament}>
            Create Tournament
          </Button>

        </CardContent>
      </Card>

      {/* ================= LIST ================= */}
      <Grid container spacing={2}>
        {items.map(t => (
          <Grid item xs={12} md={4} key={t.id}>
            <Card>
              <CardContent>

                <Typography fontWeight={700}>{t.title}</Typography>

                <Button
                  fullWidth
                  sx={{ mt:1 }}
                  variant="contained"
                  onClick={()=>openDashboard(t.id)}
                >
                  Open Dashboard
                </Button>

              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* ================= BRACKETS (VISIBLE FIX) ================= */}
      {activeTournament && (
        <Box mt={5}>

          <Typography variant="h5" fontWeight={700} mb={2}>
            🧩 Tournament Brackets
          </Typography>

          {matches.length === 0 && (
            <Typography>No matches found</Typography>
          )}

          {matches.map(m => (
            <Card key={m.id} sx={{ p:2, mb:2 }}>
              <Typography fontWeight={600}>
                {m.round}
              </Typography>

              <Stack direction="row" spacing={2} mt={1}>
                <Button
                  variant={m.winner === m.player1 ? "contained" : "outlined"}
                  onClick={()=>pickWinner(m.id,m.player1)}
                >
                  {m.player1}
                </Button>

                <Button
                  variant={m.winner === m.player2 ? "contained" : "outlined"}
                  onClick={()=>pickWinner(m.id,m.player2)}
                >
                  {m.player2}
                </Button>
              </Stack>

              <Typography mt={1}>
                Winner: {m.winner || "-"}
              </Typography>
            </Card>
          ))}

        </Box>
      )}

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



import PeopleIcon from "@mui/icons-material/People";
import Tab from "@mui/material/Tab";

 function AdminDashboard() {
  const username = localStorage.getItem("username") || "Admin";

  const [tab, setTab] = useState(0);

  const [players, setPlayers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [applications, setApplications] = useState([]);

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

  const stats = [
    {
      label: "Players",
      value: players.length,
      icon: <PeopleIcon />,
      gradient: "linear-gradient(135deg,#6366f1,#4f46e5)"
    },
    {
      label: "Bookings",
      value: bookings.length,
      icon: <EventIcon />,
      gradient: "linear-gradient(135deg,#06b6d4,#3b82f6)"
    },
    {
      label: "Applications",
      value: applications.length,
      icon: <AssignmentIcon />,
      gradient: "linear-gradient(135deg,#ec4899,#f43f5e)"
    },
    {
      label: "Programs",
      value: [...new Set(players.map(p => p.program_id))].length,
      icon: <SportsTennisIcon />,
      gradient: "linear-gradient(135deg,#f97316,#ef4444)"
    }
  ];

  const columns = [
    { field: "name", headerName: "Name", flex: 1 },
    { field: "email", headerName: "Email", flex: 1 },
    { field: "programTitle", headerName: "Program", flex: 1 },
    { field: "category", headerName: "Category", flex: 1 }
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, background: "#f5f7fb", minHeight: "100vh" }}>

      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" mb={3}>
        <Typography variant="h4" fontWeight={800}>
          Welcome, {username} 👋
        </Typography>

        <Avatar sx={{ bgcolor: "#4f46e5" }}>
          {username[0]}
        </Avatar>
      </Box>

      {/* TABS */}
      <Tabs
        value={tab}
        onChange={(e, v) => setTab(v)}
        variant="fullWidth"
        sx={{ mb: 3 }}
      >
        <Tab label="Overview" />
        <Tab label="Players" />
        <Tab label="Activity" />
      </Tabs>

      {/* ================= OVERVIEW ================= */}
      {tab === 0 && (
        <>
          {/* HERO */}
          <Card
            sx={{
              borderRadius: 4,
              mb: 3,
              background: "linear-gradient(135deg,#0f172a,#1e293b)",
              color: "#fff"
            }}
          >
            <CardContent>
              <Typography sx={{ opacity: 0.7 }}>
                Admin Overview
              </Typography>

              <Typography variant="h3" fontWeight={800}>
                {players.length} Players
              </Typography>

              <Typography>
                {bookings.length} bookings • {applications.length} applications
              </Typography>
            </CardContent>
          </Card>

          {/* KPI CARDS */}
          <Grid container spacing={2}>
            {stats.map((s) => (
              <Grid item xs={12} sm={6} md={3} key={s.label}>
                <Card
                  sx={{
                    borderRadius: 4,
                    background: s.gradient,
                    color: "#fff",
                    height: "100%"
                  }}
                >
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography>{s.label}</Typography>
                      {s.icon}
                    </Stack>

                    <Typography variant="h3" mt={2} fontWeight={800}>
                      {s.value}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {/* ================= PLAYERS ================= */}
      {tab === 1 && (
        <Card sx={{ borderRadius: 4, p: 2 }}>
          <Typography variant="h6" mb={2}>
            Players
          </Typography>

          <Box sx={{ width: "100%", overflowX: "auto" }}>
            <Box sx={{ minWidth: 600 }}>
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
                  }
                }}
              />
            </Box>
          </Box>
        </Card>
      )}

      {/* ================= ACTIVITY ================= */}
      {tab === 2 && (
        <Stack spacing={2}>

          {[...applications, ...bookings].slice(0, 10).map((a, i) => (
            <Card key={i}>
              <CardContent>
                <Typography>
                  {a.name || "User activity"}
                </Typography>

                <Typography color="text.secondary">
                  {a.email || ""}
                </Typography>
              </CardContent>
            </Card>
          ))}

        </Stack>
      )}

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




import {

  useTheme
} from "@mui/material";







function AdminSessions() {

  const [sessions, setSessions] = React.useState([]);
  const [locations, setLocations] = React.useState([]);
  const [coaches, setCoaches] = React.useState([]);
  const [programs, setPrograms] = React.useState([]);

  const [editingId, setEditingId] = React.useState(null);

  const [date, setDate] = React.useState("");
  const [startTime, setStartTime] = React.useState(null);
  const [endTime, setEndTime] = React.useState(null);
  const [locationId, setLocationId] = React.useState("");
  const [coachId, setCoachId] = React.useState("");
  const [programIds, setProgramIds] = React.useState([]);

  const [filterDate, setFilterDate] = React.useState(dayjs().format("YYYY-MM-DD"));

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // ================= LOAD =================
  const loadSessions = () => {
    fetch(`${API_BASE}/api/admin/sessions`)
      .then(res => res.json())
      .then(setSessions);
  };

  React.useEffect(() => {
    loadSessions();
    fetch(`${API_BASE}/api/admin/locations`).then(r=>r.json()).then(setLocations);
    fetch(`${API_BASE}/api/admin/coaches`).then(r=>r.json()).then(setCoaches);
    fetch(`${API_BASE}/api/admin/programs`).then(r=>r.json()).then(setPrograms);
  }, []);

  // ================= FILTER =================
  const filteredSessions = sessions.filter(s =>
    dayjs(s.session_date).format("YYYY-MM-DD") === filterDate
  );

  // ================= SAVE =================
  const saveSession = () => {
    const payload = {
      session_date: dayjs(date).format("YYYY-MM-DD"),
      start_time: startTime.format("HH:mm:ss"),
      end_time: endTime.format("HH:mm:ss"),
      location_id: Number(locationId),
      coach_id: Number(coachId),
      program_ids: programIds
    };

    fetch(
      editingId
        ? `${API_BASE}/api/admin/sessions/${editingId}`
        : `${API_BASE}/api/admin/sessions`,
      {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }
    ).then(() => {
      loadSessions();
      setEditingId(null);
    });
  };

  // ================= EDIT =================
  const editSession = (s) => {
    setEditingId(s.id);
    setDate(dayjs(s.session_date).format("YYYY-MM-DD"));
    setStartTime(dayjs(s.start_time, "HH:mm:ss"));
    setEndTime(dayjs(s.end_time, "HH:mm:ss"));
    setLocationId(s.location_id);
    setCoachId(s.coach_id);
    setProgramIds(s.programIds || []);
  };

  // ================= DELETE =================
  const deleteSession = (id) => {
    if (!window.confirm("Delete session?")) return;

    fetch(`${API_BASE}/api/admin/sessions/${id}`, {
      method: "DELETE"
    }).then(loadSessions);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={containerStyle}>

        <Typography variant="h5" fontWeight={700} color="white" mb={2}>
          Sessions Dashboard
        </Typography>

        {/* 🔥 FILTER */}
        <Card sx={filterCard}>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center">
              <TextField
                label="Filter Date"
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
              <Typography fontWeight={600}>
                {filteredSessions.length} sessions
              </Typography>
            </Stack>
          </CardContent>
        </Card>

        {/* 🔥 FORM */}
        <Card sx={glassCard}>
          <CardContent>
            <Stack spacing={2}>

              <TextField
                label="Session Date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />

              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <TimePicker label="Start Time" value={startTime} onChange={setStartTime} />
                <TimePicker label="End Time" value={endTime} onChange={setEndTime} />
              </Stack>

              <TextField
                select
                label="Location"
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
              >
                {locations.map(l => (
                  <MenuItem key={l.id} value={l.id}>{l.name}</MenuItem>
                ))}
              </TextField>

              <TextField
                select
                label="Coach"
                value={coachId}
                onChange={(e) => setCoachId(e.target.value)}
              >
                {coaches.map(c => (
                  <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                ))}
              </TextField>

              <TextField
                select
                label="Programs"
                value={programIds}
                onChange={(e) => {
                  const val = typeof e.target.value === "string"
                    ? e.target.value.split(",").map(Number)
                    : e.target.value;
                  setProgramIds(val);
                }}
                SelectProps={{ multiple: true }}
              >
                {programs.map(p => (
                  <MenuItem key={p.id} value={p.id}>{p.title}</MenuItem>
                ))}
              </TextField>

              <Button sx={ctaBtn} onClick={saveSession}>
                {editingId ? "Update Session" : "Create Session"}
              </Button>

            </Stack>
          </CardContent>
        </Card>

        {/* 🔥 LIST */}
        <Box mt={3}>
          {isMobile ? (
            <Stack spacing={2}>
              {filteredSessions.map(s => (
                <Card key={s.id} sx={glassCard}>
                  <CardContent>
                    <Typography fontWeight={700}>
                      {dayjs(s.session_date).format("DD MMM YYYY")}
                    </Typography>
                    <Typography>
                      {dayjs(s.start_time, "HH:mm:ss").format("hh:mm A")} →
                      {dayjs(s.end_time, "HH:mm:ss").format("hh:mm A")}
                    </Typography>
                    <Typography>Coach: {s.coachName}</Typography>

                    <Stack direction="row" spacing={1} mt={2}>
                      <Button onClick={() => editSession(s)}>Edit</Button>
                      <Button color="error" onClick={() => deleteSession(s.id)}>Delete</Button>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          ) : (
            <Card sx={glassCard}>
              <Table>
                <TableHead sx={{ background: "#800000" }}>
                  <TableRow>
                    <TableCell sx={th}>Date</TableCell>
                    <TableCell sx={th}>Time</TableCell>
                    <TableCell sx={th}>Coach</TableCell>
                    <TableCell sx={th}>Programs</TableCell>
                    <TableCell sx={th}>Actions</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {filteredSessions.map(s => (
                    <TableRow key={s.id}>
                      <TableCell>{dayjs(s.session_date).format("DD MMM YYYY")}</TableCell>
                      <TableCell>
                        {dayjs(s.start_time, "HH:mm:ss").format("hh:mm A")} →
                        {dayjs(s.end_time, "HH:mm:ss").format("hh:mm A")}
                      </TableCell>
                      <TableCell>{s.coachName}</TableCell>
                      <TableCell>{s.programTitles}</TableCell>

                      <TableCell>
                        <Button sx={{ mr:1 }} onClick={() => editSession(s)}>Edit</Button>
                        <Button color="error" onClick={() => deleteSession(s.id)}>Delete</Button>
                      </TableCell>

                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </Box>

      </Box>
    </LocalizationProvider>
  );
}

// 🎨 STYLES
const containerStyle = {
  p: 2,
  minHeight: "100vh",
  background: "linear-gradient(135deg,#1a0000,#800000)"
};

const glassCard = {
  borderRadius: 3,
  background: "#fff",
  boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
  mb: 2
};

const filterCard = {
  borderRadius: 3,
  background: "#fff",
  mb: 2
};

const ctaBtn = {
  background: "#800000",
  color: "#fff"
};

const th = {
  color: "#fff",
  fontWeight: 700
};



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
