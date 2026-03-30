import React, { useState, useEffect } from "react";
import {
  Box, Typography, Grid, Card, CardContent, Avatar, 
  Tabs, Tab, Stack, IconButton, Chip, Fade, Divider, Paper
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import PeopleIcon from "@mui/icons-material/People";
import EventIcon from "@mui/icons-material/Event";
import AssignmentIcon from "@mui/icons-material/Assignment";
import SportsTennisIcon from "@mui/icons-material/SportsTennis";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import API_BASE from "./api";

export default function AdminDashboard() {
  const username = localStorage.getItem("username") || "Admin";
  const [tab, setTab] = useState(0);
  const [players, setPlayers] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [p, b, a] = await Promise.all([
          fetch(`${API_BASE}/api/admin/players`).then(r => r.json()),
          fetch(`${API_BASE}/api/admin/court-bookings`).then(r => r.json()),
          fetch(`${API_BASE}/api/admin/applications`).then(r => r.json())
        ]);
        setPlayers(Array.isArray(p) ? p : []);
        setBookings(Array.isArray(b) ? b : []);
        setApplications(Array.isArray(a) ? a : []);
      } catch (err) {
        console.error("Admin Load Error:", err);
      }
    };
    fetchData();
  }, []);

  const stats = [
    { label: "Active Players", value: players.length, icon: <PeopleIcon />, color: "#6366f1" },
    { label: "Court Bookings", value: bookings.length, icon: <EventIcon />, color: "#06b6d4" },
    { label: "New Leads", value: applications.length, icon: <AssignmentIcon />, color: "#f43f5e" },
    { label: "Active Programs", value: [...new Set(players.map(p => p.program_id))].length, icon: <SportsTennisIcon />, color: "#f59e0b" }
  ];

  const columns: GridColDef[] = [
    { 
      field: "name", 
      headerName: "Athlete", 
      flex: 1.5,
      renderCell: (params) => (
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Avatar sx={{ width: 28, height: 28, fontSize: '0.8rem', bgcolor: '#e2e8f0', color: '#475569' }}>
            {params.value[0]}
          </Avatar>
          <Typography variant="body2" fontWeight={600}>{params.value}</Typography>
        </Stack>
      )
    },
    { field: "email", headerName: "Email", flex: 1.2 },
    { 
      field: "programTitle", 
      headerName: "Program", 
      flex: 1,
      renderCell: (params) => (
        <Chip label={params.value || "General"} size="small" sx={programChipStyle} />
      )
    },
    { 
      field: "category", 
      headerName: "Level", 
      flex: 0.8,
      renderCell: (params) => (
        <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748b' }}>
          {params.value?.toUpperCase() || "N/A"}
        </Typography>
      )
    }
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, background: "#f8fafc", minHeight: "100vh" }}>
      
      {/* HEADER SECTION */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight={900} color="#1e293b" letterSpacing="-1px">
            Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            System Overview for <span style={{ color: '#4f46e5', fontWeight: 700 }}>{username}</span>
          </Typography>
        </Box>
        <Avatar sx={{ bgcolor: "#4f46e5", width: 45, height: 45, boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)' }}>
          {username[0]}
        </Avatar>
      </Box>

      {/* TABS DESIGN */}
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={tabsStyle}
        TabIndicatorProps={{ sx: { display: 'none' } }}
      >
        <Tab label="System Overview" />
        <Tab label="Athlete Management" />
        <Tab label="Recent Activity" />
      </Tabs>

      {/* ================= OVERVIEW ================= */}
      {tab === 0 && (
        <Fade in timeout={600}>
          <Box>
            <Grid container spacing={3} mb={4}>
              {stats.map((s, i) => (
                <Grid item xs={12} sm={6} md={3} key={i}>
                  <Card sx={statCardStyle}>
                    <CardContent>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                        <Box sx={{ p: 1, borderRadius: 2, bgcolor: `${s.color}15`, color: s.color }}>
                          {s.icon}
                        </Box>
                        <TrendingUpIcon sx={{ color: '#10b981', fontSize: 18 }} />
                      </Stack>
                      <Typography variant="h4" fontWeight={900} sx={{ mt: 2, mb: 0.5 }}>
                        {s.value}
                      </Typography>
                      <Typography variant="caption" fontWeight={700} color="text.secondary">
                        {s.label.toUpperCase()}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Paper sx={{ p: 3, borderRadius: 4, height: '100%', border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                  <Typography variant="h6" fontWeight={800} mb={2}>Registration Flow</Typography>
                  <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f1f5f9', borderRadius: 3 }}>
                    <Typography color="text.secondary" variant="body2">Chart Data Placeholder</Typography>
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 3, borderRadius: 4, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                  <Typography variant="h6" fontWeight={800} mb={2}>Quick Actions</Typography>
                  <Stack spacing={1}>
                    <ActionButton label="Add New Player" />
                    <ActionButton label="View Bookings" />
                    <ActionButton label="Export CSV" />
                  </Stack>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </Fade>
      )}

      {/* ================= PLAYERS TABLE ================= */}
      {tab === 1 && (
        <Fade in timeout={600}>
          <Card sx={{ borderRadius: 4, boxShadow: 'none', border: '1px solid #e2e8f0' }}>
            <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" fontWeight={800}>Athlete Directory</Typography>
              <Chip label={`${players.length} Total`} sx={{ fontWeight: 700 }} color="primary" variant="outlined" />
            </Box>
            <DataGrid
              rows={players}
              columns={columns}
              getRowId={(row) => row.id}
              autoHeight
              initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
              sx={dataGridStyle}
            />
          </Card>
        </Fade>
      )}

      {/* ================= ACTIVITY FEED ================= */}
      {tab === 2 && (
        <Fade in timeout={600}>
          <Stack spacing={2} maxWidth={800} mx="auto">
            <Typography variant="h6" fontWeight={800}>Activity Stream</Typography>
            {[...applications, ...bookings].slice(0, 10).map((a, i) => (
              <Paper key={i} sx={activityCardStyle}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ bgcolor: i % 2 === 0 ? '#eff6ff' : '#fff1f2', color: i % 2 === 0 ? '#2563eb' : '#e11d48' }}>
                    {i % 2 === 0 ? <AssignmentIcon fontSize="small"/> : <EventIcon fontSize="small" />}
                  </Avatar>
                  <Box flex={1}>
                    <Typography variant="body2" fontWeight={800}>{a.name || "New Notification"}</Typography>
                    <Typography variant="caption" color="text.secondary">{a.email || "System log generated"}</Typography>
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

// --- HELPER COMPONENTS & STYLES ---

const ActionButton = ({ label }: { label: string }) => (
  <Button
    fullWidth
    variant="outlined"
    sx={{ 
      justifyContent: 'flex-start', py: 1.5, borderRadius: 2, textTransform: 'none',
      fontWeight: 700, color: '#475569', borderColor: '#e2e8f0',
      '&:hover': { bgcolor: '#f8fafc', borderColor: '#4f46e5' }
    }}
  >
    {label}
  </Button>
);

const tabsStyle = {
  minHeight: 48, mb: 4,
  '& .MuiTab-root': {
    textTransform: 'none', fontWeight: 700, color: '#64748b', borderRadius: 2, mr: 1,
    transition: '0.2s', '&.Mui-selected': { color: '#4f46e5', bgcolor: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }
  }
};

const statCardStyle = {
  borderRadius: 4, border: '1px solid #e2e8f0', boxShadow: 'none', transition: '0.3s',
  '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 24px -10px rgba(0,0,0,0.1)' }
};

const dataGridStyle = {
  border: "none",
  "& .MuiDataGrid-columnHeaders": { bgcolor: "#f8fafc", color: "#64748b", fontWeight: 800, borderBottom: '1px solid #e2e8f0' },
  "& .MuiDataGrid-cell": { borderBottom: '1px solid #f1f5f9' },
  "& .MuiDataGrid-footerContainer": { borderTop: 'none' }
};

const activityCardStyle = {
  p: 2, borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: 'none', transition: '0.2s',
  '&:hover': { bgcolor: '#f8fafc' }
};

const programChipStyle = {
  bgcolor: '#eff6ff', color: '#2563eb', fontWeight: 800, fontSize: '0.7rem', borderRadius: '6px'
};

import { Button } from "@mui/material"; // Fixed import for ActionButton