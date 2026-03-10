import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Stack,
  Typography,
  Chip,
  Box,
  Alert,
  Card,
  CardContent,
} from "@mui/material";

function AdminLeaves() {
  const [leaves, setLeaves] = React.useState<any[]>([]);

  const loadLeaves = () => {
    fetch("http://localhost:4000/api/admin/leaves")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setLeaves(data);
        else setLeaves([]);
      });
  };

  React.useEffect(() => {
    loadLeaves();
  }, []);

  const updateStatus = (id: number, status: string) => {
    fetch(`http://localhost:4000/api/admin/leaves/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    }).then(() => loadLeaves());
  };

  return (
    <section style={{ background: "#f5f7fb", minHeight: "100vh", padding: 16 }}>
      <Typography variant="h4" fontWeight={800} mb={3}>
        Leave Management
      </Typography>

      <Card
        sx={{
          borderRadius: 3,
          boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
        }}
      >
        <CardContent>
          <Typography variant="h6" fontWeight={700} mb={1}>
            Coach Leave Requests
          </Typography>
          <Typography color="text.secondary" mb={2}>
            Approve or reject leave requests submitted by coaches
          </Typography>

          {leaves.length === 0 && (
            <Alert severity="info">No leave requests found.</Alert>
          )}

          {leaves.length > 0 && (
            <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ background: "#f0f2f7" }}>
                    <TableCell><strong>Coach</strong></TableCell>
                    <TableCell><strong>From</strong></TableCell>
                    <TableCell><strong>To</strong></TableCell>
                    <TableCell><strong>Reason</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell align="right"><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {leaves.map((l) => (
                    <TableRow key={l.id} hover>
                      <TableCell>{l.username}</TableCell>
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

                      <TableCell align="right">
                        {l.status === "Pending" && (
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <Button
                              variant="contained"
                              color="success"
                              size="small"
                              onClick={() => updateStatus(l.id, "Approved")}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              onClick={() => updateStatus(l.id, "Rejected")}
                            >
                              Reject
                            </Button>
                          </Stack>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

export default AdminLeaves;
