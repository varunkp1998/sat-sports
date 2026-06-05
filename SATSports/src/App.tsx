import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// CSS and Global Modules
import "./index.css";
import "jspdf-autotable";
import { Box,Typography } from "@mui/material";
// Static Components (Immediate Load)
import Header from "./Header";
import ProtectedRoute from "./ProtectedRoute";

// ⚡ Public Pages
const Home = lazy(() => import("./Home"));
const About = lazy(() => import("./About"));
const ProgramsPage = lazy(() => import("./ProgramsPage"));
const NewsPage = lazy(() => import("./NewsPage"));
const Contact = lazy(() => import("./Contact"));
const Login = lazy(() => import("./Login"));
const Signup = lazy(() => import("./Signup"));

// ⚡ Tournament & Booking
const TournamentsPage = lazy(() => import("./TournamentsPage"));
const TournamentDetails = lazy(() => import("./TournamentDetails"));
const PublicCourtBooking = lazy(() => import("./PublicCourtBooking"));
const PrivateBooking = lazy(() => import("./PrivateBooking"));
const RegisterPlayer = lazy(() => import("./RegisterPlayer"));

// ⚡ Layouts
const AdminLayout = lazy(() => import("./AdminLayout"));
const PlayerLayout = lazy(() => import("./PlayerLayout"));
const CoachLayout = lazy(() => import("./CoachLayout"));

// ⚡ NEW ADMIN MODULES (Optimized)
const AdminLivePresence = lazy(() => import("./AdminLivePresence"));
const AdminLocations = lazy(() => import("./AdminLocations"));
const AdminNews = lazy(() => import("./AdminNews"));
const AdminPlayers = lazy(() => import("./AdminPlayers"));
const AdminPrivateBookings = lazy(() => import("./AdminPrivateBooking"));
const PlayerProfile = lazy(() => import("./PlayerProfile"));
const AdminCoaches = lazy(() => import("./AdminCoaches"));
const AdminPrograms = lazy(() => import("./AdminPrograms"));
const AdminSessions = lazy(() => import("./AdminSessions"));
const AdminApplications = lazy(() => import("./AdminApplications"));
const AdminAttendance = lazy(() => import("./AdminAttendance"));
const AdminLeaves = lazy(() => import("./AdminLeaves"));
const AdminRevenue = lazy(() => import("./AdminRevenue"));
const AdminPayroll = lazy(() => import("./AdminCoachPayroll"));
const AdminReports = lazy(() => import("./AdminReports"));
const AdminTournaments = lazy(() => import("./AdminTournaments"));
const AdminCourtBookings = lazy(() => import("./AdminCourtBookings"));
const AdminDashboard = lazy(() => import("./AdminDashboard"));
// ⚡ Coach Specific
const CoachDashboard = lazy(() => import("./CoachDashboard"));
const CoachSessions = lazy(() => import("./CoachSessions"));
const CoachAttendance = lazy(() => import("./CoachAttendance"));
const CoachLeave = lazy(() => import("./CoachLeave"));
const CoachProfile = lazy(() => import("./CoachProfile"));
const CoachTournaments = lazy(() => import("./PracticeTournaments"));
// ⚡ UI Helpers
const Loader = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
    <Typography variant="overline" fontWeight={900} sx={{ letterSpacing: 2, opacity: 0.5 }}>
      Synchronizing SAT Sports...
    </Typography>
  </Box>
);

const PublicLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="container" style={{ minHeight: "80vh" }}>{children}</div>
);

export default function App() {
  return (
    <Router>
      <Header />
      
      <Suspense fallback={<Loader />}>
        <Routes>
          {/* --- PUBLIC ROUTES --- */}
          <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
          <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
          <Route path="/programs" element={<PublicLayout><ProgramsPage /></PublicLayout>} />
          <Route path="/news" element={<PublicLayout><NewsPage /></PublicLayout>} />
          <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
          <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
          <Route path="/signup" element={<PublicLayout><Signup /></PublicLayout>} />
          
          {/* --- TOURNAMENTS & BOOKING --- */}
          <Route path="/tournaments" element={<PublicLayout><TournamentsPage /></PublicLayout>} />
          <Route path="/tournaments/:id" element={<PublicLayout><TournamentDetails /></PublicLayout>} />
          <Route path="/book-court" element={<PublicLayout><PublicCourtBooking /></PublicLayout>} />
          <Route path="/book-private-session" element={<PublicLayout><PrivateBooking /></PublicLayout>} />
          <Route path="/register-player" element={<PublicLayout><RegisterPlayer /></PublicLayout>} />

          {/* --- COACH SECTION (Nested) --- */}
          <Route path="/coach" element={<CoachLayout />}>
            <Route index element={<CoachDashboard />} />
            <Route path="sessions" element={<CoachSessions />} />
            <Route path="sessions/:sessionId/attendance" element={<CoachAttendance />} />
            <Route path="leave" element={<CoachLeave />} />
            <Route path="profile" element={<CoachProfile />} />
            <Route path="tournaments" element={<CoachTournaments />} />
          </Route>

          {/* --- PLAYER SECTION (Nested) --- */}
          <Route path="/player" element={<PlayerLayout />}>
             {/* Add player nested routes here */}
          </Route>

          {/* --- ADMIN SECTION (Unified & Nested) --- */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            {/* Index redirects to players or dashboard */}
            <Route index element={<AdminDashboard />} />            
            <Route path="live-presence" element={<AdminLivePresence />} />
            <Route path="locations" element={<AdminLocations />} />
            <Route path="news" element={<AdminNews />} />
            <Route path="players" element={<AdminPlayers />} />
            <Route path="players/:id" element={<PlayerProfile />} />
            <Route path="private-bookings" element={<AdminPrivateBookings />} />
            <Route path="programs" element={<AdminPrograms />} />
<Route path="sessions" element={<AdminSessions />} />
<Route path="coaches" element={<AdminCoaches />} />
<Route path="applications" element={<AdminApplications />} />
<Route path="attendance" element={<AdminAttendance />} />
<Route path="leaves" element={<AdminLeaves />} />
<Route path="live" element={<AdminLivePresence />} />
<Route path="revenue" element={<AdminRevenue />} />
<Route path="payroll" element={<AdminPayroll />} />
<Route path="reports" element={<AdminReports />} />
<Route path="tournaments" element={<AdminTournaments />} />
<Route path="court-bookings" element={<AdminCourtBookings />} />
          </Route>

          {/* 404 Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        <Footer />
      </Suspense>
    </Router>
  );
}

function Footer() {
  return (
    <footer style={{ textAlign: "center", padding: "3rem 0", opacity: 0.5 }}>
      <Typography variant="caption" fontWeight={800}>
        © {new Date().getFullYear()} SAT SPORTS PVT LTD • DATA SYSTEMS V2.0
      </Typography>
    </footer>
  );
}