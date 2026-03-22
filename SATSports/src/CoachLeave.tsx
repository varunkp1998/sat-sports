import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  TextField,
  Button,
  Stack,
  Typography,
  Chip,
  Box,
  Grid,
  Select,
  MenuItem,
  Paper
} from "@mui/material";
import API_BASE from "./api";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
function CoachLeave() {
  const coachId = localStorage.getItem("userId");

  const [form, setForm] = useState({
    startDate: "",
    endDate: "",
    reason: "",
    leaveType: "casual"
  });

  const [leaves, setLeaves] = useState([]);
  const [balance, setBalance] = useState<any>({});

  // LOAD DATA
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

  // SUBMIT
  const submit = async () => {
    await fetch(`${API_BASE}/api/coach/leaves`, {
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

    alert("Leave submitted");
    setForm({ startDate: "", endDate: "", reason: "", leaveType: "casual" });
    load();
  };

  return (
    <Box sx={{ p: 3, background: "#f5f7fb", minHeight: "100vh" }}>

      <Typography variant="h4" fontWeight={800} mb={3}>
        Leave Dashboard
      </Typography>

      {/* BALANCE CARDS */}
      <Grid container spacing={2} mb={3}>
        {[
          { label: "Casual", value: balance.casual },
          { label: "Medical", value: balance.medical },
          { label: "LOP", value: "Unlimited" }
        ].map((b, i) => (
          <Grid item xs={4} key={i}>
            <Card>
              <CardContent>
                <Typography fontWeight={700}>{b.label}</Typography>
                <Typography variant="h5">{b.value || 0}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* APPLY */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography fontWeight={700} mb={2}>
            Apply Leave
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                type="date"
                fullWidth
                value={form.startDate}
                onChange={(e) =>
                  setForm({ ...form, startDate: e.target.value })
                }
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                type="date"
                fullWidth
                value={form.endDate}
                onChange={(e) =>
                  setForm({ ...form, endDate: e.target.value })
                }
              />
            </Grid>

            <Grid item xs={6}>
              <Select
                fullWidth
                value={form.leaveType}
                onChange={(e) =>
                  setForm({ ...form, leaveType: e.target.value })
                }
              >
                <MenuItem value="casual">Casual Leave</MenuItem>
                <MenuItem value="medical">Medical Leave</MenuItem>
                <MenuItem value="lop">Loss of Pay</MenuItem>
              </Select>
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                placeholder="Reason"
                value={form.reason}
                onChange={(e) =>
                  setForm({ ...form, reason: e.target.value })
                }
              />
            </Grid>

            <Grid item xs={12}>
              <Button fullWidth variant="contained" onClick={submit}>
                Submit Leave
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      <Box mb={3}>
  <Typography fontWeight={700} mb={1}>
    Leave Calendar
  </Typography>

  <Calendar
    tileContent={({ date }) => {
      const leave = leaves.find(
        (l) =>
          new Date(l.start_date) <= date &&
          new Date(l.end_date) >= date
      );

      return leave ? (
        <div style={{ fontSize: 10, color: "red" }}>●</div>
      ) : null;
    }}
  />
</Box>
      {/* LEAVE LIST */}
      <Typography fontWeight={700} mb={1}>
        Leave History
      </Typography>

      <Grid container spacing={2}>
        {leaves.map((l: any) => (
          <Grid item xs={12} md={6} key={l.id}>
            <Card>
              <CardContent>

                <Typography fontWeight={700}>
                  {l.start_date} → {l.end_date}
                </Typography>

                <Typography>{l.reason}</Typography>

                <Typography mt={1}>
                  Type: {l.leave_type}
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
                  sx={{ mt: 1 }}
                />

              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

    </Box>
  );
}

export default CoachLeave;