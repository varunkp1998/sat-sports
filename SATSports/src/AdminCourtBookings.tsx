import { useEffect, useState } from "react";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Paper,
  Typography,
} from "@mui/material";
import API_BASE from "./api";
export default function AdminCourtBookings() {
  const [rows, setRows] = useState<any[]>([]);

  const load = () => {
    fetch(`${API_BASE}/api/admin/court-bookings`)
      .then(res => res.json())
      .then(data => {
        console.log("Admin bookings:", data); // 👈 debug
        if (Array.isArray(data)) setRows(data);
        else setRows([]);
      })
      .catch(err => {
        console.error("Failed to load bookings", err);
        setRows([]);
      });
  };

  useEffect(() => {
    load();
  }, []);

  const cancel = async (id: number) => {
    if (!window.confirm("Cancel this booking?")) return;

    await fetch(`${API_BASE}/api/admin/court-bookings/${id}`, {
      method: "DELETE",
    });

    load();
  };

  return (
    <section style={{ padding: 24 }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
        📋 Court Bookings (Admin)
      </Typography>

      <Paper sx={{ borderRadius: 3, boxShadow: "0 8px 20px rgba(0,0,0,0.08)" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Court</strong></TableCell>
              <TableCell><strong>Date</strong></TableCell>
              <TableCell><strong>Time</strong></TableCell>
              <TableCell><strong>Name</strong></TableCell>
              <TableCell><strong>Phone</strong></TableCell>
              <TableCell align="right"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No bookings found.
                </TableCell>
              </TableRow>
            )}

            {rows.map(r => (
              <TableRow key={r.id} hover>
                <TableCell>{r.court_name}</TableCell>
                <TableCell>
                  {new Date(r.booking_date).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {r.start_time} – {r.end_time}
                </TableCell>
                <TableCell>{r.name}</TableCell>
                <TableCell>{r.phone || "-"}</TableCell>
                <TableCell align="right">
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => cancel(r.id)}
                  >
                    Cancel
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </section>
  );
}
