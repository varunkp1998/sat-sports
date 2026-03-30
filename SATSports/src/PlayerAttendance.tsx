import { useEffect, useState } from "react";
import { 
  Box, Typography, Card, CardContent, Chip, Stack, 
  Divider, CircularProgress, Fade, Paper 
} from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AssistantIcon from "@mui/icons-material/Assistant";
import API_BASE from "./api";
import dayjs from "dayjs";

export default function PlayerAttendance() {
  const userId = localStorage.getItem("userId");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/player/attendance/${userId}`)
      .then(res => res.json())
      .then(json => {
        setData(Array.isArray(json) ? json : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [userId]);

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
      <CircularProgress color="primary" />
    </Box>
  );

  return (
    <Fade in timeout={600}>
      <Box>
        <Stack direction="row" alignItems="center" spacing={1} mb={3}>
          <CalendarMonthIcon sx={{ color: "#2563eb" }} />
          <Typography variant="h5" fontWeight={800} sx={{ color: "#1e293b" }}>
            Attendance Registry
          </Typography>
        </Stack>

        {data.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 4, bgcolor: '#f1f5f9' }}>
            <Typography color="text.secondary">No attendance sessions recorded yet.</Typography>
          </Paper>
        ) : (
          <Stack spacing={2.5}>
            {data.map((row, i) => {
              const isPresent = row.present === 1 || row.status?.toLowerCase() === "present";
              
              return (
                <Card 
                  key={i} 
                  sx={{ 
                    borderRadius: 4, 
                    border: '1px solid #e2e8f0', 
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                    transition: '0.3s',
                    '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }
                  }}
                >
                  <CardContent sx={{ p: '20px !important' }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      
                      {/* Date & Time Info */}
                      <Box>
                        <Typography variant="h6" fontWeight={800} color="#1e293b">
                          {dayjs(row.session_date).format("DD MMMM YYYY")}
                        </Typography>
                        <Typography variant="body2" fontWeight={600} color="text.secondary">
                          ⏰ {row.start_time} — {row.end_time}
                        </Typography>
                      </Box>

                      {/* Status Badge */}
                      <Chip 
                        label={isPresent ? "PRESENT" : "ABSENT"} 
                        sx={{ 
                          fontWeight: 900, 
                          fontSize: '0.75rem',
                          bgcolor: isPresent ? "#dcfce7" : "#fee2e2",
                          color: isPresent ? "#166534" : "#991b1b",
                          px: 1
                        }} 
                      />
                    </Box>

                    <Divider sx={{ my: 2, opacity: 0.6 }} />

                    {/* Coach Feedback Section */}
                    <Box sx={{ 
                      bgcolor: row.remark ? "#f8fafc" : "transparent", 
                      p: row.remark ? 1.5 : 0, 
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 1.5
                    }}>
                      <AssistantIcon sx={{ fontSize: 20, color: "#64748b", mt: 0.3 }} />
                      <Box>
                        <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                          COACH FEEDBACK
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          color: row.remark ? "#334155" : "#94a3b8",
                          fontStyle: row.remark ? "normal" : "italic",
                          lineHeight: 1.6
                        }}>
                          {row.remark || "Performance notes will appear here after review."}
                        </Typography>
                      </Box>
                    </Box>

                  </CardContent>
                </Card>
              );
            })}
          </Stack>
        )}
      </Box>
    </Fade>
  );
}