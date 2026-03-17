import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from "@mui/material";
import API_BASE from "./api";

function AdminLocations() {
  const [locations, setLocations] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);

  const [form, setForm] = useState({
    name: ""
  });

  const loadLocations = () => {
    fetch(`${API_BASE}/api/admin/locations`)
      .then(res => res.json())
      .then(setLocations);
  };

  useEffect(() => {
    loadLocations();
  }, []);

  // ✅ OPEN ADD
  const handleAdd = () => {
    setEditing(null);
    setForm({ name: "" });
    setOpen(true);
  };

  // ✅ OPEN EDIT
  const handleEdit = (loc: any) => {
    setEditing(loc);
    setForm({ name: loc.name });
    setOpen(true);
  };

  // ✅ SAVE (CREATE / UPDATE)
  const handleSave = async () => {
    if (!form.name) return alert("Name required");

    if (editing) {
      // UPDATE
      await fetch(`${API_BASE}/api/admin/locations/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
    } else {
      // CREATE
      await fetch(`${API_BASE}/api/admin/locations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
    }

    setOpen(false);
    loadLocations();
  };

  // ✅ DELETE
  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this location?")) return;

    await fetch(`${API_BASE}/api/admin/locations/${id}`, {
      method: "DELETE"
    });

    loadLocations();
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* HEADER */}
      <Typography variant="h5" mb={2} fontWeight={700}>
        📍 Locations Management
      </Typography>

      <Button variant="contained" onClick={handleAdd} sx={{ mb: 2 }}>
        Add Location
      </Button>

      {/* LIST */}
      <Stack spacing={2}>
        {locations.map(l => (
          <Card key={l.id}>
            <CardContent>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography fontWeight={600}>{l.name}</Typography>

                <Stack direction="row" spacing={1}>
                  <Button
                    variant="outlined"
                    onClick={() => handleEdit(l)}
                  >
                    Edit
                  </Button>

                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => handleDelete(l.id)}
                  >
                    Delete
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>

      {/* MODAL */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>
          {editing ? "Edit Location" : "Add Location"}
        </DialogTitle>

        <DialogContent>
          <TextField
            fullWidth
            label="Location Name"
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
            sx={{ mt: 2 }}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AdminLocations;