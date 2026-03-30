import React, { useEffect, useState } from "react";
import {
  Table, TableHead, TableRow, TableCell, TableBody, Button, Paper,
  Chip, Box, useTheme, useMediaQuery, Card, CardContent, Stack,
  Typography, CircularProgress, Fade, Avatar, Divider
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import HourglassEmptyIcon from "@mui/material/SvgIcon"; // Or use any timer icon
import API_BASE from "./api";

export default function AdminApplications() {
  const [rows, setRows] = useState<any[]>([]);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const load = () => {
    fetch(`${API_BASE}/api/admin/applications`)
      .then((res) => res.json())
      .then(setRows)
      .catch((err) => console.error("Load failed", err));
  };

  useEffect(() => { load(); }, []);

  const handleAction = async (id: number, action: string) => {
    setProcessingId(id);
    try {
      const res = await fetch(`${API_BASE}/api/admin/applications/${id}/${action}`, {
        method: "POST"
      });
      const data = await res.json();
      if (data.success) {
        load();
      } else {
        alert(data.message || "Action failed");
      }
    } catch (err) {
      alert("Network error, please try again.");
    } finally {
      setProcessingId(null);
    }
  };

  const renderActions = (r: any) => {
    if (r.status !== "pending") {
      return (
        <Typography variant="caption" fontWeight={700} sx={{ color: 'text.secondary', letterSpacing: 1 }}>
          PROCESSED
        </Typography>
      );
    }

    if (processingId === r.id) return <CircularProgress size={24} thickness={5} sx={{ color: '#3b82f6' }} />;

    return (
      <Stack direction="row" spacing={1}>
        <Button
          variant="contained"
          size="small"
          startIcon={<CheckCircleIcon />}
          onClick={() => handleAction(r.id, "approve")}
          sx={approveBtnStyle}
        >
          Approve
        </Button>
        <Button
          variant="outlined"
          size="small"
          startIcon={<CancelIcon />}
          onClick={() => handleAction(r.id, "reject")}
          sx={rejectBtnStyle}
        >
          Reject
        </Button>
      </Stack>
    );
  };

  return (
    <Box sx={containerStyle}>
      {/* HEADER SECTION */}
      <Box mb={4}>
        <Typography variant="h4" fontWeight={900} letterSpacing="-1px">
          Application Queue
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Review and process new athlete registrations
        </Typography>
      </Box>

      {/* QUICK STATS */}
      <Stack direction="row" spacing={2} mb={4}>
        <Chip 
          label={`${rows.filter(r => r.status === 'pending').length} PENDING`} 
          sx={{ fontWeight: 800, bgcolor: '#fff7ed', color: '#c2410c', border: '1px solid #ffedd5' }} 
        />
        <Chip 
          label={`${rows.filter(r => r.status === 'approved').length} APPROVED`} 
          sx={{ fontWeight: 800, bgcolor: '#f0fdf4', color: '#15803d', border: '1px solid #dcfce7' }} 
        />
      </Stack>

      {isMobile ? (
        <Stack spacing={2}>
          {rows.map((r) => (
            <Fade in key={r.id}>
              <Card sx={{ ...mobileCardStyle, borderLeft: `6px solid ${getStatusColor(r.status)}` }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                    <Avatar sx={{ bgcolor: '#f1f5f9', color: '#475569', fontWeight: 700 }}>{r.name[0]}</Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" fontWeight={800}>{r.name}</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>{r.email}</Typography>
                    </Box>
                    <Chip 
                      label={r.status.toUpperCase()} 
                      size="small" 
                      sx={{ fontWeight: 900, fontSize: '0.65rem', ...getStatusChipStyles(r.status) }} 
                    />
                  </Stack>

                  <GridInfo age={r.age} program={r.preferred_program} />
                  
                  <Divider sx={{ my: 2, opacity: 0.5 }} />
                  <Box display="flex" justifyContent="flex-end">
                    {renderActions(r)}
                  </Box>
                </CardContent>
              </Card>
            </Fade>
          ))}
        </Stack>
      ) : (
        <Paper sx={tablePaperStyle}>
          <Table>
            <TableHead sx={{ bgcolor: "#f8fafc" }}>
              <TableRow>
                <TableCell sx={thStyle}>STUDENT</TableCell>
                <TableCell sx={thStyle}>CONTACT</TableCell>
                <TableCell sx={thStyle}>AGE</TableCell>
                <TableCell sx={thStyle}>PROGRAM</TableCell>
                <TableCell sx={thStyle}>STATUS</TableCell>
                <TableCell sx={{ ...thStyle, textAlign: 'right' }}>DECISION</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id} hover sx={{ '&:hover': { bgcolor: '#fcfcfd' } }}>
                  <TableCell>
                    <Typography variant="body2" fontWeight={800} color="#1e293b">{r.name}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">{r.email}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={r.age} size="small" sx={{ fontWeight: 700, bgcolor: '#f1f5f9' }} />
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" fontWeight={800} color="primary">
                      {r.preferred_program || "NOT SPECIFIED"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={r.status.toUpperCase()} 
                      size="small" 
                      sx={{ fontWeight: 800, fontSize: '0.7rem', ...getStatusChipStyles(r.status) }} 
                    />
                  </TableCell>
                  <TableCell align="right">{renderActions(r)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}
    </Box>
  );
}

// --- SUB-COMPONENTS & STYLES ---

const GridInfo = ({ age, program }: any) => (
  <Stack direction="row" spacing={4}>
    <Box>
      <Typography variant="caption" fontWeight={700} color="text.secondary">AGE</Typography>
      <Typography variant="body2" fontWeight={800}>{age}</Typography>
    </Box>
    <Box>
      <Typography variant="caption" fontWeight={700} color="text.secondary">PREF. PROGRAM</Typography>
      <Typography variant="body2" fontWeight={800} color="primary">{program || "N/A"}</Typography>
    </Box>
  </Stack>
);

const containerStyle = { p: { xs: 2, md: 5 }, background: "#f8fafc", minHeight: "100vh" };

const tablePaperStyle = { 
  borderRadius: 5, overflow: "hidden", border: '1px solid #e2e8f0', boxShadow: 'none' 
};

const thStyle = { fontWeight: 800, color: '#64748b', fontSize: '0.75rem', letterSpacing: 1 };

const mobileCardStyle = { 
  borderRadius: 4, boxShadow: 'none', border: '1px solid #e2e8f0', bgcolor: 'white' 
};

const approveBtnStyle = { 
  borderRadius: 2, fontWeight: 800, textTransform: 'none', px: 2,
  background: 'linear-gradient(135deg, #10b981, #059669)',
  '&:hover': { boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)' }
};

const rejectBtnStyle = { 
  borderRadius: 2, fontWeight: 800, textTransform: 'none', px: 2,
  borderColor: '#e11d48', color: '#e11d48',
  '&:hover': { bgcolor: '#fff1f2', borderColor: '#e11d48' }
};

const getStatusColor = (status: string) => {
  if (status === 'approved') return '#10b981';
  if (status === 'rejected') return '#e11d48';
  return '#f59e0b';
};

const getStatusChipStyles = (status: string) => {
  if (status === 'approved') return { bgcolor: '#f0fdf4', color: '#166534' };
  if (status === 'rejected') return { bgcolor: '#fff1f2', color: '#991b1b' };
  return { bgcolor: '#fff7ed', color: '#9a3412' };
};