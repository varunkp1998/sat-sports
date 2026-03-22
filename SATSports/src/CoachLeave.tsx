import React, { useEffect, useState } from "react";
import {
  Box, Typography, Grid, Card, CardContent,
  TextField, Button, Stack, Select, MenuItem,
  Chip, Divider
} from "@mui/material";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import API_BASE from "./api";

export default function CoachLeave() {
  const coachId = localStorage.getItem("userId");

  const [tab, setTab] = useState("apply");
  const [leaves, setLeaves] = useState([]);
  const [balance, setBalance] = useState({});
  const [form, setForm] = useState({
    startDate: "",
    endDate: "",
    reason: "",
    leaveType: "casual"
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
    load();
  }, []);

  const submit = async () => {
    const res = await fetch(`${API_BASE}/api/coach/leaves`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userId: coachId,
        start_date: form.startDate,
        end_date: form.endDate,
        reason: form.reason,
        leave_type: form.leaveType
      })
    });

    if (!res.ok) {
      const data = await res.json();
      alert(data.message);
      return;
    }

    alert("Leave submitted");
    setForm({ startDate: "", endDate: "", reason: "", leaveType: "casual" });
    load();
  };

  const calculateDays = () => {
    if (!form.startDate || !form.endDate) return 0;
    const diff =
      (new Date(form.endDate) - new Date(form.startDate)) /
      (1000 * 60 * 60 * 24);
    return diff + 1;
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", background: "#f5f7fb" }}>

      {/* SIDEBAR */}
      <Box sx={{ width: 220, background: "#fff", p: 2 }}>
        <Typography fontWeight={700}>Leave</Typography>
        <Stack spacing={2} mt={2}>
          <Button onClick={() => setTab("apply")}>Apply</Button>
          <Button onClick={() => setTab("pending")}>Pending</Button>
          <Button onClick={() => setTab("history")}>History</Button>
        </Stack>
      </Box>

      {/* MAIN */}
      <Box sx={{ flex: 1, p: 3 }}>

        <Typography variant="h4" fontWeight={800} mb={3}>
          Leave Apply
        </Typography>

        {/* APPLY */}
        {tab === "apply" && (
          <Grid container spacing={3}>

            {/* FORM */}
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>

                  <Typography fontWeight={700} mb={2}>
                    Applying for Leave
                  </Typography>

                  <Stack spacing={2}>

                    <Select
                      fullWidth
                      value={form.leaveType}
                      onChange={(e) =>
                        setForm({ ...form, leaveType: e.target.value })
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
                      value={form.startDate}
                      onChange={(e) =>
                        setForm({ ...form, startDate: e.target.value })
                      }
                    />

                    <TextField
                      type="date"
                      label="To"
                      InputLabelProps={{ shrink: true }}
                      value={form.endDate}
                      onChange={(e) =>
                        setForm({ ...form, endDate: e.target.value })
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

                    <Button variant="contained" onClick={submit}>
                      Apply Leave
                    </Button>

                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* RIGHT PANEL */}
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography fontWeight={700}>Leave Balance</Typography>
                  <Typography>Casual: {balance.casual}</Typography>
                  <Typography>Medical: {balance.medical}</Typography>
                  <Divider sx={{ my: 2 }} />
                  <Typography>Total: {(balance.casual || 0) + (balance.medical || 0)}</Typography>
                  <Typography>Applying: {calculateDays()} days</Typography>
                </CardContent>
              </Card>

              <Card sx={{ mt: 2 }}>
                <CardContent>
                  <Typography fontWeight={700}>Calendar</Typography>
                  <Calendar
                    tileContent={({ date }) => {
                      const found = leaves.find(
                        l =>
                          new Date(date) >= new Date(l.start_date) &&
                          new Date(date) <= new Date(l.end_date)
                      );
                      return found ? <span style={{ color: "red" }}>●</span> : null;
                    }}
                  />
                </CardContent>
              </Card>
            </Grid>

          </Grid>
        )}

        {/* PENDING */}
        {tab === "pending" && (
          <Grid container spacing={2}>
            {leaves.filter(l => l.status === "Pending").map(l => (
              <Grid item xs={12} md={6} key={l.id}>
                <Card>
                  <CardContent>
                    <Typography>{l.start_date} → {l.end_date}</Typography>
                    <Chip label="Pending" color="warning" />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* HISTORY */}
        {tab === "history" && (
          <Grid container spacing={2}>
            {leaves.map(l => (
              <Grid item xs={12} md={6} key={l.id}>
                <Card>
                  <CardContent>
                    <Typography>{l.start_date} → {l.end_date}</Typography>
                    <Typography>{l.leave_type}</Typography>
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
              </Grid>
            ))}
          </Grid>
        )}

      </Box>
    </Box>
  );
}