import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Grid,
  Paper,
  Divider,
  TextField,
  Button,
  Chip,
  IconButton
} from "@mui/material";

import SportsTennisIcon from "@mui/icons-material/SportsTennis";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

import API_BASE from "./api";

export default function AdminPrograms() {
  const [programs, setPrograms] = useState<any[]>([]);
  const [newSubCat, setNewSubCat] = useState<{ [key: number]: string }>({});
  const [pricingInputs, setPricingInputs] = useState<any>({});

  useEffect(() => {
    loadAllData();
  }, []);

  // =========================
  // LOAD PROGRAMS
  // =========================
  const loadAllData = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/programs`);
      const data = await res.json();

      setPrograms(data);

      // Load subcategories for each program
      data.forEach((p: any) => fetchSubCategories(p.id));

    } catch (err) {
      console.error("LOAD PROGRAMS ERROR:", err);
    }
  };

  // =========================
  // LOAD SUBCATEGORIES
  // =========================
  const fetchSubCategories = async (programId: number) => {
    try {
      const res = await fetch(
        `${API_BASE}/api/programs/${programId}/subcategories`
      );

      const subcats = await res.json();

      setPrograms((prev) =>
        prev.map((p) =>
          p.id === programId
            ? { ...p, subcategories: subcats }
            : p
        )
      );

      // Load pricing for each subcategory
      subcats.forEach((sc: any) => fetchPricing(sc.id));

    } catch (err) {
      console.error("SUBCATEGORY ERROR:", err);
    }
  };

  // =========================
  // LOAD PRICING
  // =========================
  const fetchPricing = async (subCatId: number) => {
    try {
      const res = await fetch(
        `${API_BASE}/api/subcategories/${subCatId}/pricing`
      );

      const data = await res.json();

      const formatted: any = {};

      [8, 12].forEach((sessionCount) => {
        const match = data.find(
          (d: any) => d.sessions_per_month === sessionCount
        );

        formatted[sessionCount] = {
          price_weekly: match?.price_weekly || "",
          price_monthly: match?.price_monthly || "",
          price_yearly: match?.price_yearly || ""
        };
      });

      setPricingInputs((prev: any) => ({
        ...prev,
        [subCatId]: formatted
      }));

    } catch (err) {
      console.error("PRICING ERROR:", err);
    }
  };

  // =========================
  // ADD SUBCATEGORY
  // =========================
  const handleAddSubCat = async (programId: number) => {
    const name = newSubCat[programId];

    if (!name) {
      return alert("Enter subcategory name");
    }

    try {
      await fetch(`${API_BASE}/api/admin/subcategories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          program_id: programId,
          name
        })
      });

      setNewSubCat({
        ...newSubCat,
        [programId]: ""
      });

      fetchSubCategories(programId);

    } catch (err) {
      console.error("ADD SUBCATEGORY ERROR:", err);
    }
  };

  // =========================
  // SAVE PRICING
  // =========================
  const handleUpdatePricing = async (
    subCatId: number,
    sessions: number
  ) => {
    try {
      const prices = pricingInputs[subCatId]?.[sessions];

      await fetch(`${API_BASE}/api/admin/subcategory-pricing`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          subcategory_id: subCatId,
          sessions_per_month: sessions,
          ...prices
        })
      });

      alert("Pricing Saved ✅");

    } catch (err) {
      console.error("SAVE PRICING ERROR:", err);
    }
  };

  return (
    <Box sx={{ p: 4, maxWidth: 1400, margin: "0 auto" }}>
      
      {/* HEADER */}
      <Card
        sx={{
          mb: 4,
          borderRadius: 4,
          background: "linear-gradient(135deg,#800000,#2a0000)",
          color: "white"
        }}
      >
        <CardContent
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2
          }}
        >
          <SportsTennisIcon sx={{ fontSize: 50 }} />

          <Box>
            <Typography variant="h4" fontWeight={900}>
              PROGRAM & PRICING CONSOLE
            </Typography>

            <Typography
              variant="body2"
              sx={{ opacity: 0.7 }}
            >
              Manage Ball Stages and Elite Training tiers
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* PROGRAMS */}
      <Stack spacing={4}>
        {programs.map((p) => (
          <Card
            key={p.id}
            sx={{
              borderRadius: 4,
              boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
              border: "1px solid #eee"
            }}
          >
            <CardContent>

              {/* TOP */}
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mb={3}
              >
                <Box>
                  <Typography
                    variant="h5"
                    fontWeight={800}
                    color="primary"
                  >
                    {p.title}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    {p.description}
                  </Typography>
                </Box>

                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteOutlineIcon />}
                >
                  Delete Program
                </Button>
              </Stack>

              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={3}>

                {/* LEFT */}
                <Grid item xs={12} lg={4}>
                  <Typography
                    variant="subtitle2"
                    fontWeight={900}
                    mb={2}
                    sx={{ letterSpacing: 1 }}
                  >
                    LEVELS / SUB-CATEGORIES
                  </Typography>

                  <Stack spacing={1} mb={2}>
                    {p.subcategories?.map((sc: any) => (
                      <Paper
                        key={sc.id}
                        variant="outlined"
                        sx={{
                          p: 1.5,
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          bgcolor: "#fcfcfc"
                        }}
                      >
                        <Box>
                          <Typography
                            fontWeight={700}
                            fontSize={14}
                          >
                            {sc.name}
                          </Typography>

                          <Typography
                            variant="caption"
                            color="gray"
                          >
                            {sc.min_age}-{sc.max_age} yrs
                          </Typography>
                        </Box>

                        <Chip
                          label={`ID: sc-${sc.id}`}
                          size="small"
                          variant="outlined"
                        />
                      </Paper>
                    ))}
                  </Stack>

                  {/* ADD SUBCATEGORY */}
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Add Level"
                      value={newSubCat[p.id] || ""}
                      onChange={(e) =>
                        setNewSubCat({
                          ...newSubCat,
                          [p.id]: e.target.value
                        })
                      }
                    />

                    <IconButton
                      color="primary"
                      onClick={() => handleAddSubCat(p.id)}
                    >
                      <AddCircleIcon fontSize="large" />
                    </IconButton>
                  </Box>
                </Grid>

                {/* RIGHT */}
                <Grid item xs={12} lg={8}>
                  <Typography
                    variant="subtitle2"
                    fontWeight={900}
                    mb={2}
                    sx={{ letterSpacing: 1 }}
                  >
                    PRICING MANAGEMENT
                  </Typography>

                  <Grid container spacing={2}>
                    {p.subcategories?.map((sc: any) => (
                      <Grid item xs={12} key={sc.id}>
                        <Paper
                          sx={{
                            p: 2,
                            bgcolor: "#f8f9fa",
                            borderRadius: 3
                          }}
                        >
                          <Typography
                            variant="body2"
                            fontWeight={800}
                            color="primary"
                            mb={2}
                          >
                            SET PRICING FOR: {sc.name.toUpperCase()}
                          </Typography>

                          <Grid container spacing={3}>
                            {[8, 12].map((sessions) => (
                              <Grid
                                item
                                xs={12}
                                md={6}
                                key={sessions}
                              >
                                <Box
                                  sx={{
                                    p: 2,
                                    bgcolor: "white",
                                    borderRadius: 2,
                                    border: "1px solid #ddd"
                                  }}
                                >
                                  <Typography
                                    variant="caption"
                                    fontWeight={900}
                                  >
                                    {sessions} SESSIONS / MONTH
                                  </Typography>

                                  <Stack spacing={1.5} mt={1.5}>
                                    <TextField
                                      label="Weekly Price"
                                      size="small"
                                      fullWidth
                                      value={
                                        pricingInputs[sc.id]?.[
                                          sessions
                                        ]?.price_weekly || ""
                                      }
                                      onChange={(e) => {
                                        const val = e.target.value;

                                        setPricingInputs((prev: any) => ({
                                          ...prev,
                                          [sc.id]: {
                                            ...prev[sc.id],
                                            [sessions]: {
                                              ...prev[sc.id]?.[
                                                sessions
                                              ],
                                              price_weekly: val
                                            }
                                          }
                                        }));
                                      }}
                                    />

                                    <TextField
                                      label="Monthly Price"
                                      size="small"
                                      fullWidth
                                      value={
                                        pricingInputs[sc.id]?.[
                                          sessions
                                        ]?.price_monthly || ""
                                      }
                                      onChange={(e) => {
                                        const val = e.target.value;

                                        setPricingInputs((prev: any) => ({
                                          ...prev,
                                          [sc.id]: {
                                            ...prev[sc.id],
                                            [sessions]: {
                                              ...prev[sc.id]?.[
                                                sessions
                                              ],
                                              price_monthly: val
                                            }
                                          }
                                        }));
                                      }}
                                    />

                                    <Button
                                      variant="contained"
                                      size="small"
                                      fullWidth
                                      onClick={() =>
                                        handleUpdatePricing(
                                          sc.id,
                                          sessions
                                        )
                                      }
                                    >
                                      Save {sessions} Sessions
                                    </Button>
                                  </Stack>
                                </Box>
                              </Grid>
                            ))}
                          </Grid>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </Grid>

              </Grid>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
}