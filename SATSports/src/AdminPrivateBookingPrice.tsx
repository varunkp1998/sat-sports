import React, { useEffect, useState } from "react";
import {
  Box, Typography, TextField, Button, MenuItem, Stack, Card, CardContent
} from "@mui/material";
import API_BASE from "./api";

export default function AdminPrivateBookingPrice() {
  const [locations, setLocations] = useState<any[]>([]);
  const [locationId, setLocationId] = useState("");
  const [price, setPrice] = useState("");

  useEffect(() => {
    fetch(`${API_BASE}/api/admin/locations`)
      .then(res => res.json())
      .then(setLocations);
  }, []);

  const savePrice = async () => {
    if (!locationId || !price) return alert("Fill all fields");

    const res = await fetch(`${API_BASE}/api/admin/private-booking-price`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        location_id: locationId,
        price: Number(price)
      })
    });

    if (res.ok) {
      alert("✅ Price updated");
    } else {
      alert("Error saving price");
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" fontWeight={800} mb={3}>
        Set Private Booking Price
      </Typography>

      <Card sx={{ maxWidth: 400 }}>
        <CardContent>
          <Stack spacing={2}>

            {/* LOCATION */}
            <TextField
              select
              label="Select Location"
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
              fullWidth
            >
              {locations.map((loc) => (
                <MenuItem key={loc.id} value={loc.id}>
                  {loc.name}
                </MenuItem>
              ))}
            </TextField>

            {/* PRICE */}
            <TextField
              label="Price (₹)"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              fullWidth
            />

            {/* SAVE */}
            <Button variant="contained" onClick={savePrice}>
              Save Price
            </Button>

          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}