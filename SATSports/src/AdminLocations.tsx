import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Box, Card, CardContent, Typography, Stack, Button, TextField, 
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton, 
  Avatar, Fade, Divider, Grid, InputAdornment, CircularProgress, Tooltip,Chip
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import MapIcon from "@mui/icons-material/Map";
import API_BASE from "./api";

// --- HELPERS ---
const cleanCoord = (val: string) => val.replace(/[^0-9.-]/g, '');

export default function AdminLocations() {
  const [locations, setLocations] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [form, setForm] = useState({ name: "", lat: "", lng: "", price: "" });

  const loadLocations = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/locations`);
      const data = await res.json();
      setLocations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Location Fetch Failed");
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => { loadLocations(); }, [loadLocations]);

  const handleOpen = useCallback((loc: any = null) => {
    setEditing(loc);
    setForm({
      name: loc?.name || "",
      lat: loc?.lat || "",
      lng: loc?.lng || "",
      price: loc?.price || ""
    });
    setOpen(true);
  }, []);

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setLoading(true);
    
    // 🚀 OPTIMISTIC UI: Update list immediately for a snappy feel
    const tempId = editing?.id || Date.now();
    const newLoc = { ...form, id: tempId };
    
    if (editing) {
      setLocations(prev => prev.map(l => l.id === editing.id ? newLoc : l));
    } else {
      setLocations(prev => [newLoc, ...prev]);
    }

    try {
      await fetch(`${API_BASE}/api/admin/locations-sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, id: editing?.id || null })
      });
      setOpen(false);
    } catch (err) {
      loadLocations(); // Revert on error
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this facility?")) return;
    setLocations(prev => prev.filter(l => l.id !== id)); // Optimistic delete
    try {
      await fetch(`${API_BASE}/api/admin/locations/${id}`, { method: "DELETE" });
    } catch {
      loadLocations();
    }
  };

  return (
    <Box sx={rootStyle}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={6}>
        <Box>
          <Typography variant="h4" fontWeight={950} sx={{ letterSpacing: "-1.5px" }}>
            FACILITY <span style={{ color: "#2563eb" }}>RESOURCES</span>
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 800, opacity: 0.5 }}>
            GEOSPATIAL COORDINATES & REVENUE CONFIGURATION
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()} sx={addBtnStyle}>
          Add Facility
        </Button>
      </Stack>

      {fetching ? (
        <Box sx={loadingBox}><CircularProgress size={30} /></Box>
      ) : (
        <Grid container spacing={2.5}>
          {locations.map((l, i) => (
            <Grid item xs={12} sm={6} lg={4} key={l.id}>
              <Fade in timeout={200}>
                <Card sx={locationCardStyle}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                      <Avatar sx={avatarStyle}><LocationOnIcon fontSize="small" /></Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="subtitle1" fontWeight={900} noWrap>{l.name}</Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip label={`₹${l.price || '0'}/hr`} size="small" sx={priceChipStyle} />
                          {l.lat && <MapIcon sx={{ fontSize: 14, color: '#3b82f6' }} />}
                        </Stack>
                      </Box>
                    </Stack>

                    <Box sx={geoBoxStyle}>
                       <Typography variant="caption" fontWeight={800}>LAT: {l.lat || '--'}</Typography>
                       <Typography variant="caption" fontWeight={800}>LNG: {l.lng || '--'}</Typography>
                    </Box>

                    <Stack direction="row" spacing={1} mt={2.5} justifyContent="flex-end">
                      <IconButton onClick={() => handleOpen(l)} sx={editBtnStyle} size="small"><EditIcon fontSize="inherit" /></IconButton>
                      <IconButton onClick={() => handleDelete(l.id)} sx={deleteBtnStyle} size="small"><DeleteIcon fontSize="inherit" /></IconButton>
                    </Stack>
                  </CardContent>
                </Card>
              </Fade>
            </Grid>
          ))}
        </Grid>
      )}

      {/* 🛠️ MODAL */}
      <Dialog open={open} onClose={() => !loading && setOpen(false)} PaperProps={{ sx: modalPaperStyle }}>
        <DialogTitle sx={{ fontWeight: 950, fontSize: '1.2rem' }}>
          {editing ? "REVISE FACILITY" : "NEW FACILITY"}
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={2.5}>
            <TextField label="Name" fullWidth value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} sx={inputStyle} />
            <TextField label="Hourly Rate" fullWidth type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} sx={inputStyle} />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField label="Latitude" fullWidth value={form.lat} onChange={(e) => setForm({ ...form, lat: cleanCoord(e.target.value) })} sx={inputStyle} />
              </Grid>
              <Grid item xs={6}>
                <TextField label="Longitude" fullWidth value={form.lng} onChange={(e) => setForm({ ...form, lng: cleanCoord(e.target.value) })} sx={inputStyle} />
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpen(false)} sx={{ fontWeight: 800, color: '#64748b' }}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={loading || !form.name} sx={saveBtnStyle}>
            {loading ? <CircularProgress size={20} color="inherit" /> : "Confirm Changes"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// --- STATIC PERFORMANCE STYLES ---
const rootStyle = { p: { xs: 2, md: 5 }, bgcolor: "#f8fafc", minHeight: "100vh" };
const loadingBox = { display: "flex", justifyContent: "center", py: 10, color: '#2563eb' };
const locationCardStyle = { borderRadius: 4, border: '1px solid #e2e8f0', boxShadow: 'none', transition: '0.2s', '&:hover': { borderColor: '#2563eb', bgcolor: '#fff' } };
const avatarStyle = { bgcolor: '#eff6ff', color: '#2563eb', width: 36, height: 36, borderRadius: 2 };
const priceChipStyle = { bgcolor: '#f1f5f9', fontWeight: 900, color: '#1e293b', fontSize: '0.65rem' };
const geoBoxStyle = { display: 'flex', gap: 2, bgcolor: '#f8fafc', p: 1.5, borderRadius: 2, border: '1px solid #f1f5f9', color: '#64748b' };
const addBtnStyle = { borderRadius: 2, fontWeight: 900, textTransform: 'none', px: 3, bgcolor: '#2563eb' };
const editBtnStyle = { bgcolor: '#f1f5f9', color: '#64748b', borderRadius: 1.5, "&:hover": { bgcolor: '#e2e8f0' } };
const deleteBtnStyle = { bgcolor: '#fff1f2', color: '#e11d48', borderRadius: 1.5, "&:hover": { bgcolor: '#e11d48', color: 'white' } };
const modalPaperStyle = { borderRadius: 4, width: '100%', maxWidth: 400, p: 1 };
const inputStyle = { "& .MuiOutlinedInput-root": { borderRadius: 2.5, bgcolor: '#f8fafc', fontWeight: 700, fontSize: '0.9rem' } };
const saveBtnStyle = { borderRadius: 2, fontWeight: 900, textTransform: 'none', px: 4, minWidth: 120 };