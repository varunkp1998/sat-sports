import { useState } from "react";
import { Box, Card, CardContent, TextField, Button, MenuItem, Typography } from "@mui/material";
import API_BASE from "./api";

function Signup() {
  const [role, setRole] = useState("player");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const handleSignup = async () => {
    const res = await fetch(`${API_BASE}/api/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, role }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message);
      return;
    }

    alert("Account created. Credentials sent to email.");
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
      <Card sx={{ width: 420 }}>
        <CardContent>
          <Typography variant="h5" mb={2}>Sign Up</Typography>

          <TextField
            fullWidth
            label="Full Name"
            margin="normal"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <TextField
            fullWidth
            label="Email"
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <TextField
            select
            fullWidth
            label="Account Type"
            margin="normal"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <MenuItem value="player">Player</MenuItem>
            <MenuItem value="coach">Coach</MenuItem>
          </TextField>

          <Button fullWidth variant="contained" sx={{ mt: 2 }} onClick={handleSignup}>
            Create Account
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}

export default Signup;