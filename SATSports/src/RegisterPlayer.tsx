import { useState } from "react";
import { 
  Box, Typography, TextField, Button, Stack, Card, 
  CardContent, Container, InputAdornment, IconButton, Divider 
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import CakeIcon from "@mui/icons-material/Cake";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import { motion } from "framer-motion";
import API_BASE from "./api";

const MotionBox = motion(Box);

export default function RegisterPlayer() {
  const queryParams = new URLSearchParams(window.location.search);
  const programId = queryParams.get("programId");
  const programName = queryParams.get("programName");

  const [form, setForm] = useState({
    name: "", email: "", phone: "", age: "",
    parentName: "", parentPhone: "", programId: programId || "",
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
    alert(`Application for ${programName || 'Program'} submitted!`);
    window.location.href = "/programs"; 
  };

  return (
    <Box sx={{ 
      background: "#020617", 
      minHeight: "100vh", 
      display: "flex", 
      alignItems: "center", 
      py: 6,
      color: "white" 
    }}>
      <Container maxWidth="sm">
        {/* BACK BUTTON */}
        <IconButton 
          onClick={() => window.history.back()} 
          sx={{ color: "white", mb: 2, "&:hover": { bgcolor: "rgba(255,255,255,0.1)" } }}
        >
          <ArrowBackIcon />
        </IconButton>

        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* HEADER SECTION */}
          <Box sx={{ mb: 4, textAlign: "center" }}>
            <Typography variant="h3" fontWeight={900} sx={{ letterSpacing: -1, textTransform: 'uppercase' }}>
              Join the <span style={{ color: "#ef4444" }}>Academy</span>
            </Typography>
            <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.6)" }}>
              Complete the form below to secure your spot.
            </Typography>
          </Box>

          {/* THE ENROLLMENT BANNER */}
          {programName && (
            <Box sx={{ 
              mb: 3, p: 2, borderRadius: 3, textAlign: 'center',
              background: "linear-gradient(90deg, rgba(239, 68, 68, 0.1), rgba(249, 115, 22, 0.1))",
              border: "1px solid rgba(239, 68, 68, 0.3)"
            }}>
              <Typography variant="caption" sx={{ color: "#f97316", fontWeight: 800, letterSpacing: 1.5 }}>
                SELECTED PROGRAM
              </Typography>
              <Typography variant="h6" fontWeight={800}>{programName.toUpperCase()}</Typography>
            </Box>
          )}

          {/* REGISTRATION FORM CARD */}
          <Card sx={{ 
            borderRadius: 6, 
            background: "rgba(255,255,255,0.03)", 
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)"
          }}>
            <CardContent sx={{ p: { xs: 3, md: 5 } }}>
              <Stack spacing={3}>
                
                {/* FIELD STYLING - Using custom InputProps for Dark Theme */}
                <Typography variant="subtitle2" color="rgba(255,255,255,0.5)" fontWeight={700}>PLAYER INFORMATION</Typography>
                
                <TextField 
                  fullWidth label="Full Name" name="name" onChange={handleChange}
                  variant="outlined" InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon sx={{color: '#ef4444'}}/></InputAdornment> }}
                  sx={inputStyles}
                />

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField 
                    fullWidth label="Email" name="email" onChange={handleChange}
                    InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon sx={{color: '#ef4444'}}/></InputAdornment> }}
                    sx={inputStyles}
                  />
                  <TextField 
                    fullWidth label="Age" name="age" type="number" onChange={handleChange}
                    InputProps={{ startAdornment: <InputAdornment position="start"><CakeIcon sx={{color: '#ef4444'}}/></InputAdornment> }}
                    sx={inputStyles}
                  />
                </Stack>

                <TextField 
                  fullWidth label="Phone Number" name="phone" onChange={handleChange}
                  InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIcon sx={{color: '#ef4444'}}/></InputAdornment> }}
                  sx={inputStyles}
                />

                <Divider sx={{ borderColor: "rgba(255,255,255,0.1)", my: 1 }} />

                <Typography variant="subtitle2" color="rgba(255,255,255,0.5)" fontWeight={700}>PARENT / GUARDIAN (Optional)</Typography>

                <TextField 
                  fullWidth label="Parent Name" name="parentName" onChange={handleChange}
                  InputProps={{ startAdornment: <InputAdornment position="start"><SupervisorAccountIcon sx={{color: '#ef4444'}}/></InputAdornment> }}
                  sx={inputStyles}
                />

                <Button 
                  onClick={submit}
                  fullWidth 
                  size="large"
                  variant="contained" 
                  sx={{ 
                    py: 2, borderRadius: 4, fontWeight: 900, fontSize: '1.1rem',
                    background: "linear-gradient(135deg, #f97316, #ef4444)",
                    boxShadow: "0 10px 25px rgba(239, 68, 68, 0.4)",
                    "&:hover": { filter: "brightness(1.1)", transform: "scale(1.02)" },
                    transition: "all 0.3s"
                  }}
                >
                  SUBMIT APPLICATION
                </Button>

                <Typography variant="caption" textAlign="center" sx={{ opacity: 0.5 }}>
                  By submitting, you agree to SAT Sports terms and conditions.
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </MotionBox>
      </Container>
    </Box>
  );
}

// Reusable custom styles for the Dark TextFields
const inputStyles = {
  "& .MuiOutlinedInput-root": {
    color: "white",
    "& fieldset": { borderColor: "rgba(255,255,255,0.1)", borderRadius: "12px" },
    "&:hover fieldset": { borderColor: "rgba(255,255,255,0.3)" },
    "&.Mui-focused fieldset": { borderColor: "#ef4444" },
    bgcolor: "rgba(255,255,255,0.02)"
  },
  "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.5)" },
  "& .MuiInputLabel-root.Mui-focused": { color: "#ef4444" }
};