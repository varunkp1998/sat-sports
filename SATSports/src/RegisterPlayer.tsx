// RegisterPlayer.tsx
import { useState } from "react";
import { Card, CardContent, TextField, Button, Stack, Typography } from "@mui/material";
import API_BASE from "./api";

export default function RegisterPlayer() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    age: "",
    parentName: "",
    parentPhone: "",
  });

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async () => {
    if (!form.name || !form.email || !form.age) {
      alert("Name, Email and Age are required");
      return;
    }

    await fetch(`${API_BASE}/api/applications`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    alert("Application submitted successfully 🎾");
    setForm({
      name: "",
      email: "",
      phone: "",
      age: "",
      parentName: "",
      parentPhone: "",
    });
  };

  return (
    <section style={{ maxWidth: 500, margin: "40px auto" }}>
      <Card sx={{ borderRadius: 3, boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}>
        <CardContent>
          <Typography variant="h5" fontWeight={700} mb={2}>
            🎾 Player Registration
          </Typography>

          <Stack spacing={2}>
            <TextField label="Student Name" name="name" value={form.name} onChange={handleChange} />
            <TextField label="Email" name="email" value={form.email} onChange={handleChange} />
            <TextField label="Phone" name="phone" value={form.phone} onChange={handleChange} />
            <TextField label="Age" type="number" name="age" value={form.age} onChange={handleChange} />

            <TextField label="Parent Name (if under 12)" name="parentName" value={form.parentName} onChange={handleChange} />
            <TextField label="Parent Phone" name="parentPhone" value={form.parentPhone} onChange={handleChange} />

            <Button variant="contained" color="error" size="large" onClick={submit}>
              Submit Application
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </section>
  );
}
