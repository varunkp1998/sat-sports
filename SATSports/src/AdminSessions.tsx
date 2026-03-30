import React, { useState, useEffect } from "react";
import {
  Box, Typography, Card, CardContent, Stack, TextField, Button, 
  MenuItem, Table, TableHead, TableRow, TableCell, TableBody, 
  IconButton, useMediaQuery, useTheme, Fade, Grid, Chip, Paper
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
  const [sessions, setSessions] = useState([]);
  const [locations, setLocations] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [programs, setPrograms] = useState([]);

  const [editingId, setEditingId] = useState(null);
  const [date, setDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [startTime, setStartTime] = useState(dayjs().set('hour', 9).set('minute', 0));
  const [endTime, setEndTime] = useState(dayjs().set('hour', 10).set('minute', 0));
  const [locationId, setLocationId] = useState("");
  const [coachId, setCoachId] = useState("");
  const [programIds, setProgramIds] = useState([]);
  const [filterDate, setFilterDate] = useState(dayjs().format("YYYY-MM-DD"));

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const loadSessions = () => {
    fetch(`${API_BASE}/api/admin/sessions`).then(res => res.json()).then(setSessions);
  };

  useEffect(() => {
    loadSessions();
    fetch(`${API_BASE}/api/admin/locations`).then(r => r.json()).then(setLocations);
    fetch(`${API_BASE}/api/admin/coaches`).then(r => r.json()).then(setCoaches);
    fetch(`${API_BASE}/api/admin/programs`).then(r => r.json()).then(setPrograms);
  }, []);

  const filteredSessions = sessions.filter(s => dayjs(s.session_date).format("YYYY-MM-DD") === filterDate);

  const saveSession = () => {
    if (!locationId || !coachId) return alert("Please select Location and Coach");
    
    const payload = {
      session_date: dayjs(date).format("YYYY-MM-DD"),
      start_time: startTime.format("HH:mm:ss"),
      end_time: endTime.format("HH:mm:ss"),
      location_id: Number(locationId),
      coach_id: Number(coachId),
      program_ids: programIds
    };

    fetch(editingId ? `${API_BASE}/api/admin/sessions/${editingId}` : `${API_BASE}/api/admin/sessions`, {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }).then(() => {
      loadSessions();
      resetForm();
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setProgramIds([]);
    setLocationId("");
    setCoachId("");
  };

  const editSession = (s) => {
    setEditingId(s.id);
    setDate(dayjs(s.session_date).format("YYYY-MM-DD"));
    setStartTime(dayjs(s.start_time, "HH:mm:ss"));
    setEndTime(dayjs(s.end_time, "HH:mm:ss"));
    setLocationId(s.location_id);
    setCoachId(s.coach_id);
    setProgramIds(s.programIds || []);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteSession = (id) => {
    if (!window.confirm("Permanent Delete?")) return;
    fetch(`${API_BASE}/api/admin/sessions/${id}`, { method: "DELETE" }).then(loadSessions);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={containerStyle}>
        
        {/* HEADER & FILTER BAR */}
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between" alignItems="center" mb={4}>
          <Box>
            <Typography variant="h4" fontWeight={900} letterSpacing="-1px">Training Schedule</Typography>
            <Typography variant="body2" color="text.secondary">Manage academy sessions and coach assignments</Typography>
          </Box>
          
          <Paper sx={filterPaperStyle}>
            <FilterListIcon sx={{ color: 'text.secondary', mr: 1 }} />
            <TextField
              type="date"
              size="small"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              variant="standard"
              InputProps={{ disableUnderline: true }}
              sx={{ width: 150 }}
            />
            <Chip label={`${filteredSessions.length} Sessions`} size="small" sx={countChipStyle} />
          </Paper>
        </Stack>

        {/* EDITOR SECTION */}
        <Fade in timeout={600}>
          <Card sx={glassCardStyle}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" fontWeight={800} mb={3} display="flex" alignItems="center">
                <AddBoxIcon sx={{ mr: 1, color: '#3b82f6' }} />
                {editingId ? "Modify Session" : "Schedule New Session"}
              </Typography>

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

                <Grid item xs={12}>
                  <TextField
                    select fullWidth label="Target Programs" value={programIds}
                    onChange={(e) => setProgramIds(typeof e.target.value === "string" ? e.target.value.split(",").map(Number) : e.target.value)}
                    SelectProps={{ multiple: true }} sx={inputStyle}
                  >
                    {programs.map(p => <MenuItem key={p.id} value={p.id}>{p.title}</MenuItem>)}
                  </TextField>
                </Grid>

                <Grid item xs={12}>
                  <Stack direction="row" spacing={2}>
                    <Button fullWidth onClick={saveSession} sx={primaryBtnStyle}>
                      {editingId ? "Update Schedule" : "Confirm Session"}
                    </Button>
                    {editingId && <Button onClick={resetForm} color="inherit" sx={{ fontWeight: 700 }}>Cancel</Button>}
                  </Stack>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Fade>

        {/* LIST SECTION */}
        <Box mt={5}>
          <Typography variant="h6" fontWeight={800} mb={2}>Daily Agenda</Typography>
          {filteredSessions.length === 0 ? (
            <Paper sx={emptyPaperStyle}>No sessions scheduled for this date.</Paper>
          ) : isMobile ? (
            <Stack spacing={2}>
              {filteredSessions.map(s => (
                <Card key={s.id} sx={sessionCardMobile}>
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Box>
                        <Typography variant="h6" fontWeight={800} color="#1e293b">
                          {dayjs(s.start_time, "HH:mm:ss").format("hh:mm A")}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                          <AccessTimeIcon sx={{ fontSize: 14, mr: 0.5 }} /> Duration: 1hr
                        </Typography>
                      </Box>
                      <Chip label={s.coachName} size="small" sx={{ fontWeight: 700, bgcolor: '#f1f5f9' }} />
                    </Stack>
                    <Divider sx={{ my: 1.5 }} />
                    <Typography variant="body2" fontWeight={600}>{s.programTitles || "No programs linked"}</Typography>
                    <Stack direction="row" spacing={1} mt={2}>
                      <IconButton size="small" onClick={() => editSession(s)} sx={editIconBtn}><EditIcon fontSize="small"/></IconButton>
                      <IconButton size="small" color="error" onClick={() => deleteSession(s.id)} sx={deleteIconBtn}><DeleteIcon fontSize="small"/></IconButton>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          ) : (
            <Paper sx={tableWrapperStyle}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f8fafc' }}>
                    <TableCell sx={thStyle}>TIME SLOT</TableCell>
                    <TableCell sx={thStyle}>COACH</TableCell>
                    <TableCell sx={thStyle}>PROGRAMS</TableCell>
                    <TableCell sx={thStyle} align="right">ACTIONS</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredSessions.map(s => (
                    <TableRow key={s.id} sx={{ '&:hover': { bgcolor: '#fcfcfd' } }}>
                      <TableCell>
                        <Typography variant="body2" fontWeight={800}>
                          {dayjs(s.start_time, "HH:mm:ss").format("hh:mm A")} – {dayjs(s.end_time, "HH:mm:ss").format("hh:mm A")}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600} color="primary">{s.coachName}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" fontWeight={700} color="text.secondary">{s.programTitles}</Typography>
                      </TableCell>
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
      </Box>
    </LocalizationProvider>
  );
}

// --- STYLES ---
const containerStyle = { p: { xs: 2, md: 5 }, background: "#f8fafc", minHeight: "100vh" };

const filterPaperStyle = {
  p: "8px 16px", display: 'flex', alignItems: 'center', borderRadius: 4,
  border: '1px solid #e2e8f0', boxShadow: 'none'
};

const countChipStyle = { ml: 2, bgcolor: '#4f46e5', color: 'white', fontWeight: 800 };

const glassCardStyle = {
  borderRadius: 6, border: '1px solid #e2e8f0', boxShadow: '0 15px 35px -10px rgba(0,0,0,0.05)',
  bgcolor: 'white'
};

const inputStyle = {
  "& .MuiOutlinedInput-root": { borderRadius: 3, bgcolor: '#f8fafc' }
};

const primaryBtnStyle = {
  py: 1.5, borderRadius: 3, fontWeight: 900, textTransform: 'none',
  background: 'linear-gradient(135deg, #2563eb, #4f46e5)', color: 'white',
  boxShadow: '0 10px 20px -5px rgba(37, 99, 235, 0.4)',
  "&:hover": { transform: 'translateY(-2px)', boxShadow: '0 20px 30px -10px rgba(37, 99, 235, 0.5)' }
};

const tableWrapperStyle = { borderRadius: 4, overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: 'none' };
const thStyle = { fontWeight: 800, color: '#64748b', fontSize: '0.75rem', letterSpacing: 1 };

const sessionCardMobile = { borderRadius: 4, border: '1px solid #e2e8f0', boxShadow: 'none', mb: 2 };
const editIconBtn = { bgcolor: '#eff6ff', color: '#2563eb', '&:hover': { bgcolor: '#2563eb', color: 'white' } };
const deleteIconBtn = { bgcolor: '#fff1f2', color: '#e11d48', '&:hover': { bgcolor: '#e11d48', color: 'white' } };
const emptyPaperStyle = { p: 4, textAlign: 'center', color: 'text.secondary', borderRadius: 4, border: '1px dashed #cbd5e1', bgcolor: 'transparent' };