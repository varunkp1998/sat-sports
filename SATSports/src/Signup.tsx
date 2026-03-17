import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  MenuItem,
  Typography,
  Stack
} from "@mui/material";
import API_BASE from "./api";

export default function Signup() {
  const navigate = useNavigate();

  const [role, setRole] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    age: "",
    parentName: "",
    parentPhone: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async () => {
    if (!role) return alert("Select role");

    if (!form.name || !form.email) {
      return alert("Name & Email required");
    }

    const endpoint =
      role === "player"
        ? "/api/signup"
        : "/api/signup/coach";

    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(form)
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message);
      return;
    }

    if (role === "player") {
      alert("Application submitted. Await admin approval.");
    } else {
      alert("Coach account created. Check email 📩");
      navigate("/login");
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
      <Card sx={{ width: 450 }}>
        <CardContent>
          <Typography variant="h5" mb={2}>
            Sign Up
          </Typography>

          {/* Role */}
          <TextField
            select
            fullWidth
            label="Register As"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            sx={{ mb: 2 }}
          >
            <MenuItem value="player">Player</MenuItem>
            <MenuItem value="coach">Coach</MenuItem>
          </TextField>

          {role && (
            <Stack spacing={2}>
              <TextField label="Full Name" name="name" value={form.name} onChange={handleChange} />
              <TextField label="Email" name="email" value={form.email} onChange={handleChange} />
              <TextField label="Phone" name="phone" value={form.phone} onChange={handleChange} />

              {role === "player" && (
                <>
                  <TextField label="Age" type="number" name="age" value={form.age} onChange={handleChange} />
                  <TextField label="Parent Name" name="parentName" value={form.parentName} onChange={handleChange} />
                  <TextField label="Parent Phone" name="parentPhone" value={form.parentPhone} onChange={handleChange} />
                </>
              )}

              <Button variant="contained" onClick={submit}>
                Create Account
              </Button>
            </Stack>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}