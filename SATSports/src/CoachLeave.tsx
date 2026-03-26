import React, { useEffect, useState } from "react";
import {
  Box, Typography, Grid, Card, CardContent,
  TextField, Button, Stack, Select, MenuItem,
  Chip, Divider, Tabs, Tab
} from "@mui/material";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import API_BASE from "./api";

export default function CoachLeave() {
  const coachId = localStorage.getItem("userId"); // ✅ use coachId

  const [tab, setTab] = useState(0);
  const [leaves, setLeaves] = useState([]);
  const [balance, setBalance] = useState({});
  const [form, setForm] = useState({
    from_date: "",
    to_date: "",
    reason: "",
    leave_type: "casual"
  });

  const load = () => {
    fetch(`${API_BASE}/api/coach/leaves/${coachId}`)
      .then(res => res.json())
      .then(setLeaves);

    fetch(`${API_BASE}/api/coach/leave-balance/${coachId}`)
      .then(res => res.json())
      .then(setBalance);
  };

  useEffect(() => {
    if (coachId) load();
  }, [coachId]);

  const submit = async () => {
    const res = await fetch(`${API_BASE}/api/coach/leaves`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: coachId,
        from_date: form.from_date,
        to_date: form.to_date,
        reason: form.reason,
        leave_type: form.leave_type
      })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Error");
      return;
    }

    alert("Leave submitted ✅");

    setForm({
      from_date: "",
      to_date: "",
      reason: "",
      leave_type: "casual"
    });

    load();
  };

  const calculateDays = () => {
    if (!form.from_date || !form.to_date) return 0;

    const diff =
      (new Date(form.to_date) - new Date(form.from_date)) /
      (1000 * 60 * 60 * 24);

    return diff + 1;
  };

  return (
    <Box sx={{ minHeight: "100vh", background: "#f5f7fb", p: 3 }}>

      <Typography variant="h5" fontWeight={800} mb={2}>
        🗓 Leave Management
      </Typography>

      {/* TABS */}
      <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Apply" />
        <Tab label="Pending" />
        <Tab label="History" />
      </Tabs>

      {/* ================= APPLY ================= */}
      {tab === 0 && (
        <Grid container spacing={2}>

          {/* FORM */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>

                <Typography fontWeight={700} mb={2}>
                  Apply Leave
                </Typography>

                <Stack spacing={2}>

                  <Select
                    value={form.leave_type}
                    onChange={(e) =>
                      setForm({ ...form, leave_type: e.target.value })
                    }
                  >
                    <MenuItem value="casual">Casual</MenuItem>
                    <MenuItem value="medical">Medical</MenuItem>
                    <MenuItem value="lop">LOP</MenuItem>
                  </Select>

                  <TextField
                    type="date"
                    label="From"
                    InputLabelProps={{ shrink: true }}
                    value={form.from_date}
                    onChange={(e) =>
                      setForm({ ...form, from_date: e.target.value })
                    }
                  />

                  <TextField
                    type="date"
                    label="To"
                    InputLabelProps={{ shrink: true }}
                    value={form.to_date}
                    onChange={(e) =>
                      setForm({ ...form, to_date: e.target.value })
                    }
                  />

                  <TextField
                    multiline
                    rows={3}
                    placeholder="Reason"
                    value={form.reason}
                    onChange={(e) =>
                      setForm({ ...form, reason: e.target.value })
                    }
                  />

                  <Typography>
                    Days: <b>{calculateDays()}</b>
                  </Typography>

                  <Button variant="contained" onClick={submit}>
                    Apply Leave
                  </Button>

                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* SIDE PANEL */}
          <Grid item xs={12} md={4}>
            <Stack spacing={2}>

              {/* BALANCE */}
              <Card>
                <CardContent>
                  <Typography fontWeight={700}>
                    Leave Balance
                  </Typography>

                  <Typography>
                    Casual: {balance.casual || 0}
                  </Typography>

                  <Typography>
                    Medical: {balance.medical || 0}
                  </Typography>

                  <Divider sx={{ my: 1 }} />

                  <Typography fontWeight={600}>
                    Total: {(balance.casual || 0) + (balance.medical || 0)}
                  </Typography>

                  <Typography>
                    Applying: {calculateDays()} days
                  </Typography>
                </CardContent>
              </Card>

              {/* CALENDAR */}
              <Card>
                <CardContent>
                  <Typography mb={1} fontWeight={700}>
                    Calendar
                  </Typography>

                  <Calendar
                    tileContent={({ date }) => {
                      const found = leaves.find(
                        l =>
                          new Date(date) >= new Date(l.from_date) &&
                          new Date(date) <= new Date(l.to_date)
                      );

                      return found ? (
                        <span style={{ color: "red" }}>●</span>
                      ) : null;
                    }}
                  />
                </CardContent>
              </Card>

            </Stack>
          </Grid>
        </Grid>
      )}

      {/* ================= PENDING ================= */}
      {tab === 1 && (
        <Stack spacing={2}>
          {leaves
            .filter(l => l.status === "Pending")
            .map(l => (
              <Card key={l.id}>
                <CardContent>
                  <Typography>
                    {l.from_date} → {l.to_date}
                  </Typography>
                  <Typography>{l.leave_type}</Typography>
                  <Chip label="Pending" color="warning" />
                </CardContent>
              </Card>
            ))}
        </Stack>
      )}

      {/* ================= HISTORY ================= */}
      {tab === 2 && (
        <Stack spacing={2}>
          {leaves.map(l => (
            <Card key={l.id}>
              <CardContent>

                <Typography>
                  {l.from_date} → {l.to_date}
                </Typography>

                <Typography>
                  {l.leave_type}
                </Typography>

                <Chip
                  label={l.status}
                  color={
                    l.status === "Approved"
                      ? "success"
                      : l.status === "Rejected"
                      ? "error"
                      : "warning"
                  }
                />

              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

    </Box>
  );
}