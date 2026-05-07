import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Box, Typography, Card, CardContent, Stack, TextField, Button, 
  MenuItem, Table, TableHead, TableRow, TableCell, TableBody, TableContainer,
  IconButton, Fade, Paper, Snackbar, Alert, Chip, ToggleButton, 
  ToggleButtonGroup, Switch, FormControlLabel, CircularProgress, LinearProgress
} from "@mui/material";
import { LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import FilterListIcon from "@mui/icons-material/FilterList";
import API_BASE from "./api";

// --- CONSTANTS ---
const DAYS = [
  { label: "S", value: 0 }, { label: "M", value: 1 }, { label: "T", value: 2 },
  { label: "W", value: 3 }, { label: "T", value: 4 }, { label: "F", value: 5 }, { label: "S", value: 6 },
];

export default function AdminSessions() {
  // Master Data
  const [sessions, setSessions] = useState<any[]>([]);
  const [lookups, setLookups] = useState({ locations: [], coaches: [], programs: [] });

  // Scheduler Configuration
  const [isMultiDay, setIsMultiDay] = useState(false);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [dateRange, setDateRange] = useState({ start: dayjs(), end: dayjs().add(1, 'month') });
  
  // Form State
  const [form, setForm] = useState({
    id: null as number | null,
    start: dayjs().set('hour', 9).set('minute', 0),
    end: dayjs().set('hour', 10).set('minute', 0),
    locationId: "",
    coachId: "",
    programIds: [] as number[],
  });

  // UI State
  const [filterDate, setFilterDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [status, setStatus] = useState({ saving: false, progress: 0, loading: true });
  const [toast, setToast] = useState({ open: false, msg: "", type: "success" as any });

  const fetchData = useCallback(async () => {
    try {
      const [s, l, c, p] = await Promise.all([
        fetch(`${API_BASE}/api/admin/sessions`).then(r => r.json()),
        fetch(`${API_BASE}/api/admin/locations`).then(r => r.json()),
        fetch(`${API_BASE}/api/admin/coaches`).then(r => r.json()),
        fetch(`${API_BASE}/api/admin/programs`).then(r => r.json())
      ]);
      setSessions(s);
      setLookups({ locations: l, coaches: c, programs: p });
    } catch {
      setToast({ open: true, msg: "Data sync failed", type: "error" });
    } finally {
      setStatus(prev => ({ ...prev, loading: false }));
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // --- LOGIC: BATCH GENERATION ---
  const handleSave = async () => {
    const { id, start, end, locationId, coachId, programIds } = form;
    if (!locationId || !coachId || programIds.length === 0) {
      return setToast({ open: true, msg: "Missing required fields", type: "error" });
    }

    setStatus(s => ({ ...s, saving: true, progress: 0 }));

    const payloadBase = {
      start_time: start.format("HH:mm:ss"),
      end_time: end.format("HH:mm:ss"),
      location_id: Number(locationId),
      coach_id: Number(coachId),
      program_ids: programIds
    };

    try {
      if (id || !isMultiDay) {
        // Single Entry
        const url = id ? `${API_BASE}/api/admin/sessions/${id}` : `${API_BASE}/api/admin/sessions`;
        await fetch(url, {
          method: id ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payloadBase, session_date: dateRange.start.format("YYYY-MM-DD") })
        });
      } else {
        // Multi-Day Generation
        let current = dateRange.start;
        const targetDates: string[] = [];
        while (current.isBefore(dateRange.end) || current.isSame(dateRange.end)) {
          if (selectedDays.includes(current.day())) targetDates.push(current.format("YYYY-MM-DD"));
          current = current.add(1, 'day');
        }

        for (let i = 0; i < targetDates.length; i++) {
          await fetch(`${API_BASE}/api/admin/sessions`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...payloadBase, session_date: targetDates[i] })
          });
          setStatus(s => ({ ...s, progress: Math.round(((i + 1) / targetDates.length) * 100) }));
        }
      }

      setToast({ open: true, msg: "Schedule published", type: "success" });
      setForm({ id: null, start: dayjs().set('hour', 9), end: dayjs().set('hour', 10), locationId: "", coachId: "", programIds: [] });
      setIsMultiDay(false);
      fetchData();
    } catch {
      setToast({ open: true, msg: "Error saving schedule", type: "error" });
    } finally {
      setStatus(s => ({ ...s, saving: false }));
    }
  };

  const filteredSessions = useMemo(() => 
    sessions.filter(s => s.session_date === filterDate),
    [sessions, filterDate]
  );

  if (status.loading) return <Box sx={centerStyle}><CircularProgress color="inherit" /></Box>;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={rootStyle}>
        
        {/* TOP NAV AREA */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
          <Box>
            <Typography variant="h4" fontWeight={950} sx={{ letterSpacing: -1 }}>ADMIN <span style={{color: '#ef4444'}}>SESSIONS</span></Typography>
            <Typography variant="body2" sx={{ opacity: 0.6 }}>Manage academy capacity and staff deployment.</Typography>
          </Box>
          
          <Paper sx={filterPaperStyle}>
            <FilterListIcon sx={{ fontSize: 18, mr: 1, opacity: 0.5 }} />
            <input 
              type="date" 
              value={filterDate} 
              onChange={e => setFilterDate(e.target.value)}
              style={rawInputStyle} 
            />
          </Paper>
        </Stack>

        {/* INPUT PANEL */}
        <Card sx={glassCardStyle}>
          <CardContent sx={{ p: 4 }}>
            <Stack direction="row" justifyContent="space-between" mb={3}>
              <Typography variant="subtitle1" fontWeight={900}>{form.id ? "EDIT SESSION" : "NEW SCHEDULE"}</Typography>
              {!form.id && (
                <FormControlLabel
                  control={<Switch size="small" checked={isMultiDay} onChange={e => setIsMultiDay(e.target.checked)} />}
                  label={<Typography variant="caption" fontWeight={900}>RECURRING MODE</Typography>}
                />
              )}
            </Stack>

            <GridContainer>
              <Box gridColumn="span 12">
                <Stack direction="row" spacing={2}>
                  <TextField 
                    type="date" 
                    fullWidth 
                    label={isMultiDay ? "Start Date" : "Session Date"}
                    value={dateRange.start.format("YYYY-MM-DD")}
                    onChange={e => setDateRange(p => ({...p, start: dayjs(e.target.value)}))}
                    InputLabelProps={{ shrink: true }}
                    sx={inputStyle}
                  />
                  {isMultiDay && (
                    <TextField 
                      type="date" 
                      fullWidth 
                      label="End Date"
                      value={dateRange.end.format("YYYY-MM-DD")}
                      onChange={e => setDateRange(p => ({...p, end: dayjs(e.target.value)}))}
                      InputLabelProps={{ shrink: true }}
                      sx={inputStyle}
                    />
                  )}
                </Stack>
              </Box>

              {isMultiDay && (
                <Box gridColumn="span 12">
                  <ToggleButtonGroup 
                    fullWidth 
                    value={selectedDays} 
                    onChange={(_, v) => setSelectedDays(v)}
                    sx={{ gap: 1 }}
                  >
                    {DAYS.map(d => (
                      <ToggleButton key={d.value} value={d.value} sx={dayBtnStyle}>{d.label}</ToggleButton>
                    ))}
                  </ToggleButtonGroup>
                </Box>
              )}

              <Box gridColumn="span 6">
                <TimePicker label="Start Time" value={form.start} onChange={v => setForm(p => ({...p, start: v as Dayjs}))} slotProps={{ textField: { fullWidth: true, sx: inputStyle }}} />
              </Box>
              <Box gridColumn="span 6">
                <TimePicker label="End Time" value={form.end} onChange={v => setForm(p => ({...p, end: v as Dayjs}))} slotProps={{ textField: { fullWidth: true, sx: inputStyle }}} />
              </Box>

              <Box gridColumn="span 6">
                <TextField select fullWidth label="Coach" value={form.coachId} onChange={e => setForm(p => ({...p, coachId: e.target.value}))} sx={inputStyle}>
                  {lookups.coaches.map((c: any) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                </TextField>
              </Box>
              <Box gridColumn="span 6">
                <TextField select fullWidth label="Court" value={form.locationId} onChange={e => setForm(p => ({...p, locationId: e.target.value}))} sx={inputStyle}>
                  {lookups.locations.map((l: any) => <MenuItem key={l.id} value={l.id}>{l.name}</MenuItem>)}
                </TextField>
              </Box>

              <Box gridColumn="span 12">
                <TextField
                  select fullWidth label="Select Programs"
                  value={form.programIds}
                  SelectProps={{ multiple: true }}
                  onChange={e => setForm(p => ({...p, programIds: e.target.value as number[]}))}
                  sx={inputStyle}
                >
                  {lookups.programs.map((pr: any) => <MenuItem key={pr.id} value={pr.id}>{pr.title}</MenuItem>)}
                </TextField>
              </Box>
            </GridContainer>

            {status.saving && isMultiDay && <LinearProgress variant="determinate" value={status.progress} sx={progressStyle} />}

            <Stack direction="row" spacing={2} mt={4}>
              <Button fullWidth onClick={handleSave} disabled={status.saving} sx={primaryBtnStyle}>
                {status.saving ? <CircularProgress size={20} color="inherit" /> : form.id ? "UPDATE SESSION" : "GENERATE SCHEDULE"}
              </Button>
              {form.id && <Button onClick={() => setForm(p => ({...p, id: null}))} sx={secondaryBtnStyle}>CANCEL</Button>}
            </Stack>
          </CardContent>
        </Card>

        {/* AGENDA VIEW */}
        <Box mt={6}>
          <Typography variant="h6" fontWeight={900} mb={2}>DEPLOYMENT LOG — {dayjs(filterDate).format("MMM DD")}</Typography>
          <TableContainer component={Paper} sx={tableStyle}>
            <Table size="small">
              <TableHead sx={{ bgcolor: "#f8fafc" }}>
                <TableRow>
                  <TableCell sx={thStyle}>TIMELINE</TableCell>
                  <TableCell sx={thStyle}>COACH</TableCell>
                  <TableCell sx={thStyle}>COURT</TableCell>
                  <TableCell sx={thStyle}>PROGRAMS</TableCell>
                  <TableCell align="right" sx={thStyle}>ACTIONS</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredSessions.map(s => (
                  <TableRow key={s.id} sx={{ "&:hover": { bgcolor: "rgba(0,0,0,0.01)" } }}>
                    <TableCell sx={{ fontWeight: 900 }}>{s.start_time.slice(0, 5)} - {s.end_time.slice(0, 5)}</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "#ef4444" }}>{s.coachName}</TableCell>
                    <TableCell sx={{ opacity: 0.8 }}>{s.locationName}</TableCell>
                    <TableCell>
                      {s.programTitles?.split(",").map((t: string) => <Chip key={t} label={t} size="small" sx={tagStyle} />)}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => {
                        setForm({ id: s.id, start: dayjs(s.start_time, "HH:mm:ss"), end: dayjs(s.end_time, "HH:mm:ss"), coachId: s.coach_id, locationId: s.location_id, programIds: s.program_ids || [] });
                        window.scrollTo(0,0);
                      }}><EditIcon fontSize="inherit" /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Snackbar open={toast.open} autoHideDuration={3000} onClose={() => setToast(p => ({...p, open: false}))}>
          <Alert severity={toast.type} variant="filled" sx={{ fontWeight: 900 }}>{toast.msg}</Alert>
        </Snackbar>
      </Box>
    </LocalizationProvider>
  );
}

// --- LIGHTWEIGHT STYLES ---
const rootStyle = { p: { xs: 2, md: 5 }, bgcolor: "#f1f5f9", minHeight: "100vh" };
const GridContainer = ({ children }: any) => <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 2 }}>{children}</Box>;
const glassCardStyle = { borderRadius: 4, border: "1px solid #e2e8f0", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)" };
const inputStyle = { "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: "white" } };
const dayBtnStyle = { flex: 1, borderRadius: "8px !important", border: "1px solid #e2e8f0 !important", fontWeight: 900, "&.Mui-selected": { bgcolor: "#0f172a !important", color: "white" } };
const primaryBtnStyle = { bgcolor: "#0f172a", color: "white", py: 1.5, borderRadius: 2, fontWeight: 900, "&:hover": { bgcolor: "#1e293b" } };
const secondaryBtnStyle = { color: "#64748b", fontWeight: 900 };
const filterPaperStyle = { display: 'flex', alignItems: 'center', p: '4px 12px', borderRadius: 2, border: "1px solid #e2e8f0", boxShadow: "none" };
const rawInputStyle = { border: "none", outline: "none", background: "transparent", fontWeight: 900, color: "#0f172a", cursor: "pointer" };
const tableStyle = { borderRadius: 3, border: "1px solid #e2e8f0", boxShadow: "none", overflow: "hidden" };
const thStyle = { fontWeight: 900, fontSize: "0.65rem", color: "#64748b", letterSpacing: 1, textTransform: "uppercase" };
const tagStyle = { height: 18, fontSize: "0.6rem", fontWeight: 800, mr: 0.5 };
const progressStyle = { mt: 2, height: 6, borderRadius: 3, bgcolor: "#e2e8f0", "& .MuiLinearProgress-bar": { bgcolor: "#ef4444" } };
const centerStyle = { height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", bgcolor: "#f1f5f9" };