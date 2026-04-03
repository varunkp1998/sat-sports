import React, { useEffect, useState, useCallback } from "react";
import {
  Box, Card, CardContent, Typography, Stack, Button, TextField, 
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton, 
  Avatar, Fade, Divider, Grid, InputAdornment, CircularProgress, Tooltip
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
  const [fetching, setFetching] = useState(true);

  const [form, setForm] = useState({
    name: "",
    lat: "",
    lng: "",
    price: ""
  });

  // 🔄 LOAD DATA
  const loadLocations = useCallback(async () => {
    setFetching(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/locations`);
      const data = await res.json();
      setLocations(data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => { loadLocations(); }, [loadLocations]);

  // 🛠️ HANDLERS
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
    if (!form.name.trim()) return;
    setLoading(true);
    
    try {
      const response = await fetch(`${API_BASE}/api/admin/locations-sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          ...form, 
          id: editing?.id || null // Send ID if editing, null if new
        })
      });

      if (response.ok) {
        setOpen(false);
        loadLocations();
      }
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this facility? This will also remove its pricing data.")) return;
    try {
      await fetch(`${API_BASE}/api/admin/locations/${id}`, { method: "DELETE" });
      loadLocations();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <Box sx={containerStyle}>
      {/* HEADER */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={6}>
        <Box>
          <Typography variant="h4" fontWeight={950} sx={{ letterSpacing: "-1.5px" }}>
            FACILITY <span style={{ color: "#2563eb" }}>MANAGEMENT</span>
          </Typography>
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            Setup courts, coordinates, and private booking rates.
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={() => handleOpen()} 
          sx={addBtnStyle}
        >
          Add New Facility
        </Button>
      </Stack>

      {/* LOADING STATE */}
      {fetching ? (
        <Box display="flex" justifyContent="center" py={10}><CircularProgress /></Box>
      ) : (
        <Grid container spacing={3}>
          {locations.map((l, index) => (
            <Grid item xs={12} sm={6} lg={4} key={l.id}>
              <Fade in timeout={300 + index * 50}>
                <Card sx={locationCardStyle}>
                  <CardContent sx={{ p: 3 }}>
                    <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                      <Avatar sx={avatarStyle}><LocationOnIcon /></Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" fontWeight={800} noWrap>{l.name}</Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 800 }}>ACTIVE</Typography>
                          <Box sx={dotDivider} />
                          <Typography variant="caption" sx={{ fontWeight: 800, color: '#3b82f6' }}>
                             ₹{l.price || '0'} /hr
                          </Typography>
                        </Stack>
                      </Box>
                    </Stack>

                    <Box sx={geoBoxStyle}>
                       <Stack direction="row" spacing={2}>
                          <Typography variant="caption"><b>LAT:</b> {l.lat || 'N/A'}</Typography>
                          <Typography variant="caption"><b>LNG:</b> {l.lng || 'N/A'}</Typography>
                       </Stack>
                       {l.lat && l.lng && (
                         <Tooltip title="Location set on map">
                            <MapIcon sx={{ fontSize: 16, color: '#3b82f6' }} />
                         </Tooltip>
                       )}
                    </Box>

                    <Divider sx={{ my: 2, opacity: 0.5 }} />

                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <IconButton onClick={() => handleOpen(l)} sx={iconBtnStyle}><EditIcon fontSize="small" /></IconButton>
                      <IconButton onClick={() => handleDelete(l.id)} sx={deleteBtnStyle}><DeleteIcon fontSize="small" /></IconButton>
                    </Stack>
                  </CardContent>
                </Card>
              </Fade>
            </Grid>
          ))}
        </Grid>
      )}

      {/* 🛠️ FOOLPROOF MODAL */}
      <Dialog 
        open={open} 
        onClose={() => !loading && setOpen(false)} 
        PaperProps={{ sx: { borderRadius: 5, width: '100%', maxWidth: 450 } }}
      >
        <DialogTitle sx={{ fontWeight: 900, pt: 3 }}>
          {editing ? "Edit Facility Details" : "Register New Facility"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Facility Name"
              fullWidth
              autoFocus
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              sx={modalInputStyle}
            />

            <TextField
              label="Hourly Booking Price"
              fullWidth
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
              sx={modalInputStyle}
            />

            <Typography variant="caption" fontWeight={700} sx={{ opacity: 0.5, mb: -2, textTransform: 'uppercase' }}>
              Geographic Coordinates (Optional)
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField label="Latitude" fullWidth value={form.lat} onChange={(e) => setForm({ ...form, lat: e.target.value })} sx={modalInputStyle} />
              </Grid>
              <Grid item xs={6}>
                <TextField label="Longitude" fullWidth value={form.lng} onChange={(e) => setForm({ ...form, lng: e.target.value })} sx={modalInputStyle} />
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setOpen(false)} disabled={loading} sx={{ fontWeight: 700, color: '#64748b' }}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleSave} 
            disabled={loading || !form.name} 
            sx={saveBtnStyle}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// --- FOOLPROOF STYLES ---

const containerStyle = { p: { xs: 2, md: 5 }, background: "#f8fafc", minHeight: "100vh" };

const locationCardStyle = {
  borderRadius: 5, border: '1px solid #e2e8f0', boxShadow: 'none', transition: '0.3s',
  '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 15px 30px -10px rgba(0,0,0,0.08)', borderColor: '#2563eb' }
};

const avatarStyle = { bgcolor: '#eff6ff', color: '#2563eb', width: 48, height: 48, borderRadius: 3 };

const geoBoxStyle = { 
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  bgcolor: '#f1f5f9', p: 1.5, borderRadius: 2.5, mt: 1, color: '#475569' 
};

const dotDivider = { width: 4, height: 4, borderRadius: '50%', bgcolor: '#cbd5e1' };

const addBtnStyle = {
  borderRadius: 3, px: 3, py: 1.2, fontWeight: 800, textTransform: 'none',
  background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', boxShadow: '0 10px 20px -5px rgba(37, 99, 235, 0.4)'
};

const iconBtnStyle = { bgcolor: '#f8fafc', color: '#64748b', borderRadius: 2, '&:hover': { bgcolor: '#e2e8f0' } };

const deleteBtnStyle = { 
  bgcolor: '#fff1f2', color: '#e11d48', borderRadius: 2, 
  '&:hover': { bgcolor: '#e11d48', color: 'white' } 
};

const modalInputStyle = { "& .MuiOutlinedInput-root": { borderRadius: 3, bgcolor: '#f8fafc', fontWeight: 600 } };

const saveBtnStyle = { borderRadius: 3, px: 4, py: 1.2, fontWeight: 800, textTransform: 'none', minWidth: 140 };