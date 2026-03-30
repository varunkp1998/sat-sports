import React, { useState, useEffect } from "react";
import { 
  Box, Typography, Card, CardContent, TextField, Button, 
  Stack, Grid, Paper, Chip, Divider, CircularProgress, Fade, Alert 
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import HistoryIcon from "@mui/icons-material/History";
import API_BASE from "./api";
import dayjs from "dayjs";

export default function PlayerLeave() {
  const userId = localStorage.getItem("userId");
  
  // Form State
  const [form, setForm] = useState({ startDate: "", endDate: "", reason: "" });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  // History State
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const fetchLeaveHistory = () => {
    fetch(`${API_BASE}/api/player/leaves/${userId}`)
      .then(res => res.json())
      .then(data => {
        setHistory(Array.isArray(data) ? data : []);
        setLoadingHistory(false);
      })
      .catch(() => setLoadingHistory(false));
  };

  useEffect(() => { fetchLeaveHistory(); }, [userId]);

  const handleSubmit = async () => {
    if (!form.startDate || !form.endDate || !form.reason) {
      setMessage({ type: 'error', text: "Please fill in all fields." });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch(`${API_BASE}/api/player/leaves`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          start_date: form.startDate,
          end_date: form.endDate,
          reason: form.reason,
        }),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: "Leave request submitted successfully!" });
        setForm({ startDate: "", endDate: "", reason: "" });
        fetchLeaveHistory(); // Refresh history list
      } else {
        throw new Error();
      }
    } catch (err) {
      setMessage({ type: 'error', text: "Failed to submit request. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Fade in timeout={600}>
      <Box>
        <Typography variant="h5" fontWeight={800} mb={3} color="#1e293b">
          Leave Management
        </Typography>

        <Grid container spacing={4}>
          {/* LEFT: Application Form */}
          <Grid item xs={12} md={5}>
            <Card sx={{ borderRadius: 4, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={700} mb={2}>Apply for Leave</Typography>
                
                {message && (
                  <Alert severity={message.type} sx={{ mb: 3, borderRadius: 2 }}>
                    {message.text}
                  </Alert>
                )}

                <Stack spacing={3}>
                  <TextField
                    type="date"
                    label="Start Date"
                    fullWidth
                    value={form.startDate}
                    onChange={e => setForm({...form, startDate: e.target.value})}
                    InputLabelProps={{ shrink: true }}
                  />

                  <TextField
                    type="date"
                    label="End Date"
                    fullWidth
                    value={form.endDate}
                    onChange={e => setForm({...form, endDate: e.target.value})}
                    InputLabelProps={{ shrink: true }}
                  />

                  <TextField
                    label="Reason for Leave"
                    placeholder="Briefly explain why you will be absent..."
                    multiline
                    rows={4}
                    fullWidth
                    value={form.reason}
                    onChange={e => setForm({...form, reason: e.target.value})}
                  />

                  <Button
                    variant="contained"
                    size="large"
                    disabled={submitting}
                    onClick={handleSubmit}
                    startIcon={submitting ? <CircularProgress size={20} /> : <SendIcon />}
                    sx={{ 
                      bgcolor: "#2563eb", 
                      fontWeight: 800, 
                      borderRadius: 3,
                      py: 1.5,
                      '&:hover': { bgcolor: "#1e40af" }
                    }}
                  >
                    {submitting ? "Submitting..." : "Submit Request"}
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* RIGHT: Request History */}
          <Grid item xs={12} md={7}>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <HistoryIcon sx={{ color: "#64748b" }} />
              <Typography variant="h6" fontWeight={700} color="#475569">Recent Requests</Typography>
            </Box>

            {loadingHistory ? (
              <Box textAlign="center" py={4}><CircularProgress size={24} /></Box>
            ) : history.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 4, bgcolor: '#f1f5f9', border: '1px dashed #cbd5e1' }}>
                <Typography color="text.secondary">No leave history found.</Typography>
              </Paper>
            ) : (
              <Stack spacing={2}>
                {history.map((item, i) => (
                  <Card key={i} sx={{ borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                    <CardContent sx={{ p: 2 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box>
                          <Typography fontWeight={800} color="#1e293b">
                            {dayjs(item.start_date).format("MMM DD")} — {dayjs(item.end_date).format("MMM DD, YYYY")}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            Reason: {item.reason}
                          </Typography>
                        </Box>
                        
                        <Chip 
                          label={item.status?.toUpperCase() || "PENDING"} 
                          size="small"
                          sx={{ 
                            fontWeight: 900, fontSize: 10,
                            bgcolor: item.status === 'approved' ? '#dcfce7' : item.status === 'rejected' ? '#fee2e2' : '#fef9c3',
                            color: item.status === 'approved' ? '#166534' : item.status === 'rejected' ? '#991b1b' : '#854d0e'
                          }} 
                        />
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            )}
          </Grid>
        </Grid>
      </Box>
    </Fade>
  );
}