import React, { useState, useEffect } from "react";
import {
  Box, Typography, Card, CardContent, Stack, TextField, Button, 
  MenuItem, Table, TableHead, TableRow, TableCell, TableBody, 
  IconButton, useMediaQuery, useTheme, Fade, Grid, Chip, Paper, 
  Divider, Snackbar, Alert
} from "@mui/material";
import { LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddBoxIcon from "@mui/icons-material/AddBox";
import FilterListIcon from "@mui/icons-material/FilterList";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import API_BASE from "./api";

export default function AdminSessions() {
  // Data States
  const [sessions, setSessions] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [coaches, setCoaches] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);

  // Form States
  const [editingId, setEditingId] = useState<number | null>(null);
  const [date, setDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [startTime, setStartTime] = useState<any>(dayjs().set('hour', 9).set('minute', 0));
  const [endTime, setEndTime] = useState<any>(dayjs().set('hour', 10).set('minute', 0));
  const [locationId, setLocationId] = useState<string | number>("");
  const [coachId, setCoachId] = useState<string | number>("");
  const [programIds, setProgramIds] = useState<number[]>([]);
  const [filterDate, setFilterDate] = useState(dayjs().format("YYYY-MM-DD"));

  // UI States
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" as "success" | "error" });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const loadData = async () => {
    try {
      const [sRes, lRes, cRes, pRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/sessions`),
        fetch(`${API_BASE}/api/admin/locations`),
        fetch(`${API_BASE}/api/admin/coaches`),
        fetch(`${API_BASE}/api/admin/programs`)
      ]);
      setSessions(await sRes.json());
      setLocations(await lRes.json());
      setCoaches(await cRes.json());
      setPrograms(await pRes.json());
    } catch (err) {
      handleToast("Error connecting to server", "error");
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleToast = (message: string, severity: "success" | "error") => {
    setToast({ open: true, message, severity });
  };

  const resetForm = () => {
    setEditingId(null);
    setProgramIds([]);
    setLocationId("");
    setCoachId("");
    setDate(dayjs().format("YYYY-MM-DD"));
  };

  const saveSession = async () => {
    if (!locationId || !coachId || programIds.length === 0) {
      return handleToast("Please complete all fields", "error");
    }
    
    const payload = {
      session_date: dayjs(date).format("YYYY-MM-DD"),
      start_time: startTime.format("HH:mm:ss"),
      end_time: endTime.format("HH:mm:ss"),
      location_id: Number(locationId),
      coach_id: Number(coachId),
      program_ids: programIds
    };

    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId ? `${API_BASE}/api/admin/sessions/${editingId}` : `${API_BASE}/api/admin/sessions`;
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        handleToast(editingId ? "Session updated" : "Session scheduled!", "success");
        loadData();
        resetForm();
      }
    } catch (err) {
      handleToast("Network error", "error");
    }
  };

  const editSession = (s: any) => {
    setEditingId(s.id);
    setDate(dayjs(s.session_date).format("YYYY-MM-DD"));
    setStartTime(dayjs(s.start_time, "HH:mm:ss"));
    setEndTime(dayjs(s.end_time, "HH:mm:ss"));
    setLocationId(s.location_id);
    setCoachId(s.coach_id);
    setProgramIds(s.program_ids || []);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteSession = async (id: number) => {
    if (!window.confirm("Delete this session?")) return;
    const res = await fetch(`${API_BASE}/api/admin/sessions/${id}`, { method: "DELETE" });
    if (res.ok) {
      handleToast("Session removed", "success");
      loadData();
    }
  };

  const filteredSessions = sessions.filter(s => dayjs(s.session_date).format("YYYY-MM-DD") === filterDate);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={containerStyle}>
        
        {/* TOP BAR */}
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between" alignItems="center" mb={6}>
          <Box>
            <Typography variant="h4" fontWeight={900} letterSpacing="-1.5px" color="#1e293b">Training Schedule</Typography>
            <Typography variant="body2" color="text.secondary">Manage court availability and staff</Typography>
          </Box>
          
          <Paper sx={filterPaperStyle}>
            <FilterListIcon sx={{ color: 'text.secondary', mr: 1 }} />
            <TextField
              type="date" size="small" value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              variant="standard" InputProps={{ disableUnderline: true, sx: { fontWeight: 700 } }}
              sx={{ width: 140 }}
            />
            <Chip label={`${filteredSessions.length} Sessions`} size="small" sx={countChipStyle} />
          </Paper>
        </Stack>

        {/* INPUT CARD */}
        <Fade in timeout={600}>
          <Card sx={glassCardStyle}>
            <CardContent sx={{ p: { xs: 3, md: 6 } }}>
              <Typography variant="h6" fontWeight={800} mb={5} display="flex" alignItems="center">
                <AddBoxIcon sx={{ mr: 1.5, color: '#3b82f6' }} />
                {editingId ? "Edit Session Details" : "New Training Session"}
              </Typography>

              <Stack spacing={5}>
                {/* ROW 1: THE TIME */}
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <TextField fullWidth label="Session Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} InputLabelProps={{ shrink: true }} sx={inputStyle} />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TimePicker label="Start Time" value={startTime} onChange={setStartTime} slotProps={{ textField: { fullWidth: true, sx: inputStyle } }} />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TimePicker label="End Time" value={endTime} onChange={setEndTime} slotProps={{ textField: { fullWidth: true, sx: inputStyle } }} />
                  </Grid>
                </Grid>

                {/* ROW 2: THE RESOURCES */}
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField select fullWidth label="Assigned Coach" value={coachId} onChange={(e) => setCoachId(e.target.value)} sx={inputStyle}>
                      {coaches.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField select fullWidth label="Location / Court" value={locationId} onChange={(e) => setLocationId(e.target.value)} sx={inputStyle}>
                      {locations.map(l => <MenuItem key={l.id} value={l.id}>{l.name}</MenuItem>)}
                    </TextField>
                  </Grid>
                </Grid>

                {/* ROW 3: THE PROGRAMS */}
                <Box>
                  <TextField
                    select fullWidth label="Target Programs" value={programIds}
                    onChange={(e) => setProgramIds(typeof e.target.value === "string" ? e.target.value.split(",").map(Number) : (e.target.value as number[]))}
                    SelectProps={{ multiple: true }} sx={inputStyle}
                  >
                    {programs.map(p => <MenuItem key={p.id} value={p.id}>{p.title}</MenuItem>)}
                  </TextField>
                </Box>

                <Box pt={1}>
                  <Stack direction="row" spacing={2}>
                    <Button onClick={saveSession} sx={primaryBtnStyle}>
                      {editingId ? "Save Changes" : "Confirm Session"}
                    </Button>
                    {editingId && <Button onClick={resetForm} variant="text" sx={{ fontWeight: 800, color: '#64748b' }}>Cancel</Button>}
                  </Stack>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Fade>

        {/* AGENDA SECTION */}
        <Box mt={10}>
          <Typography variant="h5" fontWeight={900} mb={3} letterSpacing="-1px">Daily Agenda</Typography>
          {filteredSessions.length === 0 ? (
            <Paper sx={emptyPaperStyle}>No sessions scheduled for this date.</Paper>
          ) : (
            <Paper sx={tableWrapperStyle}>
              <Table>
                <TableHead sx={{ bgcolor: '#f8fafc' }}>
                  <TableRow>
                    <TableCell sx={thStyle}>TIME SLOT</TableCell>
                    <TableCell sx={thStyle}>COACH</TableCell>
                    <TableCell sx={thStyle}>PROGRAMS</TableCell>
                    <TableCell sx={thStyle} align="right">ACTIONS</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredSessions.map(s => (
                    <TableRow key={s.id} sx={{ '&:hover': { bgcolor: '#fcfcfd' } }}>
                      <TableCell sx={{ py: 3 }}>
                        <Typography variant="body2" fontWeight={800} color="#1e293b">
                          {dayjs(s.start_time, "HH:mm:ss").format("hh:mm A")} – {dayjs(s.end_time, "HH:mm:ss").format("hh:mm A")}
                        </Typography>
                      </TableCell>
                      <TableCell><Typography variant="body2" fontWeight={700} color="#3b82f6">{s.coachName}</Typography></TableCell>
                      <TableCell><Typography variant="caption" fontWeight={700} color="text.secondary">{s.programTitles}</Typography></TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={() => editSession(s)} sx={{ mr: 1 }}><EditIcon fontSize="small" /></IconButton>
                        <IconButton size="small" color="error" onClick={() => deleteSession(s.id)}><DeleteIcon fontSize="small" /></IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          )}
        </Box>

        {/* TOAST NOTIFICATION */}
        <Snackbar 
          open={toast.open} 
          autoHideDuration={4000} 
          onClose={() => setToast({ ...toast, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert severity={toast.severity} variant="filled" sx={{ width: '100%', fontWeight: 700, borderRadius: 2 }}>
            {toast.message}
          </Alert>
        </Snackbar>
      </Box>
    </LocalizationProvider>
  );
}

// --- FULL STYLE OBJECTS ---
const containerStyle = { p: { xs: 2, md: 8 }, background: "#f8fafc", minHeight: "100vh" };
const filterPaperStyle = { p: "10px 20px", display: 'flex', alignItems: 'center', borderRadius: 4, border: '1px solid #e2e8f0', boxShadow: 'none' };
const countChipStyle = { ml: 2, bgcolor: '#4f46e5', color: 'white', fontWeight: 900 };
const glassCardStyle = { borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: '0 20px 40px -12px rgba(0,0,0,0.05)', bgcolor: 'white', overflow: 'visible' };
const inputStyle = { "& .MuiOutlinedInput-root": { borderRadius: 3, bgcolor: '#fcfcfd', "& fieldset": { borderColor: '#e2e8f0' } } };
const primaryBtnStyle = {
  px: 6, py: 1.5, borderRadius: 3, fontWeight: 900, textTransform: 'none',
  background: 'linear-gradient(135deg, #2563eb, #4f46e5)', color: 'white',
  boxShadow: '0 10px 20px -5px rgba(37, 99, 235, 0.4)',
  "&:hover": { transform: 'translateY(-2px)', boxShadow: '0 20px 30px -10px rgba(37, 99, 235, 0.5)' }
};
const tableWrapperStyle = { borderRadius: 6, overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: 'none' };
const thStyle = { fontWeight: 900, color: '#64748b', fontSize: '0.75rem', letterSpacing: 1.5, py: 2 };
const emptyPaperStyle = { p: 8, textAlign: 'center', color: '#94a3b8', borderRadius: 6, border: '1px dashed #cbd5e1', bgcolor: 'transparent', fontWeight: 700 };