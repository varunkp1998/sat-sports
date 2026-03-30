import React, { useState, useEffect } from "react";
import {
  Box, Typography, Stack, TextField, Table, TableHead, TableRow, 
  TableCell, TableBody, Paper, Chip, Switch, FormControlLabel, 
  Fade, Card, CardContent, useTheme, useMediaQuery, Snackbar, Alert, 
  TableContainer, Avatar
} from "@mui/material";
import HistoryIcon from "@mui/icons-material/History";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import BadgeIcon from "@mui/icons-material/Badge";
import API_BASE from "./api";

type PlayerAttendanceRow = {
  session_id: number;
  player_id: number;
  present: number;
  session_date: string;
  playerName: string;
  programTitle: string;
};

type CoachCheckinRow = {
  id: number;
  coachName: string;
  session_date: string;
  start_time: string;
  end_time: string;
  locationName: string;
  checkout_time: string | null;
  work_minutes: number;
};

export default function AdminAttendance() {
  const [mode, setMode] = useState<"players" | "coaches" | any>("players");
  const [playerRows, setPlayerRows] = useState<PlayerAttendanceRow[]>([]);
  const [coachRows, setCoachRows] = useState<CoachCheckinRow[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" as "success" | "error" });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const loadPlayers = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/attendance?date=${selectedDate}`);
      const data = await res.json();
      setPlayerRows(data);
    } catch (err) { handleToast("Error loading player data", "error"); }
  };

  const loadCoaches = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/coach-checkins?date=${selectedDate}`);
      const data = await res.json();
      setCoachRows(data);
    } catch (err) { handleToast("Error loading coach data", "error"); }
  };

  useEffect(() => {
    mode === "players" ? loadPlayers() : loadCoaches();
  }, [mode, selectedDate]);

  const handleToast = (message: string, severity: "success" | "error") => {
    setToast({ open: true, message, severity });
  };

  return (
    <Box sx={containerStyle}>
      
      {/* HEADER SECTION */}
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between" alignItems="center" mb={6}>
        <Box>
          <Typography variant="h4" fontWeight={900} letterSpacing="-1.5px" color="#1e293b">
            Attendance Center
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Daily logs for {mode === "players" ? "student athletes" : "coaching staff"}
          </Typography>
        </Box>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
          <Paper sx={datePaperStyle}>
            <TextField
              type="date"
              size="small"
              variant="standard"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              InputProps={{ disableUnderline: true, sx: { fontWeight: 700, fontSize: '0.9rem' } }}
            />
          </Paper>

          <Paper sx={togglePaperStyle}>
            <FormControlLabel
              control={
                <Switch
                  checked={mode === "coaches"}
                  onChange={(e) => setMode(e.target.checked ? "coaches" : "players")}
                  color="primary"
                />
              }
              label={
                <Typography variant="caption" fontWeight={900} color="text.secondary" sx={{ textTransform: 'uppercase' }}>
                  {mode === "coaches" ? "Coaches View" : "Players View"}
                </Typography>
              }
              sx={{ m: 0, px: 1 }}
            />
          </Paper>
        </Stack>
      </Stack>

      {/* DATA VIEW */}
      <Fade in timeout={600}>
        <Card sx={glassCardStyle}>
          <CardContent sx={{ p: 0 }}>
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: '#f8fafc' }}>
                  <TableRow>
                    <TableCell sx={thStyle}>NAME</TableCell>
                    <TableCell sx={thStyle}>{mode === "players" ? "PROGRAM" : "SESSION/LOCATION"}</TableCell>
                    <TableCell sx={thStyle}>STATUS</TableCell>
                    <TableCell sx={thStyle}>{mode === "players" ? "DATE" : "WORK LOG"}</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {/* PLAYER ROWS */}
                  {mode === "players" && playerRows.map((r, idx) => (
                    <TableRow key={idx} hover sx={rowStyle}>
                      <TableCell>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Avatar sx={{ bgcolor: '#eff6ff', color: '#3b82f6', width: 32, height: 32, fontSize: '0.8rem', fontWeight: 700 }}>
                            {r.playerName.charAt(0)}
                          </Avatar>
                          <Typography variant="body2" fontWeight={800} color="#1e293b">{r.playerName}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Chip label={r.programTitle} size="small" sx={programChipStyle} />
                      </TableCell>
                      <TableCell>
                        {r.present ? (
                          <Chip label="Present" size="small" sx={successChipStyle} />
                        ) : (
                          <Chip label="Absent" size="small" sx={errorChipStyle} />
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" fontWeight={700} color="text.secondary">
                          {r.session_date.slice(0, 10)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}

                  {/* COACH ROWS */}
                  {mode === "coaches" && coachRows.map((r) => (
                    <TableRow key={r.id} hover sx={rowStyle}>
                      <TableCell>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Avatar sx={{ bgcolor: '#f0fdf4', color: '#16a34a', width: 32, height: 32, fontSize: '0.8rem', fontWeight: 700 }}>
                            {r.coachName.charAt(0)}
                          </Avatar>
                          <Typography variant="body2" fontWeight={800} color="#1e293b">{r.coachName}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={700} color="#3b82f6">{r.locationName}</Typography>
                        <Typography variant="caption" color="text.secondary">{r.start_time} - {r.end_time}</Typography>
                      </TableCell>
                      <TableCell>
                        {r.checkout_time === null ? (
                          <Chip label="Active" size="small" sx={activeChipStyle} />
                        ) : (
                          <Chip label="Completed" size="small" sx={completedChipStyle} />
                        )}
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <HistoryIcon sx={{ fontSize: 16, color: '#64748b' }} />
                          <Typography variant="body2" fontWeight={800}>{r.work_minutes ?? 0}m</Typography>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}

                  {/* EMPTY STATE */}
                  {((mode === "players" && playerRows.length === 0) || (mode === "coaches" && coachRows.length === 0)) && (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 10 }}>
                        <Typography variant="body2" fontWeight={700} color="text.secondary">
                          No records found for this date.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Fade>

      {/* TOAST NOTIFICATION */}
      <Snackbar open={toast.open} autoHideDuration={3000} onClose={() => setToast({ ...toast, open: false })}>
        <Alert severity={toast.severity} variant="filled" sx={{ borderRadius: 2, fontWeight: 700 }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

// --- STYLING ---
const containerStyle = { p: { xs: 2, md: 8 }, background: "#f8fafc", minHeight: "100vh" };
const datePaperStyle = { p: "6px 16px", borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: 'none', display: 'flex', alignItems: 'center' };
const togglePaperStyle = { p: "2px 8px", borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: 'none', display: 'flex', alignItems: 'center', bgcolor: 'white' };
const glassCardStyle = { borderRadius: 6, border: '1px solid #e2e8f0', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.04)', overflow: 'hidden', bgcolor: 'white' };
const thStyle = { fontWeight: 900, color: '#64748b', fontSize: '0.7rem', letterSpacing: 1.2, py: 2, px: 3 };
const rowStyle = { '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { bgcolor: '#fcfcfd' } };

// --- CHIP STYLES ---
const programChipStyle = { bgcolor: '#eff6ff', color: '#1d4ed8', fontWeight: 800, borderRadius: 1.5 };
const successChipStyle = { bgcolor: '#dcfce7', color: '#15803d', fontWeight: 800, borderRadius: 1.5 };
const errorChipStyle = { bgcolor: '#fee2e2', color: '#b91c1c', fontWeight: 800, borderRadius: 1.5 };
const activeChipStyle = { bgcolor: '#3b82f6', color: 'white', fontWeight: 800, borderRadius: 1.5, animation: 'pulse 2s infinite' };
const completedChipStyle = { bgcolor: '#f1f5f9', color: '#475569', fontWeight: 800, borderRadius: 1.5 };