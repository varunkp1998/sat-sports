import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid
} from "@mui/material";

import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

import API_BASE from "./api";

function CoachDashboard() {
  const userId = localStorage.getItem("userId");
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/coach/overview/${userId}`)
      .then(r => r.json())
      .then(setData);
  }, []);

  if (!data) return <p>Loading...</p>;

  return (
    <Box>

      {/* Header */}
      <Typography variant="h4" fontWeight={700} mb={3}>
        Welcome {data.coachName}
      </Typography>

      {/* Stats */}
      <Grid container spacing={2} mb={3}>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography>Today's Sessions</Typography>
              <Typography variant="h3">
                {data.todaySessionCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography>Check In</Typography>
              <Button variant="contained">
                Check In
              </Button>
            </CardContent>
          </Card>
        </Grid>

      </Grid>

      {/* Weekly Chart */}
      <Card sx={{ mb: 3 }}>
        <CardContent>

          <Typography mb={2}>
            Sessions This Week
          </Typography>

          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.weekly}>
              <XAxis dataKey="d"/>
              <Tooltip />
              <Bar dataKey="cnt" fill="#667eea" />
            </BarChart>
          </ResponsiveContainer>

        </CardContent>
      </Card>

      {/* Today's Sessions */}
      <Card sx={{ mb: 3 }}>
        <CardContent>

          <Typography variant="h6">
            Today's Sessions
          </Typography>

          {data.todaySessionList.map((s:any)=>(
            <Box key={s.id} sx={{p:1}}>
              {s.start_time} - {s.end_time}
            </Box>
          ))}

        </CardContent>
      </Card>

      {/* Upcoming Sessions */}
      <Card>
        <CardContent>

          <Typography variant="h6">
            Upcoming Sessions
          </Typography>

          {data.upcoming.map((s:any,i:number)=>(
            <Box key={i} sx={{p:1}}>
              {s.session_date} | {s.start_time} - {s.end_time}
            </Box>
          ))}

        </CardContent>
      </Card>

    </Box>
  );
}

export default CoachDashboard;