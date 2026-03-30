import React, { useState, useEffect } from "react";
import {
  Box, Typography, Card, CardContent, Button, Stack, TextField, 
  Grid, Chip, IconButton, MenuItem, Select, FormControl, InputLabel, 
  Switch, FormControlLabel, Fade, Paper, Snackbar, Alert, Divider
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CampaignIcon from "@mui/icons-material/Campaign";
import EventIcon from "@mui/icons-material/Event";
import SearchIcon from "@mui/icons-material/Search";
import API_BASE from "./api";

export default function AdminNews() {
  const [items, setItems] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" as "success" | "error" });

  // Form State
  const [form, setForm] = useState({
    title: "",
    body: "",
    category: "News",
    isPublished: true
  });

  const loadNews = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/news`);
      const data = await res.json();
      setItems(data);
    } catch (err) { handleToast("Failed to load news", "error"); }
  };

  useEffect(() => { loadNews(); }, []);

  const handleToast = (message: string, severity: "success" | "error") => {
    setToast({ open: true, message, severity });
  };

  const saveItem = async () => {
    if (!form.title || !form.body) return handleToast("Title and Content required", "error");

    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `${API_BASE}/api/news/${editingId}` : `${API_BASE}/api/news`;

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      handleToast(editingId ? "Update successful" : "Post created", "success");
      resetForm();
      loadNews();
    }
  };

  const editItem = (item: any) => {
    setEditingId(item.id);
    setForm({
      title: item.title,
      body: item.body,
      category: item.category,
      isPublished: item.isPublished
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteItem = async (id: number) => {
    if (!window.confirm("Delete this post?")) return;
    const res = await fetch(`${API_BASE}/api/news/${id}`, { method: "DELETE" });
    if (res.ok) {
      handleToast("Item deleted", "success");
      loadNews();
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({ title: "", body: "", category: "News", isPublished: true });
  };

  const filteredItems = items.filter(i => 
    i.title.toLowerCase().includes(search.toLowerCase()) || 
    i.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box sx={containerStyle}>
      {/* HEADER */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={6}>
        <Box>
          <Typography variant="h4" fontWeight={900} letterSpacing="-1.5px" color="#1e293b">News & Events</Typography>
          <Typography variant="body2" color="text.secondary">Broadcast updates to all academy members</Typography>
        </Box>
      </Stack>

      {/* COMPOSER FORM */}
      <Card sx={glassCardStyle}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" fontWeight={800} mb={3} color="#1e293b">
            {editingId ? "Edit Publication" : "Create New Announcement"}
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <TextField 
                fullWidth label="Title" variant="outlined" sx={inputStyle}
                value={form.title} onChange={e => setForm({...form, title: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField 
                fullWidth label="Content / Description" variant="outlined" sx={inputStyle}
                value={form.body} onChange={e => setForm({...form, body: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth sx={inputStyle}>
                <InputLabel>Type</InputLabel>
                <Select label="Type" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                  <MenuItem value="News">News</MenuItem>
                  <MenuItem value="Event">Event</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Stack direction="row" justifyContent="space-between" alignItems="center" mt={3}>
            <FormControlLabel
              control={<Switch checked={form.isPublished} onChange={e => setForm({...form, isPublished: e.target.checked})} />}
              label={<Typography variant="body2" fontWeight={700}>Publish immediately</Typography>}
            />
            <Stack direction="row" spacing={1}>
              {editingId && <Button onClick={resetForm} color="inherit" sx={{ fontWeight: 800 }}>Cancel</Button>}
              <Button variant="contained" onClick={saveItem} sx={primaryBtnStyle}>
                {editingId ? "Update Post" : "Post Announcement"}
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* FILTER SEARCH */}
      <Paper sx={searchPaperStyle}>
        <SearchIcon sx={{ color: 'text.secondary', mr: 1.5 }} />
        <TextField
          fullWidth placeholder="Filter by title or type..." variant="standard"
          value={search} onChange={(e) => setSearch(e.target.value)}
          InputProps={{ disableUnderline: true, sx: { fontWeight: 600 } }}
        />
      </Paper>

      {/* LISTING */}
      <Grid container spacing={3}>
        {filteredItems.map((n) => {
          const date = new Date(n.created_at || Date.now());
          const day = date.getDate();
          const month = date.toLocaleString("default", { month: "short" }).toUpperCase();

          return (
            <Grid item xs={12} md={6} key={n.id}>
              <Fade in timeout={500}>
                <Card sx={newsCardStyle}>
                  <CardContent sx={{ display: "flex", gap: 3, p: 3 }}>
                    
                    {/* DATE BOX */}
                    <Box sx={dateBoxStyle}>
                      <Typography variant="h5" fontWeight={900} lineHeight={1}>{day}</Typography>
                      <Typography variant="caption" fontWeight={800}>{month}</Typography>
                    </Box>

                    {/* CONTENT */}
                    <Box flex={1}>
                      <Stack direction="row" spacing={1} mb={0.5}>
                        <Chip 
                          label={n.category} 
                          size="small" 
                          icon={n.category === 'Event' ? <EventIcon style={{ fontSize: 14 }}/> : <CampaignIcon style={{ fontSize: 14 }}/>}
                          sx={categoryChipStyle(n.category)}
                        />
                        {!n.isPublished && <Chip label="Draft" size="small" variant="outlined" sx={{ fontWeight: 800, fontSize: '0.6rem' }} />}
                      </Stack>
                      
                      <Typography variant="subtitle1" fontWeight={800} color="#1e293b" mb={0.5}>{n.title}</Typography>
                      <Typography variant="body2" color="text.secondary" mb={2} sx={bodyTruncateStyle}>{n.body}</Typography>

                      <Divider sx={{ my: 1.5, borderStyle: 'dashed' }} />

                      <Stack direction="row" spacing={1}>
                        <Button size="small" startIcon={<EditIcon />} onClick={() => editItem(n)} sx={actionBtnStyle}>Edit</Button>
                        <Button size="small" startIcon={<DeleteIcon />} color="error" onClick={() => deleteItem(n.id)} sx={actionBtnStyle}>Delete</Button>
                      </Stack>
                    </Box>

                  </CardContent>
                </Card>
              </Fade>
            </Grid>
          );
        })}
      </Grid>

      <Snackbar open={toast.open} autoHideDuration={3000} onClose={() => setToast({ ...toast, open: false })}>
        <Alert severity={toast.severity} variant="filled" sx={{ borderRadius: 2 }}>{toast.message}</Alert>
      </Snackbar>
    </Box>
  );
}

// --- STYLING ---
const containerStyle = { p: { xs: 2, md: 8 }, background: "#f8fafc", minHeight: "100vh" };
const glassCardStyle = { borderRadius: 6, border: '1px solid #e2e8f0', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.04)', bgcolor: 'white', mb: 6 };
const searchPaperStyle = { p: "12px 24px", display: 'flex', alignItems: 'center', borderRadius: 4, border: '1px solid #e2e8f0', boxShadow: 'none', mb: 4, bgcolor: 'white' };
const inputStyle = { "& .MuiOutlinedInput-root": { borderRadius: 3, bgcolor: '#fcfcfd' } };
const primaryBtnStyle = { px: 4, py: 1.2, borderRadius: 3, fontWeight: 900, textTransform: 'none', background: 'linear-gradient(135deg, #2563eb, #4f46e5)', color: 'white', boxShadow: '0 10px 20px -5px rgba(37, 99, 235, 0.4)' };
const newsCardStyle = { borderRadius: 5, border: '1px solid #e2e8f0', bgcolor: 'white', transition: '0.2s', '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 12px 25px -10px rgba(0,0,0,0.08)' }};
const dateBoxStyle = { minWidth: 65, height: 65, background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: 'white', borderRadius: 3, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxShadow: '0 5px 15px -5px rgba(79, 70, 229, 0.4)' };
const bodyTruncateStyle = { display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' };
const actionBtnStyle = { fontWeight: 800, textTransform: 'none', borderRadius: 2 };

const categoryChipStyle = (cat: string) => ({
  bgcolor: cat === 'Event' ? '#fef3c7' : '#eff6ff',
  color: cat === 'Event' ? '#92400e' : '#1d4ed8',
  fontWeight: 900, fontSize: '0.65rem', border: 'none'
});