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
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import API_BASE from "./api";

function CoachProfile() {
  const userId = localStorage.getItem("userId");

  // Data States
  const [profile, setProfile] = useState<any>(null);
  const [name, setName] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI States
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [passSaving, setPassSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // 1. LOAD PROFILE
  useEffect(() => {
    if (!userId) return;

    fetch(`${API_BASE}/api/coach/profile/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        setProfile(data);
        setName(data.name || "");
      })
      .catch(() => setMessage({ type: "error", text: "Failed to load profile data" }))
      .finally(() => setLoading(false));
  }, [userId]);

  // 2. HANDLE PHOTO UPLOAD
  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: "error", text: "Image must be less than 2MB" });
      return;
    }

    const formData = new FormData();
    formData.append("photo", file);
    formData.append("userId", userId || "");

    setUploading(true);
    setMessage(null);

    try {
      const res = await fetch(`${API_BASE}/api/coach/upload-photo`, {
        method: "POST",
        body: formData, // Browser handles Content-Type for FormData
      });

      const data = await res.json();
      if (res.ok) {
        setProfile({ ...profile, photo: data.url });
        setMessage({ type: "success", text: "Profile photo updated!" });
      } else {
        setMessage({ type: "error", text: data.message || "Upload failed" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Connection error during upload" });
    } finally {
      setUploading(false);
    }
  };

  // 3. SAVE PROFILE NAME
  const handleSaveProfile = async () => {
    if (!name.trim()) return setMessage({ type: "error", text: "Name cannot be empty" });

    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`${API_BASE}/api/coach/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, name }),
      });
      if (res.ok) {
        setMessage({ type: "success", text: "Profile updated successfully!" });
        localStorage.setItem("username", name);
      }
    } catch (err) {
      setMessage({ type: "error", text: "Connection error. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  // 4. CHANGE PASSWORD
  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword) return setMessage({ type: "error", text: "Please fill all password fields" });
    if (newPassword !== confirmPassword) return setMessage({ type: "error", text: "New passwords do not match" });
    if (newPassword.length < 6) return setMessage({ type: "error", text: "Password must be at least 6 characters" });

    setPassSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`${API_BASE}/api/coach/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, oldPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.message || "Failed to change password" });
      } else {
        setMessage({ type: "success", text: "Password changed successfully!" });
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      setMessage({ type: "error", text: "Server error. Try again later." });
    } finally {
      setPassSaving(false);
    }
  };

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
      <CircularProgress color="error" />
    </Box>
  );

  return (
    <Box sx={{ background: "#f8fafc", minHeight: "100vh", p: { xs: 2, md: 4 } }}>
      <Typography variant="h4" fontWeight={900} mb={1} color="#111827">
        My Profile
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={4}>
        Update your personal details and secure your account.
      </Typography>

      <Box sx={{ maxWidth: 600 }}>
        {message && (
          <Alert severity={message.type} sx={{ mb: 3, borderRadius: 2 }}>
            {message.text}
          </Alert>
        )}

        <Stack spacing={4}>
          {/* PROFILE CARD */}
          <Card sx={{ borderRadius: 4, border: "1px solid #e2e8f0", boxShadow: "none" }}>
            <CardContent sx={{ p: 4 }}>
              <Stack spacing={3} alignItems="center">
                
                {/* PHOTO UPLOAD AREA */}
                <Box sx={{ position: "relative" }}>
                  <Avatar
                    src={profile?.photo ? `${API_BASE}${profile.photo}` : ""}
                    sx={{ width: 110, height: 110, bgcolor: "#800000", fontSize: "2.5rem", fontWeight: 800 }}
                  >
                    {name?.[0] || "C"}
                  </Avatar>
                  <input
                    accept="image/*"
                    style={{ display: "none" }}
                    id="profile-photo-upload"
                    type="file"
                    onChange={handlePhotoChange}
                  />
                  <label htmlFor="profile-photo-upload">
                    <IconButton
                      component="span"
                      disabled={uploading}
                      sx={{
                        position: "absolute", bottom: 0, right: 0,
                        bgcolor: "#fff", boxShadow: 3,
                        "&:hover": { bgcolor: "#f3f4f6" },
                      }}
                    >
                      {uploading ? <CircularProgress size={20} color="error" /> : <PhotoCameraIcon color="primary" />}
                    </IconButton>
                  </label>
                </Box>

                <Box textAlign="center">
                  <Typography variant="h6" fontWeight={800}>{profile?.email}</Typography>
                  <Typography variant="body2" color="text.secondary">Coach Access Level</Typography>
                </Box>

                <Divider sx={{ width: "100%" }} />

                <TextField
                  label="Full Name"
                  fullWidth
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  sx={{ bgcolor: "#fff" }}
                />

                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleSaveProfile}
                  disabled={saving}
                  sx={{ bgcolor: "#800000", py: 1.5, fontWeight: 700, "&:hover": { bgcolor: "#600000" } }}
                >
                  {saving ? <CircularProgress size={24} color="inherit" /> : "Update Name"}
                </Button>
              </Stack>
            </CardContent>
          </Card>

          {/* PASSWORD CARD */}
          <Card sx={{ borderRadius: 4, border: "1px solid #e2e8f0", boxShadow: "none" }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" fontWeight={800} mb={3}>Change Password</Typography>
              <Stack spacing={2.5}>
                <TextField
                  label="Current Password"
                  type={showPass ? "text" : "password"}
                  fullWidth
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPass(!showPass)} edge="end">
                          {showPass ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  label="New Password"
                  type="password"
                  fullWidth
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <TextField
                  label="Confirm New Password"
                  type="password"
                  fullWidth
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  error={newPassword !== confirmPassword && confirmPassword !== ""}
                  helperText={newPassword !== confirmPassword && confirmPassword !== "" ? "Passwords do not match" : ""}
                />
                <Button
                  fullWidth
                  variant="outlined"
                  color="error"
                  onClick={handleChangePassword}
                  disabled={passSaving}
                  sx={{ py: 1.5, fontWeight: 700, borderWidth: 2, "&:hover": { borderWidth: 2 } }}
                >
                  {passSaving ? <CircularProgress size={24} color="inherit" /> : "Update Password"}
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Box>
    </Box>
  );
}

export default CoachProfile;