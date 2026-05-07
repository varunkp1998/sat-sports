import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Box, Typography, Grid, Card, CardContent, Avatar, Tabs, Tab, 
  Stack, IconButton, Chip, Fade, Paper, Button
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import PeopleIcon from "@mui/icons-material/People";
import EventIcon from "@mui/icons-material/Event";
import AssignmentIcon from "@mui/icons-material/Assignment";
import SportsTennisIcon from "@mui/icons-material/SportsTennis";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import API_BASE from "./api";

// 🚀 MOVE COLUMNS OUTSIDE: Prevents re-renders
const COLUMNS: GridColDef[] = [
  { 
    field: "name", 
    headerName: "Athlete", 
    flex: 1.5,
    renderCell: (params) => (
      <Stack direction="row" alignItems="center" spacing={1.5}>
        <Avatar sx={smallAvatarStyle}>{params.value?.[0]}</Avatar>
        <Typography variant="body2" fontWeight={600}>{params.value}</Typography>
      </Stack>
    )
  },
  { field: "email", headerName: "Email", flex: 1.2 },
  { 
    field: "programTitle", 
    headerName: "Program", 
    flex: 1,
    renderCell: (params) => <Chip label={params.value || "General"} size="small" sx={programChipStyle} />
  },
  { 
    field: "category", 
    headerName: "Level", 
    flex: 0.8,
    renderCell: (params) => (
      <Typography variant="caption" sx={levelTextStyle}>
        {params.value?.toUpperCase() || "N/A"}
      </Typography>
    )
  }
];

export default function AdminDashboard() {
  const username = useMemo(() => localStorage.getItem("username") || "Admin", []);
  const [tab, setTab] = useState(0);
  const [data, setData] = useState({ players: [], bookings: [], applications: [], loading: true });

  // 🚀 OPTIMIZED FETCH: Sequential or Parallel based on need
  const fetchData = useCallback(async () => {
    try {
      const [p, b, a] = await Promise.all([
        fetch(`${API_BASE}/api/admin/players`).then(r => r.json()),
        fetch(`${API_BASE}/api/admin/court-bookings`).then(r => r.json()),
        fetch(`${API_BASE}/api/admin/applications`).then(r => r.json())
      ]);
      setData({ 
        players: Array.isArray(p) ? p : [], 
        bookings: Array.isArray(b) ? b : [], 
        applications: Array.isArray(a) ? a : [],
        loading: false 
      });
    } catch (err) {
      console.error("Dashboard Sync Error");
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const stats = useMemo(() => [
    { label: "Players", value: data.players.length, icon: <PeopleIcon />, color: "#6366f1" },
    { label: "Bookings", value: data.bookings.length, icon: <EventIcon />, color: "#06b6d4" },
    { label: "Leads", value: data.applications.length, icon: <AssignmentIcon />, color: "#f43f5e" },
    { label: "Programs", value: 4, icon: <SportsTennisIcon />, color: "#f59e0b" }
  ], [data]);

  return (
    <Box sx={rootBoxStyle}>
      {/* HEADER */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight={950} sx={{ letterSpacing: -1 }}>CORE <span style={{color: '#4f46e5'}}>OPS</span></Typography>
          <Typography variant="caption" fontWeight={700} sx={{ opacity: 0.5 }}>CONTROL CENTER // {username.toUpperCase()}</Typography>
        </Box>
        <Avatar sx={topAvatarStyle}>{username[0]}</Avatar>
      </Stack>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={tabsStyle}>
        <Tab label="OVERVIEW" />
        <Tab label="ATHLETES" />
        <Tab label="FEED" />
      </Tabs>

      {/* 📊 OVERVIEW */}
      {tab === 0 && (
        <Fade in>
          <Box>
            <Grid container spacing={2} mb={4}>
              {stats.map((s, i) => (
                <Grid item xs={6} md={3} key={i}>
                  <Card sx={statCardStyle}>
                    <Stack direction="row" justifyContent="space-between" mb={1}>
                      <Box sx={{ color: s.color }}>{s.icon}</Box>
                      <TrendingUpIcon sx={{ color: '#10b981', fontSize: 16 }} />
                    </Stack>
                    <Typography variant="h4" fontWeight={900}>{s.value}</Typography>
                    <Typography variant="caption" fontWeight={800} sx={{ opacity: 0.4 }}>{s.label}</Typography>
                  </Card>
                </Grid>
              ))}
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={12} md={8}>
                <Paper sx={chartPlaceholderStyle}>
                  <Typography variant="caption" fontWeight={900}>TRAFFIC FLOW DATA</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Stack spacing={1.5}>
                  <QuickButton label="Add Player" />
                  <QuickButton label="Broadcast SMS" />
                  <QuickButton label="System Log" />
                </Stack>
              </Grid>
            </Grid>
          </Box>
        </Fade>
      )}

      {/* 📋 DIRECTORY */}
      {tab === 1 && (
        <Fade in>
          <Card sx={tableCardStyle}>
            <DataGrid
              rows={data.players}
              columns={COLUMNS}
              autoHeight
              density="comfortable"
              disableRowSelectionOnClick
              sx={dataGridStyle}
              initialState={{ pagination: { paginationModel: { pageSize: 8 } } }}
            />
          </Card>
        </Fade>
      )}

      {/* 🔔 FEED */}
      {tab === 2 && (
        <Fade in>
          <Stack spacing={1}>
            {[...data.applications, ...data.bookings].slice(0, 8).map((a, i) => (
              <Paper key={i} sx={activityCardStyle}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={i % 2 === 0 ? blueIconStyle : redIconStyle}>
                    {i % 2 === 0 ? <AssignmentIcon fontSize="small"/> : <EventIcon fontSize="small" />}
                  </Avatar>
                  <Box flex={1}>
                    <Typography variant="body2" fontWeight={900}>{a.name || "System Event"}</Typography>
                    <Typography variant="caption" sx={{ opacity: 0.5 }}>{a.email || "LOG_SYNC_OK"}</Typography>
                  </Box>
                  <IconButton size="small"><MoreVertIcon fontSize="small" /></IconButton>
                </Stack>
              </Paper>
            ))}
          </Stack>
        </Fade>
      )}
    </Box>
  );
}

// --- PURE CSS-IN-JS (OPTIMIZED) ---
const rootBoxStyle = { p: { xs: 2, md: 4 }, bgcolor: "#f8fafc", minHeight: "100vh" };
const topAvatarStyle = { bgcolor: "#4f46e5", width: 42, height: 42, fontWeight: 900, fontSize: '1rem' };
const smallAvatarStyle = { width: 24, height: 24, fontSize: '0.7rem', bgcolor: '#e2e8f0', color: '#475569' };
const programChipStyle = { bgcolor: '#eff6ff', color: '#4f46e5', fontWeight: 900, fontSize: '0.65rem', borderRadius: 1 };
const levelTextStyle = { fontWeight: 900, color: '#94a3b8', fontSize: '0.65rem' };

const tabsStyle = {
  mb: 3, minHeight: 40,
  '& .MuiTab-root': {
    minHeight: 40, py: 0.5, px: 2, fontSize: '0.75rem', fontWeight: 900, color: '#64748b',
    '&.Mui-selected': { color: '#4f46e5' }
  },
  '& .MuiTabs-indicator': { height: 3, borderRadius: '3px 3px 0 0', bgcolor: '#4f46e5' }
};

const statCardStyle = {
  p: 2.5, borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: 'none',
  transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-2px)' }
};

const tableCardStyle = { borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: 'none', overflow: 'hidden' };

const dataGridStyle = {
  border: "none",
  "& .MuiDataGrid-columnHeader": { bgcolor: "#f8fafc", fontWeight: 900, fontSize: '0.7rem', color: '#64748b' },
  "& .MuiDataGrid-cell": { borderBottom: '1px solid #f1f5f9', fontSize: '0.85rem' }
};

const activityCardStyle = { p: 1.5, borderRadius: 2, border: '1px solid #e2e8f0', boxShadow: 'none' };
const blueIconStyle = { width: 32, height: 32, bgcolor: '#eff6ff', color: '#2563eb' };
const redIconStyle = { width: 32, height: 32, bgcolor: '#fff1f2', color: '#e11d48' };

const chartPlaceholderStyle = { 
  height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center', 
  bgcolor: '#f1f5f9', borderRadius: 3, border: '1px dashed #cbd5e1' 
};

const QuickButton = ({ label }: { label: string }) => (
  <Button
    fullWidth
    variant="outlined"
    sx={{ 
      justifyContent: 'flex-start', py: 1, borderRadius: 2, textTransform: 'none',
      fontWeight: 800, fontSize: '0.8rem', color: '#475569', borderColor: '#e2e8f0',
      '&:hover': { bgcolor: '#fff', borderColor: '#4f46e5', color: '#4f46e5' }
    }}
  >
    {label}
  </Button>
);