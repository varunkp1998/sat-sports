import { useEffect, useState } from "react";
import { Box, Typography, Card, CardContent } from "@mui/material";
import API_BASE from "./api";

function GlassCard({ children }: any) {
  return (
    <Card
      sx={{
        backdropFilter: "blur(12px)",
        background: "rgba(255,255,255,0.08)",
        borderRadius: 4,
        boxShadow: "0 8px 25px rgba(0,0,0,0.4)",
        color: "white",
        mb: 2
      }}
    >
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function PlayerAttendance() {
  const userId = localStorage.getItem("userId");
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${API_BASE}/api/player/attendance/${userId}`)
      .then(res => res.json())
      .then(setData);
  }, []);

  return (
    <Box
      sx={{
        p: 4,
        background: "linear-gradient(135deg,#1f2937,#111827)",
        minHeight: "100vh",
        color: "white"
      }}
    >
      <Typography variant="h4" fontWeight={800} mb={3}>
        📊 Attendance History
      </Typography>

      {data.length === 0 && (
        <Typography>No attendance records found</Typography>
      )}

      {data.map((row, i) => (
        <GlassCard key={i}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="flex-start"
          >
            <Box>
              {/* Date */}
              <Typography fontWeight={600}>
                {row.session_date}
              </Typography>

              {/* Time */}
              <Typography variant="body2">
                {row.start_time} - {row.end_time}
              </Typography>

              {/* ✅ NEW: Coach Feedback */}
              {row.remark && (
                <Typography
                  sx={{
                    mt: 1,
                    fontStyle: "italic",
                    color: "#cbd5f5",
                    fontSize: 14
                  }}
                >
                  💬 {row.remark}
                </Typography>
              )}

              {/* Optional: show no feedback */}
              {!row.remark && (
                <Typography
                  sx={{
                    mt: 1,
                    fontSize: 13,
                    color: "#9ca3af"
                  }}
                >
                  No feedback given
                </Typography>
              )}
            </Box>

            {/* Status */}
            <Typography
              sx={{
                px: 2,
                py: 0.5,
                borderRadius: 2,
                background:
                  row.present === 1 || row.status === "present"
                    ? "#4ade80"
                    : "#f87171",
                color: "#000",
                fontWeight: 600
              }}
            >
              {row.present === 1 || row.status === "present"
                ? "Present"
                : "Absent"}
            </Typography>
          </Box>
        </GlassCard>
      ))}
    </Box>
  );
}

export default PlayerAttendance;