import React, { useEffect, useState, useCallback } from "react";
import {
  Box, Card, CardContent, Typography, Stack, Button, TextField, 
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton, 
  Avatar, Fade, Divider, Grid, InputAdornment
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import MapIcon from "@mui/icons-material/Map";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import API_BASE from "./api";

export default function AdminLocations() {
  const [locations, setLocations] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    lat: "",
    lng: "",
    price: ""
  });

  const loadLocations = useCallback(async () => {
    const res = await fetch(`${API_BASE}/api/admin/locations`);
    const data = await res.json();
    setLocations(data);
  }, []);

  useEffect(() => { loadLocations(); }, [loadLocations]);

  const handleOpen = (loc: any = null) => {
    setEditing(loc);
    setForm({
      name: loc?.name || "",
      lat: loc?.lat || "",
      lng: loc?.lng || "",
      price: loc?.price || ""
    });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.name) return;
    setLoading(true);
    
    await fetch(`${API_BASE}/api/admin/locations-full`, {
      method: "POST", // Unified route handles both Add and Edit
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, id: editing?.id })
    });

    setOpen(false);
    setLoading(false);
    loadLocations();
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this facility and its pricing?")) return;
    await fetch(`${API_BASE}/api/admin/locations/${id}`, { method: "DELETE" });
    loadLocations();
  };

  return (
    <Box sx={{ p: { xs: 2, md: 5 }, background: "#f8fafc", minHeight: "100vh" }}>
      
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" fontWeight={900}>Facility Management</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()} sx={primaryBtnStyle}>
          New Location
        </Button>
      </Stack>

      <Grid container spacing={3}>
        {locations.map((l, i) => (
          <Grid item xs={12} sm={6} lg={4} key={l.id}>
            <Fade in timeout={300 + i * 100}>
              <Card sx={cardStyle}>
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                    <Avatar sx={avatarStyle}><LocationOnIcon /></Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" fontWeight={800}>{l.name}</Typography>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ opacity: 0.7 }}>
                        <Typography variant="caption" fontWeight={700} color="primary">
                          ₹{l.price || '0'} /hr
                        </Typography>
                        {l.lat && <Chip label="GEO" size="small" sx={{ height: 16, fontSize: 10, fontWeight: 900 }} />}
                      </Stack>
                    </Box>
                  </Stack>

                  <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                     <Typography variant="caption" color="text.secondary">LAT: {l.lat || '--'}</Typography>
                     <Typography variant="caption" color="text.secondary">LNG: {l.lng || '--'}</Typography>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <IconButton onClick={() => handleOpen(l)} size="small" sx={{ bgcolor: '#f1f5f9' }}><EditIcon fontSize="small" /></IconButton>
                    <IconButton onClick={() => handleDelete(l.id)} size="small" sx={{ bgcolor: '#fff1f2', color: '#e11d48' }}><DeleteIcon fontSize="small" /></IconButton>
                  </Stack>
                </CardContent>
              </Card>
            </Fade>
          </Grid>
        ))}
      </Grid>

      {/* 🛠️ MODAL */}
      <Dialog open={open} onClose={() => setOpen(false)} PaperProps={{ sx: { borderRadius: 4, width: '100%', maxWidth: 450 } }}>
        <DialogTitle sx={{ fontWeight: 900 }}>{editing ? "Edit Facility" : "New Facility"}</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField label="Facility Name" fullWidth value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} sx={inputStyle} />
            
            <TextField 
              label="Private Booking Price" 
              type="number" 
              fullWidth 
              value={form.price} 
              onChange={(e) => setForm({...form, price: e.target.value})} 
              InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
              sx={inputStyle} 
            />

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField label="Latitude" fullWidth value={form.lat} onChange={(e) => setForm({...form, lat: e.target.value})} sx={inputStyle} />
              </Grid>
              <Grid item xs={6}>
                <TextField label="Longitude" fullWidth value={form.lng} onChange={(e) => setForm({...form, lng: e.target.value})} sx={inputStyle} />
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpen(false)} sx={{ fontWeight: 700 }}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={loading} sx={primaryBtnStyle}>
            {loading ? "Saving..." : "Save Facility"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// Styles
const cardStyle = { borderRadius: 4, border: '1px solid #e2e8f0', boxShadow: 'none', transition: '0.3s', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 24px rgba(0,0,0,0.05)' } };
const avatarStyle = { bgcolor: '#eff6ff', color: '#3b82f6', borderRadius: 3 };
const primaryBtnStyle = { borderRadius: 3, fontWeight: 800, textTransform: 'none', background: 'linear-gradient(135deg, #2563eb, #4f46e5)', px: 3 };
const inputStyle = { "& .MuiOutlinedInput-root": { borderRadius: 3, bgcolor: '#f8fafc' } };
const Chip = (props: any) => <Box {...props} sx={{ ...props.sx, bgcolor: '#3b82f6', color: 'white', px: 1, borderRadius: 1 }}>{props.label}</Box>;