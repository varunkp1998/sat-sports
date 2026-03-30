import { useEffect, useState, useMemo } from "react";
import {
  Box, Typography, Grid, Card, CardContent, Button, Chip, Stack, TextField, CircularProgress, Alert
} from "@mui/material";
import API_BASE from "./api";
import dayjs from "dayjs";

// Types
type Session = {
  id: number;
  session_date: string;
  start_time: string;
  end_time: string;
  category: string;
  locationName: string;
  location_id: number;
  programTitles?: string;
};

type CheckInState = {
  checkedIn: boolean;
  completed: boolean;
  isLate: number;
};

export default function CoachSessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [checkedInMap, setCheckedInMap] = useState<Record<number, CheckInState>>({});
  const [coachId, setCoachId] = useState<string | null>(null);
  const [filterDate, setFilterDate] = useState(dayjs().format("YYYY-MM-DD"));
  
  // UI States
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null); // Track which session is processing
  const [error, setError] = useState<string | null>(null);

  // 1. Memoized Filtered Sessions (Better Performance)
  const filteredSessions = useMemo(() => {
    return sessions.filter(s => dayjs(s.session_date).isSame(filterDate, "day"));
  }, [sessions, filterDate]);

  // 2. Load Coach & Sessions (Sequential to ensure coachId is ready)
  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);
        const userId = localStorage.getItem("userId");
        if (!userId) {
          setError("User not logged in");
          return;
        }

        // Fetch Profile
        const profileRes = await fetch(`${API_BASE}/api/coach/profile/${userId}`);
        const profile = await profileRes.json();
        const cid = profile.coachId;
        
        setCoachId(cid);
        localStorage.setItem("coachId", cid);

        // Fetch Sessions
        const sessionRes = await fetch(`${API_BASE}/api/coach/sessions/${cid}`);
        const sessionData = await sessionRes.json();
        setSessions(sessionData);

        // Fetch Statuses for all sessions at once
        const statusPromises = sessionData.map((s: Session) => 
          fetch(`${API_BASE}/api/coach/checkin/status?coachId=${cid}&sessionId=${s.id}&date=${dayjs(s.session_date).format("YYYY-MM-DD")}`)
            .then(res => res.json())
            .then(data => ({ id: s.id, data }))
        );

        const statuses = await Promise.all(statusPromises);
        const newMap: Record<number, CheckInState> = {};
        statuses.forEach(res => {
          newMap[res.id] = {
            checkedIn: res.data.checkedIn,
            completed: res.data.completed,
            isLate: res.data.isLate || 0
          };
        });
        setCheckedInMap(newMap);

      } catch (err) {
        setError("Failed to load dashboard. Please refresh.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, []);

  // 3. Robust Handle Check-In
  const handleCheckIn = async (sessionId: number, locationId: number) => {
    if (!navigator.geolocation) {
      alert("GPS location is not supported by your browser.");
      return;
    }

    setActionLoading(sessionId);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;

          const res = await fetch(`${API_BASE}/api/coach/checkin`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              coachId, sessionId, locationId,
              lat: latitude, lng: longitude
            }),
          });

          const data = await res.json();

          if (res.ok) {
            setCheckedInMap(prev => ({
              ...prev,
              [sessionId]: { checkedIn: true, completed: false, isLate: data.isLate || 0 }
            }));
          } else {
            alert(data.message || "Check-in failed");
          }
        } catch (err) {
          alert("Connection error. Try again.");
        } finally {
          setActionLoading(null);
        }
      },
      (err) => {
        setActionLoading(null);
        alert(`Location Access Denied: Please enable GPS/Location in settings.`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleCheckOut = async (sessionId: number) => {
    if (!window.confirm("Are you sure you want to Check Out?")) return;
    
    setActionLoading(sessionId);
    try {
      await fetch(`${API_BASE}/api/coach/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coachId, sessionId }),
      });

      setCheckedInMap(prev => ({
        ...prev,
        [sessionId]: { ...prev[sessionId], checkedIn: false, completed: true }
      }));
    } catch (err) {
      alert("Checkout failed. Check your internet.");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" height="100vh" bgcolor="#000">
      <CircularProgress color="error" />
    </Box>
  );

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, background: "#000", minHeight: "100vh" }}>
      <Typography variant="h4" fontWeight={900} mb={3} sx={{ color: "#fff" }}>
        📅 My Sessions
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Box mb={4} sx={{ background: "rgba(255,255,255,0.05)", p: 2, borderRadius: 3 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
          <TextField
            type="date"
            label="Filter Date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ background: "#fff", borderRadius: 2, width: { xs: "100%", sm: 250 } }}
          />
          <Typography color="#9ca3af" fontWeight={600}>
            Showing {filteredSessions.length} sessions
          </Typography>
        </Stack>
      </Box>

      {filteredSessions.length === 0 && !error && (
        <Typography color="gray" textAlign="center" mt={5}>No sessions found for this date.</Typography>
      )}

      <Grid container spacing={3}>
        {filteredSessions.map((s) => {
          const state = checkedInMap[s.id] || { checkedIn: false, completed: false, isLate: 0 };
          
          // Time Logic
          const sessionTime = dayjs(`${s.session_date} ${s.start_time}`, "YYYY-MM-DD HH:mm:ss");
          const diffMin = sessionTime.diff(dayjs(), "minute");

          const isLive = diffMin <= 15 && diffMin > -120; // Allow check-in 15 mins early
          const isUpcoming = diffMin > 15 && diffMin < 60;
          const status = isLive ? "LIVE" : isUpcoming ? "SOON" : "SCHEDULED";
          const statusColor = isLive ? "#22c55e" : isUpcoming ? "#f59e0b" : "#64748b";

          return (
            <Grid item xs={12} md={6} lg={4} key={s.id}>
              <Card sx={{ 
                borderRadius: 4, 
                transition: "0.3s", 
                "&:hover": { transform: "translateY(-5px)" },
                opacity: state.completed ? 0.7 : 1 
              }}>
                <Box sx={{ height: 6, background: statusColor }} />
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="start">
                    <Typography variant="h6" fontWeight={800}>
                      {dayjs(s.session_date).format("DD MMM")}
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      <Chip label={status} size="small" sx={{ background: statusColor, color: "#fff", fontWeight: 700 }} />
                      {state.isLate === 1 && <Chip label="LATE" size="small" color="error" />}
                    </Stack>
                  </Box>

                  <Typography mt={1} fontWeight={600} color="text.secondary">
                    ⏰ {s.start_time} – {s.end_time || "--"}
                  </Typography>

                  <Typography mt={2} variant="subtitle1" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    📍 {s.locationName}
                  </Typography>

                  {s.programTitles && (
                    <Box mt={2} display="flex" flexWrap="wrap" gap={1}>
                      {s.programTitles.split(",").map((p, i) => (
                        <Chip key={i} label={p.trim()} size="small" variant="outlined" sx={{ borderColor: "#800000", color: "#800000" }} />
                      ))}
                    </Box>
                  )}

                  <Box mt={3}>
                    {actionLoading === s.id ? (
                      <Button fullWidth disabled><CircularProgress size={24} /></Button>
                    ) : (
                      <>
                        {!state.checkedIn && !state.completed && (
                          <Button
                            fullWidth
                            variant="contained"
                            disabled={!isLive}
                            sx={{ background: "#800000", py: 1.2, fontWeight: 700 }}
                            onClick={() => handleCheckIn(s.id, s.location_id)}
                          >
                            {isLive ? "Check In Now" : "Check-in Not Available"}
                          </Button>
                        )}

                        {state.checkedIn && (
                          <Stack spacing={1.5}>
                            <Typography textAlign="center" color="#22c55e" fontWeight={800} display="flex" alignItems="center" justifyContent="center" gap={1}>
                              ✅ ACTIVE SESSION
                            </Typography>
                            <Button
                              fullWidth
                              variant="contained"
                              color="success"
                              onClick={() => window.location.href = `/coach/sessions/${s.id}/attendance`}
                            >
                              Mark Attendance
                            </Button>
                            <Button
                              fullWidth
                              variant="outlined"
                              color="error"
                              onClick={() => handleCheckOut(s.id)}
                            >
                              Check Out
                            </Button>
                          </Stack>
                        )}

                        {state.completed && (
                          <Box textAlign="center" p={1} bgcolor="#f3f4f6" borderRadius={2}>
                            <Typography fontWeight={700} color="text.disabled">✔ Session Finalized</Typography>
                          </Box>
                        )}
                      </>
                    )}
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