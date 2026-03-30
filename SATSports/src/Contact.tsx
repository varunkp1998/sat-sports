import { Box, Typography, Grid, Button, TextField, Container, Stack, IconButton } from "@mui/material";
import { motion } from "framer-motion";
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneEnabledIcon from '@mui/icons-material/PhoneEnabled';
import SendIcon from '@mui/icons-material/Send';

const MotionBox = motion(Box);

export default function Contact() {
  return (
    <Box sx={{ background: "#020617", color: "white", minHeight: "100vh" }}>

      {/* 🎾 PREMIUM HERO */}
      <Box
        sx={{
          height: "45vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          textAlign: "center",
          background: "radial-gradient(circle at top right, rgba(239, 68, 68, 0.15), transparent), #020617",
          borderBottom: "1px solid rgba(255,255,255,0.05)"
        }}
      >
        <MotionBox initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Typography variant="h1" fontWeight={950} sx={{ fontSize: { xs: '3rem', md: '5rem' } }}>
            GET IN <span style={{ color: "#ef4444" }}>TOUCH</span>
          </Typography>
          <Typography mt={2} sx={{ color: "rgba(255,255,255,0.6)", letterSpacing: 2, fontWeight: 700 }}>
            START YOUR JOURNEY TO THE TOP
          </Typography>
        </MotionBox>
      </Box>

      <Container sx={{ py: 12 }}>
        <Grid container spacing={8}>

          {/* 📍 LEFT SIDE: CONTACT INFO */}
          <Grid item xs={12} md={5}>
            <MotionBox
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Typography variant="h3" fontWeight={900} mb={3}>
                REACH OUT
              </Typography>
              <Typography sx={{ color: "rgba(255,255,255,0.6)", mb: 6, fontSize: '1.1rem', lineHeight: 1.8 }}>
                Have questions about our elite training modules, professional pathways, or court availability? 
                Our team is ready to assist you.
              </Typography>

              <Stack spacing={4}>
                <ContactDetail 
                  icon={<EmailIcon />} 
                  title="Official Email" 
                  value="info@satsports.com" 
                />
                <ContactDetail 
                  icon={<LocationOnIcon />} 
                  title="Academy Location" 
                  value="SAT Sports Arena, Sarjapur Road, Bangalore" 
                />
                <ContactDetail 
                  icon={<PhoneEnabledIcon />} 
                  title="Direct Line" 
                  value="+91 98765 43210" 
                />
              </Stack>
            </MotionBox>
          </Grid>

          {/* 📩 RIGHT SIDE: CONTACT FORM */}
          <Grid item xs={12} md={7}>
            <MotionBox
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              sx={glassCardStyle}
            >
              <Typography variant="h5" fontWeight={800} mb={4}>
                SEND AN ENQUIRY
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Full Name" variant="outlined" sx={inputStyle} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Email Address" variant="outlined" sx={inputStyle} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Subject" variant="outlined" sx={inputStyle} />
                </Grid>
                <Grid item xs={12}>
                  <TextField 
                    fullWidth multiline rows={4} 
                    label="How can we help you?" 
                    variant="outlined" 
                    sx={inputStyle} 
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    fullWidth variant="contained" endIcon={<SendIcon />}
                    sx={{
                      py: 2, borderRadius: 4, fontWeight: 900, fontSize: '1.1rem',
                      background: "linear-gradient(135deg,#f97316,#ef4444)",
                      boxShadow: "0 10px 30px rgba(239, 68, 68, 0.4)",
                      "&:hover": { transform: "translateY(-2px)", filter: "brightness(1.1)" },
                      transition: "all 0.3s"
                    }}
                  >
                    SEND MESSAGE
                  </Button>
                </Grid>
              </Grid>
            </MotionBox>
          </Grid>
        </Grid>
      </Container>

      {/* 🗺️ LOCATION MAP SECTION */}
      <Box sx={{ height: "450px", width: "100%", filter: "grayscale(1) invert(1) contrast(0.9)", opacity: 0.6, mt: 5 }}>
        <iframe
          title="map"
          width="100%"
          height="100%"
          frameBorder="0"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.7502476563616!2d77.6749!3d12.9224!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTLCsDU1JzIwLjYiTiA3N8KwNDAnMjkuNiJF!5e0!3m2!1sen!2sin!4v1625000000000!5m2!1sen!2sin"
          allowFullScreen
        ></iframe>
      </Box>

      {/* 🚀 FINAL CTA */}
      <Box sx={{ py: 12, textAlign: "center", background: "#0f172a" }}>
        <Typography variant="h3" fontWeight={950} mb={2}>VISIT THE ARENA 🎾</Typography>
        <Typography sx={{ color: "rgba(255,255,255,0.5)", mb: 4 }}>Step onto the court where champions are made.</Typography>
        <Button 
          variant="outlined" 
          sx={{ 
            borderColor: '#ef4444', color: 'white', px: 6, py: 1.5, borderRadius: 3, fontWeight: 800,
            '&:hover': { bgcolor: '#ef4444', borderColor: '#ef4444' }
          }}
        >
          GET DIRECTIONS
        </Button>
      </Box>
    </Box>
  );
}

// 🏛️ SUB-COMPONENT FOR INFO
function ContactDetail({ icon, title, value }: { icon: any, title: string, value: string }) {
  return (
    <Stack direction="row" spacing={3} alignItems="center">
      <Box sx={{ 
        p: 1.5, bgcolor: "rgba(239, 68, 68, 0.1)", borderRadius: 3, color: "#ef4444",
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        {icon}
      </Box>
      <Box>
        <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.4)", fontWeight: 800, letterSpacing: 1 }}>
          {title.toUpperCase()}
        </Typography>
        <Typography variant="h6" fontWeight={700}>{value}</Typography>
      </Box>
    </Stack>
  );
}

// 🎨 STYLES
const glassCardStyle = {
  p: { xs: 3, md: 6 },
  borderRadius: 6,
  background: "rgba(255,255,255,0.02)",
  backdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.08)",
  boxShadow: "0 40px 100px -20px rgba(0,0,0,0.5)"
};

const inputStyle = {
  "& .MuiOutlinedInput-root": {
    color: "white",
    "& fieldset": { borderColor: "rgba(255,255,255,0.1)", borderRadius: "14px" },
    "&:hover fieldset": { borderColor: "rgba(255,255,255,0.3)" },
    "&.Mui-focused fieldset": { borderColor: "#ef4444" },
    bgcolor: "rgba(255,255,255,0.02)"
  },
  "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.5)" },
  "& .MuiInputLabel-root.Mui-focused": { color: "#ef4444" }
};