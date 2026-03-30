import { useState, useEffect } from "react";
import { Card, CardContent, TextField, Button, Stack, Typography, Box } from "@mui/material";
import API_BASE from "./api";

export default function RegisterPlayer() {
  // Get Program Info from URL
  const queryParams = new URLSearchParams(window.location.search);
  const programId = queryParams.get("programId");
  const programName = queryParams.get("programName");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    age: "",
    parentName: "",
    parentPhone: "",
    programId: programId || "", // Store the ID in the form
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

    alert(`Application for ${programName || 'Program'} submitted successfully 🎾`);
    // Redirect back or clear
    window.location.href = "/programs"; 
  };

  return (
    <section style={{ maxWidth: 500, margin: "40px auto", padding: "0 20px" }}>
      {programName && (
        <Box sx={{ mb: 2, textAlign: 'center', p: 2, bgcolor: '#fef2f2', borderRadius: 2, border: '1px solid #fecaca' }}>
          <Typography variant="body2" color="error" fontWeight={700}>
            ENROLLING IN: {programName.toUpperCase()}
          </Typography>
        </Box>
      )}

      <Card sx={{ borderRadius: 3, boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}>
        <CardContent>
          <Typography variant="h5" fontWeight={700} mb={2}>
            🎾 Player Registration
          </Typography>

          <Stack spacing={2}>
            <TextField label="Student Name" name="name" value={form.name} onChange={handleChange} fullWidth />
            <TextField label="Email" name="email" value={form.email} onChange={handleChange} fullWidth />
            <TextField label="Phone" name="phone" value={form.phone} onChange={handleChange} fullWidth />
            <TextField label="Age" type="number" name="age" value={form.age} onChange={handleChange} fullWidth />

            <TextField label="Parent Name (if under 12)" name="parentName" value={form.parentName} onChange={handleChange} fullWidth />
            <TextField label="Parent Phone" name="parentPhone" value={form.parentPhone} onChange={handleChange} fullWidth />

            <Button variant="contained" color="error" size="large" onClick={submit} sx={{ py: 1.5, fontWeight: 700 }}>
              Submit Application
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </section>
  );
}