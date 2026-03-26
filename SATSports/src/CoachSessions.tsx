import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button
} from "@mui/material";

import API_BASE from "./api";

function GlassCard({ children }: any) {
  return (
    <Card
      sx={{
        backdropFilter: "blur(12px)",
        background: "rgba(255,255,255,0.08)",
        borderRadius: 4,
        boxShadow: "0 8px 25px rgba(0,0,0,0.4)",
        color: "white"
      }}
    >
      <CardContent>{children}</CardContent>
    </Card>
  );
}

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
  const coachId = localStorage.getItem("coachId");

  const [sessions, setSessions] = useState<Session[]>([]);
  const [checkedInMap, setCheckedInMap] = useState<Record<number, boolean>>({});

  // Load sessions
  useEffect(() => {
    if (!coachId) return;

    fetch(`${API_BASE}/api/coach/sessions/${coachId}`)
      .then(res => res.json())
      .then(setSessions);
  }, [coachId]);
  console.log("coachId:", coachId);
  // Load check-in status
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

  return (
<Box sx={{ p: 4, background: "#f5f7fb", minHeight: "100vh" }}>
  
  <Typography variant="h4" fontWeight={800} mb={3}>
    📅 My Sessions
  </Typography>

  {sessions.length === 0 && (
    <Typography>No sessions assigned</Typography>
  )}

  <Grid container spacing={3}>
    {sessions.map((s) => {
      const isCheckedIn = checkedInMap[s.id];

      return (
        <Grid item xs={12} md={6} lg={4} key={s.id}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: "0 6px 18px rgba(0,0,0,0.08)"
            }}
          >
            <CardContent>

              {/* DATE */}
              <Typography fontWeight={700}>
                {s.session_date}
              </Typography>

              {/* TIME */}
              <Typography color="text.secondary">
                {s.start_time} – {s.end_time}
              </Typography>

              {/* LOCATION */}
              <Typography mt={1}>
                📍 {s.locationName}
              </Typography>

              {/* CATEGORY */}
              <Typography fontSize={13} color="text.secondary">
                {s.category}
              </Typography>

              {/* ACTIONS */}
              <Box mt={2} display="flex" gap={1} flexWrap="wrap">

                {!isCheckedIn ? (
                  <Button
                    variant="contained"
                    color="warning"
                    fullWidth
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
</Box>  );
}