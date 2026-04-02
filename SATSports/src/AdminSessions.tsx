import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Box, Typography, Card, CardContent, Stack, TextField, Button, 
  MenuItem, Table, TableHead, TableRow, TableCell, TableBody, 
  IconButton, useTheme, Fade, Paper, 
  Snackbar, Alert, Chip, ToggleButton, ToggleButtonGroup, Switch, FormControlLabel, CircularProgress, LinearProgress
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

  // UI & Progress States
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" as "success" | "error" });
  const [isSaving, setIsSaving] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);

  const loadData = useCallback(async () => {
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
      setToast({ open: true, message: "Sync failed", severity: "error" });
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const resetForm = () => {
    setEditingId(null);
    setProgramIds([]);
    setLocationId("");
    setCoachId("");
    setSelectedDays([]);
    setIsMultiDay(false);
    setSyncProgress(0);
    setDate(dayjs().format("YYYY-MM-DD"));
  };

  // --- FOOLPROOF SEQUENTIAL SAVING ---
  const saveSession = async () => {
    if (!locationId || !coachId || programIds.length === 0) {
      setToast({ open: true, message: "Required fields missing", severity: "error" });
      return;
    }

    setIsSaving(true);
    setSyncProgress(0);

    const basePayload = {
      start_time: startTime.format("HH:mm:ss"),
      end_time: endTime.format("HH:mm:ss"),
      location_id: Number(locationId),
      coach_id: Number(coachId),
      program_ids: programIds
    };

    try {
      // MODE 1: Single Update or Single Create
      if (editingId || !isMultiDay) {
        const url = editingId ? `${API_BASE}/api/admin/sessions/${editingId}` : `${API_BASE}/api/admin/sessions`;
        const res = await fetch(url, {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...basePayload, session_date: date })
        });
        if (!res.ok) throw new Error("Server rejected request");
      } 
      
      // MODE 2: Multi-Day Sequential Logic (No Bulk API)
      else {
        if (selectedDays.length === 0) throw new Error("Select repeat days");
        
        let current = dayjs(date);
        const last = dayjs(endDate);
        const targetDates: string[] = [];

        while (current.isBefore(last) || current.isSame(last)) {
          if (selectedDays.includes(current.day())) {
            targetDates.push(current.format("YYYY-MM-DD"));
          }
          current = current.add(1, 'day');
        }

        // Sequential Loop to prevent 429 errors or DB locks
        for (let i = 0; i < targetDates.length; i++) {
          const res = await fetch(`${API_BASE}/api/admin/sessions`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...basePayload, session_date: targetDates[i] })
          });
          if (!res.ok) console.warn(`Skipped: ${targetDates[i]} (Conflict/Error)`);
          
          setSyncProgress(Math.round(((i + 1) / targetDates.length) * 100));
        }
      }

      setToast({ open: true, message: "Schedule Updated Successfully", severity: "success" });
      loadData();
      resetForm();
    } catch (err: any) {
      setToast({ open: true, message: err.message || "Execution Error", severity: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  const deleteSession = async (id: number) => {
    if (!window.confirm("Permanent Delete?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/sessions/${id}`, { method: "DELETE" });
      if (res.ok) {
        setToast({ open: true, message: "Session Removed", severity: "success" });
        loadData();
      }
    } catch (err) {
      setToast({ open: true, message: "Delete failed", severity: "error" });
    }
  };

  const editSession = (s: any) => {
    setEditingId(s.id);
    setIsMultiDay(false); // Force off during edit for safety
    setDate(dayjs(s.session_date).format("YYYY-MM-DD"));
    setStartTime(dayjs(s.start_time, "HH:mm:ss"));
    setEndTime(dayjs(s.end_time, "HH:mm:ss"));
    setLocationId(s.location_id);
    setCoachId(s.coach_id);
    setProgramIds(s.program_ids || []);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filteredSessions = useMemo(() => 
    sessions.filter(s => dayjs(s.session_date).format("YYYY-MM-DD") === filterDate),
    [sessions, filterDate]
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={containerStyle}>
        
        {/* HEADER */}
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between" alignItems="center" mb={6}>
          <Box>
            <Typography variant="h4" fontWeight={900} color="#0f172a">Scheduler</Typography>
            <Typography variant="body2" color="text.secondary">SAT Sports Academy Operations</Typography>
          </Box>
          
          <Paper sx={filterPaperStyle}>
            <FilterListIcon sx={{ color: 'text.secondary', mr: 1 }} />
            <TextField
              type="date" size="small" value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              variant="standard" InputProps={{ disableUnderline: true, sx: { fontWeight: 800 } }}
              sx={{ width: 140 }}
            />
            <Chip label={`${filteredSessions.length} Active`} size="small" sx={countChipStyle} />
          </Paper>
        </Stack>

        {/* INPUT FORM */}
        <Fade in timeout={600}>
          <Card sx={glassCardStyle}>
            <CardContent sx={{ p: { xs: 3, md: 5 } }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h6" fontWeight={900} color="#1e293b">
                  {editingId ? "Modify Session" : "Create Schedule"}
                </Typography>
                {!editingId && (
                  <FormControlLabel
                    control={<Switch checked={isMultiDay} onChange={(e) => setIsMultiDay(e.target.checked)} color="primary" />}
                    label={<Typography fontWeight={800} variant="body2">Bulk Repeat</Typography>}
                  />
                )}
              </Stack>

              <Stack spacing={4}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                   <TextField fullWidth label={isMultiDay ? "Start From" : "Date"} type="date" value={date} onChange={(e) => setDate(e.target.value)} InputLabelProps={{ shrink: true }} sx={inputStyle} />
                   {isMultiDay && (
                     <TextField fullWidth label="Repeat Until" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} InputLabelProps={{ shrink: true }} sx={inputStyle} />
                   )}
                </Stack>

                {isMultiDay && (
                  <Box>
                    <Typography variant="caption" fontWeight={900} color="primary" sx={{ mb: 1, display: 'block' }}>RECURRING DAYS</Typography>
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
                  <TimePicker label="Start" value={startTime} onChange={setStartTime} slotProps={{ textField: { fullWidth: true, sx: inputStyle } }} />
                  <TimePicker label="End" value={endTime} onChange={setEndTime} slotProps={{ textField: { fullWidth: true, sx: inputStyle } }} />
                </Stack>

                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <TextField select fullWidth label="Coach" value={coachId} onChange={(e) => setCoachId(e.target.value)} sx={inputStyle}>
                    {coaches.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                  </TextField>
                  <TextField select fullWidth label="Court" value={locationId} onChange={(e) => setLocationId(e.target.value)} sx={inputStyle}>
                    {locations.map(l => <MenuItem key={l.id} value={l.id}>{l.name}</MenuItem>)}
                  </TextField>
                </Stack>

                <TextField
                  select fullWidth label="Programs" value={programIds}
                  onChange={(e) => setProgramIds(typeof e.target.value === "string" ? e.target.value.split(",").map(Number) : (e.target.value as number[]))}
                  SelectProps={{ multiple: true }} sx={inputStyle}
                >
                  {programs.map(p => <MenuItem key={p.id} value={p.id}>{p.title}</MenuItem>)}
                </TextField>

                <Box>
                  {isSaving && isMultiDay && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" fontWeight={900}>Generating Sessions: {syncProgress}%</Typography>
                      <LinearProgress variant="determinate" value={syncProgress} sx={{ height: 8, borderRadius: 4, mt: 1 }} />
                    </Box>
                  )}
                  <Stack direction="row" spacing={2}>
                    <Button onClick={saveSession} disabled={isSaving} sx={primaryBtnStyle}>
                      {isSaving ? <CircularProgress size={24} color="inherit" /> : editingId ? "Save Changes" : isMultiDay ? "Execute Bulk Schedule" : "Add Session"}
                    </Button>
                    {editingId && (
                      <Button onClick={resetForm} variant="outlined" sx={{ borderRadius: 3, fontWeight: 800 }}>Cancel</Button>
                    )}
                  </Stack>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Fade>

        {/* AGENDA */}
        <Box mt={8}>
          <Typography variant="h5" fontWeight={900} mb={3}>Daily Agenda</Typography>
          {filteredSessions.length === 0 ? (
            <Paper sx={emptyPaperStyle}>No sessions for this date</Paper>
          ) : (
            <TableContainer component={Paper} sx={tableWrapperStyle}>
              <Table>
                <TableHead sx={{ bgcolor: '#f1f5f9' }}>
                  <TableRow>
                    <TableCell sx={thStyle}>TIME</TableCell>
                    <TableCell sx={thStyle}>STAFF</TableCell>
                    <TableCell sx={thStyle}>LOCATION</TableCell>
                    <TableCell sx={thStyle}>TARGET</TableCell>
                    <TableCell sx={thStyle} align="right">ACTION</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredSessions.map(s => (
                    <TableRow key={s.id}>
                      <TableCell sx={{ fontWeight: 800 }}>
                        {dayjs(s.start_time, "HH:mm:ss").format("hh:mm A")}
                      </TableCell>
                      <TableCell sx={{ color: '#2563eb', fontWeight: 700 }}>{s.coachName}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{s.locationName}</TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5} flexWrap="wrap">
                          {s.programTitles?.split(',').map((p: string) => (
                            <Chip key={p} label={p.trim()} size="small" sx={{ fontSize: '0.65rem', fontWeight: 800 }} />
                          ))}
                        </Stack>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={() => editSession(s)}><EditIcon fontSize="inherit" /></IconButton>
                        <IconButton size="small" color="error" onClick={() => deleteSession(s.id)}><DeleteIcon fontSize="inherit" /></IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>

        <Snackbar open={toast.open} autoHideDuration={4000} onClose={() => setToast({ ...toast, open: false })}>
          <Alert severity={toast.severity} variant="filled" sx={{ fontWeight: 700 }}>{toast.message}</Alert>
        </Snackbar>
      </Box>
    </LocalizationProvider>
  );
}

// --- STYLES ---
const containerStyle = { p: { xs: 2, md: 6 }, background: "#f8fafc", minHeight: "100vh" };
const filterPaperStyle = { p: "8px 16px", display: 'flex', alignItems: 'center', borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: 'none' };
const countChipStyle = { ml: 2, bgcolor: '#0f172a', color: 'white', fontWeight: 900 };
const glassCardStyle = { borderRadius: 6, border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' };
const inputStyle = { "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: '#fcfcfd' } };
const primaryBtnStyle = {
  px: 4, py: 1.5, borderRadius: 2, fontWeight: 900, textTransform: 'none',
  background: '#0f172a', color: 'white', "&:hover": { background: '#1e293b' }
};
const tableWrapperStyle = { borderRadius: 4, border: '1px solid #e2e8f0', boxShadow: 'none' };
const thStyle = { fontWeight: 900, color: '#64748b', fontSize: '0.7rem', letterSpacing: 1, py: 2 };
const emptyPaperStyle = { p: 6, textAlign: 'center', color: '#94a3b8', borderRadius: 4, border: '1px dashed #cbd5e1', bgcolor: 'transparent', fontWeight: 700 };
const dayToggleStyle = { 
  flex: 1, borderRadius: "8px !important", border: "1px solid #e2e8f0 !important", fontWeight: 900,
  "&.Mui-selected": { bgcolor: "#0f172a !important", color: "white" }
};