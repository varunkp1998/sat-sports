import React, { useEffect, useState } from "react";
import { 
  Box, Typography, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, Chip, Fade, CircularProgress 
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import dayjs from "dayjs";
import API_BASE from "./api";

const MotionBox = motion(Box);

export default function CoachLeavesStatus() {
  const coachId = localStorage.getItem("userId");
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!coachId) return;
    let isMounted = true;
    
    setLoading(true);
    fetch(`${API_BASE}/api/coach/leaves/${coachId}`)
      .then(res => res.json())
      .then(data => {
        if (isMounted) setLeaves(Array.isArray(data) ? data : []);
      })
      .catch(err => console.error("History fetch error:", err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [coachId]);

  if (loading) return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 10, gap: 2 }}>
      <CircularProgress color="error" thickness={5} size={40} />
      <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.4)", fontWeight: 800, letterSpacing: 1 }}>
        RETRIEVING ARCHIVES...
      </Typography>
    </Box>
  );

  if (leaves.length === 0) {
    return (
      <Fade in>
        <Box sx={emptyStateStyle}>
          <Typography variant="h6" fontWeight={900}>NO ACTIVE REQUESTS FOUND</Typography>
          <Typography variant="caption" sx={{ opacity: 0.5, letterSpacing: 1 }}>
            MISSION RECORDS WILL APPEAR HERE ONCE SUBMITTED
          </Typography>
        </Box>
      </Fade>
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
            <AnimatePresence>
              {leaves.map((l, index) => {
                // Defensive check for date fields
                const start = l.from_date || l.start_date;
                const end = l.to_date || l.end_date;
                const status = l.status || "Pending";

                return (
                  <TableRow 
                    key={l.id || index} 
                    component={motion.tr}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    sx={rowStyle}
                  >
                    <TableCell sx={cellStyle}>
                      <Typography fontWeight={900} fontSize="0.9rem">
                        {dayjs(start).format("DD MMM")} — {dayjs(end).format("DD MMM")}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.5, fontWeight: 800, fontSize: '0.65rem' }}>
                        {dayjs(start).format("YYYY")} • {dayjs(end).diff(dayjs(start), 'day') + 1} DAYS
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
                      <Typography sx={{ opacity: 0.8, fontStyle: 'italic', fontSize: '0.85rem', maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {l.reason || "No mission notes recorded."}
                      </Typography>
                    </TableCell>

                    <TableCell sx={cellStyle} align="right">
                      <Chip 
                        label={status.toUpperCase()} 
                        sx={statusChipStyle(status)} 
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </AnimatePresence>
          </TableBody>
        </Table>
      </TableContainer>
    </Fade>
  );
}

// --- STYLES ---
const tableContainerStyle = {
  background: "rgba(255,255,255,0.02)",
  backdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.05)",
  borderRadius: 4,
  boxShadow: "none",
  overflow: "hidden"
};

const headerStyle = {
  color: "#ef4444",
  fontWeight: 900,
  fontSize: "0.7rem",
  letterSpacing: 2,
  borderBottom: "1px solid rgba(255,255,255,0.05)",
  py: 2.5,
  textTransform: 'uppercase'
};

const cellStyle = {
  color: "white",
  borderBottom: "1px solid rgba(255,255,255,0.03)",
  py: 2.5
};

const rowStyle = {
  "&:hover": { bgcolor: "rgba(255,255,255,0.03)" },
  transition: "background 0.2s ease"
};

const typeChipStyle = {
  bgcolor: "rgba(255,255,255,0.05)",
  color: "rgba(255,255,255,0.6)",
  fontWeight: 900,
  borderRadius: 1,
  fontSize: "0.6rem",
  border: "1px solid rgba(255,255,255,0.1)",
  letterSpacing: 0.5
};

const statusChipStyle = (status: string) => {
  const s = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  const colors: any = { 
    Approved: "#22c55e", 
    Rejected: "#ef4444", 
    Pending: "#f59e0b" 
  };
  const color = colors[s] || "#64748b";
  return { 
    bgcolor: `${color}10`, 
    color: color, 
    border: `1px solid ${color}33`, 
    fontWeight: 900, 
    borderRadius: 1,
    letterSpacing: 1,
    fontSize: '0.65rem'
  };
};

const emptyStateStyle = {
  textAlign: 'center',
  py: 10,
  background: "rgba(255,255,255,0.01)",
  borderRadius: 4,
  border: "1px dashed rgba(255,255,255,0.05)",
  color: "rgba(255,255,255,0.3)"
};