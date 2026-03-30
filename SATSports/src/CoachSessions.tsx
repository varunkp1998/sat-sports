import { useEffect, useState, useMemo } from "react";
import {
  Box, Typography, Grid, Card, CardContent, Button, Chip, Stack, TextField, CircularProgress, Alert, Container, Fade
} from "@mui/material";
import { motion } from "framer-motion";
import API_BASE from "./api";
import dayjs from "dayjs";

const MotionBox = motion(Box);

// ... (Types remain the same as your original)

export default function CoachSessions() {
  // ... (Your existing Logic, State, and Handlers remain exactly the same)

  return (
    <Box sx={{ background: "#020617", color: "white", minHeight: "100vh", py: 6 }}>
      <Container maxWidth="xl">
        
        {/* HEADER SECTION */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="overline" sx={{ color: "#ef4444", fontWeight: 900, letterSpacing: 3 }}>
            FIELD COMMAND
          </Typography>
          <Typography variant="h3" fontWeight={950} sx={{ letterSpacing: -1.5, mb: 1 }}>
            MY <span style={{ color: "#ef4444" }}>SESSIONS</span>
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>
            MANAGE ATTENDANCE, TRACK LIVE STATUS, AND SYNC WITH THE ARENA.
          </Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 3, bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#ff4444' }}>{error}</Alert>}

        {/* SEARCH & FILTER BAR */}
        <Box sx={filterBarStyle}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={3} alignItems="center">
            <TextField
              type="date"
              label="FILTER BY DATE"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={datePickerStyle}
            />
            <Box sx={{ flexGrow: 1 }} />
            <Typography sx={{ fontWeight: 900, fontSize: '0.8rem', color: '#ef4444', letterSpacing: 1 }}>
               ● {filteredSessions.length} SESSIONS DISCOVERED
            </Typography>
          </Stack>
        </Box>

        {filteredSessions.length === 0 && !error && (
          <Box sx={{ py: 10, textAlign: 'center', opacity: 0.3 }}>
             <Typography variant="h5" fontWeight={900}>NO SESSIONS DEPLOYED FOR THIS DATE</Typography>
          </Box>
        )}

        <Grid container spacing={4}>
          {filteredSessions.map((s) => {
            const state = checkedInMap[s.id] || { checkedIn: false, completed: false, isLate: 0 };
            const diffMin = dayjs(`${s.session_date} ${s.start_time}`, "YYYY-MM-DD HH:mm:ss").diff(dayjs(), "minute");

            const isLive = diffMin <= 15 && diffMin > -120;
            const isUpcoming = diffMin > 15 && diffMin < 60;
            const status = isLive ? "LIVE" : isUpcoming ? "SOON" : "SCHEDULED";
            const statusColor = isLive ? "#22c55e" : isUpcoming ? "#f59e0b" : "rgba(255,255,255,0.2)";

            return (
              <Grid item xs={12} md={6} lg={4} key={s.id}>
                <MotionBox whileHover={{ y: -10 }} transition={{ duration: 0.3 }}>
                  <Card sx={{ ...glassCardStyle, opacity: state.completed ? 0.5 : 1 }}>
                    <Box sx={{ height: 4, background: statusColor, boxShadow: `0 0 15px ${statusColor}` }} />
                    
                    <CardContent sx={{ p: 4 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                        <Box>
                          <Typography variant="h4" fontWeight={950}>{dayjs(s.session_date).format("DD")}</Typography>
                          <Typography variant="overline" fontWeight={900} sx={{ opacity: 0.6 }}>{dayjs(s.session_date).format("MMM YYYY")}</Typography>
                        </Box>
                        <Stack alignItems="flex-end" spacing={1}>
                          <Chip label={status} sx={statusChipStyle(statusColor)} />
                          {state.isLate === 1 && <Chip label="LATE ENTRY" size="small" sx={lateChipStyle} />}
                        </Stack>
                      </Stack>

                      <Stack spacing={2} mb={4}>
                        <Typography variant="h6" fontWeight={800} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                           <span style={{ color: '#ef4444' }}>⏰</span> {s.start_time} – {s.end_time || "TBD"}
                        </Typography>
                        <Typography variant="body1" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, opacity: 0.8 }}>
                           <span style={{ color: '#ef4444' }}>📍</span> {s.locationName}
                        </Typography>
                      </Stack>

                      {s.programTitles && (
                        <Box mb={4} display="flex" flexWrap="wrap" gap={1}>
                          {s.programTitles.split(",").map((p, i) => (
                            <Chip key={i} label={p.trim()} size="small" sx={programChipStyle} />
                          ))}
                        </Box>
                      )}

                      <Box>
                        {actionLoading === s.id ? (
                          <Button fullWidth disabled sx={actionBtnBase}><CircularProgress size={24} color="error" /></Button>
                        ) : (
                          <>
                            {!state.checkedIn && !state.completed && (
                              <Button
                                fullWidth
                                variant="contained"
                                disabled={!isLive}
                                sx={isLive ? primaryBtnStyle : disabledBtnStyle}
                                onClick={() => handleCheckIn(s.id, s.location_id)}
                              >
                                {isLive ? "INITIALIZE CHECK-IN" : "WAITING FOR SESSION"}
                              </Button>
                            )}

                            {state.checkedIn && (
                              <Stack spacing={2}>
                                <Button
                                  fullWidth
                                  variant="contained"
                                  sx={attendanceBtnStyle}
                                  onClick={() => window.location.href = `/coach/sessions/${s.id}/attendance`}
                                >
                                  MARK ATTENDANCE
                                </Button>
                                <Button
                                  fullWidth
                                  variant="outlined"
                                  sx={checkoutBtnStyle}
                                  onClick={() => handleCheckOut(s.id)}
                                >
                                  CLOSE SESSION
                                </Button>
                              </Stack>
                            )}

                            {state.completed && (
                              <Box sx={finalizedBoxStyle}>
                                <Typography fontWeight={900} sx={{ letterSpacing: 1 }}>✔ SESSION COMPLETED</Typography>
                              </Box>
                            )}
                          </>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </MotionBox>
              </Grid>
            );
          })}
        </Grid>
      </Container>
    </Box>
  );
}

// 💅 ELITE DESIGN SYSTEM TOKENS
const glassCardStyle = { borderRadius: 6, background: "rgba(255,255,255,0.03)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.08)", color: "white", overflow: 'hidden' };
const filterBarStyle = { background: "rgba(255,255,255,0.02)", p: 3, borderRadius: 4, mb: 6, border: "1px solid rgba(255,255,255,0.05)" };
const datePickerStyle = { 
  background: "rgba(255,255,255,0.05)", borderRadius: 2, width: { xs: "100%", sm: 250 },
  "& .MuiOutlinedInput-root": { color: "white", fontWeight: 800, "& fieldset": { borderColor: "rgba(255,255,255,0.1)" } },
  "& .MuiInputLabel-root": { color: "#ef4444", fontWeight: 900 }
};
const statusChipStyle = (color: string) => ({ bgcolor: color, color: "#fff", fontWeight: 900, borderRadius: 1, fontSize: '0.65rem' });
const lateChipStyle = { bgcolor: 'rgba(239, 68, 68, 0.2)', color: '#ff4444', border: '1px solid #ff4444', fontWeight: 900, borderRadius: 1 };
const programChipStyle = { borderRadius: 1, border: "1px solid rgba(239, 68, 68, 0.3)", color: "rgba(255,255,255,0.7)", fontWeight: 800, fontSize: '0.7rem' };

const actionBtnBase = { py: 1.8, borderRadius: 3, fontWeight: 950 };
const primaryBtnStyle = { ...actionBtnBase, background: "linear-gradient(135deg, #f97316, #ef4444)", boxShadow: "0 10px 20px rgba(239, 68, 68, 0.3)", color: 'white' };
const disabledBtnStyle = { ...actionBtnBase, bgcolor: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.2)" };
const attendanceBtnStyle = { ...actionBtnBase, bgcolor: "#22c55e", color: "white", "&:hover": { bgcolor: "#16a34a" } };
const checkoutBtnStyle = { ...actionBtnBase, borderColor: "#ef4444", color: "#ef4444", "&:hover": { bgcolor: "rgba(239, 68, 68, 0.1)" } };
const finalizedBoxStyle = { py: 2, textAlign: 'center', bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 3, color: 'rgba(255,255,255,0.3)' };