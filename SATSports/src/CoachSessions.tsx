import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip
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
  // 🔥 FIXED COACH ID LOAD
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

      <Grid container spacing={3}>
        {sessions.map((s) => {
          const isCheckedIn = checkedInMap[s.id];

          return (
            <Grid item xs={12} md={6} lg={4} key={s.id}>

              <Card
                sx={{
                  borderRadius: 4,
                  p: 1,
                  transition: "0.3s",
                  background: "white",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                  "&:hover": {
                    transform: "translateY(-6px)",
                    boxShadow: "0 20px 50px rgba(0,0,0,0.12)"
                  }
                }}
              >
                <CardContent>

                  {/* DATE */}
                  <Typography fontWeight={800}>
                    {s.session_date}
                  </Typography>

                  {/* TIME */}
                  <Typography color="text.secondary" mb={1}>
                    {s.start_time} – {s.end_time || "--"}
                  </Typography>

                  {/* LOCATION */}
                  <Typography fontSize={14} mb={1}>
                    📍 {s.locationName}
                  </Typography>

                  {/* CATEGORY */}
                  {s.category && (
                    <Chip
                      label={s.category}
                      size="small"
                      sx={{
                        mb: 2,
                        background:
                          "linear-gradient(135deg,#f97316,#ef4444)",
                        color: "white"
                      }}
                    />
                  )}

                  {/* ACTIONS */}
                  <Box mt={2} display="flex" gap={1} flexWrap="wrap">

                    {!isCheckedIn ? (
                      <Button
                        variant="contained"
                        fullWidth
                        sx={{
                          borderRadius: 999,
                          fontWeight: 700,
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
                          fullWidth
                          sx={{ borderRadius: 999 }}
                          onClick={() =>
                            (window.location.href = `/coach/sessions/${s.id}/attendance`)
                          }
                        >
                          Mark Attendance
                        </Button>

                        <Button
                          variant="outlined"
                          color="error"
                          fullWidth
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