import React, { Suspense, lazy, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./index.css";
import "jspdf-autotable";

// ✅ DO NOT lazy load global components
import Header from "./Header.tsx";
import ProtectedRoute from "./ProtectedRoute.tsx";

// ⚡ Lazy load only pages
const PracticeTournaments = lazy(() => import("./PracticeTournaments.tsx"));
const AdminLayout = lazy(() => import("./AdminLayout.tsx"));
const PlayerPortal = lazy(() => import("./PlayerPortal.tsx"));
const TournamentsPage = lazy(() => import("./TournamentsPage.tsx"));
const TournamentDetails = lazy(() => import("./TournamentDetails.tsx"));
const CoachAttendance = lazy(() => import("./CoachAttendance.tsx"));
const PublicCourtBooking = lazy(() => import("./PublicCourtBooking.tsx"));
const RegisterPlayer = lazy(() => import("./RegisterPlayer.tsx"));
const Signup = lazy(() => import("./Signup.tsx"));
const PrivateBooking = lazy(() => import("./PrivateBooking"));
const PlayerProfile = lazy(() => import("./PlayerProfile.tsx"));
const Home = lazy(() => import("./Home.tsx"));
const About = lazy(() => import("./About.tsx"));
const ProgramsPage = lazy(() => import("./ProgramsPage.tsx"));
const NewsPage = lazy(() => import("./NewsPage.tsx"));
const Login = lazy(() => import("./Login.tsx"));
const Contact = lazy(() => import("./Contact.tsx"));
const PlayerLayout = lazy(() => import("./PlayerLayout"));
const CoachLayout = lazy(() => import("./CoachLayout.tsx"));
const CoachSessions = lazy(() => import("./CoachSessions"));
const CoachLeave = lazy(() => import("./CoachLeave"));
const CoachProfile = lazy(() => import("./CoachProfile"));
const CoachDashboard = lazy(() => import("./CoachDashboard"));

// ⚡ Loader
const Loader = () => (
  <div style={{ padding: 40, textAlign: "center" }}>Loading...</div>
);

// ✅ PUBLIC WRAPPER (ONLY for website pages)
const PublicLayout = ({ children }: any) => (
  <div className="container">{children}</div>
);

// 🚀 PREFETCH
function Prefetcher() {
  useEffect(() => {
    import("./AdminLayout.tsx");
    import("./TournamentsPage.tsx");
    import("./PlayerPortal.tsx");
  }, []);
  return null;
}

export default function App() {
  return (
    <Router>
      <Header />
      <Prefetcher />

      <Suspense fallback={<Loader />}>
        <main>
          <Routes>

            {/* --- PUBLIC ROUTES (WITH CONTAINER) --- */}
            <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
            <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
            <Route path="/programs" element={<PublicLayout><ProgramsPage /></PublicLayout>} />
            <Route path="/news" element={<PublicLayout><NewsPage /></PublicLayout>} />
            <Route path="/tournaments" element={<PublicLayout><TournamentsPage /></PublicLayout>} />
            <Route path="/tournaments/:id" element={<PublicLayout><TournamentDetails /></PublicLayout>} />
            <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
            <Route path="/book-court" element={<PublicLayout><PublicCourtBooking /></PublicLayout>} />
            <Route path="/register-player" element={<PublicLayout><RegisterPlayer /></PublicLayout>} />
            <Route path="/book-private-session" element={<PublicLayout><PrivateBooking /></PublicLayout>} />
            <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
            <Route path="/signup" element={<PublicLayout><Signup /></PublicLayout>} />
            <Route path="/portal" element={<PublicLayout><PlayerPortal /></PublicLayout>} />

            {/* --- COACH (FULL WIDTH) --- */}
            <Route path="/coach" element={<CoachLayout />}>
              <Route index element={<CoachDashboard />} />
              <Route path="sessions" element={<CoachSessions />} />
              <Route path="sessions/:sessionId/attendance" element={<CoachAttendance />} />
              <Route path="leave" element={<CoachLeave />} />
              <Route path="profile" element={<CoachProfile />} />
              <Route path="tournaments" element={<PracticeTournaments />} />
            </Route>

            {/* --- PLAYER (FULL WIDTH) --- */}
            <Route path="/player/*" element={<PlayerLayout />} />

            {/* --- ADMIN (FULL WIDTH FIXED) --- */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            />

            {/* --- SPECIAL ADMIN PAGE --- */}
            <Route path="/admin/players/:id" element={<PlayerProfile />} />

          </Routes>
        </main>

        <Footer />
      </Suspense>
    </Router>
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