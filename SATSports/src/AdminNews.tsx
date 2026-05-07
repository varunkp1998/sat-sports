import React, { useEffect, useState, useCallback, useMemo } from "react";
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
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" as "success" | "error" });

  const [form, setForm] = useState({ title: "", body: "", category: "News", isPublished: true });

  const loadNews = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/news`);
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setToast({ open: true, message: "Sync error", severity: "error" });
    }
  }, []);

  useEffect(() => { loadNews(); }, [loadNews]);

  const saveItem = async () => {
    if (!form.title || !form.body) return;
    setLoading(true);

    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `${API_BASE}/api/news/${editingId}` : `${API_BASE}/api/news`;

    // 🚀 OPTIMISTIC UPDATE
    const tempItem = { ...form, id: editingId || Date.now(), created_at: new Date().toISOString() };
    if (!editingId) setItems(prev => [tempItem, ...prev]);

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setToast({ open: true, message: editingId ? "Updated" : "Published", severity: "success" });
        setEditingId(null);
        setForm({ title: "", body: "", category: "News", isPublished: true });
        loadNews();
      }
    } catch {
      loadNews(); // Revert on fail
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (id: number) => {
    if (!window.confirm("Delete post?")) return;
    setItems(prev => prev.filter(i => i.id !== id));
    await fetch(`${API_BASE}/api/news/${id}`, { method: "DELETE" });
  };

  const filteredItems = useMemo(() => {
    const s = search.toLowerCase();
    return items.filter(i => i.title.toLowerCase().includes(s) || i.category.toLowerCase().includes(s));
  }, [items, search]);

  return (
    <Box sx={rootStyle}>
      <Box mb={4}>
        <Typography variant="h4" fontWeight={950} sx={{ letterSpacing: -1.5 }}>NEWS & <span style={{color: '#4f46e5'}}>ALERTS</span></Typography>
        <Typography variant="body2" sx={{ opacity: 0.6 }}>Broadcast updates and events to the academy</Typography>
      </Box>

      {/* COMPOSER */}
      <Card sx={composerCard}>
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Headline" value={form.title} onChange={e => setForm({...form, title: e.target.value})} sx={inputField} />
            </Grid>
            <Grid item xs={12} md={5}>
              <TextField fullWidth label="Content" value={form.body} onChange={e => setForm({...form, body: e.target.value})} sx={inputField} />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth sx={inputField}>
                <InputLabel>Category</InputLabel>
                <Select label="Category" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                  <MenuItem value="News">Academy News</MenuItem>
                  <MenuItem value="Event">Special Event</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          
          <Stack direction="row" justifyContent="space-between" alignItems="center" mt={3}>
            <FormControlLabel 
              control={<Switch size="small" checked={form.isPublished} onChange={e => setForm({...form, isPublished: e.target.checked})} />} 
              label={<Typography variant="caption" fontWeight={900}>PUBLIC VISIBILITY</Typography>} 
            />
            <Stack direction="row" spacing={1}>
              {editingId && <Button size="small" onClick={() => { setEditingId(null); setForm({title:"", body:"", category:"News", isPublished:true}); }}>Cancel</Button>}
              <Button variant="contained" disableElevation onClick={saveItem} sx={postBtn}>
                {editingId ? "Update" : "Broadcast"}
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Paper sx={searchBar}>
        <SearchIcon sx={{ fontSize: 18, mr: 1, opacity: 0.5 }} />
        <TextField fullWidth placeholder="Search headlines..." variant="standard" InputProps={{ disableUnderline: true }} onChange={e => setSearch(e.target.value)} sx={{ '& input': { fontWeight: 700, fontSize: '0.9rem' } }} />
      </Paper>

      <Grid container spacing={2}>
        {filteredItems.map((n) => {
          const d = new Date(n.created_at);
          return (
            <Grid item xs={12} md={6} key={n.id}>
              <Fade in>
                <Card sx={newsCard}>
                  <Stack direction="row" spacing={2} p={2}>
                    <Box sx={dateStyle}>
                      <Typography variant="h6" fontWeight={900} lineHeight={1.1}>{d.getDate()}</Typography>
                      <Typography variant="caption" fontWeight={900}>{d.toLocaleString('default', { month: 'short' }).toUpperCase()}</Typography>
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Stack direction="row" spacing={1} mb={0.5} alignItems="center">
                        <Chip label={n.category} size="small" sx={tagStyle(n.category)} />
                        {!n.isPublished && <Typography variant="caption" fontWeight={900} color="error">DRAFT</Typography>}
                      </Stack>
                      <Typography variant="subtitle2" fontWeight={900} noWrap>{n.title}</Typography>
                      <Typography variant="caption" sx={truncateBody}>{n.body}</Typography>
                      <Stack direction="row" spacing={2} mt={1.5}>
                        <Typography variant="caption" sx={actionText} onClick={() => { setEditingId(n.id); setForm({title:n.title, body:n.body, category:n.category, isPublished:n.isPublished}); window.scrollTo(0,0); }}>Edit</Typography>
                        <Typography variant="caption" sx={{ ...actionText, color: '#ef4444' }} onClick={() => deleteItem(n.id)}>Delete</Typography>
                      </Stack>
                    </Box>
                  </Stack>
                </Card>
              </Fade>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}

// --- STATIC PERFORMANCE STYLES ---
const rootStyle = { p: { xs: 2, md: 5 }, bgcolor: "#f8fafc", minHeight: "100vh" };
const composerCard = { borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: 'none', mb: 4 };
const inputField = { "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: '#f8fafc', fontWeight: 700, fontSize: '0.85rem' } };
const postBtn = { borderRadius: 2, fontWeight: 900, textTransform: 'none', px: 4, bgcolor: '#4f46e5' };
const searchBar = { px: 2, py: 1, display: 'flex', alignItems: 'center', borderRadius: 2, border: '1px solid #e2e8f0', boxShadow: 'none', mb: 3 };
const newsCard = { borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: 'none', '&:hover': { bgcolor: '#fff', borderColor: '#4f46e5' } };
const dateStyle = { width: 50, height: 50, bgcolor: '#4f46e5', color: 'white', borderRadius: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' };
const truncateBody = { opacity: 0.6, fontWeight: 500, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' };
const actionText = { fontWeight: 900, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } };

const tagStyle = (cat: string) => ({
  height: 18, fontSize: '0.6rem', fontWeight: 900,
  bgcolor: cat === 'Event' ? '#fef3c7' : '#eff6ff',
  color: cat === 'Event' ? '#92400e' : '#1d4ed8'
});