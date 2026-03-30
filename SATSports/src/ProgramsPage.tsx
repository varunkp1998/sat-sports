import { useEffect, useState } from "react";
import { 
    Box, 
    Typography, 
    Grid, 
    Button, 
    Stack, 
    Chip, 
    Divider, 
    Modal, 
    Backdrop, 
    Fade, 
    ToggleButton, 
    ToggleButtonGroup, 
    CircularProgress,
    IconButton,
    Card // <--- ADD THIS ONE
  } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";
import { motion } from "framer-motion";
import API_BASE from "./api";

const MotionBox = motion(Box);

// Declare Razorpay for TypeScript
declare var Razorpay: any;

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<any[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<any>(null);
  const [selectedSubCat, setSelectedSubCat] = useState<any>(null);
  const [sessionCount, setSessionCount] = useState<number>(8);
  const [pricing, setPricing] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // 1. LOAD DATA
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

  const handleSelectSubCat = async (sc: any) => {
    setSelectedSubCat(sc);
    const res = await fetch(`${API_BASE}/api/subcategories/${sc.id}/pricing`);
    const data = await res.json();
    setPricing(data);
  };

  // 💳 RAZORPAY PAYMENT HANDLER
  const handlePayment = async (plan: string, amount: number) => {
    setLoading(true);
    try {
      // Step A: Create Order on Backend
      const orderRes = await fetch(`${API_BASE}/api/payment/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount })
      });
      const order = await orderRes.json();

      // Step B: Razorpay Checkout Options
      const options = {
        key: "YOUR_RAZORPAY_KEY_ID", // Replace with your actual Key ID
        amount: order.amount,
        currency: order.currency,
        name: "SAT Sports Academy",
        description: `${selectedProgram.title} - ${selectedSubCat.name} (${plan})`,
        order_id: order.id,
        handler: async (response: any) => {
          // Step C: Verify on Backend
          const verifyRes = await fetch(`${API_BASE}/api/payment/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...response,
              playerId: 1, // You should get this from your Auth context/User state
              programId: selectedProgram.id,
              sessions: sessionCount,
              amount: amount,
              plan: plan
            })
          });
          const result = await verifyRes.json();
          if (result.success) {
            alert("Payment Successful! Your invoice is ready.");
            window.location.href = result.invoice_url;
          }
        },
        prefill: {
          name: "Player Name", // Get from user profile
          email: "player@example.com"
        },
        theme: { color: "#800000" }
      };

      const rzp = new Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Payment failed", err);
      alert("Payment initiation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ background: "#020617", color: "white", minHeight: "100vh" }}>
      {/* ... HERO & PROGRAM GRID (Keep your existing UI here) ... */}
      
      <Box sx={{ px: { xs: 2, md: 10 }, py: 8 }}>
        <Grid container spacing={4}>
          {programs.map((p) => (
            <Grid item xs={12} md={4} key={p.id}>
              <Card sx={{ bgcolor: "rgba(255,255,255,0.05)", p: 3, borderRadius: 4, color: 'white' }}>
                 <Typography variant="h5" fontWeight={900}>{p.title}</Typography>
                 <Button 
                   fullWidth variant="contained" 
                   sx={{ mt: 2, bgcolor: '#ef4444' }}
                   onClick={() => setSelectedProgram(p)}
                 >
                   Register Now
                 </Button>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* 🧩 REGISTRATION MODAL */}
      <Modal open={Boolean(selectedProgram)} onClose={() => !loading && setSelectedProgram(null)}>
        <Fade in={Boolean(selectedProgram)}>
          <Box sx={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            width: { xs: '95%', md: 550 }, bgcolor: '#0f172a', p: 4, borderRadius: 6, color: 'white',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <Stack direction="row" justifyContent="space-between" mb={2}>
              <Typography variant="h5" fontWeight={900}>Enrollment</Typography>
              <IconButton onClick={() => setSelectedProgram(null)} sx={{ color: 'white' }}><CloseIcon /></IconButton>
            </Stack>

            {/* LEVEL SELECTION */}
            <Typography variant="subtitle2" mb={1} color="gray">SELECT LEVEL</Typography>
            <Stack direction="row" spacing={1} mb={3} sx={{ overflowX: 'auto', pb: 1 }}>
              {selectedProgram?.subcategories?.map((sc: any) => (
                <Chip 
                  key={sc.id} label={sc.name} 
                  onClick={() => handleSelectSubCat(sc)}
                  sx={{ 
                    bgcolor: selectedSubCat?.id === sc.id ? '#ef4444' : 'rgba(255,255,255,0.1)',
                    color: 'white', fontWeight: 700, p: 2
                  }}
                />
              ))}
            </Stack>

            {selectedSubCat && (
              <>
                <Typography variant="subtitle2" mb={1} color="gray">FREQUENCY</Typography>
                <ToggleButtonGroup
                  value={sessionCount} exclusive fullWidth
                  onChange={(_, v) => v && setSessionCount(v)}
                  sx={{ mb: 3, bgcolor: 'rgba(255,255,255,0.05)' }}
                >
                  <ToggleButton value={8} sx={{ color: 'white' }}>8 Sessions</ToggleButton>
                  <ToggleButton value={12} sx={{ color: 'white' }}>12 Sessions</ToggleButton>
                </ToggleButtonGroup>

                <Typography variant="subtitle2" mb={1} color="gray">CHOOSE A PLAN</Typography>
                <Stack spacing={2}>
                  {['weekly', 'monthly', 'yearly'].map(plan => {
                    const tierData = pricing?.find((i: any) => i.sessions_per_month === sessionCount);
                    const price = tierData?.[`price_${plan}`];
                    if (!price) return null;

                    return (
                      <Box key={plan} sx={{ 
                        p: 2, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.03)', 
                        border: '1px solid rgba(255,255,255,0.1)',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                      }}>
                        <Box>
                          <Typography variant="body2" sx={{ textTransform: 'uppercase' }}>{plan}</Typography>
                          <Typography variant="h5" fontWeight={900}>₹{price}</Typography>
                        </Box>
                        <Button 
                          variant="contained" color="success" 
                          disabled={loading}
                          onClick={() => handlePayment(plan, price)}
                        >
                          {loading ? <CircularProgress size={24} /> : "Pay Now"}
                        </Button>
                      </Box>
                    );
                  })}
                </Stack>
              </>
            )}
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
}