import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  TextField,
  Button,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Alert,
  Typography,
  Chip,
  Box,
  Divider,
} from "@mui/material";
import API_BASE from "./api";
type Leave = {
  id: number;
  start_date: string;
  end_date: string;
  reason: string;
  status: string;
};

function CoachLeave() {
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");
  const [reason, setReason] = React.useState("");
  const [leaves, setLeaves] = useState<Leave[]>([]);

  const coachId = localStorage.getItem("userId");

  const loadLeaves = () => {
    if (!coachId) return;

    fetch(`${API_BASE}/api/coach/leaves/${coachId}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setLeaves(data);
        } else {
          setLeaves([]);
        }
      });
  };

  useEffect(() => {
    loadLeaves();
  }, [coachId]);

  const submitLeave = () => {
    if (!startDate || !endDate) {
      alert("Select leave dates");
      return;
    }

    fetch(`${API_BASE}/api/coach/leaves`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: coachId,
        start_date: startDate,
        end_date: endDate,
        reason,
      }),
    }).then(() => {
      alert("Leave request submitted");
      setStartDate("");
      setEndDate("");
      setReason("");
      loadLeaves();
    });
  };

  return (
    <section style={{ background: "#f5f7fb", minHeight: "100vh", padding: 16 }}>
      <Typography variant="h4" fontWeight={800} mb={3}>
        Leave Management
      </Typography>

      {/* APPLY FORM */}
      <Card
        sx={{
          maxWidth: 500,
          mb: 4,
          borderRadius: 3,
          boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
        }}
      >
        <CardContent>
          <Typography variant="h6" fontWeight={700} mb={2}>
            Apply for Leave
          </Typography>

          <Stack spacing={2}>
            <TextField
              type="date"
              label="From"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />

            <TextField
              type="date"
              label="To"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />

            <TextField
              label="Reason"
              multiline
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              fullWidth
            />

            <Button variant="contained" color="error" onClick={submitLeave}>
              Submit Leave Request
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* LEAVE LIST */}
      <Box mb={2}>
        <Typography variant="h6" fontWeight={700}>
          My Leave Requests
        </Typography>
        <Typography color="text.secondary">
          Track approval status of your leave applications
        </Typography>
      </Box>

      {leaves.length === 0 && (
        <Alert severity="info">No leave requests yet.</Alert>
      )}

      {leaves.length > 0 && (
        <Paper
          sx={{
            borderRadius: 3,
            boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
            overflow: "hidden",
          }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ background: "#f0f2f7" }}>
                <TableCell><strong>From</strong></TableCell>
                <TableCell><strong>To</strong></TableCell>
                <TableCell><strong>Reason</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {leaves.map((l) => (
                <TableRow key={l.id} hover>
                  <TableCell>{l.start_date}</TableCell>
                  <TableCell>{l.end_date}</TableCell>
                  <TableCell>{l.reason || "-"}</TableCell>
                  <TableCell>
                    <Chip
                      label={l.status}
                      color={
                        l.status === "Approved"
                          ? "success"
                          : l.status === "Rejected"
                          ? "error"
                          : "warning"
                      }
                      variant="outlined"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}
    </section>
  );
}

export default CoachLeave;
