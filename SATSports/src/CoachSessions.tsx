import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Stack
} from "@mui/material";
import API_BASE from "./api";

type Session = {
  id: number;
  session_date: string;
  start_time: string;
  end_time: string;
  category: string;
  locationName: string;
  location_id: number;
};

export default function CoachSessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [checkedInMap, setCheckedInMap] = useState<Record<number, boolean>>({});
  const [coachId, setCoachId] = useState<string | null>(null);

  ///////////////////////////////////////////////////////
  // LOAD COACH ID
  ///////////////////////////////////////////////////////

  useEffect(() => {
    const loadCoach = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) return;

      const res = await fetch(`${API_BASE}/api/coach/profile/${userId}`);
      const data = await res.json();

      localStorage.setItem("coachId", data.coachId);
      setCoachId(data.coachId);
    };

    loadCoach();
  }, []);

  ///////////////////////////////////////////////////////
  // LOAD SESSIONS
  ///////////////////////////////////////////////////////

  useEffect(() => {
    if (!coachId) return;

    fetch(`${API_BASE}/api/coach/sessions/${coachId}`)
      .then(res => res.json())
      .then(setSessions);
  }, [coachId]);

  ///////////////////////////////////////////////////////
  // CHECK-IN STATUS
  ///////////////////////////////////////////////////////

  useEffect(() => {
    if (!coachId || sessions.length === 0) return;

    sessions.forEach((s) => {
      fetch(`${API_BASE}/api/coach/checkin/status?coachId=${coachId}&sessionId=${s.id}`)
        .then(res => res.json())
        .then(data => {
          setCheckedInMap(prev => ({
            ...prev,
            [s.id]: Boolean(data.checkedIn),
          }));
        });
    });
  }, [coachId, sessions]);

  ///////////////////////////////////////////////////////
  // ACTIONS
  ///////////////////////////////////////////////////////

  const handleCheckIn = async (sessionId, locationId) => {
    if (!navigator.geolocation) {
      alert("Location not supported");
      return;
    }
  
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
  
        const res = await fetch(`${API_BASE}/api/coach/checkin`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            coachId,
            sessionId,
            locationId,
            lat: latitude,
            lng: longitude
          }),
        });
  
        const data = await res.json();
  
        ///////////////////////////////////////////////////////
        // ✅ ONLY UPDATE IF SUCCESS
        ///////////////////////////////////////////////////////
  
        if (res.ok) {
          setCheckedInMap(prev => ({
            ...prev,
            [sessionId]: true
          }));
        } else {
          alert(data.message || "Check-in failed");
        }
      },
      () => {
        alert("Please enable location to check in");
      },
      { enableHighAccuracy: true }
    );
  };
  const handleCheckOut = async (sessionId: number) => {
    await fetch(`${API_BASE}/api/coach/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ coachId, sessionId }),
    });

    setCheckedInMap(prev => ({ ...prev, [sessionId]: false }));
  };

  ///////////////////////////////////////////////////////

  return (
<Box sx={{ p: 4, background: "#f5f7fb", minHeight: "100vh" }}>

{/* 🔥 HEADER */}
<Typography
  variant="h4"
  fontWeight={900}
  mb={4}
  sx={{
    letterSpacing: 1,
    background: "linear-gradient(135deg,#f97316,#ef4444)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent"
  }}
>
  📅 My Sessions
</Typography>

{/* EMPTY */}
{sessions.length === 0 && (
  <Typography color="gray">No sessions assigned</Typography>
)}

{/* GRID */}
<Grid container spacing={4}>
  {sessions.map((s) => {
    const isCheckedIn = checkedInMap[s.id];

    const sessionTime = new Date(`${s.session_date} ${s.start_time}`);
    const diffMin = Math.floor((sessionTime - new Date()) / (1000 * 60));

    const isLive = diffMin <= 0 && diffMin > -120;
    const isUpcoming = diffMin > 0 && diffMin < 60;
    const isFuture = diffMin >= 60;

    const status = isLive
      ? "LIVE"
      : isUpcoming
      ? "SOON"
      : "UPCOMING";

    const statusColor = isLive
      ? "#22c55e"
      : isUpcoming
      ? "#f59e0b"
      : "#64748b";

    return (
      <Grid item xs={12} md={6} lg={4} key={s.id}>

        <Card
          sx={{
            borderRadius: 5,
            overflow: "hidden",
            background: "#ffffff",
            position: "relative",
            boxShadow: "0 20px 50px rgba(0,0,0,0.08)",
            transition: "all 0.3s ease",
            "&:hover": {
              transform: "translateY(-10px)",
              boxShadow: "0 30px 70px rgba(0,0,0,0.15)"
            }
          }}
        >

          {/* 🔥 STATUS STRIP */}
          <Box
            sx={{
              height: 6,
              background: statusColor
            }}
          />

          <CardContent sx={{ p: 3 }}>

            {/* HEADER */}
            <Box display="flex" justifyContent="space-between">
              <Typography fontWeight={900}>
                {s.session_date}
              </Typography>

              <Chip
                label={status}
                size="small"
                sx={{
                  background: statusColor,
                  color: "white",
                  fontWeight: 700
                }}
              />
            </Box>

            {/* TIME */}
            <Typography mt={1} color="text.secondary">
              ⏰ {s.start_time} – {s.end_time || "--"}
            </Typography>

            {/* COUNTDOWN */}
            {isUpcoming && (
              <Typography
                mt={1}
                fontSize={13}
                sx={{ color: "#f97316", fontWeight: 600 }}
              >
                Starts in {diffMin} mins
              </Typography>
            )}

            {/* LOCATION */}
            <Typography mt={2} fontWeight={700}>
              📍 {s.locationName}
            </Typography>

            {/* CATEGORY */}
            {s.category && (
              <Chip
                label={s.category}
                size="small"
                sx={{
                  mt: 1,
                  background:
                    "linear-gradient(135deg,#f97316,#ef4444)",
                  color: "white"
                }}
              />
            )}

            {/* ACTIONS */}
            <Box mt={3}>

              {!isCheckedIn ? (
                <Button
                  fullWidth
                  variant="contained"
                  sx={{
                    borderRadius: 999,
                    py: 1.2,
                    fontWeight: 800,
                    background:
                      "linear-gradient(135deg,#f97316,#ef4444)",
                    boxShadow: "0 8px 20px rgba(249,115,22,0.4)"
                  }}
                  onClick={() =>
                    handleCheckIn(s.id, s.location_id)
                  }
                >
                  Check In
                </Button>
              ) : (
                <Stack spacing={1}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="success"
                    sx={{ borderRadius: 999 }}
                    onClick={() =>
                      (window.location.href = `/coach/sessions/${s.id}/attendance`)
                    }
                  >
                    Mark Attendance
                  </Button>

                  <Button
                    fullWidth
                    variant="outlined"
                    color="error"
                    sx={{ borderRadius: 999 }}
                    onClick={() => handleCheckOut(s.id)}
                  >
                    Check Out
                  </Button>
                </Stack>
              )}

            </Box>

          </CardContent>

        </Card>

      </Grid>
    );
  })}
</Grid>

</Box>
  )
}