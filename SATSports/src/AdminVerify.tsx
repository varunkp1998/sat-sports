import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  Stack,
  CircularProgress,
  Container,
  IconButton,
  Paper,
  Alert
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import BlockIcon from "@mui/icons-material/Block";

const API_BASE = "https://sat-sports.onrender.com";

export default function AdminVerify() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<number | null>(null);

  // 🔥 SAFE JSON PARSER
  const safeParse = async (res: Response) => {
    const text = await res.text();
    console.log("RAW:", text);

    try {
      return JSON.parse(text);
    } catch {
      throw new Error("Invalid JSON response");
    }
  };

  // 🔥 FETCH DATA
  const fetchPhotos = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/api/admin/checkins/all-photos`);

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
      }

      const json = await safeParse(res);

      setData(Array.isArray(json) ? json : []);
    } catch (err: any) {
      console.error("FETCH ERROR:", err);
      setError("Failed to load data");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

  // 🔥 VERIFY ACTION
  const handleStatus = async (id: number, status: string) => {
    setActionId(id);
  
    try {
      const res = await fetch(`${API_BASE}/api/admin/checkin/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          id: Number(id),
          status
        })
      });
  
      const text = await res.text();
      console.log("VERIFY RAW:", text);
  
      if (!res.ok) {
        alert("Update failed");
        return;
      }
  
      // ✅ DO NOT PARSE STRICTLY
      try {
        JSON.parse(text);
      } catch {
        console.warn("Non-JSON response, ignoring");
      }
  
      setData(prev =>
        prev.map(item =>
          item.id === id ? { ...item, status } : item
        )
      );
  
    } catch (err) {
      console.error("VERIFY ERROR:", err);
      alert("Network error");
    } finally {
      setActionId(null);
    }
  };
  // 🔥 LOADING
  if (loading) {
    return (
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          bgcolor: "#020617",
          color: "white"
        }}
      >
        <CircularProgress />
        <Typography mt={2}>Loading records...</Typography>
      </Box>
    );
  }
  console.log("🔥 NEW BUILD WORKING");
  return (
    <Box sx={{ bgcolor: "#020617", minHeight: "100vh", pb: 10 }}>
      {/* HEADER */}
      <Paper
        elevation={0}
        sx={{
          bgcolor: "#020617",
          borderBottom: "1px solid #1e293b",
          py: 3,
          mb: 4
        }}
      >
        <Container maxWidth="xl">
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="h5" sx={{ color: "white", fontWeight: 800 }}>
              📸 Photo Verifications
            </Typography>

            <IconButton onClick={fetchPhotos} sx={{ color: "white" }}>
              <RefreshIcon />
            </IconButton>
          </Stack>
        </Container>
      </Paper>

      <Container maxWidth="xl">
        {/* ERROR */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* EMPTY */}
        {!loading && data.length === 0 && !error && (
          <Box sx={{ textAlign: "center", color: "#94a3b8", mt: 10 }}>
            <Typography>No records found</Typography>
          </Box>
        )}

        {/* GRID */}
        <Grid container spacing={3}>
          {(data || []).map((item, index) => {
            if (!item || typeof item !== "object") return null;

            return (
              <Grid item xs={12} sm={6} md={4} key={item.id || index}>
                <Card sx={{ bgcolor: "#0f172a", color: "white", borderRadius: 3 }}>
                  {/* IMAGE */}
                  <Box sx={{ position: "relative" }}>
                  <CardMedia
  component="img"
  height="220"
  // This matches your app.use('/uploads', ...) configuration
  image={`${API_BASE}/uploads/${item.verification_photo}`}
  sx={{ 
    objectFit: "cover", 
    bgcolor: "#0f172a",
    filter: "brightness(0.9)" // Optional: matches your dark theme better
  }}
  onError={(e: any) => {
    console.error("Image 404 at:", e.target.src);
    e.target.src = "https://via.placeholder.com/400x300?text=Image+Missing";
  }}
/>

                    <Chip
                      label={item.status || "PENDING"}
                      size="small"
                      sx={{
                        position: "absolute",
                        top: 10,
                        left: 10,
                        bgcolor:
                          item.status === "APPROVED"
                            ? "#22c55e"
                            : item.status === "REJECTED"
                            ? "#ef4444"
                            : "#f59e0b",
                        color: "white"
                      }}
                    />
                  </Box>

                  {/* CONTENT */}
                  <CardContent>
                    <Typography fontWeight={700}>
                      {item.coach_name || "Unknown Coach"}
                    </Typography>

                    <Typography fontSize={13}>
                      📍 {item.locationName || "Unknown Location"}
                    </Typography>

                    <Typography fontSize={12} color="#94a3b8">
                      {item.checkin_time
                        ? new Date(item.checkin_time).toLocaleString()
                        : "No time"}
                    </Typography>

                    <Stack direction="row" spacing={1} mt={2}>
                      <Button
                        fullWidth
                        variant="contained"
                        color="success"
                        disabled={actionId === item.id || item.status === "APPROVED"}
                        onClick={() => handleStatus(item.id, "APPROVED")}
                        startIcon={<CheckCircleIcon />}
                      >
                        Approve
                      </Button>

                      <Button
                        fullWidth
                        variant="contained"
                        color="error"
                        disabled={actionId === item.id || item.status === "REJECTED"}
                        onClick={() => handleStatus(item.id, "REJECTED")}
                        startIcon={<BlockIcon />}
                      >
                        Reject
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Container>
    </Box>
  );
}
