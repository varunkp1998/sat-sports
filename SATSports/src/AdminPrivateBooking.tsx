import { useEffect, useState } from "react";
import {
  Box, Typography, Card, Button,
  Select, MenuItem
} from "@mui/material";
import API_BASE from "./api";

export default function AdminPrivateBookings() {

  const [rows, setRows] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [courts, setCourts] = useState({});

  const load = () => {
    fetch(`${API_BASE}/api/admin/private-bookings`)
      .then(res => res.json())
      .then(setRows);
  };

  useEffect(() => {
    load();

    fetch(`${API_BASE}/api/coaches`).then(r=>r.json()).then(setCoaches);
    fetch(`${API_BASE}/api/courts`).then(r=>r.json()).then(setCourts);
  }, []);

  const approve = async (id, coach, court) => {
    await fetch(`${API_BASE}/api/admin/private-bookings/${id}/approve`, {
      method: "PUT",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({
        coach_id: coach,
        court_id: court
      })
    });

    load();
  };

  const reject = async (id) => {
    await fetch(`${API_BASE}/api/admin/private-bookings/${id}/reject`, {
      method: "PUT"
    });

    load();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" mb={3}>
        Private Bookings
      </Typography>

      {rows.map(r => {
        const [coach, setCoach] = useState("");
        const [court, setCourt] = useState("");

        return (
          <Card key={r.id} sx={{ p:2, mb:2 }}>

            <Typography>{r.name}</Typography>
            <Typography>{r.location_name}</Typography>
            <Typography>{r.booking_date} | {r.time_slot}</Typography>

            <Typography>Status: {r.status}</Typography>

            {r.status === "pending" && (
              <>
                <Select onChange={e => setCoach(e.target.value)}>
                  {coaches.map(c => (
                    <MenuItem value={c.id}>{c.name}</MenuItem>
                  ))}
                </Select>

                <Select onChange={e => setCourt(e.target.value)}>
                  {courts.map(c => (
                    <MenuItem value={c.id}>{c.name}</MenuItem>
                  ))}
                </Select>

                <Button onClick={() => approve(r.id, coach, court)}>
                  Approve
                </Button>

                <Button onClick={() => reject(r.id)}>
                  Reject
                </Button>
              </>
            )}

          </Card>
        );
      })}

    </Box>
  );
}