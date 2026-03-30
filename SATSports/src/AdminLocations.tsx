import React, { useEffect, useState } from "react";
import {
  Box, Card, CardContent, Typography, Stack, Button, TextField, 
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton, 
  Avatar, Fade, Paper, Divider
} from "@mui/material";
import MapIcon from "@mui/icons-material/Map";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import API_BASE from "./api";

function AdminLocations() {
  const [locations, setLocations] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState({ name: "" });

  const loadLocations = () => {
    fetch(`${API_BASE}/api/admin/locations`)
      .then(res => res.json())
      .then(setLocations)
      .catch(err => console.error("Load error:", err));
  };

  useEffect(() => { loadLocations(); }, []);

  const handleOpen = (loc: any = null) => {
    setEditing(loc);
    setForm(loc ? { name: loc.name } : { name: "" });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.name) return;
    const method = editing ? "PUT" : "POST";
    const url = editing 
      ? `${API_BASE}/api/admin/locations/${editing.id}` 
      : `${API_BASE}/api/admin/locations`;

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    setOpen(false);
    loadLocations();
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this facility?")) return;
    await fetch(`${API_BASE}/api/admin/locations/${id}`, { method: "DELETE" });
    loadLocations();
  };

  return (
    <Box sx={containerStyle}>
      {/* HEADER SECTION */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight={900} letterSpacing="-1px">Facility Management</Typography>
          <Typography variant="body2" color="text.secondary">Manage courts, fields, and training centers</Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={() => handleOpen()} 
          sx={addBtnStyle}
        >
          New Location
        </Button>
      </Stack>

      {/* LOCATIONS GRID */}
      <Box sx={gridStyle}>
        {locations.map((l, index) => (
          <Fade in timeout={400 + index * 100} key={l.id}>
            <Card sx={locationCardStyle}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                  <Avatar sx={avatarStyle}>
                    <LocationOnIcon />
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" fontWeight={800} color="#1e293b">{l.name}</Typography>
                    <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 700, letterSpacing: 1 }}>
                      ACTIVE FACILITY
                    </Typography>
                  </Box>
                </Stack>

                <Divider sx={{ my: 2, opacity: 0.5 }} />

                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <IconButton onClick={() => handleOpen(l)} sx={editBtnStyle}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(l.id)} sx={deleteBtnStyle}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </CardContent>
            </Card>
          </Fade>
        ))}
      </Box>

      {/* MODAL */}
      <Dialog 
        open={open} 
        onClose={() => setOpen(false)} 
        PaperProps={{ sx: { borderRadius: 5, width: '100%', maxWidth: 400 } }}
      >
        <DialogTitle sx={{ fontWeight: 900, pb: 1 }}>
          {editing ? "Update Location" : "Add New Location"}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Enter the name of the court or training center.
          </Typography>
          <TextField
            fullWidth
            placeholder="e.g. Center Court 01"
            value={form.name}
            onChange={(e) => setForm({ name: e.target.value })}
            sx={modalInputStyle}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setOpen(false)} sx={{ fontWeight: 700, color: '#64748b' }}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} sx={saveBtnStyle}>
            Save Facility
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// --- STYLES ---

const containerStyle = { p: { xs: 2, md: 5 }, background: "#f8fafc", minHeight: "100vh" };

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr' },
  gap: 3
};

const locationCardStyle = {
  borderRadius: 5, border: '1px solid #e2e8f0', boxShadow: 'none', transition: '0.3s',
  '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 15px 30px -10px rgba(0,0,0,0.08)', borderColor: '#3b82f6' }
};

const avatarStyle = { 
  bgcolor: '#eff6ff', color: '#3b82f6', width: 48, height: 48, borderRadius: 3,
  boxShadow: '0 4px 10px rgba(59, 130, 246, 0.1)'
};

const addBtnStyle = {
  borderRadius: 3, px: 3, py: 1.2, fontWeight: 800, textTransform: 'none',
  background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
  boxShadow: '0 10px 20px -5px rgba(37, 99, 235, 0.4)',
  "&:hover": { background: 'linear-gradient(135deg, #1d4ed8, #4338ca)' }
};

const editBtnStyle = { 
  bgcolor: '#f1f5f9', color: '#475569', borderRadius: 2, 
  '&:hover': { bgcolor: '#e2e8f0' } 
};

const deleteBtnStyle = { 
  bgcolor: '#fff1f2', color: '#e11d48', borderRadius: 2, 
  '&:hover': { bgcolor: '#fb7185', color: 'white' } 
};

const modalInputStyle = {
  "& .MuiOutlinedInput-root": { borderRadius: 3, bgcolor: '#f8fafc', fontWeight: 600 }
};

const saveBtnStyle = {
  borderRadius: 3, px: 3, fontWeight: 800, textTransform: 'none', bgcolor: '#2563eb'
};

export default AdminLocations;