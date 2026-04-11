import React, { useEffect, useState, useCallback } from "react";
import {
  Box, Card, CardContent, Typography, Button,
  Grid, Stack, TextField, Chip, Divider, Paper, IconButton
} from "@mui/material";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SportsTennisIcon from "@mui/icons-material/SportsTennis";
import API_BASE from "./api";

function AdminPrograms() {
  const [programs, setPrograms] = useState<any[]>([]);
  const [newSubCat, setNewSubCat] = useState<{ [key: number]: string }>({});
  const [pricingInputs, setPricingInputs] = useState<any>({});

  // 🚀 OPTIMIZED DATA LOADING (parallel + batched)
  useEffect(() => {
    let mounted = true;

    const loadAllData = async () => {
      try {
        const programsRes = await fetch(`${API_BASE}/api/admin/programs`);
        const programsData = await programsRes.json();

        const programsFull = await Promise.all(
          programsData.map(async (p: any) => {
            const subRes = await fetch(`${API_BASE}/api/programs/${p.id}/subcategories`);
            const subcats = await subRes.json();

            const subcatsWithPricing = await Promise.all(
              subcats.map(async (sc: any) => {
                const priceRes = await fetch(`${API_BASE}/api/subcategories/${sc.id}/pricing`);
                const pricing = await priceRes.json();

                const formatted: any = {};
                [8, 12].forEach(s => {
                  const match = pricing.find((d: any) => d.sessions_per_month === s);
                  formatted[s] = {
                    price_weekly: match?.price_weekly || "",
                    price_monthly: match?.price_monthly || "",
                    price_yearly: match?.price_yearly || ""
                  };
                });

                return { ...sc, pricing: formatted };
              })
            );

            return { ...p, subcategories: subcatsWithPricing };
          })
        );

        if (!mounted) return;

        setPrograms(programsFull);

        // preload pricingInputs (IMPORTANT for speed)
        const pricingMap: any = {};
        programsFull.forEach((p: any) => {
          p.subcategories.forEach((sc: any) => {
            pricingMap[sc.id] = sc.pricing;
          });
        });

        setPricingInputs(pricingMap);

      } catch (err) {
        console.error("Failed loading programs", err);
      }
    };

    loadAllData();
    return () => { mounted = false };
  }, []);

  // ⚡ optimized update function (no lag typing)
  const updatePrice = useCallback((id: number, sessions: number, key: string, value: string) => {
    setPricingInputs(prev => {
      const copy = { ...prev };
      copy[id] = { ...copy[id] };
      copy[id][sessions] = { ...copy[id][sessions], [key]: value };
      return copy;
    });
  }, []);

  // --- ACTIONS ---

  const handleAddSubCat = useCallback(async (programId: number) => {
    const name = newSubCat[programId];
    if (!name) return;

    await fetch(`${API_BASE}/api/admin/subcategories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ program_id: programId, name })
    });

    setNewSubCat(prev => ({ ...prev, [programId]: "" }));

    // reload only this program (faster)
    const subRes = await fetch(`${API_BASE}/api/programs/${programId}/subcategories`);
    const subcats = await subRes.json();

    setPrograms(prev =>
      prev.map(p => p.id === programId ? { ...p, subcategories: subcats } : p)
    );
  }, [newSubCat]);

  const handleUpdatePricing = useCallback(async (subCatId: number, sessions: number) => {
    const prices = pricingInputs[subCatId]?.[sessions];

    await fetch(`${API_BASE}/api/admin/subcategory-pricing`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subcategory_id: subCatId,
        sessions_per_month: sessions,
        ...prices
      })
    });

    console.log("Pricing saved"); // ⚡ no blocking alert
  }, [pricingInputs]);

  return (
    <Box sx={{ p: 4, maxWidth: 1400, margin: "0 auto" }}>
      
      {/* HEADER */}
      <Card sx={{ mb: 4, borderRadius: 4, background: "linear-gradient(135deg,#800000,#2a0000)", color: "white" }}>
        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <SportsTennisIcon sx={{ fontSize: 50 }} />
          <Box>
            <Typography variant="h4" fontWeight={900}>PROGRAM & PRICING CONSOLE</Typography>
          </Box>
        </CardContent>
      </Card>

      <Stack spacing={4}>
        {programs.map((p) => (
          <Card key={p.id} sx={{ borderRadius: 4 }}>
            <CardContent>

              <Stack direction="row" justifyContent="space-between" mb={3}>
                <Box>
                  <Typography variant="h5" fontWeight={800}>{p.title}</Typography>
                  <Typography variant="body2">{p.description}</Typography>
                </Box>
                <Button color="error" startIcon={<DeleteOutlineIcon />}>
                  Delete Program
                </Button>
              </Stack>

              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={3}>
                
                {/* LEFT */}
                <Grid item xs={12} lg={4}>
                  <Stack spacing={1}>
                    {p.subcategories?.map((sc: any) => (
                      <Paper key={sc.id} sx={{ p: 1.5 }}>
                        <Typography fontWeight={700}>{sc.name}</Typography>
                      </Paper>
                    ))}
                  </Stack>

                  <Box sx={{ display: 'flex', mt: 2 }}>
                    <TextField
                      fullWidth
                      size="small"
                      value={newSubCat[p.id] || ""}
                      onChange={(e) =>
                        setNewSubCat(prev => ({ ...prev, [p.id]: e.target.value }))
                      }
                    />
                    <IconButton onClick={() => handleAddSubCat(p.id)}>
                      <AddCircleIcon />
                    </IconButton>
                  </Box>
                </Grid>

                {/* RIGHT */}
                <Grid item xs={12} lg={8}>
                  {p.subcategories?.map((sc: any) => (
                    <Paper key={sc.id} sx={{ p: 2, mb: 2 }}>
                      <Typography fontWeight={800}>{sc.name}</Typography>

                      <Grid container spacing={2}>
                        {[8, 12].map(sessions => (
                          <Grid item xs={12} md={6} key={sessions}>
                            <Stack spacing={1}>
                              <TextField
                                label="Weekly"
                                value={pricingInputs[sc.id]?.[sessions]?.price_weekly || ""}
                                onChange={(e) =>
                                  updatePrice(sc.id, sessions, "price_weekly", e.target.value)
                                }
                              />
                              <TextField
                                label="Monthly"
                                value={pricingInputs[sc.id]?.[sessions]?.price_monthly || ""}
                                onChange={(e) =>
                                  updatePrice(sc.id, sessions, "price_monthly", e.target.value)
                                }
                              />
                              <Button onClick={() => handleUpdatePricing(sc.id, sessions)}>
                                Save
                              </Button>
                            </Stack>
                          </Grid>
                        ))}
                      </Grid>

                    </Paper>
                  ))}
                </Grid>

              </Grid>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
}

export default React.memo(AdminPrograms);