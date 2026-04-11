// 🔥 ELITE OPTIMIZED VERSION
import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import {
  Box, Typography, Grid, Card, CardContent, Button,
  CircularProgress, Container, IconButton, Stack, TextField
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import CloseIcon from '@mui/icons-material/Close';
import API_BASE from "./api";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

const MotionBox = motion(Box);

// --- TYPES ---
type CheckInState = { checkedIn: boolean; completed: boolean; isLate: number };
type Session = { id: number; session_date: string; start_time: string; locationName: string; location_id: number };

export default function CoachSessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [checkedInMap, setCheckedInMap] = useState<Record<number, CheckInState>>({});
  const [coachId, setCoachId] = useState<string | null>(null);
  const [filterDate, setFilterDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [now, setNow] = useState(dayjs());
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [showCamera, setShowCamera] = useState<{ sessionId: number; locationId: number } | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);

  // 🚀 CLEAN CAMERA PROPERLY
  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    if (!showCamera) stopCamera();
  }, [showCamera]);

  // 🚀 STABLE CLOCK (LESS RE-RENDERS)
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(prev => prev.add(10, "second"));
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  // 🚀 PARALLEL DATA LOAD (MAJOR SPEED BOOST)
  const initData = useCallback(async () => {
    setLoading(true);
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) return;

      const [profileRes, sessionRes] = await Promise.all([
        fetch(`${API_BASE}/api/coach/profile/${userId}`),
        fetch(`${API_BASE}/api/coach/sessions/${userId}`)
      ]);

      const profile = await profileRes.json();
      const sessionData = await sessionRes.json();

      setCoachId(profile.coachId);
      setSessions(sessionData);

      // 🚀 PARALLEL STATUS FETCH
      const statusResults = await Promise.allSettled(
        sessionData.map((s: Session) =>
          fetch(`${API_BASE}/api/coach/checkin/status?coachId=${profile.coachId}&sessionId=${s.id}`)
            .then(res => res.json())
        )
      );

      const newMap: Record<number, CheckInState> = {};

      sessionData.forEach((s: Session, i: number) => {
        const result = statusResults[i];
        if (result.status === "fulfilled") {
          const data = result.value;
          newMap[s.id] = {
            checkedIn: !!data.checkedIn,
            completed: !!data.completed,
            isLate: data.isLate || 0
          };
        } else {
          newMap[s.id] = { checkedIn: false, completed: false, isLate: 0 };
        }
      });

      setCheckedInMap(newMap);

    } catch (err) {
      console.error("Init error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { initData(); }, [initData]);

  // 🚀 FAST LOCATION (NON-BLOCKING)
  const getQuickLocation = () =>
    new Promise<{ lat: number | null; lng: number | null }>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => resolve({ lat: null, lng: null }),
        { timeout: 5000 }
      );
    });

  // 🚀 CHECK-IN OPTIMIZED
  const handleCheckIn = useCallback(async (sessionId: number, locationId: number) => {
    if (actionLoading) return;

    setActionLoading(sessionId);

    try {
      const coords = await getQuickLocation();

      const formData = new FormData();
      formData.append("coachId", coachId!);
      formData.append("sessionId", String(sessionId));
      formData.append("locationId", String(locationId));
      formData.append("lat", String(coords.lat || 0));
      formData.append("lng", String(coords.lng || 0));

      const res = await fetch(`${API_BASE}/api/coach/checkin`, {
        method: "POST",
        body: formData
      });

      const data = await res.json();

      if (res.ok) {
        setCheckedInMap(prev => ({
          ...prev,
          [sessionId]: { ...prev[sessionId], checkedIn: true }
        }));
      } else if (res.status === 403 && data.requiresPhoto) {
        setShowCamera({ sessionId, locationId });

        setTimeout(async () => {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
              videoRef.current.play();
            }
          } catch {
            alert("Camera required");
            setShowCamera(null);
          }
        }, 200);
      } else {
        alert(data.message || "Error");
      }
    } finally {
      setActionLoading(null);
    }
  }, [coachId, actionLoading]);

  // 🚀 CHECKOUT OPTIMIZED
  const handleCheckOut = useCallback(async (sessionId: number) => {
    if (actionLoading) return;
    if (!window.confirm("End this session?")) return;

    setActionLoading(sessionId);

    try {
      const res = await fetch(`${API_BASE}/api/coach/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coachId, sessionId })
      });

      if (res.ok) {
        setCheckedInMap(prev => ({
          ...prev,
          [sessionId]: { ...prev[sessionId], completed: true, checkedIn: false }
        }));
      } else {
        const data = await res.json();
        alert(data.message);
      }
    } finally {
      setActionLoading(null);
    }
  }, [coachId, actionLoading]);

  // 🚀 FILTER MEMO
  const filteredSessions = useMemo(() =>
    sessions.filter(s =>
      dayjs(s.session_date).format("YYYY-MM-DD") === filterDate
    ),
    [sessions, filterDate]
  );

  if (loading) return <Box sx={centerStyle}><CircularProgress color="error" /></Box>;

  return (
    <Box sx={{ background: "#020617", color: "white", minHeight: "100vh", py: 6 }}>
      <Container maxWidth="xl">

        <Stack direction="row" justifyContent="space-between" mb={4}>
          <Typography variant="h3" fontWeight={900}>MY SESSIONS</Typography>
          <TextField type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
        </Stack>

        <Grid container spacing={3}>
          {filteredSessions.map((s) => {
            const state = checkedInMap[s.id] || { checkedIn: false, completed: false };

            return (
              <Grid item xs={12} md={4} key={s.id}>
                <Card sx={sessionCardStyle(state.completed)}>
                  <CardContent>

                    <Typography fontWeight={800}>{s.locationName}</Typography>
                    <Typography>{s.start_time}</Typography>

                    {state.completed ? (
                      <Box>SESSION CLOSED</Box>
                    ) : state.checkedIn ? (
                      <>
                        <Button onClick={() => window.location.href=`/coach/sessions/${s.id}/attendance`}>
                          ATTENDANCE
                        </Button>
                        <Button onClick={() => handleCheckOut(s.id)}>
                          END SESSION
                        </Button>
                      </>
                    ) : (
                      <Button onClick={() => handleCheckIn(s.id, s.location_id)}>
                        CHECK IN
                      </Button>
                    )}

                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

      </Container>
    </Box>
  );
}
const centerStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100vh"
};