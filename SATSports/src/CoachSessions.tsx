import { useEffect, useState } from "react";
import { Button, Table, TableBody, TableCell, TableHead, TableRow, Alert, Paper } from "@mui/material";
import API_BASE from "./api";

type Session = {
  id: number;
  session_date: string;
  start_time: string;
  end_time: string;
  category: string;
  locationName: string;
  location_id: number;   // ✅ ADD THIS
};


function CoachSessions() {
  const coachId = localStorage.getItem("coachId");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [checkedInMap, setCheckedInMap] = useState<Record<number, boolean>>({});
  console.log("Logged in coachId:", coachId);

  // Load sessions assigned to this coach
  useEffect(() => {
    if (!coachId) return;

    fetch(`${API_BASE}/api/coach/sessions/${coachId}`)
      .then(res => res.json())
      .then(data => setSessions(data));
  }, [coachId]);

  // For each session, check check-in status
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
      body: JSON.stringify({
        coachId,
        sessionId,
        locationId,
      }),
    });

    // Refresh status for this session
    const res = await fetch(
      `${API_BASE}/api/coach/checkin/status?coachId=${coachId}&sessionId=${sessionId}`
    );
    const data = await res.json();

    setCheckedInMap(prev => ({
      ...prev,
      [sessionId]: Boolean(data.checkedIn),
    }));
  };
  const handleCheckOut = async (sessionId: number) => {
    await fetch(`${API_BASE}/api/coach/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        coachId,
        sessionId,
      }),
    });
  
    // After checkout, mark as not checked in
    setCheckedInMap(prev => ({
      ...prev,
      [sessionId]: false,
    }));
  };
  
  return (
    <section>
      <h3>My Sessions</h3>

      {sessions.length === 0 && <Alert severity="info">No sessions assigned.</Alert>}

      {sessions.length > 0 && (
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Time</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {sessions.map((s) => {
                const isCheckedIn = checkedInMap[s.id];

                return (
                  <TableRow key={s.id}>
                    <TableCell>{s.session_date}</TableCell>
                    <TableCell>
                      {s.start_time} – {s.end_time}
                    </TableCell>
                    <TableCell>{s.locationName}</TableCell>
                    <TableCell>{s.category}</TableCell>
                    <TableCell>
                    {!isCheckedIn ? (
  <Button
    variant="contained"
    color="warning"
    onClick={() => handleCheckIn(s.id, s.location_id)}
  >
    Check In
  </Button>
) : (
  <>
    <Button
      variant="contained"
      color="success"
      onClick={() => {
        window.location.href = `/coach/sessions/${s.id}/attendance`;
      }}
      sx={{ mr: 1 }}
    >
      Mark Attendance
    </Button>

    <Button
      variant="outlined"
      color="error"
      onClick={() => handleCheckOut(s.id)}
    >
      Check Out
    </Button>
  </>
)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Paper>
      )}
    </section>
  );
}

export default CoachSessions;
