import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Stack,
  TextField
} from "@mui/material";
import API_BASE from "./api";
import dayjs from "dayjs";

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

export default function CoachSessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [checkedInMap, setCheckedInMap] = useState<Record<number, any>>({});
  const [coachId, setCoachId] = useState<string | null>(null);

  const [filterDate, setFilterDate] = useState(
    dayjs().format("YYYY-MM-DD")
  );

  ///////////////////////////////////////////////////////
  // FILTER
  ///////////////////////////////////////////////////////

  const filteredSessions = sessions.filter(s =>
    dayjs(s.session_date).format("YYYY-MM-DD") === filterDate
  );

  ///////////////////////////////////////////////////////
  // LOAD COACH
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
  // CHECK-IN STATUS (UPDATED FOR LATE)
  ///////////////////////////////////////////////////////

  useEffect(() => {
    if (!coachId || sessions.length === 0) return;

    sessions.forEach((s) => {
      fetch(`${API_BASE}/api/coach/checkin/status?coachId=${coachId}&sessionId=${s.id}`)
        .then(res => res.json())
        .then(data => {
          setCheckedInMap(prev => ({
            ...prev,
            [s.id]: {
              checkedIn: Boolean(data.checkedIn),
              isLate: data.isLate || 0
            }
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

        if (res.ok) {
          setCheckedInMap(prev => ({
            ...prev,
            [sessionId]: {
              checkedIn: true,
              isLate: data.isLate || 0
            }
          }));
        } else {
          alert(data.message || "Check-in failed");
        }
      },
      () => alert("Enable location"),
      { enableHighAccuracy: true }
    );
  };

  const handleCheckOut = async (sessionId: number) => {
    await fetch(`${API_BASE}/api/coach/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ coachId, sessionId }),
    });

    setCheckedInMap(prev => ({
      ...prev,
      [sessionId]: { checkedIn: false }
    }));
  };

  ///////////////////////////////////////////////////////

  return (
    <Box sx={{ p: 4, background: "#000", minHeight: "100vh" }}>

      {/* HEADER */}
      <Typography
        variant="h4"
        fontWeight={900}
        mb={3}
        sx={{ color: "#fff" }}
      >
        📅 My Sessions
      </Typography>

      {/* FILTER */}
      <Box mb={3}>
        <Stack direction="row" spacing={2} alignItems="center">

          <TextField
            type="date"
            label="Filter Date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ background: "#fff", borderRadius: 2 }}
          />

          <Typography color="white" fontWeight={600}>
            {filteredSessions.length} sessions
          </Typography>

        </Stack>
      </Box>

      {/* EMPTY */}
      {filteredSessions.length === 0 && (
        <Typography color="gray">No sessions</Typography>
      )}

      {/* GRID */}
      <Grid container spacing={4}>
        {filteredSessions.map((s) => {

          const checkin = checkedInMap[s.id] || {};
          const isCheckedIn = checkin.checkedIn;

          const sessionTime = new Date(`${s.session_date} ${s.start_time}`);
          const diffMin = Math.floor((sessionTime - new Date()) / (1000 * 60));

          const isLive = diffMin <= 0 && diffMin > -120;
          const isUpcoming = diffMin > 0 && diffMin < 60;

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

              <Card sx={{
                borderRadius: 5,
                background: "#fff",
                boxShadow: "0 10px 40px rgba(0,0,0,0.4)"
              }}>

                <Box sx={{ height: 6, background: statusColor }} />

                <CardContent>

                  {/* HEADER */}
                  <Box display="flex" justifyContent="space-between">

                    <Typography fontWeight={900}>
                      {dayjs(s.session_date).format("DD MMM YYYY")}
                    </Typography>

                    <Stack direction="row" spacing={1}>
                      <Chip label={status} size="small" sx={{
                        background: statusColor,
                        color: "#fff"
                      }} />

                      {isCheckedIn && (
                        <Chip
                          label="Checked In"
                          size="small"
                          sx={{ background: "#22c55e", color: "#fff" }}
                        />
                      )}

                      {checkin.isLate === 1 && (
                        <Chip
                          label="Late"
                          size="small"
                          sx={{ background: "#ef4444", color: "#fff" }}
                        />
                      )}
                    </Stack>

                  </Box>

                  {/* TIME */}
                  <Typography mt={1}>
  ⏰ {
    s.start_time
      ? dayjs(s.start_time).format("hh:mm A")
      : "--"
  } – {
    s.end_time
      ? dayjs(s.end_time).format("hh:mm A")
      : "--"
  }
</Typography>

                  {/* LOCATION */}
                  <Typography mt={2} fontWeight={700}>
                    📍 {s.locationName}
                  </Typography>

                  {/* PROGRAMS */}
                  {s.programTitles && (
                    <Stack direction="row" flexWrap="wrap" gap={1} mt={2}>
                      {s.programTitles.split(",").map((p, i) => (
                        <Chip key={i} label={p} size="small"
                          sx={{ background: "#800000", color: "#fff" }} />
                      ))}
                    </Stack>
                  )}

                  {/* ACTIONS */}
                  <Box mt={3}>

                    {!isCheckedIn ? (
                      <Button
                        fullWidth
                        variant="contained"
                        sx={{
                          background: "#800000",
                          color: "#fff",
                          borderRadius: 3
                        }}
                        onClick={() =>
                          handleCheckIn(s.id, s.location_id)
                        }
                      >
                        Check In
                      </Button>
                    ) : (
                      <Stack spacing={1}>

                        <Typography textAlign="center" color="green" fontWeight={700}>
                          ✔ Checked In
                        </Typography>

                        <Button
                          fullWidth
                          variant="contained"
                          color="success"
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
  );
}