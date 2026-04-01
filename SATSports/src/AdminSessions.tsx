import React, { useState, useEffect } from "react";
import {
  Box, Typography, Card, CardContent, Stack, TextField, Button, 
  MenuItem, Table, TableHead, TableRow, TableCell, TableBody, 
  IconButton, useMediaQuery, useTheme, Fade, Paper, 
  Snackbar, Alert, Chip, ToggleButton, ToggleButtonGroup, Switch, FormControlLabel, CircularProgress
} from "@mui/material";
import { LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddBoxIcon from "@mui/icons-material/AddBox";
import FilterListIcon from "@mui/icons-material/FilterList";
import API_BASE from "./api";

const DAYS = [
  { label: "S", value: 0 }, { label: "M", value: 1 }, { label: "T", value: 2 },
  { label: "W", value: 3 }, { label: "T", value: 4 }, { label: "F", value: 5 }, { label: "S", value: 6 },
];

export default function AdminSessions() {
  // Data States
  const [sessions, setSessions] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [coaches, setCoaches] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);

  // Multi-Day States
  const [isMultiDay, setIsMultiDay] = useState(false);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [endDate, setEndDate] = useState(dayjs().add(1, 'month').format("YYYY-MM-DD"));

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
  const [isSaving, setIsSaving] = useState(false);
  const theme = useTheme();

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
      setToast({ open: true, message: "Server connection failed", severity: "error" });
    }
  };

  useEffect(() => { loadData(); }, []);

  const resetForm = () => {
    setEditingId(null);
    setProgramIds([]);
    setLocationId("");
    setCoachId("");
    setSelectedDays([]);
    setIsMultiDay(false);
    setDate(dayjs().format("YYYY-MM-DD"));
  };

  const saveSession = async () => {
    if (!locationId || !coachId || programIds.length === 0) {
      setToast({ open: true, message: "Please fill all fields", severity: "error" });
      return;
    }

    setIsSaving(true);
    try {
      const basePayload = {
        start_time: startTime.format("HH:mm:ss"),
        end_time: endTime.format("HH:mm:ss"),
        location_id: Number(locationId),
        coach_id: Number(coachId),
        program_ids: programIds
      };

      if (!isMultiDay || editingId) {
        // Standard single save or Update
        const url = editingId ? `${API_BASE}/api/admin/sessions/${editingId}` : `${API_BASE}/api/admin/sessions`;
        const res = await fetch(url, {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...basePayload, session_date: date })
        });
        if (!res.ok) throw new Error();
      } else {
        // Multi-day Bulk Insert
        if (selectedDays.length === 0) throw new Error("Select at least one day");
        let current = dayjs(date);
        const last = dayjs(endDate);
        const promises = [];

        while (current.isBefore(last) || current.isSame(last)) {
          if (selectedDays.includes(current.day())) {
            promises.push(
              fetch(`${API_BASE}/api/admin/sessions`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...basePayload, session_date: current.format("YYYY-MM-DD") })
              })
            );
          }
          current = current.add(1, 'day');
        }
        await Promise.all(promises);
      }

      setToast({ open: true, message: "Sessions Synced Successfully", severity: "success" });
      loadData();
      resetForm();
    } catch (err) {
      setToast({ open: true, message: "Error saving schedule", severity: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  const deleteSession = async (id: number) => {
    if (!window.confirm("Delete this session?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/sessions/${id}`, { method: "DELETE" });
      if (res.ok) {
        setToast({ open: true, message: "Session Deleted", severity: "success" });
        loadData();
      }
    } catch (err) {
      setToast({ open: true, message: "Delete failed", severity: "error" });
    }
  };

  const editSession = (s: any) => {
    setEditingId(s.id);
    setIsMultiDay(false);
    setDate(dayjs(s.session_date).format("YYYY-MM-DD"));
    setStartTime(dayjs(s.start_time, "HH:mm:ss"));
    setEndTime(dayjs(s.end_time, "HH:mm:ss"));
    setLocationId(s.location_id);
    setCoachId(s.coach_id);
    setProgramIds(s.program_ids || []);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filteredSessions = sessions.filter(s => dayjs(s.session_date).format("YYYY-MM-DD") === filterDate);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={containerStyle}>
        
        {/* HEADER */}
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between" alignItems="center" mb={6}>
          <Box>
            <Typography variant="h4" fontWeight={900} letterSpacing="-1.5px" color="#1e293b">Training Schedule</Typography>
            <Typography variant="body2" color="text.secondary">Configure court times and staff assignments</Typography>
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

        {/* INPUT FORM */}
        <Fade in timeout={600}>
          <Card sx={glassCardStyle}>
            <CardContent sx={{ p: { xs: 3, md: 6 } }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h6" fontWeight={800} display="flex" alignItems="center" color="#1e293b">
                  <AddBoxIcon sx={{ mr: 1.5, color: '#3b82f6' }} />
                  {editingId ? "Edit Training Details" : "Schedule New Session"}
                </Typography>
                {!editingId && (
                  <FormControlLabel
                    control={<Switch checked={isMultiDay} onChange={(e) => setIsMultiDay(e.target.checked)} color="primary" />}
                    label={<Typography fontWeight={700} variant="body2">Repeat Schedule</Typography>}
                  />
                )}
              </Stack>

              <Stack spacing={4} sx={{ maxWidth: '800px' }}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                   <TextField fullWidth label={isMultiDay ? "Start Date" : "Session Date"} type="date" value={date} onChange={(e) => setDate(e.target.value)} InputLabelProps={{ shrink: true }} sx={inputStyle} />
                   {isMultiDay && (
                     <TextField fullWidth label="Repeat Until" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} InputLabelProps={{ shrink: true }} sx={inputStyle} />
                   )}
                </Stack>

                {isMultiDay && (
                  <Box>
                    <Typography variant="caption" fontWeight={900} color="text.secondary" sx={{ letterSpacing: 1, mb: 1, display: 'block' }}>SELECT DAYS TO ASSIGN</Typography>
                    <ToggleButtonGroup 
                      fullWidth value={selectedDays} 
                      onChange={(_, val) => setSelectedDays(val)}
                      sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}
                    >
                      {DAYS.map(d => (
                        <ToggleButton key={d.value} value={d.value} sx={dayToggleStyle}>
                          {d.label}
                        </ToggleButton>
                      ))}
                    </ToggleButtonGroup>
                  </Box>
                )}
                
                <Stack direction="row" spacing={2}>
                  <TimePicker label="Start Time" value={startTime} onChange={setStartTime} slotProps={{ textField: { fullWidth: true, sx: inputStyle } }} />
                  <TimePicker label="End Time" value={endTime} onChange={setEndTime} slotProps={{ textField: { fullWidth: true, sx: inputStyle } }} />
                </Stack>

                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <TextField select fullWidth label="Assigned Coach" value={coachId} onChange={(e) => setCoachId(e.target.value)} sx={inputStyle}>
                    {coaches.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                  </TextField>
                  <TextField select fullWidth label="Location / Court" value={locationId} onChange={(e) => setLocationId(e.target.value)} sx={inputStyle}>
                    {locations.map(l => <MenuItem key={l.id} value={l.id}>{l.name}</MenuItem>)}
                  </TextField>
                </Stack>

                <TextField
                  select fullWidth label="Target Programs" value={programIds}
                  onChange={(e) => setProgramIds(typeof e.target.value === "string" ? e.target.value.split(",").map(Number) : (e.target.value as number[]))}
                  SelectProps={{ multiple: true }} sx={inputStyle}
                >
                  {programs.map(p => <MenuItem key={p.id} value={p.id}>{p.title}</MenuItem>)}
                </TextField>

                <Box pt={2}>
                  <Stack direction="row" spacing={2}>
                    <Button onClick={saveSession} disabled={isSaving} sx={primaryBtnStyle}>
                      {isSaving ? <CircularProgress size={24} color="inherit" /> : editingId ? "Update Schedule" : isMultiDay ? "Generate Multi-Day Sessions" : "Confirm Session"}
                    </Button>
                    {editingId && (
                      <Button onClick={resetForm} variant="outlined" sx={{ borderRadius: 3, fontWeight: 700, px: 4 }}>Cancel</Button>
                    )}
                  </Stack>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Fade>

        {/* AGENDA GRID */}
        <Box mt={10}>
          <Typography variant="h5" fontWeight={900} mb={3} letterSpacing="-1px">Daily Agenda</Typography>
          
          {filteredSessions.length === 0 ? (
            <Paper sx={emptyPaperStyle}>No training sessions scheduled for this date.</Paper>
          ) : (
            <Paper sx={tableWrapperStyle}>
              <Table>
                <TableHead sx={{ bgcolor: '#f8fafc' }}>
                  <TableRow>
                    <TableCell sx={thStyle}>TIME SLOT</TableCell>
                    <TableCell sx={thStyle}>COACH</TableCell>
                    <TableCell sx={thStyle}>LOCATION</TableCell>
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
                      <TableCell>
                        <Typography variant="body2" fontWeight={700} color="#3b82f6">{s.coachName}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600} color="text.secondary">{s.locationName}</Typography>
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

        <Snackbar open={toast.open} autoHideDuration={4000} onClose={() => setToast({ ...toast, open: false })}>
          <Alert severity={toast.severity} variant="filled">{toast.message}</Alert>
        </Snackbar>
      </Box>
    </LocalizationProvider>
  );
}

// --- STYLES ---
const containerStyle = { p: { xs: 2, md: 8 }, background: "#f8fafc", minHeight: "100vh" };
const filterPaperStyle = { p: "10px 20px", display: 'flex', alignItems: 'center', borderRadius: 4, border: '1px solid #e2e8f0', boxShadow: 'none', bgcolor: 'white' };
const countChipStyle = { ml: 2, bgcolor: '#4f46e5', color: 'white', fontWeight: 900 };
const glassCardStyle = { borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: '0 20px 40px -12px rgba(0,0,0,0.05)', bgcolor: 'white' };
const inputStyle = { "& .MuiOutlinedInput-root": { borderRadius: 3, bgcolor: '#fcfcfd' } };
const primaryBtnStyle = {
  px: 6, py: 1.5, borderRadius: 3, fontWeight: 900, textTransform: 'none',
  background: 'linear-gradient(135deg, #2563eb, #4f46e5)', color: 'white',
  "&:hover": { transform: 'translateY(-2px)' }
};
const tableWrapperStyle = { borderRadius: 6, overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: 'none' };
const thStyle = { fontWeight: 900, color: '#64748b', fontSize: '0.75rem', letterSpacing: 1.5, py: 2 };
const emptyPaperStyle = { p: 8, textAlign: 'center', color: '#94a3b8', borderRadius: 6, border: '1px dashed #cbd5e1', bgcolor: 'transparent', fontWeight: 700 };
const dayToggleStyle = { 
  flex: 1, borderRadius: "12px !important", border: "1px solid #e2e8f0 !important", fontWeight: 900,
  "&.Mui-selected": { bgcolor: "#2563eb !important", color: "white" }
};