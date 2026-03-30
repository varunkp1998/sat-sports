import React, { useEffect, useState } from "react";
import {
  Box, Typography, Grid, Card, CardContent, TextField, Button, Stack, Select, 
  MenuItem, Chip, Divider, Tabs, Tab, Container, Fade, InputLabel, FormControl
} from "@mui/material";
import { motion } from "framer-motion";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import API_BASE from "./api";

const MotionBox = motion(Box);

export default function CoachLeave() {
  const coachId = localStorage.getItem("userId");

  const [tab, setTab] = useState(0);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [balance, setBalance] = useState<any>({});
  const [form, setForm] = useState({
    from_date: "",
    to_date: "",
    reason: "",
    leave_type: "casual"
  });

  const load = () => {
    fetch(`${API_BASE}/api/coach/leaves/${coachId}`).then(res => res.json()).then(setLeaves);
    fetch(`${API_BASE}/api/coach/leave-balance/${coachId}`).then(res => res.json()).then(setBalance);
  };

  useEffect(() => { if (coachId) load(); }, [coachId]);

  const submit = async () => {
    const res = await fetch(`${API_BASE}/api/coach/leaves`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: coachId,
        from_date: form.from_date,
        to_date: form.to_date,
        reason: form.reason,
        leave_type: form.leave_type
      })
    });

    if (res.ok) {
      alert("Leave Request Submitted ✅");
      setForm({ from_date: "", to_date: "", reason: "", leave_type: "casual" });
      load();
    }
  };

  const calculateDays = () => {
    if (!form.from_date || !form.to_date) return 0;
    const diff = (new Date(form.to_date).getTime() - new Date(form.from_date).getTime()) / (1000 * 60 * 60 * 24);
    return diff >= 0 ? diff + 1 : 0;
  };

  return (
    <Box sx={{ minHeight: "100vh", background: "#020617", color: "white", py: 6 }}>
      <Container maxWidth="xl">
        
        {/* HEADER */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="overline" sx={{ color: "#ef4444", fontWeight: 900, letterSpacing: 3 }}>OFF-FIELD REQUESTS</Typography>
          <Typography variant="h3" fontWeight={950} sx={{ letterSpacing: -1.5 }}>LEAVE <span style={{ color: "#ef4444" }}>CENTER</span></Typography>
        </Box>

        {/* TABS */}
        <Tabs 
          value={tab} 
          onChange={(e, v) => setTab(v)} 
          sx={tabsStyle}
          TabIndicatorProps={{ sx: { display: 'none' } }}
        >
          <Tab label="NEW REQUEST" sx={tabItemStyle} />
          <Tab label="PENDING APPROVAL" sx={tabItemStyle} />
          <Tab label="REQUEST HISTORY" sx={tabItemStyle} />
        </Tabs>

        {/* ================= APPLY ================= */}
        {tab === 0 && (
          <Fade in timeout={800}>
            <Grid container spacing={4}>
              <Grid item xs={12} md={8}>
                <Card sx={glassCardStyle}>
                  <CardContent sx={{ p: 4 }}>
                    <Typography variant="h6" fontWeight={900} mb={4} sx={{ color: "#ef4444" }}>REQUEST FORM</Typography>
                    
                    <Stack spacing={3}>
                      <FormControl fullWidth sx={formControlStyle}>
                        <InputLabel sx={{ color: "rgba(255,255,255,0.5)", fontWeight: 800 }}>LEAVE CATEGORY</InputLabel>
                        <Select
                          value={form.leave_type}
                          label="LEAVE CATEGORY"
                          onChange={(e) => setForm({ ...form, leave_type: e.target.value })}
                        >
                          <MenuItem value="casual">CASUAL LEAVE</MenuItem>
                          <MenuItem value="medical">MEDICAL LEAVE</MenuItem>
                          <MenuItem value="lop">LOSS OF PAY (LOP)</MenuItem>
                        </Select>
                      </FormControl>

                      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                        <TextField
                          fullWidth
                          type="date"
                          label="FROM DATE"
                          InputLabelProps={{ shrink: true }}
                          value={form.from_date}
                          onChange={(e) => setForm({ ...form, from_date: e.target.value })}
                          sx={inputFieldStyle}
                        />
                        <TextField
                          fullWidth
                          type="date"
                          label="TO DATE"
                          InputLabelProps={{ shrink: true }}
                          value={form.to_date}
                          onChange={(e) => setForm({ ...form, to_date: e.target.value })}
                          sx={inputFieldStyle}
                        />
                      </Stack>

                      <TextField
                        fullWidth
                        multiline
                        rows={4}
                        placeholder="PROVIDE REASON FOR ABSENCE..."
                        value={form.reason}
                        onChange={(e) => setForm({ ...form, reason: e.target.value })}
                        sx={inputFieldStyle}
                      />

                      <Box sx={summaryBoxStyle}>
                        <Typography fontWeight={900} sx={{ opacity: 0.6 }}>TOTAL DURATION</Typography>
                        <Typography variant="h4" fontWeight={950}>{calculateDays()} DAYS</Typography>
                      </Box>

                      <Button 
                        variant="contained" 
                        onClick={submit} 
                        disabled={calculateDays() === 0}
                        sx={primaryBtnStyle}
                      >
                        SUBMIT REQUEST
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              {/* SIDE PANEL */}
              <Grid item xs={12} md={4}>
                <Stack spacing={3}>
                  <Card sx={balanceCardStyle}>
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h6" fontWeight={900} mb={3}>CREDIT BALANCE</Typography>
                      <BalanceRow label="CASUAL" value={balance.casual} color="#3b82f6" />
                      <BalanceRow label="MEDICAL" value={balance.medical} color="#10b981" />
                      <Divider sx={{ my: 2, bgcolor: "rgba(255,255,255,0.1)" }} />
                      <Stack direction="row" justifyContent="space-between">
                        <Typography fontWeight={900}>TOTAL AVAILABLE</Typography>
                        <Typography fontWeight={950} color="#ef4444">{(balance.casual || 0) + (balance.medical || 0)}</Typography>
                      </Stack>
                    </CardContent>
                  </Card>

                  <Card sx={glassCardStyle}>
                    <CardContent sx={{ ".react-calendar": calendarOverride }}>
                      <Typography variant="h6" fontWeight={900} mb={2}>LEAVE CALENDAR</Typography>
                      <Calendar
                        tileContent={({ date }) => {
                          const found = leaves.find(l => 
                            new Date(date) >= new Date(l.from_date) && 
                            new Date(date) <= new Date(l.to_date)
                          );
                          return found ? <Box sx={calendarDotStyle} /> : null;
                        }}
                      />
                    </CardContent>
                  </Card>
                </Stack>
              </Grid>
            </Grid>
          </Fade>
        )}

        {/* ================= HISTORY / PENDING LIST ================= */}
        {(tab === 1 || tab === 2) && (
          <Fade in timeout={500}>
            <Stack spacing={2}>
              {leaves
                .filter(l => tab === 1 ? l.status === "Pending" : true)
                .map(l => (
                  <MotionBox key={l.id} whileHover={{ x: 10 }}>
                    <Card sx={glassCardStyle}>
                      <CardContent sx={{ p: 3 }}>
                        <Grid container alignItems="center">
                          <Grid item xs={12} md={4}>
                             <Typography variant="h6" fontWeight={900}>{dayjs(l.from_date).format("DD MMM")} — {dayjs(l.to_date).format("DD MMM")}</Typography>
                             <Typography variant="caption" sx={{ opacity: 0.5, fontWeight: 800 }}>{l.leave_type.toUpperCase()}</Typography>
                          </Grid>
                          <Grid item xs={12} md={4}>
                             <Typography sx={{ fontStyle: 'italic', opacity: 0.7, fontSize: '0.9rem' }}>"{l.reason}"</Typography>
                          </Grid>
                          <Grid item xs={12} md={4} textAlign="right">
                             <Chip label={l.status.toUpperCase()} sx={statusChipStyle(l.status)} />
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </MotionBox>
                ))}
            </Stack>
          </Fade>
        )}
      </Container>
    </Box>
  );
}

// 🏛️ MINI COMPONENTS
const BalanceRow = ({ label, value, color }: any) => (
  <Stack direction="row" justifyContent="space-between" mb={1.5} alignItems="center">
    <Typography variant="body2" fontWeight={800} sx={{ opacity: 0.6 }}>{label}</Typography>
    <Box sx={{ flexGrow: 1, mx: 2, height: 4, bgcolor: "rgba(255,255,255,0.05)", borderRadius: 1 }}>
       <Box sx={{ width: `${(value / 15) * 100}%`, height: '100%', bgcolor: color, borderRadius: 1 }} />
    </Box>
    <Typography fontWeight={900}>{value || 0}</Typography>
  </Stack>
);

// 💅 DESIGN SYSTEM
const glassCardStyle = { borderRadius: 6, background: "rgba(255,255,255,0.03)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.08)", color: "white" };
const balanceCardStyle = { ...glassCardStyle, borderLeft: "4px solid #ef4444" };
const tabsStyle = { bgcolor: "rgba(255,255,255,0.03)", borderRadius: 3, p: 0.5, mb: 4, minHeight: 'auto' };
const tabItemStyle = { fontWeight: 900, color: "rgba(255,255,255,0.4)", borderRadius: 2, "&.Mui-selected": { color: "white", bgcolor: "#ef4444" }, minHeight: '40px' };

const inputFieldStyle = {
  "& .MuiOutlinedInput-root": {
    color: "white", bgcolor: "rgba(255,255,255,0.02)", borderRadius: 3, fontWeight: 700,
    "& fieldset": { borderColor: "rgba(255,255,255,0.1)" },
    "&:hover fieldset": { borderColor: "#ef4444" }
  },
  "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.5)", fontWeight: 800 }
};

const formControlStyle = {
  "& .MuiOutlinedInput-root": { color: "white", borderRadius: 3, bgcolor: "rgba(255,255,255,0.02)", "& fieldset": { borderColor: "rgba(255,255,255,0.1)" } },
  "& .MuiSelect-icon": { color: "white" }
};

const summaryBoxStyle = { p: 3, bgcolor: "rgba(239, 68, 68, 0.05)", borderRadius: 4, border: "1px solid rgba(239, 68, 68, 0.1)", textAlign: 'center' };
const primaryBtnStyle = { py: 2, borderRadius: 3, fontWeight: 950, background: "linear-gradient(135deg, #f97316, #ef4444)", color: "white", "&:disabled": { opacity: 0.3 } };

const calendarDotStyle = { width: 6, height: 6, bgcolor: "#ef4444", borderRadius: "50%", margin: "auto", mt: 0.5, boxShadow: "0 0 10px #ef4444" };
const calendarOverride = { background: "transparent !important", border: "none !important", color: "white !important", ".react-calendar__tile": { color: "white" }, ".react-calendar__navigation button": { color: "white" }, ".react-calendar__month-view__days__day--neighboringMonth": { opacity: 0.2 } };

const statusChipStyle = (status: string) => {
  const colors: any = { Approved: "#22c55e", Rejected: "#ef4444", Pending: "#f59e0b" };
  return { bgcolor: `${colors[status]}15`, color: colors[status], border: `1px solid ${colors[status]}44`, fontWeight: 900, borderRadius: 1 };
};

const dayjs = require('dayjs'); // Or use your preferred date formatter