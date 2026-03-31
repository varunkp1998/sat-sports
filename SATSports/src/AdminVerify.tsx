import { useEffect, useState } from "react";
import { Box, Typography, Grid, Card, CardContent, CardMedia, Button, Chip, Stack, CircularProgress, Container } from "@mui/material";
import API_BASE from "./api"; // Ensure this file exports "https://sat-sports.onrender.com"
import dayjs from "dayjs";

export default function AdminVerify() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Fetching from:", `${API_BASE}/api/admin/checkins/all-photos`);
    fetch(`${API_BASE}/api/admin/checkins/all-photos`)
      .then(res => res.json())
      .then(json => {
        console.log("Received Data:", json);
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        console.error("Fetch Error:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 10, bgcolor: '#020617', height: '100vh' }}>
      <CircularProgress color="error" />
    </Box>
  );

  return (
    <Box sx={{ background: "#020617", minHeight: "100vh", color: "white", py: 4 }}>
      <Container maxWidth="xl">
        <Typography variant="h4" fontWeight={900} gutterBottom>
          PHOTO <span style={{ color: '#ef4444' }}>VERIFICATIONS</span>
        </Typography>

        {data.length === 0 ? (
          <Typography sx={{ opacity: 0.5 }}>No records found in database.</Typography>
        ) : (
          <Grid container spacing={3}>
            {data.map((item: any) => (
              <Grid item xs={12} md={4} key={item.id}>
                <Card sx={{ bgcolor: "#1e293b", color: "white", borderRadius: 4 }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={`${API_BASE}/uploads/${item.verification_photo}`}
                    alt="Check-in Photo"
                    onError={(e: any) => { e.target.src = "https://via.placeholder.com/300?text=Photo+Not+Found"; }}
                  />
                  <CardContent>
                    <Typography variant="h6">{item.coach_name || "Unknown Coach"}</Typography>
                    <Typography variant="body2" color="error">{item.locationName}</Typography>
                    <Typography variant="caption" display="block" sx={{ mt: 1, opacity: 0.7 }}>
                      {dayjs(item.checkin_time).format("DD MMM - hh:mm A")}
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                      <Chip label={item.status} color={item.status === 'APPROVED' ? 'success' : 'warning'} size="small" />
                      {item.is_late === 1 && <Chip label="LATE" color="error" size="small" />}
                    </Stack>
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