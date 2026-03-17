import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
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

    const endpoint =
      role === "player"
        ? "/api/signup"
        : "/api/signup/coach";

    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    const data = await res.json();

    if (!res.ok) return alert(data.message);

    if (role === "player") {
      alert("Application submitted 🎾");
    } else {
      alert("Coach account created 📩");
      navigate("/login");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg,#0f172a,#111827,#1f2937)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2
      }}
    >
      <Card
        sx={{
          width: 480,
          borderRadius: 4,
          backdropFilter: "blur(15px)",
          background: "rgba(255,255,255,0.08)",
          color: "white",
          boxShadow: "0 20px 50px rgba(0,0,0,0.5)"
        }}
      >
        <CardContent>
          <Typography variant="h4" fontWeight={800} mb={1}>
            🎾 Join SAT Sports
          </Typography>

          <Typography mb={3} color="gray">
            Start your journey with us
          </Typography>

          {/* ROLE SELECTION (MODERN BUTTONS) */}
          <Stack direction="row" spacing={2} mb={3}>
            <Button
              fullWidth
              variant={role === "player" ? "contained" : "outlined"}
              onClick={() => setRole("player")}
              sx={{
                borderRadius: 3,
                background: role === "player" ? "#ef4444" : "transparent"
              }}
            >
              Player
            </Button>

            <Button
              fullWidth
              variant={role === "coach" ? "contained" : "outlined"}
              onClick={() => setRole("coach")}
              sx={{
                borderRadius: 3,
                background: role === "coach" ? "#22c55e" : "transparent"
              }}
            >
              Coach
            </Button>
          </Stack>

          {/* FORM */}
          {role && (
            <Stack spacing={2}>
              <TextField
                label="Full Name"
                name="name"
                value={form.name}
                onChange={handleChange}
                fullWidth
                sx={{ input: { color: "white" } }}
              />

              <TextField
                label="Email"
                name="email"
                value={form.email}
                onChange={handleChange}
                fullWidth
                sx={{ input: { color: "white" } }}
              />

              <TextField
                label="Phone"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                fullWidth
                sx={{ input: { color: "white" } }}
              />

              {role === "player" && (
                <>
                  <TextField
                    label="Age"
                    name="age"
                    type="number"
                    value={form.age}
                    onChange={handleChange}
                    fullWidth
                    sx={{ input: { color: "white" } }}
                  />

                  <TextField
                    label="Parent Name"
                    name="parentName"
                    value={form.parentName}
                    onChange={handleChange}
                    fullWidth
                    sx={{ input: { color: "white" } }}
                  />

                  <TextField
                    label="Parent Phone"
                    name="parentPhone"
                    value={form.parentPhone}
                    onChange={handleChange}
                    fullWidth
                    sx={{ input: { color: "white" } }}
                  />
                </>
              )}

              <Button
                variant="contained"
                size="large"
                onClick={submit}
                sx={{
                  mt: 2,
                  borderRadius: 3,
                  background: "linear-gradient(90deg,#ef4444,#dc2626)",
                  fontWeight: 700
                }}
              >
                Create Account 🚀
              </Button>
            </Stack>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}