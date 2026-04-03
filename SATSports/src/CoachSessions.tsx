import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import {
  Box, Typography, Grid, Card, CardContent, Button, CircularProgress, Container, IconButton, Stack, TextField
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
type CheckInState = { checkedIn: boolean; completed: boolean; isLate: number; };
type Session = { id: number; session_date: string; start_time: string; locationName: string; location_id: number; };

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

  // 1. CLEANUP: Kill camera tracks when overlay closes
  useEffect(() => {
    if (!showCamera && videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  }, [showCamera]);

  // 2. TICKER: Keep time and UI status updated
  useEffect(() => {
    const timer = setInterval(() => setNow(dayjs()), 10000);
    return () => clearInterval(timer);
  }, []);

  // 3. INITIALIZER: Unified Data Fetching
  const initData = useCallback(async () => {
    setLoading(true);
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) return;
  
      // 1. Get Coach Profile
      const profileRes = await fetch(`${API_BASE}/api/coach/profile/${userId}`);
      const profile = await profileRes.json();
      setCoachId(profile.coachId);
  
      // 2. Get Sessions
      const sessionRes = await fetch(`${API_BASE}/api/coach/sessions/${profile.coachId}`);
      const sessionData = await sessionRes.json();
      setSessions(sessionData);
  
      // 3. Get Statuses (Hardened individual fetching)
      const newMap: Record<number, CheckInState> = {};
      
      await Promise.all(sessionData.map(async (s: Session) => {
        try {
          const dateStr = dayjs(s.session_date).format("YYYY-MM-DD");
          const statusUrl = `${API_BASE}/api/coach/checkin/status?coachId=${profile.coachId}&sessionId=${s.id}&date=${dateStr}`;
          
          const statusRes = await fetch(statusUrl);
          if (!statusRes.ok) throw new Error("Status failed");
          
          const data = await statusRes.json();
          newMap[s.id] = { 
            checkedIn: !!data.checkedIn, 
            completed: !!data.completed, 
            isLate: data.isLate || 0 
          };
        } catch (err) {
          console.warn(`Sync failed for session ${s.id}, using default state.`);
          newMap[s.id] = { checkedIn: false, completed: false, isLate: 0 };
        }
      }));
  
      setCheckedInMap(newMap);
    } catch (err) {
      console.error("Critical Sync Error:", err);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { initData(); }, [initData]);

  // 4. GPS HELPER: With 6s timeout to prevent hanging
  const getQuickLocation = () => new Promise<{lat: number | null, lng: number | null}>((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve({ lat: null, lng: null }),
      { enableHighAccuracy: true, timeout: 6000 }
    );
  });

  // 5. CHECK-IN: Deduplicated & Fail-safe
  const handleCheckIn = async (sessionId: number, locationId: number) => {
    if (actionLoading) return;
    setActionLoading(sessionId);

    const coords = await getQuickLocation();
    
    const formData = new FormData();
    formData.append("coachId", coachId!);
    formData.append("sessionId", sessionId.toString());
    formData.append("locationId", locationId.toString());
    formData.append("lat", String(coords.lat || 0));
    formData.append("lng", String(coords.lng || 0));

    try {
      const res = await fetch(`${API_BASE}/api/coach/checkin`, { method: "POST", body: formData });
      const data = await res.json();

      if (res.ok) {
        setCheckedInMap(prev => ({ ...prev, [sessionId]: { ...prev[sessionId], checkedIn: true } }));
      } else if (res.status === 403 && data.requiresPhoto) {
        // Trigger Photo Fallback
        setShowCamera({ sessionId, locationId });
        setTimeout(async () => {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
            if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play(); }
          } catch { alert("Camera Access Required"); setShowCamera(null); }
        }, 300);
      } else {
        alert(data.message || "Error");
      }
    } catch {
      alert("Network Error");
    } finally {
      setActionLoading(null);
    }
  };

  const capturePhotoCheckIn = async () => {
    if (!videoRef.current || !showCamera || actionLoading) return;
    setActionLoading(showCamera.sessionId);

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d")?.drawImage(videoRef.current, 0, 0);

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const coords = await getQuickLocation();

      const formData = new FormData();
      formData.append("photo", blob, "verify.jpg");
      formData.append("coachId", coachId!);
      formData.append("sessionId", showCamera.sessionId.toString());
      formData.append("locationId", showCamera.locationId.toString());
      formData.append("lat", String(coords.lat || 0));
      formData.append("lng", String(coords.lng || 0));

      const res = await fetch(`${API_BASE}/api/coach/checkin`, { method: "POST", body: formData });
      if (res.ok) {
        setCheckedInMap(prev => ({ ...prev, [showCamera.sessionId]: { ...prev[showCamera.sessionId], checkedIn: true } }));
        setShowCamera(null);
      } else {
        alert("Upload Failed");
      }
      setActionLoading(null);
    }, "image/jpeg", 0.7);
  };
  const handleCheckOut = async (sessionId: number) => {
    if (actionLoading) return;
  
    // Foolproof Step 1: Confirm intent
    const confirm = window.confirm("Are you sure you want to end this session? You won't be able to mark attendance after closing.");
    if (!confirm) return;
  
    setActionLoading(sessionId);
  
    try {
      const res = await fetch(`${API_BASE}/api/coach/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coachId, sessionId })
      });
  
      const data = await res.json();
  
      if (res.ok) {
        // Foolproof Step 2: Update local UI state immediately
        setCheckedInMap(prev => ({
          ...prev,
          [sessionId]: { ...prev[sessionId], completed: true, checkedIn: false }
        }));
      } else {
        alert(data.message || "Checkout failed");
      }
    } catch (err) {
      alert("Network error. Please check your connection.");
    } finally {
      setActionLoading(null);
    }
  };
  const filteredSessions = useMemo(() => {
    return sessions.filter(s => dayjs(s.session_date).format("YYYY-MM-DD") === filterDate);
  }, [sessions, filterDate]);

  if (loading) return <Box sx={centerStyle}><CircularProgress color="error" /></Box>;

  return (
    <Box sx={{ background: "#020617", color: "white", minHeight: "100vh", py: 6 }}>
      <Container maxWidth="xl">
        <Typography variant="h3" fontWeight={950} mb={4}>MY <span style={{ color: "#ef4444" }}>SESSIONS</span></Typography>
        
        <Grid container spacing={3}>
          {filteredSessions.map((s) => {
            const state = checkedInMap[s.id] || { checkedIn: false, completed: false };
            const sessionStart = dayjs(`${dayjs(s.session_date).format("YYYY-MM-DD")} ${s.start_time}`);
            const diffMin = sessionStart.diff(now, "minute");
            const isLive = diffMin <= 20 && diffMin > -180;

            return (
              <Grid item xs={12} md={4} key={s.id}>
                <Card sx={sessionCardStyle(state.completed)}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight={800}>{s.locationName}</Typography>
                    <Typography color="rgba(255,255,255,0.6)" mb={3}>{s.start_time}</Typography>
                    
                    {state.completed ? (
                      <Box sx={finalizedBoxStyle}>SESSION CLOSED</Box>
                    ) : state.checkedIn ? (
                      <Stack spacing={1}>
                        <Button fullWidth sx={attendanceBtnStyle} onClick={() => window.location.href=`/coach/sessions/${s.id}/attendance`}>MARK ATTENDANCE</Button>
                        <Button 
  fullWidth 
  variant="outlined" 
  onClick={() => handleCheckOut(s.id)}
  disabled={actionLoading === s.id}
  sx={{ 
    mt: 1,
    color: "#ef4444", 
    borderColor: "#ef4444", 
    fontWeight: 800,
    borderRadius: 2,
    "&:hover": { borderColor: "#f87171", bgcolor: "rgba(239, 68, 68, 0.05)" }
  }}
>
  {actionLoading === s.id ? (
    <CircularProgress size={20} color="inherit" />
  ) : (
    "END SESSION"
  )}
</Button>
                     </Stack>
                    ) : (
                      <Button 
                        fullWidth 
                        sx={isLive ? primaryBtnStyle : disabledBtnStyle} 
                        disabled={!isLive || actionLoading === s.id}
                        onClick={() => handleCheckIn(s.id, s.location_id)}
                      >
                        {actionLoading === s.id ? <CircularProgress size={20} color="inherit"/> : isLive ? "CHECK IN" : `WAITING (${diffMin}m)`}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Container>

      <AnimatePresence>
        {showCamera && (
          <MotionBox initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} sx={cameraOverlayStyle}>
            <IconButton onClick={() => setShowCamera(null)} sx={{ position: 'absolute', top: 20, right: 20, color: 'white' }}><CloseIcon /></IconButton>
            <Box sx={videoContainer}><video ref={videoRef} style={{ width: '100%' }} muted playsInline /></Box>
            <Button variant="contained" onClick={capturePhotoCheckIn} sx={captureBtnStyle} disabled={!!actionLoading}>
              {actionLoading ? "UPLOADING..." : "CAPTURE & VERIFY"}
            </Button>
          </MotionBox>
        )}
      </AnimatePresence>
    </Box>
  );
}

// Minimalist Styles for production
const sessionCardStyle = (comp: boolean) => ({ borderRadius: 4, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", color: "white", opacity: comp ? 0.5 : 1 });
const primaryBtnStyle = { py: 1.5, borderRadius: 2, background: "linear-gradient(135deg, #f97316, #ef4444)", color: 'white', fontWeight: 800 };
const disabledBtnStyle = { py: 1.5, borderRadius: 2, bgcolor: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.2)" };
const attendanceBtnStyle = { py: 1.5, borderRadius: 2, bgcolor: "#22c55e", color: "white", fontWeight: 800 };
const finalizedBoxStyle = { py: 1.5, textAlign: 'center', bgcolor: 'rgba(34, 197, 94, 0.1)', borderRadius: 2, color: '#22c55e', fontWeight: 800 };
const cameraOverlayStyle = { position: 'fixed', inset: 0, bgcolor: '#020617', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 3 };
const videoContainer = { width: '100%', maxWidth: '400px', borderRadius: 4, overflow: 'hidden', border: '2px solid #ef4444', mb: 3 };
const captureBtnStyle = { px: 4, py: 1.5, bgcolor: '#ef4444', color: 'white', borderRadius: 2, fontWeight: 800 };
const centerStyle = { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#020617' };