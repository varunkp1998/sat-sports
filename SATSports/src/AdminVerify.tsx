import { useEffect, useState } from "react";
import { Box, Typography, Grid, Card, CardContent, CircularProgress, Container, Alert } from "@mui/material";
import API_BASE from "./api";

export default function AdminVerify() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [internalError, setInternalError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Attempting fetch from:", `${API_BASE}/api/admin/checkins/all-photos`);
        const res = await fetch(`${API_BASE}/api/admin/checkins/all-photos`);
        
        if (!res.ok) throw new Error(`Server responded with ${res.status}`);
        
        const json = await res.json();
        console.log("Data received successfully:", json);
        setData(json);
      } catch (err: any) {
        console.error("Frontend Fetch Error:", err);
        setInternalError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <Box sx={{ p: 5, textAlign: 'center', color: 'white' }}><CircularProgress color="error" /><Typography>Loading Field Data...</Typography></Box>;

  return (
    <Box sx={{ background: "#020617", minHeight: "100vh", color: "white", p: 4 }}>
      <Container maxWidth="xl">
        <Typography variant="h4" fontWeight={900} sx={{ mb: 4 }}>
          COMMAND <span style={{ color: '#ef4444' }}>VERIFY</span>
        </Typography>

        {internalError && (
          <Alert severity="error" sx={{ mb: 4 }}>
            CONNECTION ERROR: {internalError} 
            <br /> Check if your Backend URL is correct: {API_BASE}
          </Alert>
        )}

        {data.length === 0 && !internalError ? (
          <Typography>No records found. The API returned an empty list [ ].</Typography>
        ) : (
          <Grid container spacing={3}>
            {data.map((item) => (
              <Grid item xs={12} md={4} key={item.id}>
                <Card sx={{ bgcolor: "#1e293b", color: "white", p: 2 }}>
                  <Typography variant="h6">{item.coach_name || "Unknown Coach"}</Typography>
                  <Typography variant="body2" sx={{ color: '#ef4444' }}>{item.locationName}</Typography>
                  <Box 
                    component="img" 
                    src={`${API_BASE}/uploads/${item.verification_photo}`} 
                    sx={{ width: '100%', height: 200, objectFit: 'cover', mt: 2, borderRadius: 2 }}
                    onError={(e: any) => e.target.src = "https://via.placeholder.com/300?text=No+Image+Found"}
                  />
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* --- DEBUGGER: REMOVE THIS ONCE FIXED --- */}
        <Box sx={{ mt: 10, p: 2, bgcolor: '#000', border: '1px solid #333', fontSize: '10px' }}>
          <Typography variant="caption" color="gray">DEBUG LOG:</Typography>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </Box>
      </Container>
    </Box>
  );
}