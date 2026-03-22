import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Stack,
  Chip,
  Select,
  MenuItem,
} from "@mui/material";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import API_BASE from "./api";

function AdminLeaves() {
  const [leaves, setLeaves] = useState([]);
  const [filter, setFilter] = useState("all");

  const loadLeaves = () => {
    fetch(`${API_BASE}/api/admin/leaves`)
      .then((res) => res.json())
      .then((data) => setLeaves(Array.isArray(data) ? data : []));
  };

  useEffect(() => {
    loadLeaves();
  }, []);

  const updateStatus = async (id, status) => {
    await fetch(`${API_BASE}/api/admin/leaves/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    loadLeaves();
  };

  // FILTER
  const filtered =
    filter === "all"
      ? leaves
      : leaves.filter((l) => l.status === filter);

  // SUMMARY
  const stats = {
    pending: leaves.filter((l) => l.status === "Pending").length,
    approved: leaves.filter((l) => l.status === "Approved").length,
    rejected: leaves.filter((l) => l.status === "Rejected").length,
  };

  return (
    <Box sx={{ p: 3, background: "#f5f7fb", minHeight: "100vh" }}>

      {/* HEADER */}
      <Typography variant="h4" fontWeight={800} mb={3}>
        Leave Management Dashboard
      </Typography>

      {/* SUMMARY CARDS */}
      <Grid container spacing={2} mb={3}>
        {[
          { label: "Pending", value: stats.pending, color: "#f59e0b" },
          { label: "Approved", value: stats.approved, color: "#22c55e" },
          { label: "Rejected", value: stats.rejected, color: "#ef4444" },
        ].map((s, i) => (
          <Grid item xs={12} md={4} key={i}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography color="text.secondary">{s.label}</Typography>
                <Typography variant="h4" fontWeight={800}>
                  {s.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* FILTERS */}
      <Stack direction="row" spacing={1} mb={3}>
        {["all", "Pending", "Approved", "Rejected"].map((f) => (
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
      <Card sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent>
          <Typography fontWeight={700} mb={2}>
            Leave Calendar
          </Typography>

          <Calendar
            tileContent={({ date }) => {
              const found = leaves.find(
                (l) =>
                  new Date(date) >= new Date(l.start_date) &&
                  new Date(date) <= new Date(l.end_date)
              );

              return found ? (
                <div style={{ color: "red", fontSize: 12 }}>●</div>
              ) : null;
            }}
          />
        </CardContent>
      </Card>

      {/* LEAVE CARDS */}
      <Grid container spacing={3}>
        {filtered.map((l) => (
          <Grid item xs={12} md={6} key={l.id}>
            <Card
              sx={{
                borderRadius: 4,
                transition: "0.3s",
                "&:hover": {
                  transform: "translateY(-4px)",
                },
              }}
            >
              <CardContent>

                {/* COACH */}
                <Typography fontWeight={700}>
                  {l.username}
                </Typography>

                {/* DATES */}
                <Typography mt={1}>
                  📅 {l.start_date} → {l.end_date}
                </Typography>

                {/* TYPE */}
                <Typography>
                  🏷 {l.leave_type || "casual"}
                </Typography>

                {/* REASON */}
                <Typography color="text.secondary" mt={1}>
                  {l.reason || "No reason provided"}
                </Typography>

                {/* STATUS */}
                <Chip
                  label={l.status}
                  color={
                    l.status === "Approved"
                      ? "success"
                      : l.status === "Rejected"
                      ? "error"
                      : "warning"
                  }
                  sx={{ mt: 2 }}
                />

                {/* ACTIONS */}
                {l.status === "Pending" && (
                  <Stack direction="row" spacing={1} mt={2}>
                    <Button
                      fullWidth
                      variant="contained"
                      color="success"
                      onClick={() => updateStatus(l.id, "Approved")}
                    >
                      Approve
                    </Button>

                    <Button
                      fullWidth
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

      {/* EMPTY STATE */}
      {filtered.length === 0 && (
        <Typography mt={4} color="text.secondary">
          No leave requests found
        </Typography>
      )}

    </Box>
  );
}

export default AdminLeaves;