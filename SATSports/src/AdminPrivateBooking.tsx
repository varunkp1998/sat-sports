import React, { useEffect, useState } from "react";
import {
  Box, Typography, Card, CardContent, Button, Stack,
  Select, MenuItem, Grid, Avatar, Divider,
  Snackbar, Alert, Chip
} from "@mui/material";
import API_BASE from "./api";
import dayjs from "dayjs";

export default function AdminPrivateBookings() {
  const [rows, setRows] = useState<any[]>([]);
  const [coaches, setCoaches] = useState<any[]>([]);
  const [selectedCoach, setSelectedCoach] = useState<any>({});
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

  const loadData = async () => {
    const [bRes, cRes] = await Promise.all([
      fetch(`${API_BASE}/api/admin/private-bookings`),
      fetch(`${API_BASE}/api/admin/coaches`)
    ]);

    const bookings = await bRes.json();
    const coachList = await cRes.json();

    setRows(bookings);
    setCoaches(coachList);
  };

  useEffect(() => { loadData(); }, []);

  const toastMsg = (msg: string, type: any) =>
    setToast({ open: true, message: msg, severity: type });

  const approve = async (id: number) => {
    const coach_id = selectedCoach[id];
    if (!coach_id) return toastMsg("Assign coach first", "error");

    const res = await fetch(`${API_BASE}/api/admin/private-bookings/${id}/approve`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ coach_id })
    });

    if (res.ok) {
      toastMsg("Approved ✅", "success");
      loadData();
    } else {
      toastMsg("Approval failed", "error");
    }
  };

  const reject = async (id: number) => {
    const res = await fetch(`${API_BASE}/api/admin/private-bookings/${id}/reject`, {
      method: "PUT"
    });

    if (res.ok) {
      toastMsg("Rejected ❌", "error");
      loadData();
    }
  };

  const formatTime = (t: string) =>
    dayjs(`2000-01-01 ${t}`).format("hh:mm A");

  return (
    <Box sx={{ p: 4, bgcolor: "#f1f5f9", minHeight: "100vh" }}>

      <Typography variant="h4" fontWeight={900} mb={4}>
        Private Booking Manager
      </Typography>

      <Grid container spacing={3}>
        {rows.map((r) => (
          <Grid item xs={12} md={6} lg={4} key={r.id}>
            <Card sx={{ borderRadius: 4 }}>
              <CardContent>

                {/* USER */}
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar>{r.name[0]}</Avatar>
                  <Box>
                    <Typography fontWeight={800}>{r.name}</Typography>
                    <Typography variant="caption">{r.phone}</Typography>
                  </Box>
                </Stack>

                <Divider sx={{ my: 2 }} />

                {/* DETAILS */}
                <Typography>
                  📍 {r.location_name}
                </Typography>

                <Typography>
                  📅 {dayjs(r.booking_date).format("MMM DD")}
                </Typography>

                <Typography>
                  ⏰ {formatTime(r.start_time)} - {formatTime(r.end_time)}
                </Typography>

                {/* 💳 PAYMENT STATUS */}
                <Box mt={2}>
                  <Chip
                    label={r.payment_status === "paid" ? "PAID" : "PENDING"}
                    color={r.payment_status === "paid" ? "success" : "warning"}
                  />
                </Box>

                {/* 💰 PRICE */}
                {r.amount && (
                  <Typography mt={1} fontWeight={700}>
                    ₹ {r.amount}
                  </Typography>
                )}

                {/* 🔐 PAYMENT ID */}
                {r.razorpay_payment_id && (
                  <Typography variant="caption" color="gray">
                    Payment ID: {r.razorpay_payment_id}
                  </Typography>
                )}

                {/* ACTIONS */}
                {r.status === "pending" && (
                  <Box mt={2}>

                    <Select
                      fullWidth
                      value={selectedCoach[r.id] || ""}
                      onChange={(e) =>
                        setSelectedCoach({
                          ...selectedCoach,
                          [r.id]: e.target.value
                        })
                      }
                    >
                      <MenuItem value="">Select Coach</MenuItem>
                      {coaches.map((c) => (
                        <MenuItem key={c.id} value={c.id}>
                          {c.name}
                        </MenuItem>
                      ))}
                    </Select>

                    <Stack direction="row" spacing={1} mt={2}>

                      {/* 🚫 BLOCK IF NOT PAID */}
                      <Button
                        fullWidth
                        variant="contained"
                        disabled={r.payment_status !== "paid"}
                        onClick={() => approve(r.id)}
                      >
                        Approve
                      </Button>

                      <Button
                        color="error"
                        onClick={() => reject(r.id)}
                      >
                        Reject
                      </Button>

                    </Stack>

                    {r.payment_status !== "paid" && (
                      <Typography variant="caption" color="red">
                        Cannot approve unpaid booking
                      </Typography>
                    )}
                  </Box>
                )}

                {r.status === "approved" && (
                  <Chip label="APPROVED" color="success" sx={{ mt: 2 }} />
                )}

                {r.status === "rejected" && (
                  <Chip label="REJECTED" color="error" sx={{ mt: 2 }} />
                )}

              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast({ ...toast, open: false })}
      >
        <Alert severity={toast.severity as any}>
          {toast.message}
        </Alert>
      </Snackbar>

    </Box>
  );
}