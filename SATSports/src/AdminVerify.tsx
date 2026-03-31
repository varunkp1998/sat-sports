import React, { useEffect, useState } from "react";
import { Box, Typography, Grid, Card, CardContent, CircularProgress, Container, Alert } from "@mui/material";
import API_BASE from "./api"; 

export default function AdminVerify() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/admin/checkins/all-photos`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' }
        });
        
        if (!response.ok) throw new Error(`Server Error: ${response.status}`);
        
        const json = await response.json();
        // Guard against non-array responses
        setData(Array.isArray(json) ? json : []);
      } catch (err: any) {
        console.error("Fetch Error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 10, bgcolor: '#020617', height: '100vh' }}>
      <CircularProgress color="error" />
    </Box>
  );

  return (
    <Box sx={{ background: "#020617", minHeight: "100vh", color: "white", py: 5 }}>
      <Container maxWidth="xl">
        <Typography variant="h4" fontWeight={900} gutterBottom>
          PHOTO <span style={{ color: '#ef4444' }}>VERIFICATIONS</span>
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 4, bgcolor: '#450a0a', color: '#fca5a5' }}>
            Connection Failed: {error}. Check if Backend CORS allows this Origin.
          </Alert>
        )}

        {!data || data.length === 0 ? (
          <Typography sx={{ opacity: 0.5 }}>No records found or API blocked.</Typography>
        ) : (
          <Grid container spacing={3}>
            {data.map((item: any) => (
              <Grid item xs={12} md={4} key={item.id}>
                <Card sx={{ bgcolor: "#1e293b", color: "white", borderRadius: 4, border: '1px solid #334155' }}>
                  <Box 
                    component="img"
                    sx={{ width: '100%', height: 250, objectFit: 'cover' }}
                    src={`${API_BASE}/uploads/${item.verification_photo}`}
                    onError={(e: any) => e.target.src = "https://via.placeholder.com/300?text=No+Image+Found"}
                  />
                  <CardContent>
                    <Typography variant="h6" fontWeight={700}>{item.coach_name || "Unknown Coach"}</Typography>
                    <Typography variant="body2" color="error">{item.locationName}</Typography>
                    <Typography variant="caption" sx={{ opacity: 0.6, mt: 1, display: 'block' }}>
                      Status: {item.status}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
}