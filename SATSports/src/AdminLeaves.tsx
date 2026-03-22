import React, { useEffect, useState } from "react";
import {
  Box, Typography, Grid, Card, CardContent,
  Button, Stack, Chip
} from "@mui/material";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import API_BASE from "./api";

export default function AdminLeaves() {
  const [leaves, setLeaves] = useState([]);
  const [filter, setFilter] = useState("all");

  const load = () => {
    fetch(`${API_BASE}/api/admin/leaves`)
      .then(res => res.json())
      .then(setLeaves);
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id, status) => {
    await fetch(`${API_BASE}/api/admin/leaves/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  };

  const filtered =
    filter === "all" ? leaves : leaves.filter(l => l.status === filter);

  const stats = {
    pending: leaves.filter(l => l.status === "Pending").length,
    approved: leaves.filter(l => l.status === "Approved").length,
    rejected: leaves.filter(l => l.status === "Rejected").length,
  };

  return (
    <Box sx={{ p: 3, background: "#f5f7fb", minHeight: "100vh" }}>

      <Typography variant="h4" fontWeight={800} mb={3}>
        Leave Dashboard
      </Typography>

      {/* STATS */}
      <Grid container spacing={2} mb={3}>
        {Object.entries(stats).map(([k, v]) => (
          <Grid item xs={4} key={k}>
            <Card>
              <CardContent>
                <Typography>{k}</Typography>
                <Typography variant="h4">{v}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* FILTER */}
      <Stack direction="row" spacing={1} mb={3}>
        {["all", "Pending", "Approved", "Rejected"].map(f => (
          <Chip
            key={f}
            label={f}
            clickable
            color={filter === f ? "primary" : "default"}
            onClick={() => setFilter(f)}
          />
        ))}
      </Stack>

      {/* CALENDAR */}
      <Card sx={{ mb: 3 }}>
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

      {/* LEAVES */}
      <Grid container spacing={2}>
        {filtered.map(l => (
          <Grid item xs={12} md={6} key={l.id}>
            <Card>
              <CardContent>

                <Typography fontWeight={700}>
                  {l.username}
                </Typography>

                <Typography>
                  {l.start_date} → {l.end_date}
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

                {l.status === "Pending" && (
                  <Stack direction="row" spacing={1} mt={2}>
                    <Button
                      variant="contained"
                      color="success"
                      onClick={() => updateStatus(l.id, "Approved")}
                    >
                      Approve
                    </Button>

                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => updateStatus(l.id, "Rejected")}
                    >
                      Reject
                    </Button>
                  </Stack>
                )}

              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

    </Box>
  );
}