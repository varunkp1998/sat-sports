import { useEffect, useState } from "react";
import {
  Box, Typography, Card, Button,
  Select, MenuItem
} from "@mui/material";
import API_BASE from "./api";

export default function AdminPrivateBookings() {

  const [rows, setRows] = useState([]);
  const [coaches, setCoaches] = useState([]);

  // ✅ store coach selection per booking
  const [selectedCoach, setSelectedCoach] = useState({});

  const load = () => {
    fetch(`${API_BASE}/api/admin/private-bookings`)
      .then(res => res.json())
      .then(setRows);
  };

  useEffect(() => {
    load();

    fetch(`${API_BASE}/api/admin/coaches`)
      .then(r => r.json())
      .then(setCoaches);
  }, []);

  const approve = async (id) => {
    const coach_id = selectedCoach[id];

    if (!coach_id) {
      alert("Please select coach");
      return;
    }

    await fetch(`${API_BASE}/api/admin/private-bookings/${id}/approve`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ coach_id })
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
        🎾 Private Bookings
      </Typography>

      {rows.map(r => (
        <Card key={r.id} sx={{ p: 2, mb: 2 }}>

          <Typography fontWeight={600}>{r.name}</Typography>
          <Typography>{r.location_name}</Typography>
          <Typography>{r.booking_date} | {r.time_slot}</Typography>
          <Typography>Status: {r.status}</Typography>

          {r.status === "pending" && (
            <>
              {/* ✅ COACH SELECT */}
              <Select
                fullWidth
                sx={{ mt: 2 }}
                value={selectedCoach[r.id] || ""}
                onChange={(e) =>
                  setSelectedCoach({
                    ...selectedCoach,
                    [r.id]: e.target.value
                  })
                }
              >
                <MenuItem value="">Select Coach</MenuItem>

                {coaches.map(c => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.name}
                  </MenuItem>
                ))}
              </Select>

              {/* ✅ ACTIONS */}
              <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
                <Button
                  variant="contained"
                  onClick={() => approve(r.id)}
                >
                  Approve
                </Button>

                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => reject(r.id)}
                >
                  Reject
                </Button>
              </Box>
            </>
          )}

        </Card>
      ))}

    </Box>
  );
}