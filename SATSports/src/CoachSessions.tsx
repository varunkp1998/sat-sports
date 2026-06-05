// 🔥 INDUSTRY-STANDARD COACH SESSIONS
import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import {
  Box, Typography, Grid, Card, CardContent, Button, Chip,
  CircularProgress, Container, Stack, TextField, Fade, Divider
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import API_BASE from "./api";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

dayjs.extend(isSameOrBefore);

const MotionBox = motion(Box);

// --- TYPES ---
interface CheckInState { checkedIn: boolean; completed: boolean; isLate: number }
interface Session { 
  id: number; 
  session_date: string; 
  start_time: string; 
  locationName: string; 
  location_id: number;
  end_time?: string; 
}

export default function CoachSessions() {
  const coachIdRef = useRef<string | null>(
    localStorage.getItem("coachId")
  );
    const [sessions, setSessions] = useState<Session[]>([]);
  const [checkedInMap, setCheckedInMap] = useState<Record<number, CheckInState>>({});
  const [filterDate, setFilterDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [showCamera, setShowCamera] = useState<{ sessionId: number; locationId: number } | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);

  // 1. RESOURCE CLEANUP (Industry Standard)
  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  }, []);

  // 2. DATA ORCHESTRATION
  const initData = useCallback(async () => {
    if (!coachIdRef.current) return;
    setLoading(true);
    try {
      const sessionRes = await fetch(
        `${API_BASE}/api/coach/sessions/${coachIdRef.current}`
      );      const sessionData: Session[] = await sessionRes.json();
      setSessions(Array.isArray(sessionData) ? sessionData : []);

      // Fetch statuses in a single pass
      const statusMap: Record<number, CheckInState> = {};
      await Promise.all(sessionData.map(async (s) => {
        try {
          const res = await fetch(`${API_BASE}/api/coach/checkin/status?coachId=${coachIdRef.current}&sessionId=${s.id}`);
          const data = await res.json();
          statusMap[s.id] = {
            checkedIn: !!data.checkedIn,
            completed: !!data.completed,
            isLate: data.isLate || 0
          };
        } catch {
          statusMap[s.id] = { checkedIn: false, completed: false, isLate: 0 };
        }
      }));
      setCheckedInMap(statusMap);
    } catch (err) {
      console.error("Critical Load Error", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { initData(); }, [initData]);

  // BUG FIX: Stop camera tracks on unmount to prevent stream leaks
  useEffect(() => { return () => stopCamera(); }, [stopCamera]);

  // BUG FIX: Was missing entirely — captures photo from stream and submits it to API
  const handleCaptureAndSubmit = async () => {
    if (!showCamera || !videoRef.current) return;
    setProcessingId(showCamera.sessionId);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext("2d")!.drawImage(videoRef.current, 0, 0);
      
      const blob = await new Promise<Blob>((res) => canvas.toBlob(b => res(b!), "image/jpeg", 0.85));
      
      const coords = await fetchLocation();
      const formData = new FormData();
      formData.append("coachId", coachIdRef.current!);
      formData.append("sessionId", String(showCamera.sessionId));
      formData.append("locationId", String(showCamera.locationId));
      formData.append("lat", String(coords.lat));
      formData.append("lng", String(coords.lng));
      formData.append("photo", blob, "checkin.jpg");

      const res = await fetch(`${API_BASE}/api/coach/checkin`, { method: "POST", body: formData });
      if (res.ok) {
        setCheckedInMap(prev => ({ ...prev, [showCamera.sessionId]: { ...prev[showCamera.sessionId], checkedIn: true } }));
        setToastMsg("Checked in successfully");
      } else {
        setToastMsg("Check-in failed. Please try again.");
      }
    } catch (err) {
      console.error("Photo capture failed", err);
    } finally {
      stopCamera();
      setShowCamera(null);
      setProcessingId(null);
    }
  };
  const fetchLocation = (): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => resolve({ lat: 0, lng: 0 }),
        { enableHighAccuracy: true, timeout: 6000 }
      );
    });
  };

  // 4. CHECK-IN LOGIC
  const handleAction = async (sessionId: number, type: 'IN' | 'OUT', locId?: number) => {
    if (processingId) return;
    setProcessingId(sessionId);

    try {
      if (type === 'IN') {
        const coords = await fetchLocation();
        const formData = new FormData();
        formData.append("coachId", coachIdRef.current!);
        formData.append("sessionId", String(sessionId));
        formData.append("locationId", String(locId));
        formData.append("lat", String(coords.lat));
        formData.append("lng", String(coords.lng));

        const res = await fetch(`${API_BASE}/api/coach/checkin`, { method: "POST", body: formData });
        const data = await res.json();

        if (res.ok) {
          setCheckedInMap(prev => ({ ...prev, [sessionId]: { ...prev[sessionId], checkedIn: true } }));
        } else if (res.status === 403 && data.requiresPhoto) {
          // Open Camera Logic
          setShowCamera({ sessionId, locationId: locId! });
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          if (videoRef.current) videoRef.current.srcObject = stream;
        }
      } else {
        const res = await fetch(`${API_BASE}/api/coach/checkout`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ coachId: coachIdRef.current, sessionId })
        });
        if (res.ok) {
          setCheckedInMap(prev => ({ ...prev, [sessionId]: { ...prev[sessionId], completed: true, checkedIn: false } }));
        }
      }
    } catch (err) {
      console.error("Action Failed", err);
    } finally {
      setProcessingId(null);
    }
  };

  const filteredSessions = useMemo(() => 
    sessions.filter(s => dayjs(s.session_date).format("YYYY-MM-DD") === filterDate),
    [sessions, filterDate]
  );

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
      <CircularProgress color="error" thickness={5} />
    </Box>
  );

  return (
    <Box sx={{ background: "#020617", minHeight: "100vh", py: 4, color: "white" }}>
      <Container maxWidth="xl">
        
        {/* HEADER BAR */}
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems="center" spacing={3} mb={6}>
          <Box>
            <Typography variant="overline" sx={{ color: "#ef4444", fontWeight: 900, letterSpacing: 2 }}>OPERATIONS</Typography>
            <Typography variant="h3" fontWeight={950} sx={{ letterSpacing: -1 }}>MY <span style={{ color: "#ef4444" }}>SESSIONS</span></Typography>
          </Box>
          <TextField 
            type="date" 
            value={filterDate} 
            onChange={e => setFilterDate(e.target.value)} 
            sx={datePickerStyle} 
          />
        </Stack>

        <Grid container spacing={3}>
          {filteredSessions.map((s, idx) => {
            const state = checkedInMap[s.id] || { checkedIn: false, completed: false, isLate: 0 };
            const isProcessing = processingId === s.id;

            return (
              <Grid item xs={12} md={6} lg={4} key={s.id}>
                <MotionBox
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card sx={sessionCardStyle(state.completed, state.checkedIn)}>
                    <CardContent sx={{ p: 4 }}>
                      <Stack direction="row" justifyContent="space-between" mb={2}>
                        <Typography variant="h6" fontWeight={900}>{s.locationName.toUpperCase()}</Typography>
                        <Chip 
                          label={state.completed ? "COMPLETED" : state.checkedIn ? "LIVE" : "SCHEDULED"} 
                          sx={statusChipStyle(state)} 
                        />
                      </Stack>
                      
                      <Typography variant="h4" fontWeight={950} mb={1}>{s.start_time}</Typography>
                      <Typography variant="body2" sx={{ opacity: 0.5, fontWeight: 700, mb: 4 }}>
                        {dayjs(s.session_date).format("dddd, MMM DD")}
                      </Typography>

                      <Divider sx={{ mb: 3, bgcolor: "rgba(255,255,255,0.05)" }} />

                      <Stack direction="row" spacing={2}>
                        {state.completed ? (
                          <Button fullWidth disabled sx={disabledBtnStyle}>SESSION CLOSED</Button>
                        ) : state.checkedIn ? (
                          <>
                            <Button 
                              fullWidth 
                              variant="outlined" 
                              onClick={() => window.location.href=`/coach/sessions/${s.id}/attendance`}
                              sx={secondaryBtnStyle}
                            >
                              ATTENDANCE
                            </Button>
                            <Button 
                              fullWidth 
                              variant="contained" 
                              onClick={() => handleAction(s.id, 'OUT')}
                              sx={checkoutBtnStyle}
                              disabled={isProcessing}
                            >
                              {isProcessing ? <CircularProgress size={20} /> : "END"}
                            </Button>
                          </>
                        ) : (
                          <Button 
                            fullWidth 
                            variant="contained" 
                            onClick={() => handleAction(s.id, 'IN', s.location_id)}
                            sx={checkinBtnStyle}
                            disabled={isProcessing}
                          >
                            {isProcessing ? <CircularProgress size={20} /> : "START SESSION"}
                          </Button>
                        )}
                      </Stack>
                    </CardContent>
                  </Card>
                </MotionBox>
              </Grid>
            );
          })}
        </Grid>

        {filteredSessions.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 10, opacity: 0.3 }}>
            <Typography variant="h5" fontWeight={900}>NO DEPLOYMENTS FOUND</Typography>
          </Box>
        )}
      </Container>

      {/* BUG FIX: Camera modal was missing — photo check-in was silently abandoned */}
      <AnimatePresence>
        {showCamera && (
          <MotionBox
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            sx={{
              position: "fixed", inset: 0, zIndex: 1300,
              bgcolor: "rgba(0,0,0,0.92)", display: "flex",
              flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3
            }}
          >
            <Typography variant="overline" sx={{ color: "#ef4444", fontWeight: 900, letterSpacing: 3 }}>
              PHOTO VERIFICATION REQUIRED
            </Typography>
            <Box sx={{ borderRadius: 4, overflow: "hidden", border: "2px solid rgba(239,68,68,0.4)", maxWidth: 480, width: "100%" }}>
              <video ref={videoRef} autoPlay playsInline style={{ width: "100%", display: "block" }} />
            </Box>
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                onClick={handleCaptureAndSubmit}
                disabled={!!processingId}
                sx={{ bgcolor: "#ef4444", fontWeight: 900, px: 4, py: 1.5, borderRadius: 3, "&:hover": { bgcolor: "#dc2626" } }}
              >
                {processingId ? <CircularProgress size={20} color="inherit" /> : "CAPTURE & CHECK IN"}
              </Button>
              <Button
                variant="outlined"
                onClick={() => { stopCamera(); setShowCamera(null); }}
                sx={{ borderColor: "rgba(255,255,255,0.2)", color: "white", fontWeight: 900, borderRadius: 3 }}
              >
                CANCEL
              </Button>
            </Stack>
          </MotionBox>
        )}
      </AnimatePresence>

      {/* Toast feedback */}
      {toastMsg && (
        <Fade in={!!toastMsg}>
          <Box sx={{
            position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
            bgcolor: toastMsg.includes("success") || toastMsg.includes("successfully") ? "#22c55e" : "#ef4444",
            color: "white", px: 4, py: 1.5, borderRadius: 3, fontWeight: 900, zIndex: 1400,
            boxShadow: "0 8px 32px rgba(0,0,0,0.3)"
          }}
            onClick={() => setToastMsg(null)}
          >
            <Typography fontWeight={900} fontSize="0.85rem">{toastMsg}</Typography>
          </Box>
        </Fade>
      )}
    </Box>
  );
}

// --- STYLES ---
const datePickerStyle = {
  "& .MuiOutlinedInput-root": {
    color: "white",
    fontWeight: 900,
    bgcolor: "rgba(255,255,255,0.03)",
    borderRadius: 3,
    "& fieldset": { borderColor: "rgba(255,255,255,0.1)" },
    "&:hover fieldset": { borderColor: "#ef4444" }
  }
};

const sessionCardStyle = (completed: boolean, checkedIn: boolean) => ({
  borderRadius: 6,
  background: completed ? "rgba(255,255,255,0.01)" : checkedIn ? "rgba(34, 197, 94, 0.03)" : "rgba(255,255,255,0.03)",
  backdropFilter: "blur(20px)",
  border: `1px solid ${completed ? "rgba(255,255,255,0.05)" : checkedIn ? "rgba(34, 197, 94, 0.2)" : "rgba(255,255,255,0.1)"}`,
  color: "white",
  transition: "all 0.3s ease"
});

const statusChipStyle = (state: CheckInState) => {
  const color = state.completed ? "#64748b" : state.checkedIn ? "#22c55e" : "#3b82f6";
  return { bgcolor: `${color}15`, color: color, fontWeight: 900, border: `1px solid ${color}33`, fontSize: '0.65rem' };
};

const checkinBtnStyle = { bgcolor: "#ef4444", fontWeight: 900, py: 1.5, borderRadius: 3, "&:hover": { bgcolor: "#dc2626" } };
const checkoutBtnStyle = { bgcolor: "white", color: "black", fontWeight: 900, py: 1.5, borderRadius: 3, "&:hover": { bgcolor: "#e2e8f0" } };
const secondaryBtnStyle = { borderColor: "rgba(255,255,255,0.2)", color: "white", fontWeight: 900, borderRadius: 3 };
const disabledBtnStyle = { bgcolor: "rgba(255,255,255,0.05) !important", color: "rgba(255,255,255,0.2) !important", borderRadius: 3, fontWeight: 900 };