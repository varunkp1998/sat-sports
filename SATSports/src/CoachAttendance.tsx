import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button, Checkbox, Table, TableBody, TableCell, TableHead, TableRow, Paper, Alert } from "@mui/material";
import API_BASE from "./api";
type Player = {
  id: number;
  name: string;
  age: number;
};

function CoachAttendance() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [players, setPlayers] = useState<Player[]>([]);
  const [attendance, setAttendance] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) return;

    fetch(`${API_BASE}/api/coach/sessions/${sessionId}/players`)
      .then(res => res.json())
      .then(data => {
        setPlayers(data);

        // Initialize attendance map (default: present = true)
        const initial: Record<number, boolean> = {};
        data.forEach((p: Player) => {
          initial[p.id] = true;
        });
        setAttendance(initial);

        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load players:", err);
        setLoading(false);
      });
  }, [sessionId]);

  const togglePlayer = (playerId: number) => {
    setAttendance(prev => ({
      ...prev,
      [playerId]: !prev[playerId],
    }));
  };

  const saveAttendance = async () => {
    const payload = {
      attendance: players.map(p => ({
        playerId: p.id,
        present: Boolean(attendance[p.id]),
      })),
    };

    await fetch(`${API_BASE}/api/coach/sessions/${sessionId}/attendance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    alert("Attendance saved ✅");
  };

  if (loading) {
    return <p>Loading players...</p>;
  }

  return (
    <section>
      <h3>Mark Attendance</h3>
      <p>Session ID: {sessionId}</p>

      {players.length === 0 && (
        <Alert severity="info">No players assigned to this session.</Alert>
      )}

      {players.length > 0 && (
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Present</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Age</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {players.map(p => (
                <TableRow key={p.id}>
                  <TableCell>
                    <Checkbox
                      checked={Boolean(attendance[p.id])}
                      onChange={() => togglePlayer(p.id)}
                    />
                  </TableCell>
                  <TableCell>{p.name}</TableCell>
                  <TableCell>{p.age}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div style={{ padding: 16 }}>
            <Button variant="contained" color="success" onClick={saveAttendance}>
              Save Attendance
            </Button>
          </div>
        </Paper>
      )}
    </section>
  );
}

export default CoachAttendance;
