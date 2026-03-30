import { useEffect, useState } from "react";
import { 
  Table, TableHead, TableRow, TableCell, TableBody, Button, Paper, 
  Chip, Box, useTheme, useMediaQuery, Card, CardContent, Stack, 
  Typography, CircularProgress, IconButton 
} from "@mui/material";
import API_BASE from "./api";

export default function AdminApplications() {
  const [rows, setRows] = useState([]);
  const [processingId, setProcessingId] = useState(null); // Track which ID is being approved/rejected
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const load = () => {
    fetch(`${API_BASE}/api/admin/applications`)
      .then(res => res.json())
      .then(setRows)
      .catch(err => console.error("Load failed", err));
  };

  useEffect(() => {
    load();
  }, []);

  const handleAction = async (id, action) => {
    setProcessingId(id); // Start spinner for this row
    try {
      const res = await fetch(`${API_BASE}/api/admin/applications/${id}/${action}`, { 
        method: "POST" 
      });
      const data = await res.json();
      
      if (data.success) {
        load(); // Refresh data
      } else {
        alert(data.message || "Action failed");
      }
    } catch (err) {
      alert("Network error, please try again.");
    } finally {
      setProcessingId(null); // Stop spinner
    }
  };

  // Helper to render Action Buttons
  const renderActions = (r) => {
    if (r.status !== "pending") return <Typography variant="caption" color="gray">Processed</Typography>;
    
    if (processingId === r.id) return <CircularProgress size={20} color="inherit" />;

    return (
      <Stack direction="row" spacing={1}>
        <Button 
          variant="contained" 
          size="small" 
          color="success" 
          onClick={() => handleAction(r.id, 'approve')}
          sx={{ fontWeight: 'bold' }}
        >
          Approve
        </Button>
        <Button 
          variant="outlined" 
          size="small" 
          color="error" 
          onClick={() => handleAction(r.id, 'reject')}
        >
          Reject
        </Button>
      </Stack>
    );
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Typography variant="h5" fontWeight={800} mb={3}>📝 PLAYER APPLICATIONS</Typography>

      {isMobile ? (
        <Stack spacing={2}>
          {rows.map((r) => (
            <Card key={r.id} sx={{ borderLeft: r.status === 'pending' ? '5px solid #ed6c02' : 'none' }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography variant="subtitle1" fontWeight={800}>{r.name}</Typography>
                    <Typography variant="body2" color="text.secondary">{r.email}</Typography>
                  </Box>
                  <Chip 
                    label={r.status.toUpperCase()} 
                    size="small"
                    color={r.status === "approved" ? "success" : r.status === "rejected" ? "error" : "warning"} 
                  />
                </Stack>
                
                <Stack direction="row" spacing={3} mt={2} mb={2}>
                  <Box><Typography variant="caption" color="gray">AGE</Typography><Typography variant="body2" fontWeight={700}>{r.age}</Typography></Box>
                  <Box><Typography variant="caption" color="gray">PROGRAM ID</Typography><Typography variant="body2" fontWeight={700}>{r.preferred_program || "-"}</Typography></Box>
                </Stack>

                {renderActions(r)}
              </CardContent>
            </Card>
          ))}
        </Stack>
      ) : (
        <Paper sx={{ borderRadius: 3, overflow: "hidden", border: '1px solid rgba(0,0,0,0.1)' }}>
          <Table>
            <TableHead sx={{ bgcolor: "#f8fafc" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800 }}>Student Name</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Age</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Program ID</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id} hover>
                  <TableCell fontWeight={600}>{r.name}</TableCell>
                  <TableCell>{r.email}</TableCell>
                  <TableCell>{r.age}</TableCell>
                  <TableCell>{r.preferred_program || "-"}</TableCell>
                  <TableCell>
                    <Chip 
                      label={r.status} 
                      size="small"
                      color={r.status === "approved" ? "success" : r.status === "rejected" ? "error" : "warning"} 
                    />
                  </TableCell>
                  <TableCell>{renderActions(r)}</TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4 }}>No applications found.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </Paper>
      )}
    </Box>
  );
}