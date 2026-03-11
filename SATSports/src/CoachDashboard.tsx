import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent
} from "@mui/material";

import EventIcon from "@mui/icons-material/Event";
import SportsTennisIcon from "@mui/icons-material/SportsTennis";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ScheduleIcon from "@mui/icons-material/Schedule";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  Tooltip
} from "recharts";

import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

import { motion } from "framer-motion";

import API_BASE from "./api";

function GlassCard({ children }: any) {
  return (
    <Card
      sx={{
        backdropFilter: "blur(12px)",
        background: "rgba(255,255,255,0.7)",
        borderRadius: 4,
        boxShadow: "0 8px 25px rgba(0,0,0,0.15)"
      }}
    >
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function Stat({ icon, title, value }: any) {
  return (
    <GlassCard>
      <Box display="flex" alignItems="center" gap={2}>
        {icon}
        <Box>
          <Typography variant="body2">{title}</Typography>
          <Typography variant="h4" fontWeight={700}>
            {value}
          </Typography>
        </Box>
      </Box>
    </GlassCard>
  );
}

export default function CoachDashboard() {

  const userId = localStorage.getItem("userId");

  const [data, setData] = useState<any>({
    weekly: [],
    todaySessionList: [],
    upcoming: []
  });

  const [date, setDate] = useState(new Date());

  useEffect(() => {
    fetch(`${API_BASE}/api/coach/overview/${userId}`)
      .then(res => res.json())
      .then(res => setData({
        weekly: [],
        todaySessionList: [],
        upcoming: [],
        ...res
      }));
  }, []);

  return (

    <Box
      sx={{
        p: 4,
        background:
          "linear-gradient(135deg,#1f2937,#111827)",
        minHeight: "100vh",
        color: "white"
      }}
    >

      {/* Header */}

      <Typography variant="h3" fontWeight={800} mb={4}>
        🎾 Welcome {data.coachName || "Coach"}
      </Typography>

      {/* Stats */}

      <Grid container spacing={3} mb={4}>

        <Grid item xs={12} md={3}>
          <Stat
            icon={<EventIcon />}
            title="Today's Sessions"
            value={data.todaySessionCount || 0}
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <Stat
            icon={<SportsTennisIcon />}
            title="Active Players"
            value="12"
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <Stat
            icon={<CheckCircleIcon />}
            title="Check-ins Today"
            value="9"
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <Stat
            icon={<ScheduleIcon />}
            title="Next Session"
            value={data.nextSession?.start_time || "None"}
          />
        </Grid>

      </Grid>

      {/* Chart + Calendar */}

      <Grid container spacing={3} mb={4}>

        {/* Weekly Chart */}

        <Grid item xs={12} md={8}>

          <GlassCard>

            <Typography variant="h6" mb={2}>
              Weekly Training Sessions
            </Typography>

            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={data.weekly}>
                <XAxis dataKey="d"/>
                <Tooltip />
                <Area
                  dataKey="cnt"
                  stroke="#4ade80"
                  fill="#4ade80"
                />
              </AreaChart>
            </ResponsiveContainer>

          </GlassCard>

        </Grid>

        {/* Calendar */}

        <Grid item xs={12} md={4}>

          <GlassCard>

            <Typography variant="h6" mb={2}>
              Session Calendar
            </Typography>

            <Calendar
              value={date}
              onChange={setDate}
            />

          </GlassCard>

        </Grid>

      </Grid>

      {/* Sessions */}

      <Grid container spacing={3}>

        {/* Today's Sessions */}

        <Grid item xs={12} md={6}>

          <GlassCard>

            <Typography variant="h6" mb={2}>
              Today's Sessions
            </Typography>

            {(data.todaySessionList || []).map((s:any)=>(
              <Box
                key={s.id}
                sx={{
                  display:"flex",
                  justifyContent:"space-between",
                  p:1,
                  borderBottom:"1px solid #ddd"
                }}
              >
                <span>
                  {s.start_time} - {s.end_time}
                </span>

                <motion.button
                  whileHover={{scale:1.05}}
                  style={{
                    background:"#4ade80",
                    border:"none",
                    padding:"6px 12px",
                    borderRadius:8
                  }}
                >
                  Start
                </motion.button>

              </Box>
            ))}

          </GlassCard>

        </Grid>

        {/* Upcoming */}

        <Grid item xs={12} md={6}>

          <GlassCard>

            <Typography variant="h6" mb={2}>
              Upcoming Sessions
            </Typography>

            {(data.upcoming || []).map((s:any,i:number)=>(
              <Typography key={i}>
                {s.session_date} | {s.start_time}
              </Typography>
            ))}

          </GlassCard>

        </Grid>

      </Grid>

    </Box>
  );
}