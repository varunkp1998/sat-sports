import { useState } from "react";
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
  const [role, setRole] = useState("player");
  const [loading, setLoading] = useState(false);

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

  const submit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.phone) {
      return alert("Please fill required fields");
    }

    if (role === "player" && (!form.age || !form.parentName)) {
      return alert("Please fill player details");
    }

    try {
      setLoading(true);

      const url =
      role === "coach"
        ? `${API_BASE}/api/signup/coach`
        : `${API_BASE}/api/signup`;

      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        ...(role === "player" && {
          age: form.age,
          parentName: form.parentName,
          parentPhone: form.parentPhone
        })
      };

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      alert(data.message || "Signup successful");

      setForm({
        name: "",
        email: "",
        phone: "",
        age: "",
        parentName: "",
        parentPhone: ""
      });

    } catch (err) {
      alert(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundImage: `
          linear-gradient(rgba(5,10,25,0.9), rgba(5,10,25,0.95)),
          url('/tennis-bg.jpg')
        `,
        backgroundSize: "cover",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2
      }}
    >
      <Card
        sx={{
          width: "100%",
          maxWidth: 520,
          borderRadius: 5,
          backdropFilter: "blur(25px)",
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.15)",
          color: "white"
        }}
      >
        <CardContent sx={{ p: 4 }}>

          <Box textAlign="center" mb={3}>
            <Typography variant="h5" fontWeight={700}>
              SAT Sports Signup 🎾
            </Typography>
            <Typography color="gray">
              Join as Player or Coach
            </Typography>
          </Box>

          {/* Toggle */}
          <Box
            sx={{
              display: "flex",
              background: "rgba(255,255,255,0.08)",
              borderRadius: 999,
              p: 0.5,
              mb: 3,
              position: "relative"
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: 4,
                left: role === "player" ? "4px" : "50%",
                width: "50%",
                height: "calc(100% - 8px)",
                borderRadius: 999,
                background: "linear-gradient(90deg,#3b82f6,#2563eb)",
                transition: "0.3s"
              }}
            />

            {["player", "coach"].map((r) => (
              <Box
                key={r}
                onClick={() => setRole(r)}
                sx={{
                  flex: 1,
                  textAlign: "center",
                  py: 1,
                  zIndex: 1,
                  cursor: "pointer",
                  fontWeight: 600
                }}
              >
                {r === "player" ? "Player" : "Coach"}
              </Box>
            ))}
          </Box>

          <form onSubmit={submit}>
            <Stack spacing={2}>

              <TextField label="Full Name" name="name" value={form.name} onChange={handleChange} fullWidth sx={inputStyle} />

              <TextField label="Email" name="email" value={form.email} onChange={handleChange} fullWidth sx={inputStyle} />

              <TextField label="Phone" name="phone" value={form.phone} onChange={handleChange} fullWidth sx={inputStyle} />

              {role === "player" && (
                <>
                  <TextField label="Age" name="age" value={form.age} onChange={handleChange} fullWidth sx={inputStyle} />

                  <TextField label="Parent Name" name="parentName" value={form.parentName} onChange={handleChange} fullWidth sx={inputStyle} />

                  <TextField label="Parent Phone" name="parentPhone" value={form.parentPhone} onChange={handleChange} fullWidth sx={inputStyle} />
                </>
              )}

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  mt: 2,
                  borderRadius: 3,
                  background: "linear-gradient(90deg,#3b82f6,#2563eb)",
                  fontWeight: 700
                }}
              >
                {loading ? "Submitting..." : "Create Account 🚀"}
              </Button>

            </Stack>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}

const inputStyle = {
  input: { color: "white" },
  label: { color: "#aaa" },
  "& .MuiOutlinedInput-root": {
    background: "rgba(255,255,255,0.05)",
    borderRadius: 2,
    "& fieldset": {
      borderColor: "rgba(255,255,255,0.2)"
    },
    "&:hover fieldset": {
      borderColor: "#3b82f6"
    },
    "&.Mui-focused fieldset": {
      borderColor: "#60a5fa"
    }
  }
};
