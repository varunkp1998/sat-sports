import { useEffect, useState } from "react";
import { 
  Box, Typography, Grid, Button, Stack, Chip, Divider, 
  Modal, Backdrop, Fade, TextField, IconButton, CircularProgress 
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { motion } from "framer-motion";
import API_BASE from "./api";

const MotionBox = motion(Box);
declare var Razorpay: any;

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<any[]>([]);
  
  // Selection State
  const [selectedProgram, setSelectedProgram] = useState<any>(null);
  const [selectedSubCat, setSelectedSubCat] = useState<any>(null);
  const [step, setStep] = useState(1); // 1: Level Select, 2: Player Info
  
  // Registration Form State
  const [form, setForm] = useState({
    name: "", email: "", phone: "", age: "", parentName: "", parentPhone: ""
  });

  useEffect(() => {
    fetch(`${API_BASE}/api/programs`)
      .then(res => res.json())
      .then(async (data) => {
        const detailed = await Promise.all(data.map(async (p: any) => {
          const subRes = await fetch(`${API_BASE}/api/programs/${p.id}/subcategories`);
          const subData = await subRes.json();
          return { ...p, subcategories: subData };
        }));
        setPrograms(detailed);
      });
  }, []);

  const handleOpen = (p: any) => {
    setSelectedProgram(p);
    setStep(1);
  };

  const handleClose = () => {
    setSelectedProgram(null);
    setSelectedSubCat(null);
    setStep(1);
  };

  const handleLevelSelect = (sc: any) => {
    setSelectedSubCat(sc);
    setStep(2);
  };

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 💳 FINAL SUBMIT & PAYMENT
  const handleFinalSubmit = async () => {
    if (!form.name || !form.email || !form.age) {
      alert("Please fill in Name, Email and Age");
      return;
    }

    // Here you would trigger Razorpay
    // On Payment Success, you'd call your /api/applications endpoint
    console.log("Submitting registration for:", selectedSubCat.name, form);
    alert("Proceeding to Payment Gateway...");
  };

  return (
    <Box sx={{ background: "#020617", color: "white", minHeight: "100vh" }}>
      
      {/* ... (Keep your HERO and CATEGORY GRID logic from previous code) ... */}
      
      {/* REPLACE YOUR PROGRAM BUTTON WITH THIS */}
      <Button 
        fullWidth variant="contained" 
        onClick={() => handleOpen(p)}
        sx={{ bgcolor: "#ef4444", fontWeight: 800 }}
      >
        View Levels & Register
      </Button>

      {/* 🎾 INTEGRATED REGISTRATION MODAL */}
      <Modal open={Boolean(selectedProgram)} onClose={handleClose} closeAfterTransition>
        <Fade in={Boolean(selectedProgram)}>
          <Box sx={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            width: { xs: '95%', md: 550 }, bgcolor: '#0f172a', p: 4, borderRadius: 6, color: 'white',
            border: '1px solid rgba(255,255,255,0.1)', maxHeight: '90vh', overflowY: 'auto'
          }}>
            
            {/* MODAL HEADER */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
              <Stack direction="row" alignItems="center" spacing={1}>
                {step === 2 && (
                  <IconButton onClick={() => setStep(1)} sx={{ color: 'white' }}>
                    <ArrowBackIcon />
                  </IconButton>
                )}
                <Typography variant="h5" fontWeight={900}>
                  {step === 1 ? "Select Your Level" : "Player Details"}
                </Typography>
              </Stack>
              <IconButton onClick={handleClose} sx={{ color: 'white' }}><CloseIcon /></IconButton>
            </Stack>

            {/* STEP 1: SELECT SUB-CATEGORY (LEVEL) */}
            {step === 1 && (
              <Stack spacing={2}>
                <Typography variant="body2" color="gray">Pick the stage appropriate for the student.</Typography>
                {selectedProgram?.subcategories?.map((sc: any) => (
                  <Box key={sc.id} onClick={() => handleLevelSelect(sc)} sx={{
                    p: 2.5, borderRadius: 3, border: '1px solid rgba(255,255,255,0.1)',
                    cursor: 'pointer', transition: '0.2s',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.05)', borderColor: '#ef4444' }
                  }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="h6" fontWeight={800}>{sc.name}</Typography>
                        <Typography variant="caption" color="gray">{sc.description || "Skill development stage"}</Typography>
                      </Box>
                      <Chip label={`${sc.min_age}-${sc.max_age} yrs`} size="small" variant="outlined" sx={{ color: 'white' }} />
                    </Stack>
                  </Box>
                ))}
              </Stack>
            )}

            {/* STEP 2: REGISTRATION FORM (FROM YOUR RegisterPlayer.tsx) */}
            {step === 2 && (
              <Stack spacing={2.5}>
                <Box sx={{ p: 2, bgcolor: 'rgba(239, 68, 68, 0.1)', borderRadius: 2, border: '1px solid #ef4444' }}>
                  <Typography variant="caption" fontWeight={800} color="#ef4444">ENROLLING IN:</Typography>
                  <Typography variant="body1" fontWeight={700}>{selectedProgram.title} - {selectedSubCat.name}</Typography>
                </Box>

                <TextField fullWidth label="Student Name" name="name" variant="filled" 
                  sx={{ bgcolor: 'white', borderRadius: 1 }} onChange={handleChange} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField fullWidth label="Email" name="email" variant="filled" 
                      sx={{ bgcolor: 'white', borderRadius: 1 }} onChange={handleChange} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField fullWidth label="Phone" name="phone" variant="filled" 
                      sx={{ bgcolor: 'white', borderRadius: 1 }} onChange={handleChange} />
                  </Grid>
                </Grid>

                <TextField fullWidth label="Age" type="number" name="age" variant="filled" 
                  sx={{ bgcolor: 'white', borderRadius: 1 }} onChange={handleChange} />

                <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }}>Parent Info (Optional)</Divider>

                <TextField fullWidth label="Parent Name" name="parentName" variant="filled" 
                  sx={{ bgcolor: 'white', borderRadius: 1 }} onChange={handleChange} />
                
                <Button 
                  fullWidth size="large" variant="contained" 
                  sx={{ py: 2, fontWeight: 900, bgcolor: '#ef4444', mt: 2 }}
                  onClick={handleFinalSubmit}
                >
                  Confirm & Proceed to Payment
                </Button>
              </Stack>
            )}
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
}