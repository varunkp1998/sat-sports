import { useEffect, useState } from "react";
import {
  Box, Button, Card, Typography, Select, MenuItem, Table, TableHead, 
  TableRow, TableCell, TableBody, Grid, Container, Stack, Paper, 
  InputLabel, FormControl, IconButton, useTheme, useMediaQuery, 
  Modal, Fade, Backdrop, Divider
} from "@mui/material";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import HistoryIcon from "@mui/icons-material/History";
import ReceiptIcon from "@mui/icons-material/Receipt";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { motion, AnimatePresence } from "framer-motion";
import API_BASE from "./api";

const MotionBox = motion(Box);

declare global { interface Window { Razorpay: any; } }

export default function PlayerPayments() {
  const [plan, setPlan] = useState("monthly");
  const [sessions, setSessions] = useState(8);
  const [programs, setPrograms] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState("");
  const [pricing, setPricing] = useState([]);
  const [amount, setAmount] = useState(0);
  const [payments, setPayments] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const playerId = localStorage.getItem("userId");

  // Load Initial Data
  useEffect(() => {
    fetch(`${API_BASE}/api/programs`).then(res => res.json()).then(setPrograms);
    fetch(`${API_BASE}/api/player/payments/${playerId}`).then(res => res.json()).then(setPayments);
  }, [playerId]);

  // Load Pricing when program changes
  useEffect(() => {
    if (!selectedProgram) return;
    fetch(`${API_BASE}/api/programs/${selectedProgram}/pricing`)
      .then(res => res.json())
      .then(data => setPricing(data));
  }, [selectedProgram]);

  // Calculate Amount
  useEffect(() => {
    const p = pricing.find(p => p.sessions_per_month === sessions);
    if (!p) return;
    const priceMap: any = { weekly: p.price_weekly, monthly: p.price_monthly, yearly: p.price_yearly };
    setAmount(priceMap[plan] || 0);
  }, [plan, sessions, pricing]);

  const handlePayment = async () => {
    if (!window.Razorpay) { alert("Razorpay SDK not loaded"); return; }

    const res = await fetch(`${API_BASE}/api/payment/create-order`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ amount, plan, playerId, programId: selectedProgram, sessions })
    });

    const order = await res.json();

    const options = {
      key: "rzp_test_YOUR_KEY", // Replace with your actual key
      amount: order.amount,
      currency: "INR",
      name: "SAT Sports Academy",
      description: `${sessions} sessions - ${plan}`,
      order_id: order.id,
      theme: { color: "#ef4444" },
      handler: async (response: any) => {
        await fetch(`${API_BASE}/api/payment/verify`, {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({ ...response, playerId, plan, amount, programId: selectedProgram, sessions })
        });
        setShowSuccess(true); // Trigger Success Modal
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#020617", color: "white", py: { xs: 4, md: 8 } }}>
      <Container maxWidth="lg">
        
        <Stack direction="row" alignItems="center" spacing={2} mb={6}>
          <AccountBalanceWalletIcon sx={{ fontSize: 40, color: "#ef4444" }} />
          <Typography variant="h3" fontWeight={900} sx={{ letterSpacing: -1 }}>PAYMENTS</Typography>
        </Stack>

        <Grid container spacing={4}>
          {/* 🔥 LEFT: PAYMENT SETUP */}
          <Grid item xs={12} md={5}>
            <MotionBox initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <Card sx={glassStyle}>
                <Typography variant="h6" fontWeight={800} mb={3}>Subscription Setup</Typography>
                
                <Stack spacing={3}>
                  <FormControl fullWidth sx={selectStyle}>
                    <InputLabel>Select Program</InputLabel>
                    <Select value={selectedProgram} label="Select Program" onChange={(e) => setSelectedProgram(e.target.value)}>
                      {programs.map(p => <MenuItem key={p.id} value={p.id}>{p.title}</MenuItem>)}
                    </Select>
                  </FormControl>

                  <Stack direction="row" spacing={2}>
                    <FormControl fullWidth sx={selectStyle}>
                      <InputLabel>Sessions</InputLabel>
                      <Select value={sessions} label="Sessions" onChange={(e) => setSessions(Number(e.target.value))}>
                        <MenuItem value={8}>8 Sessions</MenuItem>
                        <MenuItem value={12}>12 Sessions</MenuItem>
                      </Select>
                    </FormControl>

                    <FormControl fullWidth sx={selectStyle}>
                      <InputLabel>Plan</InputLabel>
                      <Select value={plan} label="Plan" onChange={(e) => setPlan(e.target.value)}>
                        <MenuItem value="weekly">Weekly</MenuItem>
                        <MenuItem value="monthly">Monthly</MenuItem>
                        <MenuItem value="yearly">Yearly</MenuItem>
                      </Select>
                    </FormControl>
                  </Stack>

                  <Box sx={{ p: 3, borderRadius: 4, bgcolor: "rgba(255,255,255,0.05)", textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <Typography variant="caption" color="rgba(255,255,255,0.5)" sx={{ letterSpacing: 1 }}>TOTAL DUE</Typography>
                    <Typography variant="h3" fontWeight={900} color="#ef4444">₹{amount}</Typography>
                  </Box>

                  <Button
                    variant="contained" fullWidth size="large" onClick={handlePayment} disabled={!amount}
                    sx={{
                      py: 2, borderRadius: 4, fontWeight: 900, fontSize: '1.1rem',
                      background: "linear-gradient(135deg, #f97316, #ef4444)",
                      boxShadow: "0 10px 30px rgba(239, 68, 68, 0.4)",
                      "&:hover": { filter: "brightness(1.1)", transform: "translateY(-2px)" },
                      transition: "all 0.3s"
                    }}
                  >
                    PROCEED TO PAY
                  </Button>
                </Stack>
              </Card>
            </MotionBox>
          </Grid>

          {/* 🔥 RIGHT: TRANSACTION HISTORY */}
          <Grid item xs={12} md={7}>
            <MotionBox initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                <HistoryIcon sx={{ color: "rgba(255,255,255,0.5)" }} />
                <Typography variant="h6" fontWeight={700}>Transaction History</Typography>
              </Stack>

              <Paper sx={{ ...glassStyle, p: 0, overflow: 'hidden' }}>
                <Table size={isMobile ? "small" : "medium"}>
                  <TableHead sx={{ bgcolor: "rgba(255,255,255,0.05)" }}>
                    <TableRow>
                      <TableCell sx={headerStyle}>Program & Date</TableCell>
                      <TableCell sx={headerStyle}>Sessions</TableCell>
                      <TableCell sx={headerStyle}>Amount</TableCell>
                      <TableCell align="right" sx={headerStyle}>Invoice</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {payments.map((p, i) => (
                      <TableRow key={i} sx={{ "&:hover": { bgcolor: "rgba(255,255,255,0.02)" } }}>
                        <TableCell sx={cellStyle}>
                            <Typography variant="body2" fontWeight={800}>{p.program_name}</Typography>
                            <Typography variant="caption" color="gray">{new Date(p.date).toLocaleDateString()}</Typography>
                        </TableCell>
                        <TableCell sx={cellStyle}>{p.sessions} Sessions</TableCell>
                        <TableCell sx={cellStyle}><Typography fontWeight={800} color="#ef4444">₹{p.amount}</Typography></TableCell>
                        <TableCell align="right" sx={cellStyle}>
                          <IconButton href={p.invoice_url} target="_blank" sx={{ color: "white", "&:hover": { color: "#ef4444" } }}>
                            <ReceiptIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                    {payments.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 6, color: 'rgba(255,255,255,0.3)' }}>No payment records found.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Paper>
            </MotionBox>
          </Grid>
        </Grid>
      </Container>

      {/* 🟢 SUCCESS MODAL */}
      <Modal
        open={showSuccess}
        onClose={() => { setShowSuccess(false); window.location.reload(); }}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{ timeout: 500, sx: { backdropFilter: 'blur(10px)' } }}
      >
        <Fade in={showSuccess}>
          <Box sx={modalStyle}>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15 }}>
              <CheckCircleOutlineIcon sx={{ fontSize: 100, color: '#22c55e', mb: 2 }} />
            </motion.div>
            <Typography variant="h4" fontWeight={900} mb={1}>Payment Success!</Typography>
            <Typography color="rgba(255,255,255,0.6)" mb={4}>Your training sessions have been updated. Get ready for the court!</Typography>
            <Button 
              fullWidth variant="contained" 
              onClick={() => { setShowSuccess(false); window.location.reload(); }}
              sx={{ bgcolor: '#22c55e', py: 1.5, borderRadius: 3, fontWeight: 800, '&:hover': { bgcolor: '#16a34a' } }}
            >
              DONE
            </Button>
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
}

// 🎨 COMPONENT STYLES
const glassStyle = {
  p: 4, borderRadius: 6, background: "rgba(255,255,255,0.03)", backdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.08)", color: "white", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)"
};

const selectStyle = {
  "& .MuiOutlinedInput-root": {
    color: "white",
    "& fieldset": { borderColor: "rgba(255,255,255,0.1)", borderRadius: "14px" },
    "&:hover fieldset": { borderColor: "rgba(255,255,255,0.3)" },
    "&.Mui-focused fieldset": { borderColor: "#ef4444" },
    bgcolor: "rgba(255,255,255,0.02)"
  },
  "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.5)" },
  "& .MuiInputLabel-root.Mui-focused": { color: "#ef4444" },
  "& .MuiSelect-icon": { color: "white" }
};

const modalStyle = {
  position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
  width: 380, bgcolor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 10, p: 5, textAlign: 'center', outline: 'none'
};

const headerStyle = { color: "rgba(255,255,255,0.4)", fontWeight: 800, borderBottom: "1px solid rgba(255,255,255,0.1)", textTransform: 'uppercase', fontSize: '0.75rem' };
const cellStyle = { color: "white", borderBottom: "1px solid rgba(255,255,255,0.05)", py: 2.5 };