import React from "react";
import { Card, CardContent, TextField, Button, Stack } from "@mui/material";

function PlayerLeave() {
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");
  const [reason, setReason] = React.useState("");

  const userId = localStorage.getItem("userId"); // set on login

  const submitLeave = () => {
    if (!startDate || !endDate) {
      alert("Select leave dates");
      return;
    }

    fetch("http://localhost:4000/api/player/leaves", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        start_date: startDate,
        end_date: endDate,
        reason,
      }),
    }).then(() => {
      alert("Leave request submitted");
      setStartDate("");
      setEndDate("");
      setReason("");
    });
  };

  return (
    <section className="section">
      <h3>Apply for Leave</h3>

      <Card sx={{ maxWidth: 500 }}>
        <CardContent>
          <Stack spacing={2}>
            <TextField
              type="date"
              label="From"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              type="date"
              label="To"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="Reason"
              multiline
              rows={3}
              value={reason}
              onChange={e => setReason(e.target.value)}
            />

            <Button
              variant="contained"
              color="error"
              onClick={submitLeave}
            >
              Submit Leave
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </section>
  );
}

export default PlayerLeave;
