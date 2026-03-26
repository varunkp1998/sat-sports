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

  const handleCheckIn = async (sessionId: number, locationId: number) => {
    await fetch(`${API_BASE}/api/coach/checkin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ coachId, sessionId, locationId }),
    });

    setCheckedInMap(prev => ({ ...prev, [sessionId]: true }));
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
          background: "linear-gradient(135deg,#f97316,#ef4444)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent"
        }}
      >
        📅 My Sessions
      </Typography>

      {sessions.length === 0 && (
        <Typography color="gray">No sessions assigned</Typography>
      )}

      {/* 🔥 GRID */}
      <Grid container spacing={4}>
        {sessions.map((s) => {
          const isCheckedIn = checkedInMap[s.id];

          const sessionTime = new Date(`${s.session_date} ${s.start_time}`);
          const diffMin = Math.floor((sessionTime.getTime() - new Date().getTime()) / (1000 * 60));

          const isLive = diffMin <= 0 && diffMin > -120;
          const isUpcoming = diffMin > 0 && diffMin < 60;

          return (
            <Grid item xs={12} md={6} lg={4} key={s.id}>

              <Card
                sx={{
                  borderRadius: 5,
                  overflow: "hidden",
                  background: "#ffffff",
                  boxShadow: "0 15px 40px rgba(0,0,0,0.08)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-10px) scale(1.02)",
                    boxShadow: "0 25px 60px rgba(0,0,0,0.15)"
                  }
                }}
              >

                {/* 🔥 TOP BAR */}
                <Box
                  sx={{
                    height: 6,
                    background:
                      isLive
                        ? "linear-gradient(90deg,#22c55e,#16a34a)"
                        : "linear-gradient(90deg,#f97316,#ef4444)"
                  }}
                />

                <CardContent sx={{ p: 3 }}>

                  {/* HEADER */}
                  <Stack direction="row" justifyContent="space-between">
                    <Typography fontWeight={900}>
                      {s.session_date}
                    </Typography>

                    {isLive && (
                      <Chip label="LIVE" color="success" size="small" />
                    )}

                    {isUpcoming && (
                      <Chip label="Starting Soon" color="warning" size="small" />
                    )}
                  </Stack>

                  {/* TIME */}
                  <Typography color="text.secondary" mt={1}>
                    ⏰ {s.start_time} – {s.end_time || "--"}
                  </Typography>

                  {/* COUNTDOWN */}
                  {isUpcoming && (
                    <Typography
                      fontSize={13}
                      sx={{ color: "#f97316", mt: 1 }}
                    >
                      Starts in {diffMin} mins
                    </Typography>
                  )}

                  {/* LOCATION */}
                  <Typography mt={2} fontWeight={600}>
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
                  <Box mt={3} display="flex" flexDirection="column" gap={1}>

                    {!isCheckedIn ? (
                      <Button
                        variant="contained"
                        sx={{
                          borderRadius: 999,
                          fontWeight: 800,
                          py: 1.2,
                          background:
                            "linear-gradient(135deg,#f97316,#ef4444)"
                        }}
                        onClick={() =>
                          handleCheckIn(s.id, s.location_id)
                        }
                      >
                        Check In
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="contained"
                          color="success"
                          sx={{ borderRadius: 999, py: 1.2 }}
                          onClick={() =>
                            (window.location.href = `/coach/sessions/${s.id}/attendance`)
                          }
                        >
                          Mark Attendance
                        </Button>

                        <Button
                          variant="outlined"
                          color="error"
                          sx={{ borderRadius: 999 }}
                          onClick={() => handleCheckOut(s.id)}
                        >
                          Check Out
                        </Button>
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