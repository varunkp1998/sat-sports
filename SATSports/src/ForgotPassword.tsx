import { useState } from "react";
import { Box, Card, CardContent, TextField, Button, Typography, Stack } from "@mui/material";
import API_BASE from "./api";

export default function ForgotPassword() {
  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");

  const sendOtp = async () => {
    await fetch(`${API_BASE}/api/auth/send-otp`, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ email })
    });
    setStep(2);
  };

  const resetPassword = async () => {
    const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ email, otp, newPassword: password })
    });

    if (!res.ok) return alert("Invalid OTP");

    alert("Password reset successful");
    window.location.href = "/login";
  };

  return (
    <Box display="flex" justifyContent="center" mt={10}>
      <Card sx={{ width: 400 }}>
        <CardContent>

          <Typography variant="h5" mb={2}>
            🔐 Forgot Password
          </Typography>

          <Stack spacing={2}>

            <TextField
              label="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />

            {step === 1 && (
              <Button variant="contained" onClick={sendOtp}>
                Send OTP
              </Button>
            )}

            {step === 2 && (
              <>
                <TextField
                  label="OTP"
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                />

                <TextField
                  label="New Password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />

                <Button variant="contained" color="error" onClick={resetPassword}>
                  Reset Password
                </Button>
              </>
            )}

          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}