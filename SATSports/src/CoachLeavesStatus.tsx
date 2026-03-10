import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableRow, Paper, Alert } from "@mui/material";
import API_BASE from "./api";
function CoachLeavesStatus() {
  const coachId = localStorage.getItem("userId");
  const [leaves, setLeaves] = useState<any[]>([]);

  useEffect(() => {
    if (!coachId) return;

    fetch(`${API_BASE}/api/coach/leaves/${coachId}`)
      .then(res => res.json())
      .then(setLeaves);
  }, [coachId]);

  if (leaves.length === 0) {
    return <Alert severity="info">No leave requests yet.</Alert>;
  }

  return (
    <Paper>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>From</TableCell>
            <TableCell>To</TableCell>
            <TableCell>Reason</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {leaves.map(l => (
            <TableRow key={l.id}>
              <TableCell>{l.start_date}</TableCell>
              <TableCell>{l.end_date}</TableCell>
              <TableCell>{l.reason || "-"}</TableCell>
              <TableCell>
                <strong>{l.status}</strong>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
}

export default CoachLeavesStatus;
