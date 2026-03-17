import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Button,
  Stack,
  Chip
} from "@mui/material";

import API_BASE from "./api";

export default function CoachAttendance() {
  const { sessionId } = useParams();

  const [players, setPlayers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // LOAD PLAYERS
  useEffect(() => {
    fetch(`${API_BASE}/api/session/${sessionId}/players`)
      .then(res => res.json())
      .then(data => {
        setPlayers(
          data.map((p: any) => ({
            ...p,
            present: true,
            remark: ""
          }))
        );
      });
  }, [sessionId]);

  // UPDATE PLAYER
  const updatePlayer = (id: number, field: string, value: any) => {
    setPlayers(prev =>
      prev.map(p =>
        p.id === id ? { ...p, [field]: value } : p
      )
    );
  };

  // AUTO SAVE (debounced)
  useEffect(() => {
    if (players.length === 0) return;

    const timeout = setTimeout(async () => {
      setSaving(true);

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

      setSaving(false);
      setLastSaved(new Date());
    }, 800); // debounce

    return () => clearTimeout(timeout);
  }, [players]);

  // MARK ALL
  const markAll = (val: boolean) => {
    setPlayers(prev =>
      prev.map(p => ({ ...p, present: val }))
    );
  };

  // FILTER
  const filtered = players.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box sx={{ p: 4, background: "#f5f7fb", minHeight: "100vh" }}>

      {/* HEADER */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={800}>
          📝 Session Attendance
        </Typography>

        <Stack direction="row" spacing={2}>
          <Chip
            label={saving ? "Saving..." : "Saved"}
            color={saving ? "warning" : "success"}
          />
          {lastSaved && (
            <Typography fontSize={12} color="text.secondary">
              {lastSaved.toLocaleTimeString()}
            </Typography>
          )}
        </Stack>
      </Stack>

      {/* ACTION BAR */}
      <Stack direction="row" spacing={2} mb={3} flexWrap="wrap">

        <TextField
          size="small"
          placeholder="Search player..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <Button
          variant="outlined"
          color="success"
          onClick={() => markAll(true)}
        >
          Mark All Present
        </Button>

        <Button
          variant="outlined"
          color="error"
          onClick={() => markAll(false)}
        >
          Mark All Absent
        </Button>

      </Stack>

      {/* GRID */}
      <Grid container spacing={3}>
        {filtered.map(p => (
          <Grid item xs={12} md={6} lg={4} key={p.id}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
                transition: "0.2s",
                "&:hover": {
                  transform: "translateY(-3px)"
                }
              }}
            >
              <CardContent>

                {/* NAME */}
                <Typography fontWeight={700} mb={1}>
                  {p.name}
                </Typography>

                {/* STATUS */}
                <ToggleButtonGroup
                  value={p.present ? "present" : "absent"}
                  exclusive
                  onChange={(e, val) => {
                    if (val)
                      updatePlayer(p.id, "present", val === "present");
                  }}
                  sx={{ mb: 2 }}
                >
                  <ToggleButton value="present" color="success">
                    Present
                  </ToggleButton>
                  <ToggleButton value="absent" color="error">
                    Absent
                  </ToggleButton>
                </ToggleButtonGroup>

                {/* REMARK */}
                <TextField
                  fullWidth
                  size="small"
                  label="Coach Feedback"
                  value={p.remark}
                  onChange={(e) =>
                    updatePlayer(p.id, "remark", e.target.value)
                  }
                />

              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

    </Box>
  );
}