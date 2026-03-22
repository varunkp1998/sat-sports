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

export default function Signup() {
  const [role, setRole] = useState("player");

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

  const submit = () => {
    console.log(form, role);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundImage: `
          linear-gradient(rgba(5,10,25,0.85), rgba(5,10,25,0.95)),
          url('/tennis-bg.jpg')
        `,
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2
      }}
    >
      {/* GLASS CARD */}
      <Card
        sx={{
          width: "100%",
          maxWidth: 520,
          borderRadius: 5,
          backdropFilter: "blur(30px)",
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.15)",
          boxShadow: "0 40px 100px rgba(0,0,0,0.9)",
          color: "white",
          animation: "fadeIn 0.8s ease",
          "@keyframes fadeIn": {
            from: { opacity: 0, transform: "translateY(20px)" },
            to: { opacity: 1, transform: "translateY(0)" }
          }
        }}
      >
        <CardContent sx={{ p: 4 }}>

          {/* LOGO */}
          <Box textAlign="center" mb={2}>
            <Box
              component="img"
              src="/logo.png"
              sx={{
                height: 70,
                animation: "float 4s ease-in-out infinite",
                "@keyframes float": {
                  "0%": { transform: "translateY(0px)" },
                  "50%": { transform: "translateY(-8px)" },
                  "100%": { transform: "translateY(0px)" }
                },
                filter: "drop-shadow(0 10px 30px rgba(0,0,0,0.8))"
              }}
            />
            <Typography mt={1} color="gray">
              Join the next generation 🎾
            </Typography>
          </Box>

          {/* TOGGLE SWITCH */}
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

          {/* FORM */}
          <Stack spacing={2}>
            <TextField
              label="Full Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              fullWidth
              sx={inputStyle}
            />

            <TextField
              label="Email"
              name="email"
              value={form.email}
              onChange={handleChange}
              fullWidth
              sx={inputStyle}
            />

            <TextField
              label="Phone"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              fullWidth
              sx={inputStyle}
            />

            {role === "player" && (
              <>
                <TextField
                  label="Age"
                  name="age"
                  value={form.age}
                  onChange={handleChange}
                  fullWidth
                  sx={inputStyle}
                />

                <TextField
                  label="Parent Name"
                  name="parentName"
                  value={form.parentName}
                  onChange={handleChange}
                  fullWidth
                  sx={inputStyle}
                />

                <TextField
                  label="Parent Phone"
                  name="parentPhone"
                  value={form.parentPhone}
                  onChange={handleChange}
                  fullWidth
                  sx={inputStyle}
                />
              </>
            )}

            {/* BUTTON */}
            <Button
              variant="contained"
              size="large"
              onClick={submit}
              sx={{
                mt: 2,
                borderRadius: 3,
                background: "linear-gradient(90deg,#3b82f6,#2563eb)",
                fontWeight: 700,
                boxShadow: "0 15px 40px rgba(37,99,235,0.6)",
                "&:hover": {
                  background: "linear-gradient(90deg,#2563eb,#1d4ed8)"
                }
              }}
            >
              Create Account 🚀
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}

// 🔥 GLASS INPUT STYLE
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