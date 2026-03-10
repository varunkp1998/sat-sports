import { useEffect, useState } from "react";
import { Table, TableHead, TableRow, TableCell, TableBody, Button, Paper, Chip } from "@mui/material";

export default function AdminApplications() {
  const [rows, setRows] = useState<any[]>([]);

  const load = () => {
    fetch("http://localhost:4000/api/admin/applications")
      .then(res => res.json())
      .then(setRows);
  };

  useEffect(() => {
    load();
  }, []);

  const approve = async (id: number) => {
    await fetch(`http://localhost:4000/api/admin/applications/${id}/approve`, { method: "POST" });
    load();
  };

  const reject = async (id: number) => {
    await fetch(`http://localhost:4000/api/admin/applications/${id}/reject`, { method: "POST" });
    load();
  };

  return (
    <section>
      <h3>📝 Player Applications</h3>

      <Paper sx={{ mt: 2 }}>
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
            {rows.map(r => (
              <TableRow key={r.id}>
                <TableCell>{r.name}</TableCell>
                <TableCell>{r.email}</TableCell>
                <TableCell>{r.age}</TableCell>
                <TableCell>{r.preferred_program || "-"}</TableCell>
                <TableCell>
                  <Chip
                    label={r.status}
                    color={r.status === "approved" ? "success" : r.status === "rejected" ? "error" : "warning"}
                  />
                </TableCell>
                <TableCell>
                  {r.status === "pending" && (
                    <>
                      <Button size="small" color="success" onClick={() => approve(r.id)}>Approve</Button>
                      <Button size="small" color="error" onClick={() => reject(r.id)}>Reject</Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </section>
  );
}
