import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
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
        color: "white",
        mb: 2
      }}
    >
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export default function CoachAttendance() {
  const { sessionId } = useParams();

  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Load players for session
  useEffect(() => {
    fetch(`${API_BASE}/api/session/${sessionId}/players`)
      .then(res => res.json())
      .then(data => {
        setPlayers(
          data.map((p: any) => ({
            ...p,
            present: true,   // default present
            remark: ""       // 👈 NEW
          }))
        );
        setLoading(false);
      });
  }, [sessionId]);

  // ✅ Toggle present/absent
  const toggle = (id: number) => {
    setPlayers(prev =>
      prev.map(p =>
        p.id === id ? { ...p, present: !p.present } : p
      )
    );
  };

  // ✅ Update remark
  const updateRemark = (id: number, value: string) => {
    setPlayers(prev =>
      prev.map(p =>
        p.id === id ? { ...p, remark: value } : p
      )
    );
  };

  // ✅ Save attendance + remarks
  const saveAttendance = async () => {
    await fetch(`${API_BASE}/api/coach/sessions/${sessionId}/attendance`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        attendance: players.map(p => ({
          playerId: p.id,
          present: p.present,
          remark: p.remark
        }))
      })
    });

    alert("✅ Attendance + feedback saved");
  };

  if (loading) return <p>Loading...</p>;

  return (
    <Box
      sx={{
        p: 4,
        background: "linear-gradient(135deg,#1f2937,#111827)",
        minHeight: "100vh",
        color: "white"
      }}
    >
      <Typography variant="h4" fontWeight={800} mb={3}>
        📋 Session Attendance
      </Typography>

      {players.map(p => (
        <GlassCard key={p.id}>

          {/* Player Row */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography fontWeight={600}>
              {p.name}
            </Typography>

            <Button
              variant="contained"
              color={p.present ? "success" : "error"}
              onClick={() => toggle(p.id)}
            >
              {p.present ? "Present" : "Absent"}
            </Button>
          </Box>

          {/* Remark Input */}
          <Box mt={2}>
            <input
              type="text"
              placeholder="Add feedback..."
              value={p.remark || ""}
              onChange={(e) => updateRemark(p.id, e.target.value)}
              style={{
                width: "100%",
                padding: 8,
                borderRadius: 8,
                border: "none",
                outline: "none"
              }}
            />
          </Box>

        </GlassCard>
      ))}

      {/* Save Button */}
      <Button
        variant="contained"
        color="primary"
        onClick={saveAttendance}
        sx={{ mt: 2 }}
      >
        Save Attendance
      </Button>
    </Box>
  );
}