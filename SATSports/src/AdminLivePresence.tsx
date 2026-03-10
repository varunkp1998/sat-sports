import React from "react";
import { Table, TableBody, TableCell, TableHead, TableRow, Paper, TableContainer } from "@mui/material";

function AdminLivePresence() {
  const [coaches, setCoaches] = React.useState<any[]>([]);

  const load = () => {
    fetch("http://localhost:4000/api/admin/live-coaches")
      .then(res => res.json())
      .then(setCoaches);
  };

  React.useEffect(() => {
    load();
    const i = setInterval(load, 30000); // refresh every 30s
    return () => clearInterval(i);
  }, []);

  return (
    <section>
      <h3>Live Coach Presence</h3>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Coach</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Checked In At</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {coaches.map(c => (
              <TableRow key={c.id}>
                <TableCell>{c.name}</TableCell>
                <TableCell>{c.location}</TableCell>
                <TableCell>{c.checkin_time}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </section>
  );
}

export default AdminLivePresence;
