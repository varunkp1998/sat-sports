import React, { useEffect, useState } from "react";
import {
  Box, Typography, Card, CardContent, Button, Stack, 
  Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, TextField, ToggleButton, ToggleButtonGroup, 
  Chip, Avatar, Divider, Fade
} from "@mui/material";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

// Icons
import TimerIcon from '@mui/icons-material/Timer';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import HistoryIcon from '@mui/icons-material/History';
import SummarizeIcon from '@mui/icons-material/Summarize';

import API_BASE from "./api";

type PayrollRow = {
  coachId: number;
  coachName: string;
  date?: string;
  month?: string;
  totalMinutes: number;
};

export default function AdminCoachPayroll() {
  const [mode, setMode] = useState<"daily" | "monthly">("daily");
  const today = new Date().toISOString().slice(0, 10);
  const thisMonth = new Date().toISOString().slice(0, 7);

  const [date, setDate] = useState(today);
  const [month, setMonth] = useState(thisMonth);
  const [rows, setRows] = useState<PayrollRow[]>([]);
  const [loading, setLoading] = useState(false);

  const loadReport = () => {
    setLoading(true);
    const url = mode === "daily"
        ? `${API_BASE}/api/admin/reports/coach-daily-hours?date=${date}`
        : `${API_BASE}/api/admin/reports/coach-monthly-hours?month=${month}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => setRows(Array.isArray(data) ? data : []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadReport(); }, [mode, date, month]);

  // Calculations
  const totalAcademyMinutes = rows.reduce((acc, r) => acc + Number(r.totalMinutes || 0), 0);
  const totalAcademyHours = (totalAcademyMinutes / 60).toFixed(2);

  // --- Exports ---
  const exportToExcel = () => {
    const sheetData = rows.map((r) => ({
      Coach: r.coachName,
      Period: mode === "daily" ? (r.date?.slice(0,10) || date) : (r.month || month),
      "Minutes": r.totalMinutes,
      "Hours": (r.totalMinutes / 60).toFixed(2),
    }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(sheetData), "Payroll");
    XLSX.writeFile(wb, `Coach_Payroll_${mode}_${mode === 'daily' ? date : month}.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Coach Work Hours & Payroll Report", 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()} | Period: ${mode.toUpperCase()}`, 14, 28);
    
    (doc as any).autoTable({
      startY: 35,
      head: [["Coach", "Period", "Minutes", "Hours"]],
      body: rows.map((r) => [
        r.coachName,
        mode === "daily" ? (r.date?.slice(0,10) || date) : (r.month || month),
        r.totalMinutes,
        (r.totalMinutes / 60).toFixed(2),
      ]),
      headStyles: { fillStyle: '#4f46e5' }
    });
    doc.save(`Payroll_Report_${date}.pdf`);
  };

  return (
    <Box sx={containerStyle}>
      {/* HEADER & CONTROLS */}
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={3} mb={6}>
        <Box>
          <Typography variant="h4" fontWeight={900} letterSpacing="-1.5px" color="#1e293b">Payroll Analytics</Typography>
          <Typography variant="body2" color="text.secondary">Monitor coach performance and billable hours</Typography>
        </Box>

        <Paper sx={controlPaperStyle}>
          <ToggleButtonGroup
            value={mode}
            exclusive
            onChange={(_, val) => val && setMode(val)}
            size="small"
            sx={{ mr: 2 }}
          >
            <ToggleButton value="daily" sx={toggleBtnStyle}>Daily</ToggleButton>
            <ToggleButton value="monthly" sx={toggleBtnStyle}>Monthly</ToggleButton>
          </ToggleButtonGroup>

          {mode === "daily" ? (
            <TextField type="date" size="small" value={date} onChange={(e) => setDate(e.target.value)} sx={inputStyle} />
          ) : (
            <TextField type="month" size="small" value={month} onChange={(e) => setMonth(e.target.value)} sx={inputStyle} />
          )}

          <Button variant="contained" onClick={loadReport} sx={refreshBtnStyle}>Sync</Button>
        </Paper>
      </Stack>

      {/* SUMMARY KPI */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={4}>
            <Card sx={summaryCardStyle}>
                <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ bgcolor: '#eff6ff', color: '#3b82f6', mr: 2 }}><TimerIcon /></Avatar>
                    <Box>
                        <Typography variant="caption" fontWeight={800} color="text.secondary">TOTAL ACADEMY HOURS</Typography>
                        <Typography variant="h4" fontWeight={900}>{totalAcademyHours} <small style={{ fontSize: '14px' }}>hrs</small></Typography>
                    </Box>
                </CardContent>
            </Card>
        </Grid>
        <Grid item xs={12} md={8}>
            <Stack direction="row" spacing={2} height="100%" alignItems="center" justifyContent="flex-end">
                <Button variant="outlined" startIcon={<FileDownloadIcon />} onClick={exportToExcel} sx={actionBtnStyle}>Excel Export</Button>
                <Button variant="outlined" startIcon={<SummarizeIcon />} onClick={exportToPDF} sx={actionBtnStyle}>PDF Report</Button>
            </Stack>
        </Grid>
      </Grid>

      {/* TABLE */}
      <TableContainer component={Paper} sx={tablePaperStyle}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={headerStyle}>Coach Name</TableCell>
              <TableCell sx={headerStyle}>{mode === "daily" ? "Work Date" : "Billing Month"}</TableCell>
              <TableCell sx={headerStyle}>Duration</TableCell>
              <TableCell sx={headerStyle}>Payroll Hours</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.map((r, idx) => {
              const minutes = Number(r.totalMinutes || 0);
              const hours = (minutes / 60).toFixed(2);
              return (
                <Fade in timeout={idx * 100} key={idx}>
                  <TableRow hover>
                    <TableCell>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ width: 32, height: 32, fontSize: '0.8rem', bgcolor: '#4f46e5' }}>{r.coachName.charAt(0)}</Avatar>
                        <Typography fontWeight={700} color="#1e293b">{r.coachName}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600} color="text.secondary">
                        {mode === "daily" ? (r.date?.slice(0, 10) || date) : (r.month || month)}
                      </Typography>
                    </TableCell>
                    <TableCell><Chip label={`${minutes} min`} size="small" sx={minuteChipStyle} /></TableCell>
                    <TableCell>
                       <Typography fontWeight={900} color="#10b981">{hours} <span style={{ fontSize: '10px' }}>HRS</span></Typography>
                    </TableCell>
                  </TableRow>
                </Fade>
              );
            })}

            {!loading && rows.length > 0 && (
                <TableRow sx={{ bgcolor: '#f8fafc' }}>
                    <TableCell colSpan={3} align="right"><Typography fontWeight={900}>GRAND TOTAL:</Typography></TableCell>
                    <TableCell><Typography fontWeight={900} color="#4f46e5">{totalAcademyHours} HRS</Typography></TableCell>
                </TableRow>
            )}

            {!loading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 10 }}>
                  <HistoryIcon sx={{ fontSize: 40, color: '#cbd5e1', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">No time logs found for this period.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

// --- STYLING ---
const containerStyle = { p: { xs: 2, md: 8 }, background: "#f8fafc", minHeight: "100vh" };
const controlPaperStyle = { p: 1.5, borderRadius: 4, display: 'flex', alignItems: 'center', bgcolor: 'white', border: '1px solid #e2e8f0', boxShadow: 'none' };
const tablePaperStyle = { borderRadius: 5, border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(0,0,0,0.02)', overflow: 'hidden' };
const summaryCardStyle = { borderRadius: 4, border: '1px solid #e2e8f0', boxShadow: 'none' };
const headerStyle = { fontWeight: 900, bgcolor: '#f8fafc', color: '#64748b', fontSize: '0.7rem', textTransform: 'uppercase', py: 2 };
const inputStyle = { "& .MuiOutlinedInput-root": { borderRadius: 3, bgcolor: '#f8fafc' }, width: 160, mr: 2 };
const toggleBtnStyle = { fontWeight: 800, textTransform: 'none', px: 3, borderRadius: '10px !important' };
const refreshBtnStyle = { borderRadius: 2.5, fontWeight: 900, px: 3 };
const actionBtnStyle = { borderRadius: 2.5, fontWeight: 800, textTransform: 'none', px: 3, color: '#475569', borderColor: '#e2e8f0' };
const minuteChipStyle = { bgcolor: '#f1f5f9', fontWeight: 800, color: '#475569', border: '1px solid #e2e8f0' };