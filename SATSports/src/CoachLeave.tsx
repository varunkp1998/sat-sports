import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Box, Typography, Grid, Card, CardContent, TextField, Button, Stack, Select, 
  MenuItem, Chip, Tabs, Tab, Container, Fade, InputLabel, FormControl, CircularProgress
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import dayjs from "dayjs";
import API_BASE from "./api";

const MotionBox = motion(Box);

export default function CoachLeave() {
  const coachId = localStorage.getItem("userId");

  const [tab, setTab] = useState(0);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [balance, setBalance] = useState<any>({ casual: 0, medical: 0 });
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    from_date: "",
    to_date: "",
    reason: "",
    leave_type: "casual"
  });

  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // 1. DATA SYNC - Deduplicated with useCallback
  const loadData = useCallback(async () => {
    if (!coachId) return;
    try {
      const [leavesRes, balanceRes] = await Promise.all([
        fetch(`${API_BASE}/api/coach/leaves/${coachId}`),
        fetch(`${API_BASE}/api/coach/leave-balance/${coachId}`)
      ]);
      const leavesData = await leavesRes.json();
      const balanceData = await balanceRes.json();
      
      setLeaves(Array.isArray(leavesData) ? leavesData : []);
      setBalance(balanceData || { casual: 0, medical: 0 });
    } catch (err) {
      setToast({ type: "error", text: "SYNC INTERRUPTED" });
    } finally {
      setLoading(false);
    }
  }, [coachId]);

  useEffect(() => { loadData(); }, [loadData]);

  // 2. FOOLPROOF SUBMISSION
  const submitRequest = async () => {
    if (!form.from_date || !form.to_date || !form.reason.trim()) {
      setToast({ type: "error", text: "MISSING MISSION PARAMETERS" });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/coach/leaves`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: coachId, ...form })
      });

      if (res.ok) {
        setToast({ type: "success", text: "REQUEST TRANSMITTED ✅" });
        setForm({ from_date: "", to_date: "", reason: "", leave_type: "casual" });
        loadData();
        setTab(1); // Auto-switch to Pending tab
      } else {
        throw new Error();
      }
    } catch {
      setToast({ type: "error", text: "TRANSMISSION FAILED" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. LOGIC: Duration Calculation
  const leaveDays = useMemo(() => {
    if (!form.from_date || !form.to_date) return 0;
    const start = dayjs(form.from_date);
    const end = dayjs(form.to_date);
    const diff = end.diff(start, 'day');
    return diff >= 0 ? diff + 1 : 0;
  }, [form.from_date, form.to_date]);

  if (loading) return (
    <Box sx={centerStyle}>
      <CircularProgress color="error" />
    </Box>
  );

  return (
    <Box sx={{ minHeight: "100vh", background: "#020617", color: "white", py: 6 }}>
      <Container maxWidth="xl">
        
        {/* HEADER */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="overline" sx={{ color: "#ef4444", fontWeight: 900, letterSpacing: 3 }}>OFF-FIELD REQUESTS</Typography>
          <Typography variant="h3" fontWeight={950} sx={{ letterSpacing: -1.5 }}>LEAVE <span style={{ color: "#ef4444" }}>CENTER</span></Typography>
        </Box>

        {toast && (
          <Fade in><Box sx={floatingToastStyle(toast.type)} onClick={() => setToast(null)}>{toast.text}</Box></Fade>
        )}

        <Tabs 
          value={tab} 
          onChange={(_, v) => setTab(v)} 
          sx={tabsStyle}
          TabIndicatorProps={{ sx: { display: 'none' } }}
        >
          <Tab label="NEW REQUEST" sx={tabItemStyle} />
          <Tab label="PENDING" sx={tabItemStyle} />
          <Tab label="HISTORY" sx={tabItemStyle} />
        </Tabs>

        {/* TAB 0: APPLY */}
        {tab === 0 && (
          <Fade in>
            <Grid container spacing={4}>
              <Grid item xs={12} md={8}>
                <Card sx={glassCardStyle}>
                  <CardContent sx={{ p: 4 }}>
                    <Typography variant="h6" fontWeight={900} mb={4} color="#ef4444">REQUEST FORM</Typography>
                    <Stack spacing={3}>
                      <FormControl fullWidth sx={formControlStyle}>
                        <InputLabel sx={{ color: "rgba(255,255,255,0.5)", fontWeight: 800 }}>CATEGORY</InputLabel>
                        <Select
                          value={form.leave_type}
                          label="CATEGORY"
                          onChange={(e) => setForm({ ...form, leave_type: e.target.value })}
                        >
                          <MenuItem value="casual">CASUAL LEAVE</MenuItem>
                          <MenuItem value="medical">MEDICAL LEAVE</MenuItem>
                          <MenuItem value="lop">LOSS OF PAY (LOP)</MenuItem>
                        </Select>
                      </FormControl>

                      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                        <TextField
                          fullWidth type="date" label="FROM" InputLabelProps={{ shrink: true }}
                          value={form.from_date} onChange={(e) => setForm({ ...form, from_date: e.target.value })}
                          sx={inputFieldStyle}
                        />
                        <TextField
                          fullWidth type="date" label="TO" InputLabelProps={{ shrink: true }}
                          value={form.to_date} onChange={(e) => setForm({ ...form, to_date: e.target.value })}
                          sx={inputFieldStyle}
                        />
                      </Stack>

                      <TextField
                        fullWidth multiline rows={4} placeholder="REASON FOR ABSENCE..."
                        value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })}
                        sx={inputFieldStyle}
                      />

                      <Box sx={summaryBoxStyle}>
                        <Typography fontWeight={900} sx={{ opacity: 0.6 }}>TOTAL DURATION</Typography>
                        <Typography variant="h4" fontWeight={950}>{leaveDays} DAYS</Typography>
                      </Box>

                      <Button 
                        variant="contained" onClick={submitRequest} 
                        disabled={leaveDays === 0 || isSubmitting} sx={primaryBtnStyle}
                      >
                        {isSubmitting ? <CircularProgress size={24} color="inherit" /> : "SUBMIT REQUEST"}
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Stack spacing={3}>
                  <Card sx={balanceCardStyle}>
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h6" fontWeight={900} mb={3}>CREDIT BALANCE</Typography>
                      <BalanceRow label="CASUAL" value={balance.casual} color="#3b82f6" />
                      <BalanceRow label="MEDICAL" value={balance.medical} color="#10b981" />
                    </CardContent>
                  </Card>
                  <Card sx={glassCardStyle}>
                    <CardContent sx={{ ".react-calendar": calendarOverride }}>
                      <Calendar
                        tileContent={({ date }) => {
                          const isLeave = leaves.some(l => 
                            dayjs(date).isBetween(dayjs(l.from_date), dayjs(l.to_date), 'day', '[]')
                          );
                          return isLeave ? <Box sx={calendarDotStyle} /> : null;
                        }}
                      />
                    </CardContent>
                  </Card>
                </Stack>
              </Grid>
            </Grid>
          </Fade>
        )}

        {/* TAB 1 & 2: LISTS */}
        {(tab === 1 || tab === 2) && (
          <Fade in>
            <Stack spacing={2}>
              <AnimatePresence>
                {leaves
                  .filter(l => tab === 1 ? (l.status || "").toLowerCase() === "pending" : true)
                  .map((l, index) => (
                    <MotionBox key={l.id || index} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                      <Card sx={glassCardStyle}>
                        <CardContent sx={{ p: 3 }}>
                          <Grid container alignItems="center" spacing={2}>
                            <Grid item xs={12} md={3}>
                               <Typography variant="h6" fontWeight={900}>
                                  {dayjs(l.from_date).format("DD MMM")} — {dayjs(l.to_date).format("DD MMM")}
                               </Typography>
                               <Typography variant="caption" sx={{ opacity: 0.5, fontWeight: 800 }}>
                                  {(l.leave_type || "casual").toUpperCase()}
                               </Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                               <Typography sx={{ fontStyle: 'italic', opacity: 0.7, fontSize: '0.9rem' }}>
                                  "{l.reason || "Mission notes empty"}"
                               </Typography>
                            </Grid>
                            <Grid item xs={12} md={3} textAlign={{ xs: "left", md: "right" }}>
                               <Chip 
                                  label={(l.status || "pending").toUpperCase()} 
                                  sx={statusChipStyle(l.status || "pending")} 
                                />
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    </MotionBox>
                  ))}
              </AnimatePresence>
              {leaves.length === 0 && (
                <Typography sx={{ textAlign: 'center', py: 10, opacity: 0.3, fontWeight: 900 }}>NO DEPLOYMENT RECORDS</Typography>
              )}
            </Stack>
          </Fade>
        )}
      </Container>
    </Box>
  );
}

// 🏛️ HELPERS
const BalanceRow = ({ label, value, color }: any) => (
  <Stack direction="row" justifyContent="space-between" mb={2} alignItems="center">
    <Typography variant="body2" fontWeight={800} sx={{ opacity: 0.6 }}>{label}</Typography>
    <Box sx={{ flexGrow: 1, mx: 2, height: 6, bgcolor: "rgba(255,255,255,0.05)", borderRadius: 1 }}>
       <Box sx={{ width: `${Math.min(((value || 0) / 15) * 100, 100)}%`, height: '100%', bgcolor: color, borderRadius: 1 }} />
    </Box>
    <Typography fontWeight={900}>{value || 0}</Typography>
  </Stack>
);

// 💅 DESIGN TOKENS
const centerStyle = { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#020617' };
const glassCardStyle = { borderRadius: 6, background: "rgba(255,255,255,0.03)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.08)", color: "white" };
const balanceCardStyle = { ...glassCardStyle, borderLeft: "4px solid #ef4444" };
const tabsStyle = { bgcolor: "rgba(255,255,255,0.03)", borderRadius: 3, p: 0.5, mb: 4 };
const tabItemStyle = { fontWeight: 900, color: "rgba(255,255,255,0.4)", borderRadius: 2, "&.Mui-selected": { color: "white", bgcolor: "#ef4444" } };
const inputFieldStyle = { "& .MuiOutlinedInput-root": { color: "white", bgcolor: "rgba(255,255,255,0.02)", borderRadius: 3, "& fieldset": { borderColor: "rgba(255,255,255,0.1)" }, "&:hover fieldset": { borderColor: "#ef4444" } }, "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.5)" } };
const formControlStyle = { "& .MuiOutlinedInput-root": { color: "white", borderRadius: 3, bgcolor: "rgba(255,255,255,0.02)", "& fieldset": { borderColor: "rgba(255,255,255,0.1)" } }, "& .MuiSelect-icon": { color: "white" } };
const summaryBoxStyle = { p: 3, bgcolor: "rgba(239, 68, 68, 0.05)", borderRadius: 4, border: "1px solid rgba(239, 68, 68, 0.1)", textAlign: 'center' };
const primaryBtnStyle = { py: 2, borderRadius: 3, fontWeight: 950, background: "linear-gradient(135deg, #f97316, #ef4444)", color: "white" };
const calendarDotStyle = { width: 6, height: 6, bgcolor: "#ef4444", borderRadius: "50%", margin: "auto", mt: 0.5 };
const calendarOverride = { background: "transparent !important", border: "none !important", color: "white !important", ".react-calendar__tile": { color: "white" }, ".react-calendar__navigation button": { color: "white" }, ".react-calendar__tile--now": { bgcolor: "rgba(255,255,255,0.1) !important", borderRadius: 2 } };
const floatingToastStyle = (type: string) => ({ position: 'fixed', bottom: 20, right: 20, zIndex: 9999, p: "12px 24px", borderRadius: 2, fontWeight: 900, bgcolor: type === 'success' ? '#22c55e' : '#ef4444', color: 'white', boxShadow: 10 });

const statusChipStyle = (status: string) => {
  const s = status.toLowerCase();
  const color = s === "approved" ? "#22c55e" : s === "rejected" ? "#ef4444" : "#f59e0b";
  return { bgcolor: `${color}15`, color: color, border: `1px solid ${color}44`, fontWeight: 900, borderRadius: 1 };
};