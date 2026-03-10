import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

type PayrollRow = {
  coachId: number;
  coachName: string;
  date?: string;   // for daily
  month?: string;  // for monthly
  totalMinutes: number;
};

function AdminCoachPayroll() {
  const [mode, setMode] = useState<"daily" | "monthly">("daily");

  const today = new Date().toISOString().slice(0, 10);
  const thisMonth = new Date().toISOString().slice(0, 7);

  const [date, setDate] = useState(today);
  const [month, setMonth] = useState(thisMonth);
  const [rows, setRows] = useState<PayrollRow[]>([]);
  const [loading, setLoading] = useState(false);

  const loadReport = () => {
    setLoading(true);

    const url =
      mode === "daily"
        ? `http://localhost:4000/api/admin/reports/coach-daily-hours?date=${date}`
        : `http://localhost:4000/api/admin/reports/coach-monthly-hours?month=${month}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => setRows(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error("Failed to load payroll report", err);
        setRows([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, date, month]);

  // ===== EXPORT: EXCEL =====
  const exportToExcel = () => {
    const sheetData = rows.map((r) => ({
      Coach: r.coachName,
      Period: mode === "daily" ? r.date : r.month,
      "Total Minutes": r.totalMinutes,
      "Total Hours": (r.totalMinutes / 60).toFixed(2),
    }));

    const sheet = XLSX.utils.json_to_sheet(sheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, "Coach Payroll");

    XLSX.writeFile(workbook, "Coach_Payroll_Report.xlsx");
  };

  // ===== EXPORT: PDF =====
  const exportToPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("Coach Payroll Report", 14, 15);

    doc.setFontSize(12);
    doc.text(
      mode === "daily" ? `Date: ${date}` : `Month: ${month}`,
      14,
      25
    );

    (doc as any).autoTable({
      startY: 35,
      head: [["Coach", "Period", "Minutes", "Hours"]],
      body: rows.map((r) => [
        r.coachName,
        mode === "daily" ? r.date : r.month,
        r.totalMinutes,
        (r.totalMinutes / 60).toFixed(2),
      ]),
    });

    doc.save("Coach_Payroll_Report.pdf");
  };

  return (
    <section>
      {/* Header */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", md: "center" }}
        spacing={2}
        mb={3}
      >
        <Typography variant="h4" fontWeight={700}>
          💰 Coach Payroll & Work Hours
        </Typography>

        <Stack direction="row" spacing={2} alignItems="center">
          <ToggleButtonGroup
            value={mode}
            exclusive
            onChange={(_, val) => val && setMode(val)}
            size="small"
          >
            <ToggleButton value="daily">Daily</ToggleButton>
            <ToggleButton value="monthly">Monthly</ToggleButton>
          </ToggleButtonGroup>

          {mode === "daily" ? (
            <TextField
              type="date"
              label="Select Date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
            />
          ) : (
            <TextField
              type="month"
              label="Select Month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
            />
          )}

          <Button variant="contained" onClick={loadReport}>
            Refresh
          </Button>
        </Stack>
      </Stack>

      {/* Export Buttons */}
      <Stack direction="row" spacing={2} mb={2}>
        <Button variant="outlined" onClick={exportToExcel}>
          📤 Export Excel
        </Button>
        <Button variant="outlined" onClick={exportToPDF}>
          📄 Export PDF
        </Button>
      </Stack>

      {/* Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "#f5f5f5" }}>
              <TableCell><strong>Coach</strong></TableCell>
              <TableCell><strong>{mode === "daily" ? "Date" : "Month"}</strong></TableCell>
              <TableCell><strong>Total Minutes</strong></TableCell>
              <TableCell><strong>Total Hours</strong></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.map((r, idx) => {
const minutes = Number(r.totalMinutes || 0);
const hours = (minutes / 60).toFixed(2);
const dateStr = r.date ? r.date.slice(0, 10) : "";
              return (
<TableRow key={idx} hover>
  <TableCell>{r.coachName}</TableCell>

  <TableCell>
    {mode === "daily" ? dateStr : r.month}
  </TableCell>

  <TableCell>
    <Chip label={`${minutes} min`} color="info" size="small" />
  </TableCell>

  <TableCell>
    <Chip label={`${hours} hrs`} color="success" size="small" />
  </TableCell>
</TableRow>              );
            })}

            {!loading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No records found for selected period.
                </TableCell>
              </TableRow>
            )}

            {loading && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  Loading...
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </section>
  );
}

export default AdminCoachPayroll;