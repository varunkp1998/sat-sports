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
  Card,
  CardContent,
  Stack,
  useTheme,
  useMediaQuery
} from "@mui/material";
import API_BASE from "./api";

export default function AdminCourtBookings() {
  const [rows, setRows] = useState([]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const load = () => {
    fetch(`${API_BASE}/api/admin/court-bookings`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setRows(data);
        else setRows([]);
      })
      .catch(() => setRows([]));
  };

  useEffect(() => {
    load();
  }, []);

  const cancel = async (id) => {
    if (!window.confirm("Cancel this booking?")) return;

    await fetch(`${API_BASE}/api/admin/court-bookings/${id}`, {
      method: "DELETE",
    });

    load();
  };

  return (
    <section style={{ padding: 16 }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
        📋 Court Bookings (Admin)
      </Typography>

      {/* ✅ MOBILE VIEW */}
      {isMobile ? (
        <Stack spacing={2}>
          {rows.length === 0 && (
            <Typography textAlign="center">No bookings found.</Typography>
          )}

          {rows.map((r) => (
            <Card key={r.id}>
              <CardContent>
                <Typography fontWeight={600}>
                  {r.court_name}
                </Typography>

                <Typography variant="body2">
                  📅 {new Date(r.booking_date).toLocaleDateString()}
                </Typography>

                <Typography variant="body2">
                  ⏰ {r.start_time} – {r.end_time}
                </Typography>

                <Typography variant="body2">
                  👤 {r.name}
                </Typography>

                <Typography variant="body2">
                  📞 {r.phone || "-"}
                </Typography>

                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  fullWidth
                  sx={{ mt: 2 }}
                  onClick={() => cancel(r.id)}
                >
                  Cancel Booking
                </Button>
              </CardContent>
            </Card>
          ))}
        </Stack>
      ) : (
        /* ✅ DESKTOP TABLE */
        <Paper sx={{ borderRadius: 3, overflowX: "auto" }}>
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

              {rows.map((r) => (
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
      )}
    </section>
  );
}