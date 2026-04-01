import React, { useState, useEffect } from "react";
import {
  Box, Typography, Card, CardContent, Stack, TextField, Button, 
  MenuItem, Table, TableHead, TableRow, TableCell, TableBody, 
  IconButton, useMediaQuery, useTheme, Fade, Paper, 
  Snackbar, Alert, Chip, ToggleButton, ToggleButtonGroup, Switch, FormControlLabel
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

  const [toast, setToast] = useState({ open: false, message: "", severity: "success" as "success" | "error" });
  const [isSaving, setIsSaving] = useState(false);

  const loadData = async () => {
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
  };

  useEffect(() => { loadData(); }, []);

  const resetForm = () => {
    setEditingId(null);
    setProgramIds([]);
    setLocationId("");
    setCoachId("");
    setSelectedDays([]);
    setIsMultiDay(false);
  };

  const saveSession = async () => {
    if (!locationId || !coachId || programIds.length === 0) {
      return setToast({ open: true, message: "Missing fields", severity: "error" });
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
        await fetch(url, {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...basePayload, session_date: date })
        });
      } else {
        // Multi-day Bulk Insert
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

      setToast({ open: true, message: "Schedule Sync Complete", severity: "success" });
      loadData();
      resetForm();
    } catch (err) {
      setToast({ open: true, message: "Error saving schedule", severity: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  const filteredSessions = sessions.filter(s => dayjs(s.session_date).format("YYYY-MM-DD") === filterDate);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={containerStyle}>
        
        <Stack direction="row" justifyContent="space-between" mb={4}>
          <Typography variant="h4" fontWeight={900}>Schedule Manager</Typography>
          <Paper sx={filterPaperStyle}>
            <TextField type="date" size="small" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} variant="standard" InputProps={{ disableUnderline: true }} />
          </Paper>
        </Stack>

        <Fade in>
          <Card sx={glassCardStyle}>
            <CardContent sx={{ p: 4 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h6" fontWeight={800}>{editingId ? "Edit Session" : "New Assignment"}</Typography>
                {!editingId && (
                  <FormControlLabel
                    control={<Switch checked={isMultiDay} onChange={(e) => setIsMultiDay(e.target.checked)} color="primary" />}
                    label={<Typography fontWeight={700}>Repeat Schedule</Typography>}
                  />
                )}
              </Stack>

              <Stack spacing={4} sx={{ maxWidth: '800px' }}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <TextField fullWidth label={isMultiDay ? "Start Date" : "Date"} type="date" value={date} onChange={(e) => setDate(e.target.value)} InputLabelProps={{ shrink: true }} sx={inputStyle} />
                  {isMultiDay && (
                    <TextField fullWidth label="End Date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} InputLabelProps={{ shrink: true }} sx={inputStyle} />
                  )}
                </Stack>

                {isMultiDay && (
                  <Box>
                    <Typography variant="caption" fontWeight={700} color="text.secondary" gutterBottom>REPEAT ON DAYS</Typography>
                    <ToggleButtonGroup 
                      fullWidth value={selectedDays} 
                      onChange={(_, val) => setSelectedDays(val)}
                      sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}
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

                <Stack direction="row" spacing={2}>
                  <TextField select fullWidth label="Coach" value={coachId} onChange={(e) => setCoachId(e.target.value)} sx={inputStyle}>
                    {coaches.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                  </TextField>
                  <TextField select fullWidth label="Location" value={locationId} onChange={(e) => setLocationId(e.target.value)} sx={inputStyle}>
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

                <Button onClick={saveSession} disabled={isSaving} sx={primaryBtnStyle}>
                  {isSaving ? "Processing..." : editingId ? "Update Session" : isMultiDay ? "Generate Multiple Sessions" : "Confirm Session"}
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Fade>

        {/* AGENDA LIST REMAINS UNCHANGED */}
        <Box mt={6}>
            {/* ... List Mapping ... */}
        </Box>

        <Snackbar open={toast.open} autoHideDuration={3000} onClose={() => setToast({ ...toast, open: false })}>
          <Alert severity={toast.severity}>{toast.message}</Alert>
        </Snackbar>
      </Box>
    </LocalizationProvider>
  );
}

// Additional Styles
const dayToggleStyle = { 
  flex: 1, 
  borderRadius: "12px !important", 
  border: "1px solid #e2e8f0 !important",
  fontWeight: 900,
  "&.Mui-selected": { bgcolor: "#3b82f6 !important", color: "white" }
};

const containerStyle = { p: { xs: 2, md: 8 }, background: "#f8fafc", minHeight: "100vh" };
const filterPaperStyle = { p: "10px 20px", display: 'flex', alignItems: 'center', borderRadius: 4, border: '1px solid #e2e8f0', boxShadow: 'none' };
const glassCardStyle = { borderRadius: 6, border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(0,0,0,0.04)', bgcolor: 'white' };
const inputStyle = { "& .MuiOutlinedInput-root": { borderRadius: 3 } };
const primaryBtnStyle = { py: 2, borderRadius: 3, fontWeight: 900, background: '#1e293b', color: 'white', "&:hover": { background: '#0f172a' } };