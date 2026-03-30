import { useEffect, useState, useMemo } from "react";
import {
  Box, Typography, Grid, Card, CardContent, Button, Chip, Stack, TextField, CircularProgress, Alert, Container
} from "@mui/material";
import { motion } from "framer-motion";
import API_BASE from "./api";
import dayjs from "dayjs";

const MotionBox = motion(Box);

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
  const [actionLoading, setActionLoading] = useState<number | null>(null); 
  const [error, setError] = useState<string | null>(null);

  // 1. Memoized Filtered Sessions
  const filteredSessions = useMemo(() => {
    return sessions.filter(s => dayjs(s.session_date).format("YYYY-MM-DD") === filterDate);
  }, [sessions, filterDate]);

  // 2. Load Coach & Sessions (Sequential)
  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);
        const userId = localStorage.getItem("userId");
        if (!userId) {
          setError("AUTHENTICATION_REQUIRED: PLEASE LOG IN.");
          return;
        }

        const profileRes = await fetch(`${API_BASE}/api/coach/profile/${userId}`);
        const profile = await profileRes.json();
        const cid = profile.coachId;
        
        setCoachId(cid);
        localStorage.setItem("coachId", cid);

        const sessionRes = await fetch(`${API_BASE}/api/coach/sessions/${cid}`);
        const sessionData = await sessionRes.json();
        setSessions(sessionData);

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
        setError("SYSTEM_SYNC_ERROR: UNABLE TO RETRIEVE ARENA DATA.");
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, []);

  // 3. Handle Check-In
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
            body: JSON.stringify({ coachId, sessionId, locationId, lat: latitude, lng: longitude }),
          });
          const data = await res.json();
          if (res.ok) {
            setCheckedInMap(prev => ({
              ...prev,
              [sessionId]: { checkedIn: true, completed: false, isLate: data.isLate || 0 }
            }));
          } else { alert(data.message || "Check-in failed"); }
        } catch (err) { alert("Connection error."); }
        finally { setActionLoading(null); }
      },
      () => { setActionLoading(null); alert("Location Access Denied."); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleCheckOut = async (sessionId: number) => {
    if (!window.confirm("ARE YOU SURE YOU WANT TO TERMINATE THIS SESSION?")) return;
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
    } finally { setActionLoading(null); }
  };

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#020617' }}>
      <CircularProgress color="error" />
    </Box>
  );

  return (
    <Box sx={{ background: "#020617", color: "white", minHeight: "100vh", py: 6 }}>
      <Container maxWidth="xl">
        
        {/* HEADER */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="overline" sx={{ color: "#ef4444", fontWeight: 900, letterSpacing: 3 }}>FIELD COMMAND</Typography>
          <Typography variant="h3" fontWeight={950} sx={{ letterSpacing: -1.5 }}>MY <span style={{ color: "#ef4444" }}>SESSIONS</span></Typography>
        </Box>

        {error && <Alert severity="error" sx={errorAlertStyle}>{error}</Alert>}

        {/* SEARCH & FILTER BAR */}
        <Box sx={actionBarBoxStyle}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={3} alignItems="center">
            <TextField
              type="date"
              label="FILTER BY DATE"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={datePickerStyle}
            />
            <Box sx={{ flexGrow: 1 }} />
            <Typography sx={{ fontWeight: 900, fontSize: '0.8rem', color: '#ef4444', letterSpacing: 1 }}>
               ● {filteredSessions.length} SESSIONS ACTIVE
            </Typography>
          </Stack>
        </Box>

        <Grid container spacing={4}>
          {filteredSessions.map((s) => {
            const state = checkedInMap[s.id] || { checkedIn: false, completed: false, isLate: 0 };
            const diffMin = dayjs(`${s.session_date} ${s.start_time}`, "YYYY-MM-DD HH:mm:ss").diff(dayjs(), "minute");

            const isLive = diffMin <= 15 && diffMin > -120;
            const isUpcoming = diffMin > 15 && diffMin < 60;
            const statusLabel = isLive ? "LIVE" : isUpcoming ? "SOON" : "SCHEDULED";
            const statusColor = isLive ? "#22c55e" : isUpcoming ? "#f59e0b" : "rgba(255,255,255,0.2)";

            return (
              <Grid item xs={12} md={6} lg={4} key={s.id}>
                <MotionBox whileHover={{ y: -8 }}>
                  <Card sx={sessionCardStyle(state.completed)}>
                    <Box sx={{ height: 4, background: statusColor, boxShadow: `0 0 15px ${statusColor}` }} />
                    <CardContent sx={{ p: 4 }}>
                      <Stack direction="row" justifyContent="space-between" mb={3}>
                        <Box>
                          <Typography variant="h4" fontWeight={950}>{dayjs(s.session_date).format("DD")}</Typography>
                          <Typography variant="overline" sx={{ opacity: 0.5, fontWeight: 900 }}>{dayjs(s.session_date).format("MMM YYYY")}</Typography>
                        </Box>
                        <Stack alignItems="flex-end" spacing={1}>
                          <Chip label={statusLabel} sx={statusChipStyle(statusColor)} />
                          {state.isLate === 1 && <Chip label="LATE ENTRY" size="small" sx={lateChipStyle} />}
                        </Stack>
                      </Stack>

                      <Stack spacing={1.5} mb={3}>
                        <Typography variant="h6" fontWeight={800}>⏰ {s.start_time} – {s.end_time || "--"}</Typography>
                        <Typography variant="body1" fontWeight={700} sx={{ opacity: 0.8 }}>📍 {s.locationName}</Typography>
                      </Stack>

                      {s.programTitles && (
                        <Box mb={4} display="flex" flexWrap="wrap" gap={1}>
                          {s.programTitles.split(",").map((p, i) => (
                            <Chip key={i} label={p.trim()} size="small" sx={programChipStyle} />
                          ))}
                        </Box>
                      )}

                      <Box>
                        {actionLoading === s.id ? (
                          <Button fullWidth disabled sx={actionBtnBase}><CircularProgress size={24} color="error" /></Button>
                        ) : (
                          <>
                            {!state.checkedIn && !state.completed && (
                              <Button
                                fullWidth
                                disabled={!isLive}
                                sx={isLive ? primaryBtnStyle : disabledBtnStyle}
                                onClick={() => handleCheckIn(s.id, s.location_id)}
                              >
                                {isLive ? "INITIALIZE CHECK-IN" : "WAITING FOR WINDOW"}
                              </Button>
                            )}

                            {state.checkedIn && (
                              <Stack spacing={2}>
                                <Button fullWidth sx={attendanceBtnStyle} onClick={() => window.location.href = `/coach/sessions/${s.id}/attendance`}>MARK ATTENDANCE</Button>
                                <Button fullWidth variant="outlined" sx={checkoutBtnStyle} onClick={() => handleCheckOut(s.id)}>CLOSE SESSION</Button>
                              </Stack>
                            )}

                            {state.completed && (
                              <Box sx={finalizedBoxStyle}>
                                <Typography fontWeight={950}>✔ MISSION COMPLETED</Typography>
                              </Box>
                            )}
                          </>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </MotionBox>
              </Grid>
            );
          })}
        </Grid>
      </Container>
    </Box>
  );
}

// 💅 ELITE DESIGN SYSTEM
const sessionCardStyle = (completed: boolean) => ({ borderRadius: 6, background: "rgba(255,255,255,0.03)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.08)", color: "white", opacity: completed ? 0.5 : 1 });
const actionBarBoxStyle = { background: "rgba(255,255,255,0.02)", p: 3, borderRadius: 4, mb: 6, border: "1px solid rgba(255,255,255,0.05)" };
const datePickerStyle = { "& .MuiOutlinedInput-root": { color: "white", borderRadius: 3, bgcolor: "rgba(255,255,255,0.02)", "& fieldset": { borderColor: "rgba(255,255,255,0.1)" } }, "& .MuiInputLabel-root": { color: "#ef4444", fontWeight: 900 } };
const statusChipStyle = (color: string) => ({ bgcolor: color, color: "#fff", fontWeight: 900, borderRadius: 1, fontSize: '0.65rem' });
const lateChipStyle = { bgcolor: 'rgba(239, 68, 68, 0.2)', color: '#ff4444', border: '1px solid #ff4444', fontWeight: 900, borderRadius: 1 };
const programChipStyle = { borderRadius: 1, border: "1px solid rgba(239, 68, 68, 0.3)", color: "rgba(255,255,255,0.7)", fontWeight: 800, fontSize: '0.7rem' };
const actionBtnBase = { py: 1.8, borderRadius: 3, fontWeight: 950 };
const primaryBtnStyle = { ...actionBtnBase, background: "linear-gradient(135deg, #f97316, #ef4444)", color: 'white' };
const disabledBtnStyle = { ...actionBtnBase, bgcolor: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.2)" };
const attendanceBtnStyle = { ...actionBtnBase, bgcolor: "#22c55e", color: "white", "&:hover": { bgcolor: "#16a34a" } };
const checkoutBtnStyle = { ...actionBtnBase, borderColor: "#ef4444", color: "#ef4444" };
const finalizedBoxStyle = { py: 2, textAlign: 'center', bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 3, color: 'rgba(255,255,255,0.3)' };
const errorAlertStyle = { mb: 3, borderRadius: 3, bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#ff4444', border: '1px solid rgba(239, 68, 68, 0.2)' };