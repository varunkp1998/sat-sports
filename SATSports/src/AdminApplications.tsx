import { useEffect, useState } from "react";
import { Table, TableHead, TableRow, TableCell, TableBody, Button, Paper, Chip } from "@mui/material";
import API_BASE from "./api";
import { useTheme, useMediaQuery, Card, CardContent, Stack, Typography } from "@mui/material";

export default function AdminApplications() {
  const [rows, setRows] = useState([]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const load = () => {
    fetch(`${API_BASE}/api/admin/applications`)
      .then(res => res.json())
      .then(setRows);
  };

  useEffect(() => {
    load();
  }, []);

  const approve = async (id) => {
    await fetch(`${API_BASE}/api/admin/applications/${id}/approve`, { method: "POST" });
    load();
  };

  const reject = async (id) => {
    await fetch(`${API_BASE}/api/admin/applications/${id}/reject`, { method: "POST" });
    load();
  };

  return (
    <section>
      <h3>📝 Player Applications</h3>

      {/* ✅ MOBILE VIEW */}
      {isMobile ? (
        <Stack spacing={2}>
          {rows.map((r) => (
            <Card key={r.id}>
              <CardContent>
                <Typography fontWeight="bold">{r.name}</Typography>
                <Typography variant="body2">{r.email}</Typography>
                <Typography variant="body2">Age: {r.age}</Typography>
                <Typography variant="body2">
                  Program: {r.preferred_program || "-"}
                </Typography>

                <Chip
                  label={r.status}
                  color={
                    r.status === "approved"
                      ? "success"
                      : r.status === "rejected"
                      ? "error"
                      : "warning"
                  }
                  sx={{ mt: 1 }}
                />

                {r.status === "pending" && (
                  <Stack direction="row" spacing={1} mt={2}>
                    <Button size="small" color="success" onClick={() => approve(r.id)}>
                      Approve
                    </Button>
                    <Button size="small" color="error" onClick={() => reject(r.id)}>
                      Reject
                    </Button>
                  </Stack>
                )}
              </CardContent>
            </Card>
          ))}
        </Stack>
      ) : (
        /* ✅ DESKTOP TABLE */
        <Paper sx={{ mt: 2, overflowX: "auto" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Age</TableCell>
                <TableCell>Preferred Program</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.name}</TableCell>
                  <TableCell>{r.email}</TableCell>
                  <TableCell>{r.age}</TableCell>
                  <TableCell>{r.preferred_program || "-"}</TableCell>
                  <TableCell>
                    <Chip
                      label={r.status}
                      color={
                        r.status === "approved"
                          ? "success"
                          : r.status === "rejected"
                          ? "error"
                          : "warning"
                      }
                    />
                  </TableCell>
                  <TableCell>
                    {r.status === "pending" && (
                      <>
                        <Button size="small" color="success" onClick={() => approve(r.id)}>
                          Approve
                        </Button>
                        <Button size="small" color="error" onClick={() => reject(r.id)}>
                          Reject
                        </Button>
                      </>
                    )}
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