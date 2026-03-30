import { useEffect, useState } from "react";
import {
  Card, CardContent, Typography, TextField, Button, Stack, Avatar, Divider, 
  Box, Alert, CircularProgress, IconButton, InputAdornment, Container, Fade,Grid
} from "@mui/material";
import { motion } from "framer-motion";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import API_BASE from "./api";

const MotionBox = motion(Box);

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

  // 1. LOAD PROFILE (Logic remains the same)
  useEffect(() => {
    if (!userId) return;
    fetch(`${API_BASE}/api/coach/profile/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        setProfile(data);
        setName(data.name || "");
      })
      .catch(() => setMessage({ type: "error", text: "Failed to sync profile data" }))
      .finally(() => setLoading(false));
  }, [userId]);

  // 2. PHOTO UPLOAD (Logic remains the same)
  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || file.size > 2 * 1024 * 1024) return;

    const formData = new FormData();
    formData.append("photo", file);
    formData.append("userId", userId || "");

    setUploading(true);
    try {
      const res = await fetch(`${API_BASE}/api/coach/upload-photo`, { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) {
        setProfile({ ...profile, photo: data.url });
        setMessage({ type: "success", text: "ID PHOTO UPDATED" });
      }
    } finally { setUploading(false); }
  };

  // 3. SAVE PROFILE & PASSWORD (Logic remains the same)
  const handleSaveProfile = async () => { /* ... (Existing save logic) ... */ };
  const handleChangePassword = async () => { /* ... (Existing password logic) ... */ };

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" height="100vh" bgcolor="#020617">
      <CircularProgress color="error" />
    </Box>
  );

  return (
    <Box sx={{ background: "#020617", minHeight: "100vh", py: 6, color: "white" }}>
      <Container maxWidth="md">
        
        {/* HEADER */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="overline" sx={{ color: "#ef4444", fontWeight: 900, letterSpacing: 3 }}>COMMAND CENTER</Typography>
          <Typography variant="h3" fontWeight={950} sx={{ letterSpacing: -1.5 }}>COACH <span style={{ color: "#ef4444" }}>PROFILE</span></Typography>
        </Box>

        {message && (
          <Fade in>
            <Alert 
              severity={message.type} 
              sx={alertStyle(message.type)}
              onClose={() => setMessage(null)}
            >
              {message.text.toUpperCase()}
            </Alert>
          </Fade>
        )}

        <Grid container spacing={4}>
          {/* PROFILE IDENTITY CARD */}
          <Grid item xs={12}>
            <MotionBox initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card sx={glassCardStyle}>
                <CardContent sx={{ p: 5 }}>
                  <Stack direction={{ xs: "column", md: "row" }} spacing={5} alignItems="center">
                    
                    {/* AVATAR SECTION */}
                    <Box sx={{ position: "relative" }}>
                      <Avatar
                        src={profile?.photo ? `${API_BASE}${profile.photo}` : ""}
                        sx={avatarStyle}
                      >
                        {name?.[0] || "C"}
                      </Avatar>
                      <input accept="image/*" style={{ display: "none" }} id="photo-upload" type="file" onChange={handlePhotoChange} />
                      <label htmlFor="photo-upload">
                        <IconButton component="span" disabled={uploading} sx={cameraBtnStyle}>
                          {uploading ? <CircularProgress size={20} color="error" /> : <PhotoCameraIcon fontSize="small" />}
                        </IconButton>
                      </label>
                    </Box>

                    {/* DETAILS SECTION */}
                    <Box sx={{ flexGrow: 1, textAlign: { xs: "center", md: "left" } }}>
                      <Typography variant="h4" fontWeight={900} sx={{ mb: 0.5 }}>{name.toUpperCase()}</Typography>
                      <Typography variant="body1" sx={{ color: "#ef4444", fontWeight: 800, letterSpacing: 1, mb: 2 }}>
                        OFFICIAL COACH ID: #{userId?.slice(-4) || "0000"}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.5, fontWeight: 700 }}>{profile?.email}</Typography>
                    </Box>
                  </Stack>

                  <Divider sx={{ my: 4, bgcolor: "rgba(255,255,255,0.05)" }} />

                  <Stack spacing={3}>
                    <TextField
                      label="DISPLAY NAME"
                      fullWidth
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      sx={darkInputStyle}
                    />
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={handleSaveProfile}
                      disabled={saving}
                      sx={primaryBtnStyle}
                    >
                      {saving ? <CircularProgress size={24} color="inherit" /> : "SYNC PROFILE DETAILS"}
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </MotionBox>
          </Grid>

          {/* SECURITY CARD */}
          <Grid item xs={12}>
            <MotionBox initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card sx={glassCardStyle}>
                <CardContent sx={{ p: 5 }}>
                  <Typography variant="h6" fontWeight={900} mb={4} sx={{ letterSpacing: 1 }}>SECURITY PROTOCOLS</Typography>
                  <Stack spacing={3}>
                    <TextField
                      label="CURRENT ACCESS KEY"
                      type={showPass ? "text" : "password"}
                      fullWidth
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      sx={darkInputStyle}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowPass(!showPass)} sx={{ color: "white" }}>
                              {showPass ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                      <TextField
                        label="NEW ACCESS KEY"
                        type="password"
                        fullWidth
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        sx={darkInputStyle}
                      />
                      <TextField
                        label="CONFIRM KEY"
                        type="password"
                        fullWidth
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        sx={darkInputStyle}
                      />
                    </Stack>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={handleChangePassword}
                      disabled={passSaving}
                      sx={secondaryBtnStyle}
                    >
                      {passSaving ? <CircularProgress size={24} color="inherit" /> : "OVERWRITE ACCESS KEY"}
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </MotionBox>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

// 💅 DESIGN SYSTEM TOKENS
const glassCardStyle = { 
  borderRadius: 6, 
  background: "rgba(255,255,255,0.03)", 
  backdropFilter: "blur(20px)", 
  border: "1px solid rgba(255,255,255,0.08)", 
  color: "white", 
  boxShadow: "0 20px 40px rgba(0,0,0,0.4)" 
};

const avatarStyle = { 
  width: 140, height: 140, 
  bgcolor: "#ef4444", 
  fontSize: "3rem", 
  fontWeight: 900,
  border: "4px solid rgba(255,255,255,0.05)",
  boxShadow: "0 0 30px rgba(239, 68, 68, 0.2)"
};

const cameraBtnStyle = {
  position: "absolute", bottom: 5, right: 5,
  bgcolor: "white", color: "black",
  boxShadow: 10, "&:hover": { bgcolor: "#ef4444", color: "white" }
};

const darkInputStyle = {
  "& .MuiOutlinedInput-root": {
    color: "white", bgcolor: "rgba(255,255,255,0.02)", borderRadius: 3, fontWeight: 700,
    "& fieldset": { borderColor: "rgba(255,255,255,0.1)" },
    "&:hover fieldset": { borderColor: "#ef4444" }
  },
  "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.5)", fontWeight: 800 }
};

const primaryBtnStyle = { 
  py: 2, borderRadius: 3, fontWeight: 950, 
  background: "linear-gradient(135deg, #f97316, #ef4444)", 
  color: "white", boxShadow: "0 10px 20px rgba(239, 68, 68, 0.2)" 
};

const secondaryBtnStyle = { 
  py: 2, borderRadius: 3, fontWeight: 950, 
  borderColor: "#ef4444", color: "#ef4444", 
  "&:hover": { borderColor: "#ff4444", bgcolor: "rgba(239, 68, 68, 0.05)", borderWidth: 1 } 
};

const alertStyle = (type: string) => ({
  mb: 4, borderRadius: 3, fontWeight: 900,
  bgcolor: type === "success" ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)",
  color: type === "success" ? "#22c55e" : "#ef4444",
  border: `1px solid ${type === "success" ? "#22c55e44" : "#ef444444"}`
});

export default CoachProfile;