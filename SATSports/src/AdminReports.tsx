import React, { useEffect, useState } from "react";
import {
  Box, Typography, Grid, Card, CardContent, Button, Stack, 
  TextField, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Divider, Avatar
} from "@mui/material";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import "jspdf-autotable";

// Material UI Icons
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PeopleIcon from '@mui/icons-material/People';
import PaymentsIcon from '@mui/icons-material/Payments';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

import API_BASE from "./api";

// Register ChartJS components
ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, 
  BarElement, Title, Tooltip, Legend
);

export default function AdminReports() {
  const today = new Date().toISOString().slice(0, 10);
  const [from, setFrom] = useState(today);
  const [to, setTo] = useState(today);

  const [attendance, setAttendance] = useState<any[]>([]);
  const [revenue, setRevenue] = useState<any[]>([]);

  const loadReports = () => {
    const query = `?from=${from}&to=${to}`;
    fetch(`${API_BASE}/api/admin/reports/attendance` + query).then(res => res.json()).then(setAttendance);
    fetch(`${API_BASE}/api/admin/reports/revenue` + query).then(res => res.json()).then(setRevenue);
  };

  useEffect(() => { loadReports(); }, []);

  // --- Calculations ---
  const totalSessions = attendance.length;
  const totalPresent = attendance.filter(a => a.status === "Present").length;
  const attendanceRate = totalSessions > 0 ? Math.round((totalPresent / totalSessions) * 100) : 0;

  const totalCR = revenue.filter(r => r.type === "CR").reduce((s, r) => s + r.amount, 0);
  const totalDR = revenue.filter(r => r.type === "DR").reduce((s, r) => s + r.amount, 0);
  const net = totalCR - totalDR;

  // --- Chart Data Processing ---
  const attendanceByDate: any = {};
  attendance.forEach(a => {
    const d = a.date.slice(0, 10);
    attendanceByDate[d] = (attendanceByDate[d] || 0) + (a.status === "Present" ? 1 : 0);
  });

  const revenueByDate: any = {};
  revenue.forEach(r => {
    const d = r.date.slice(0, 10);
    if (!revenueByDate[d]) revenueByDate[d] = { CR: 0, DR: 0 };
    revenueByDate[d][r.type] += r.amount;
  });

  // --- Export Logic ---
  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(attendance), "Attendance");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(revenue), "Revenue");
    XLSX.writeFile(wb, `SAT_Report_${from}_to_${to}.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("SAT Sports - Business Intelligence Report", 14, 15);
    (doc as any).autoTable({
      head: [["Date", "Player", "Program", "Status"]],
      body: attendance.map(a => [a.date.slice(0, 10), a.playerName, a.programTitle, a.status]),
      startY: 25
    });
    doc.save("SAT_Report.pdf");
  };

  return (
    <Box sx={containerStyle}>
      {/* HEADER */}
      <Box mb={4}>
        <Typography variant="h4" fontWeight={900} letterSpacing="-1.5px">Business Analytics</Typography>
        <Typography variant="body2" color="text.secondary">Deep dive into attendance and financial performance</Typography>
      </Box>

      {/* FILTER BAR */}
      <Paper sx={filterPaperStyle}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="center">
          <TextField type="date" label="Start Date" value={from} onChange={e => setFrom(e.target.value)} InputLabelProps={{ shrink: true }} size="small" />
          <TextField type="date" label="End Date" value={to} onChange={e => setTo(e.target.value)} InputLabelProps={{ shrink: true }} size="small" />
          <Button variant="contained" onClick={loadReports} sx={primaryBtnStyle}>Generate</Button>
          <Box sx={{ flexGrow: 1 }} />
          <Button variant="outlined" startIcon={<FileDownloadIcon />} onClick={exportToExcel} sx={actionBtnStyle}>Excel</Button>
          <Button variant="outlined" startIcon={<FileDownloadIcon />} onClick={exportToPDF} sx={actionBtnStyle}>PDF</Button>
        </Stack>
      </Paper>

      {/* KPI CARDS */}
      <Grid container spacing={3} mb={6}>
        <Grid item xs={12} md={4}>
          <KPICard title="Attendance Rate" value={`${attendanceRate}%`} sub={`${totalPresent} Present`} color="#6366f1" icon={<PeopleIcon />} />
        </Grid>
        <Grid item xs={12} md={4}>
          <KPICard title="Total Revenue" value={`₹${totalCR}`} sub={`DR: ₹${totalDR}`} color="#10b981" icon={<PaymentsIcon />} />
        </Grid>
        <Grid item xs={12} md={4}>
          <KPICard title="Net Profit" value={`₹${net}`} sub="After Debits" color="#f59e0b" icon={<AccountBalanceWalletIcon />} />
        </Grid>
      </Grid>

      {/* CHARTS SECTION */}
      <Grid container spacing={3} mb={6}>
        <Grid item xs={12} md={8}>
          <Card sx={glassCardStyle}>
            <CardContent>
              <Typography variant="subtitle2" fontWeight={800} mb={3}>REVENUE TREND (CR vs DR)</Typography>
              <Bar 
                data={{
                  labels: Object.keys(revenueByDate),
                  datasets: [
                    { label: 'Credit', data: Object.values(revenueByDate).map((v: any) => v.CR), backgroundColor: '#10b981' },
                    { label: 'Debit', data: Object.values(revenueByDate).map((v: any) => v.DR), backgroundColor: '#ef4444' }
                  ]
                }} 
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={glassCardStyle}>
            <CardContent>
              <Typography variant="subtitle2" fontWeight={800} mb={3}>ATTENDANCE VOLUME</Typography>
              <Line 
                data={{
                  labels: Object.keys(attendanceByDate),
                  datasets: [{ label: 'Sessions', data: Object.values(attendanceByDate), borderColor: '#6366f1', tension: 0.4 }]
                }} 
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* DATA TABLE */}
      <Typography variant="h6" fontWeight={800} mb={2}>Detailed Attendance Log</Typography>
      <TableContainer component={Paper} sx={tablePaperStyle}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={headerCellStyle}>Date</TableCell>
              <TableCell sx={headerCellStyle}>Player</TableCell>
              <TableCell sx={headerCellStyle}>Program</TableCell>
              <TableCell sx={headerCellStyle}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {attendance.map((a, i) => (
              <TableRow key={i} hover>
                <TableCell fontWeight={700}>{a.date.slice(0, 10)}</TableCell>
                <TableCell>{a.playerName}</TableCell>
                <TableCell>{a.programTitle}</TableCell>
                <TableCell>
                   <Chip label={a.status} size="small" color={a.status === "Present" ? "success" : "error"} variant="outlined" sx={{ fontWeight: 800 }} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

// --- SUB-COMPONENTS ---
function KPICard({ title, value, sub, color, icon }: any) {
  return (
    <Card sx={glassCardStyle}>
      <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
        <Avatar sx={{ bgcolor: `${color}15`, color, mr: 2, borderRadius: 2 }}>{icon}</Avatar>
        <Box>
          <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ textTransform: 'uppercase' }}>{title}</Typography>
          <Typography variant="h4" fontWeight={900}>{value}</Typography>
          <Typography variant="caption" color="text.secondary">{sub}</Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

// --- STYLING ---
const containerStyle = { p: { xs: 2, md: 8 }, background: "#f8fafc", minHeight: "100vh" };
const glassCardStyle = { borderRadius: 4, border: '1px solid #e2e8f0', boxShadow: 'none' };
const filterPaperStyle = { p: 3, borderRadius: 4, mb: 4, border: '1px solid #e2e8f0', boxShadow: 'none' };
const tablePaperStyle = { borderRadius: 4, border: '1px solid #e2e8f0', boxShadow: 'none', maxHeight: 400 };
const headerCellStyle = { fontWeight: 900, bgcolor: '#f1f5f9', color: '#475569' };
const primaryBtnStyle = { borderRadius: 2, px: 4, fontWeight: 800, textTransform: 'none' };
const actionBtnStyle = { borderRadius: 2, fontWeight: 800, textTransform: 'none', borderColor: '#e2e8f0', color: '#475569' };