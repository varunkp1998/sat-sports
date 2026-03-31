import React, { useEffect, useState } from "react";

// Minimalist fallback for API_BASE if your import is failing
const BACKEND_URL = "https://sat-sports.onrender.com";

export default function AdminVerify() {
  const [data, setData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("AdminVerify Mounted. Fetching...");
    
    fetch(`${BACKEND_URL}/api/admin/checkins/all-photos`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
        return res.json();
      })
      .then((json) => {
        console.log("Data loaded:", json);
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch failed:", err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div style={{ color: 'white', padding: '20px' }}>Loading Field Data...</div>;
  if (error) return <div style={{ color: 'red', padding: '20px' }}>Error: {error}</div>;

  return (
    <div style={{ backgroundColor: "#020617", minHeight: "100vh", color: "white", padding: "40px", fontFamily: "sans-serif" }}>
      <h1 style={{ borderBottom: "2px solid #ef4444", paddingBottom: "10px" }}>
        PHOTO <span style={{ color: "#ef4444" }}>VERIFICATIONS</span>
      </h1>

      {data.length === 0 ? (
        <p>No photos found in database.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px", marginTop: "20px" }}>
          {data.map((item) => (
            <div key={item.id} style={{ background: "#1e293b", borderRadius: "12px", overflow: "hidden", border: "1px solid #334155" }}>
              <img 
                src={`${BACKEND_URL}/uploads/${item.verification_photo}`} 
                alt="Coach" 
                style={{ width: "100%", height: "250px", objectFit: "cover" }}
                onError={(e: any) => { e.target.src = "https://via.placeholder.com/300?text=No+Image+Found"; }}
              />
              <div style={{ padding: "15px" }}>
                <h3 style={{ margin: "0 0 5px 0" }}>{item.coach_name || "Unknown Coach"}</h3>
                <p style={{ color: "#ef4444", margin: "0", fontSize: "14px", fontWeight: "bold" }}>{item.locationName}</p>
                <div style={{ marginTop: "10px", fontSize: "12px", opacity: 0.6 }}>
                  Status: <span style={{ color: item.status === 'APPROVED' ? '#22c55e' : '#f97316' }}>{item.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}