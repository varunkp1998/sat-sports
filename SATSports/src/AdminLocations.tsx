import {
    Card, CardContent, Button, Stack
  } from "@mui/material";
  import { QRCodeSVG } from "qrcode.react";
  import React from "react";
  import API_BASE from "./api";
  function AdminLocations() {
    const [locations, setLocations] = React.useState<any[]>([]);
    const [showQR, setShowQR] = React.useState<{
        id: number;
        name: string;
        qr_token?: string;
      } | null>(null);
      
    const loadLocations = () => {
      fetch(`${API_BASE}/api/admin/locations`)
        .then(res => res.json())
        .then(setLocations);
    };
  
    React.useEffect(() => {
      loadLocations();
    }, []);
  
    const generateNewQR = async (location: any) => {
        const res = await fetch(
          `${API_BASE}/api/admin/locations/${location.id}/qr`,
          { method: "POST" }
        );
        const data = await res.json();
      
        const updated = {
          ...location,
          qr_token: String(data.qr_token), // 👈 FORCE STRING
        };
      
        setShowQR(updated);
        loadLocations();
      };
      
  
    return (
      <section className="section">
        <h3>Locations (QR)</h3>
  
        <Stack spacing={2}>
          {locations.map(l => (
            <Card key={l.id}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <strong>{l.name}</strong>
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="outlined"
                      onClick={() => setShowQR(l)}
                    >
                      Show QR
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() => generateNewQR(l)}
                    >
                      Generate New QR
                    </Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
  
        {showQR && (
  <Card sx={{ mt: 3, p: 3, textAlign: "center" }}>
    <h4>QR for {showQR.name}</h4>

    {typeof showQR.qr_token === "string" && showQR.qr_token.length > 0 ? (
        <QRCodeSVG value={String(showQR.qr_token)} size={200} />
    ) : (
      <p style={{ color: "red" }}>
        No QR token yet. Click "Generate New QR".
      </p>
    )}

    <p>Print & place at venue</p>
  </Card>
)}
      </section>
    );
  }
  
  export default AdminLocations;
  