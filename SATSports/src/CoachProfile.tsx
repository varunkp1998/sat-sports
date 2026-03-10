import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Stack,
  Avatar,
  Divider,
  Box,
} from "@mui/material";
import API_BASE from "./api";

function CoachProfile() {
  const userId = localStorage.getItem("userId");
  const [profile, setProfile] = useState<any>(null);

  const [name, setName] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!userId) return;

    fetch(`${API_BASE}/api/coach/profile/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        setProfile(data);
        setName(data.name || "");
      });
  }, [userId]);

  if (!profile) return <p>Loading profile...</p>;

  const saveProfile = async () => {
    setSaving(true);
    await fetch(`${API_BASE}/api/coach/profile`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        name,
      }),
    });
    alert("Profile updated");
    setSaving(false);
  };

  const changePassword = async () => {
    if (!oldPassword || !newPassword) {
      alert("Enter old and new password");
      return;
    }

    const res = await fetch(`${API_BASE}/api/coach/change-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        oldPassword,
        newPassword,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      alert(data.message || "Failed to change password");
      return;
    }

    alert("Password changed successfully");
    setOldPassword("");
    setNewPassword("");
  };

  return (
    <section style={{ background: "#f5f7fb", minHeight: "100vh", padding: 16 }}>
      <Typography variant="h4" fontWeight={800} mb={3}>
        My Profile
      </Typography>

      <Box sx={{ maxWidth: 500 }}>
        <Card sx={{ borderRadius: 3, boxShadow: "0 6px 16px rgba(0,0,0,0.08)" }}>
          <CardContent>
            <Stack spacing={2} alignItems="center">
              <Avatar sx={{ width: 80, height: 80, bgcolor: "primary.main" }}>
                {name?.[0] || "C"}
              </Avatar>

              <Typography variant="h6" fontWeight={700}>
              {profile.email}
              </Typography>

              <Divider flexItem />

              {/* Editable Name */}
              <TextField
                label="Full Name"
                fullWidth
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <Button
                variant="contained"
                onClick={saveProfile}
                disabled={saving}
              >
                Save Profile
              </Button>

              <Divider flexItem />

              {/* Change Password */}
              <Typography fontWeight={700}>Change Password</Typography>

              <TextField
                label="Old Password"
                type="password"
                fullWidth
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />

              <TextField
                label="New Password"
                type="password"
                fullWidth
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />

              <Button variant="outlined" color="error" onClick={changePassword}>
                Update Password
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </section>
  );
}

export default CoachProfile;
