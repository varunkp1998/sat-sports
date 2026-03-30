import { useEffect, useState } from "react";
import { 
  Box, Typography, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, Chip, Fade, CircularProgress 
} from "@mui/material";
import { motion } from "framer-motion";
import dayjs from "dayjs";
import API_BASE from "./api";

const MotionBox = motion(Box);

export default function CoachLeavesStatus() {
  const coachId = localStorage.getItem("userId");
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!coachId) return;
    setLoading(true);
    fetch(`${API_BASE}/api/coach/leaves/${coachId}`)
      .then(res => res.json())
      .then(setLeaves)
      .finally(() => setLoading(false));
  }, [coachId]);

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
      <CircularProgress color="error" />
    </Box>
  );

  if (leaves.length === 0) {
    return (
      <Box sx={emptyStateStyle}>
        <Typography variant="h6" fontWeight={900}>NO ACTIVE REQUESTS FOUND</Typography>
        <Typography variant="caption" sx={{ opacity: 0.5 }}>REQUESTS WILL APPEAR HERE ONCE SUBMITTED</Typography>
      </Box>
    );
  }

  return (
    <Fade in timeout={800}>
      <TableContainer component={Paper} sx={tableContainerStyle}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ bgcolor: "rgba(255,255,255,0.02)" }}>
            <TableRow>
              <TableCell sx={headerStyle}>TIMEFRAME</TableCell>
              <TableCell sx={headerStyle}>CATEGORY</TableCell>
              <TableCell sx={headerStyle}>MISSION REASON</TableCell>
              <TableCell sx={headerStyle} align="right">CURRENT STATUS</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {leaves.map((l, index) => (
              <TableRow 
                key={l.id} 
                component={motion.tr}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                sx={rowStyle}
              >
                <TableCell sx={cellStyle}>
                  <Typography fontWeight={900} fontSize="0.9rem">
                    {dayjs(l.from_date || l.start_date).format("DD MMM")} — {dayjs(l.to_date || l.end_date).format("DD MMM")}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.5, fontWeight: 800 }}>
                    {dayjs(l.from_date || l.start_date).format("YYYY")}
                  </Typography>
                </TableCell>
                
                <TableCell sx={cellStyle}>
                  <Chip 
                    label={(l.leave_type || "CASUAL").toUpperCase()} 
                    size="small" 
                    sx={typeChipStyle} 
                  />
                </TableCell>

                <TableCell sx={cellStyle}>
                  <Typography sx={{ opacity: 0.8, fontStyle: 'italic', maxWidth: 300 }}>
                    {l.reason || "No reason provided"}
                  </Typography>
                </TableCell>

                <TableCell sx={cellStyle} align="right">
                  <Chip 
                    label={l.status.toUpperCase()} 
                    sx={statusChipStyle(l.status)} 
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Fade>
  );
}

// 💅 ELITE TERMINAL STYLES
const tableContainerStyle = {
  background: "rgba(255,255,255,0.03)",
  backdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 4,
  boxShadow: "none",
  overflow: "hidden"
};

const headerStyle = {
  color: "#ef4444",
  fontWeight: 900,
  fontSize: "0.75rem",
  letterSpacing: 2,
  borderBottom: "1px solid rgba(255,255,255,0.05)",
  py: 2.5
};

const cellStyle = {
  color: "white",
  borderBottom: "1px solid rgba(255,255,255,0.05)",
  py: 3
};

const rowStyle = {
  "&:hover": { bgcolor: "rgba(255,255,255,0.02)" },
  transition: "0.2s"
};

const typeChipStyle = {
  bgcolor: "rgba(255,255,255,0.05)",
  color: "rgba(255,255,255,0.7)",
  fontWeight: 900,
  borderRadius: 1,
  fontSize: "0.65rem",
  border: "1px solid rgba(255,255,255,0.1)"
};

const statusChipStyle = (status: string) => {
  const colors: any = { 
    Approved: "#22c55e", 
    Rejected: "#ef4444", 
    Pending: "#f59e0b" 
  };
  const color = colors[status] || "#64748b";
  return { 
    bgcolor: `${color}15`, 
    color: color, 
    border: `1px solid ${color}44`, 
    fontWeight: 900, 
    borderRadius: 1,
    letterSpacing: 1,
    fontSize: '0.7rem'
  };
};

const emptyStateStyle = {
  textAlign: 'center',
  py: 8,
  background: "rgba(255,255,255,0.02)",
  borderRadius: 4,
  border: "1px dashed rgba(255,255,255,0.1)",
  color: "rgba(255,255,255,0.3)"
};