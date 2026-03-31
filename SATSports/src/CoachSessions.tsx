import { useEffect, useState, useMemo, useRef } from "react";
import {
  Box, Typography, Grid, Card, CardContent, Button, Chip, Stack, TextField, CircularProgress, Alert, Container, IconButton
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import CloseIcon from '@mui/icons-material/Close';
import API_BASE from "./api";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

const MotionBox = motion(Box);

// --- TYPES ---
type Session = {
  id: number;
  session_date: string;
  start_time: string;
  end_time: string;
  category: string;
  locationName: string;
  location_id: number;
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
  const [now, setNow] = useState(dayjs());
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fallback Camera State
  const [showCamera, setShowCamera] = useState<{ sessionId: number; locationId: number } | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // 1. CLOCK HEARTBEAT
  useEffect(() => {
    const timer = setInterval(() => setNow(dayjs()), 10000);
    return () => clearInterval(timer);
  }, []);

  // 2. INITIAL LOAD
  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);
        const userId = localStorage.getItem("userId");
        if (!userId) return setError("AUTH REQUIRED");

        const profileRes = await fetch(`${API_BASE}/api/coach/profile/${userId}`);
        const profile = await profileRes.json();
        const cid = profile.coachId;
        setCoachId(cid);

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
          newMap[res.id] = { checkedIn: res.data.checkedIn, completed: res.data.completed, isLate: res.data.isLate || 0 };
        });
        setCheckedInMap(newMap);
      } catch (err) {
        setError("DATABASE SYNC ERROR");
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, []);

  // 3. CORE CHECK-IN LOGIC (GPS -> PHOTO FALLBACK)
  const handleCheckIn = async (sessionId: number, locationId: number) => {
    setActionLoading(sessionId);

    if (!navigator.geolocation) {
      return startPhotoFallback(sessionId, locationId);
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(`${API_BASE}/api/coach/checkin`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ coachId, sessionId, locationId, lat: pos.coords.latitude, lng: pos.coords.longitude }),
          });
          const data = await res.json();
          if (res.ok) {
            setCheckedInMap(prev => ({ ...prev, [sessionId]: { checkedIn: true, completed: false, isLate: data.isLate || 0 } }));
            setActionLoading(null);
          } else {
            // GPS works, but coordinates are wrong? Offer Photo fallback.
            if (window.confirm(`${data.message}. Open camera for photo check-in?`)) {
              startPhotoFallback(sessionId, locationId);
            } else {
              setActionLoading(null);
            }
          }
        } catch { setActionLoading(null); }
      },
      () => {
        // GPS Denied or Timeout -> Photo Fallback
        startPhotoFallback(sessionId, locationId);
      },
      { enableHighAccuracy: true, timeout: 6000 }
    );
  };

  // 4. CAMERA FALLBACK HELPERS
  const startPhotoFallback = async (sessionId: number, locationId: number) => {
    setActionLoading(null);
    setShowCamera({ sessionId, locationId });
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      alert("Camera permissions required for manual check-in.");
      setShowCamera(null);
    }
  };

  const capturePhotoCheckIn = async () => {
    if (!videoRef.current || !showCamera) return;
    setActionLoading(showCamera.sessionId);

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d")?.drawImage(videoRef.current, 0, 0);

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const formData = new FormData();
      formData.append("photo", blob, "verification.jpg");
      formData.append("coachId", coachId!);
      formData.append("sessionId", showCamera.sessionId.toString());
      formData.append("locationId", showCamera.locationId.toString());

      try {
        const res = await fetch(`${API_BASE}/api/coach/checkin/photo`, {
          method: "POST",
          body: formData,
        });
        if (res.ok) {
          const stream = videoRef.current?.srcObject as MediaStream;
          stream?.getTracks().forEach(t => t.stop());
          setCheckedInMap(prev => ({ ...prev, [showCamera.sessionId]: { checkedIn: true, completed: false, isLate: 0 } }));
          setShowCamera(null);
        } else {
          const d = await res.json();
          alert(d.message);
        }
      } catch {
        alert("Upload failed. Check connection.");
      } finally {
        setActionLoading(null);
      }
    }, "image/jpeg", 0.7);
  };

  const filteredSessions = useMemo(() => {
    return sessions.filter(s => dayjs(s.session_date).format("YYYY-MM-DD") === filterDate);
  }, [sessions, filterDate]);

  if (loading) return <Box sx={centerStyle}><CircularProgress color="error" /></Box>;

  return (
    <Box sx={{ background: "#020617", color: "white", minHeight: "100vh", py: 6 }}>
      <Container maxWidth="xl">
        <Typography variant="h3" fontWeight={950} sx={{ mb: 6 }}>MY <span style={{ color: "#ef4444" }}>SESSIONS</span></Typography>

        {/* DATE PICKER */}
        <Box sx={actionBarBoxStyle}>
          <TextField
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            sx={datePickerStyle}
          />
        </Box>

        <Grid container spacing={4}>
          {filteredSessions.map((s) => {
            const state = checkedInMap[s.id] || { checkedIn: false, completed: false, isLate: 0 };
            const sessionStart = dayjs(`${dayjs(s.session_date).format("YYYY-MM-DD")} ${s.start_time}`);
            const diffMin = sessionStart.diff(now, "minute");
            const isLive = diffMin <= 20 && diffMin > -180;

            return (
              <Grid item xs={12} md={6} lg={4} key={s.id}>
                <Card sx={sessionCardStyle(state.completed)}>
                  <CardContent sx={{ p: 4 }}>
                    <Typography variant="h6" fontWeight={800} mb={2}>⏰ {s.start_time} – {s.locationName}</Typography>
                    
                    {actionLoading === s.id ? (
                      <Button fullWidth disabled sx={actionBtnBase}><CircularProgress size={20} /></Button>
                    ) : (
                      <>
                        {!state.checkedIn && !state.completed && (
                          <Button
                            fullWidth
                            disabled={!isLive}
                            sx={isLive ? primaryBtnStyle : disabledBtnStyle}
                            onClick={() => handleCheckIn(s.id, s.location_id)}
                          >
                            {isLive ? "INITIALIZE CHECK-IN" : `WAITING (${diffMin}m)`}
                          </Button>
                        )}
                        {state.checkedIn && (
                          <Stack spacing={2}>
                            <Button fullWidth sx={attendanceBtnStyle} onClick={() => window.location.href = `/coach/sessions/${s.id}/attendance`}>ATTENDANCE</Button>
                            <Typography variant="caption" textAlign="center" sx={{ opacity: 0.5 }}>SESSION ACTIVE</Typography>
                          </Stack>
                        )}
                        {state.completed && <Chip label="✔ COMPLETED" sx={{ width: '100%', borderRadius: 2 }} />}
                      </>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Container>

      {/* --- CAMERA OVERLAY --- */}
      <AnimatePresence>
        {showCamera && (
          <MotionBox
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            sx={cameraOverlayStyle}
          >
            <IconButton 
                onClick={() => {
                    const stream = videoRef.current?.srcObject as MediaStream;
                    stream?.getTracks().forEach(t => t.stop());
                    setShowCamera(null);
                }} 
                sx={{ position: 'absolute', top: 20, right: 20, color: 'white' }}
            >
              <CloseIcon />
            </IconButton>

            <Typography variant="h5" fontWeight={900} mb={3} textAlign="center">
                GPS UNSTABLE <br/> 
                <span style={{ fontSize: '0.9rem', color: '#ef4444' }}>TAKE A PHOTO ON COURT TO VERIFY</span>
            </Typography>

            <Box sx={videoContainer}>
              <video ref={videoRef} style={{ width: '100%' }} muted playsInline />
            </Box>

            <Button 
                variant="contained" 
                startIcon={<CameraAltIcon />} 
                onClick={capturePhotoCheckIn}
                sx={captureBtnStyle}
            >
              {actionLoading ? "UPLOADING..." : "CAPTURE PHOTO"}
            </Button>
          </MotionBox>
        )}
      </AnimatePresence>
    </Box>
  );
}

// --- STYLES ---
const centerStyle = { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#020617' };
const actionBarBoxStyle = { background: "rgba(255,255,255,0.02)", p: 3, borderRadius: 4, mb: 6 };
const sessionCardStyle = (comp: boolean) => ({ borderRadius: 6, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "white", opacity: comp ? 0.5 : 1 });
const datePickerStyle = { "& .MuiOutlinedInput-root": { color: "white", borderRadius: 3, bgcolor: "rgba(255,255,255,0.02)" } };
const actionBtnBase = { py: 1.8, borderRadius: 3, fontWeight: 950 };
const primaryBtnStyle = { ...actionBtnBase, background: "linear-gradient(135deg, #f97316, #ef4444)", color: 'white' };
const disabledBtnStyle = { ...actionBtnBase, bgcolor: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.2)" };
const attendanceBtnStyle = { ...actionBtnBase, bgcolor: "#22c55e", color: "white" };
const cameraOverlayStyle = { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', bgcolor: '#020617', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 3 };
const videoContainer = { width: '100%', maxWidth: '400px', borderRadius: 4, overflow: 'hidden', border: '4px solid rgba(255,255,255,0.1)', mb: 4 };
const captureBtnStyle = { ...actionBtnBase, px: 6, background: '#ef4444', color: 'white', '&:hover': { background: '#dc2626' } };