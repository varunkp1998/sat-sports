import React, { useEffect, useState } from "react";
import API_BASE from "./api";

export default function AdminVerify() {
  const [data, setData] = useState<any[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    // Check if API_BASE is actually loading
    console.log("AdminVerify initialized. API_BASE is:", API_BASE);
    
    fetch(`${API_BASE}/api/admin/checkins/all-photos`)
      .then(res => res.json())
      .then(json => setData(json))
      .catch(e => setErr(e.message));
  }, []);

  // FORCE RENDER TEST
  return (
    <div style={{ 
      background: "blue", 
      color: "white", 
      minHeight: "100vh", 
      padding: "50px",
      zIndex: 9999,
      position: "relative" 
    }}>
      <h1>IF YOU SEE THIS, THE ROUTE IS WORKING</h1>
      <p>Current Data Count: {data.length}</p>
      {err && <p style={{color: "red"}}>Error: {err}</p>}
      
      <div style={{ display: "grid", gap: "20px", marginTop: "20px" }}>
        {data.map((item) => (
          <div key={item.id} style={{ border: "1px solid white", padding: "10px" }}>
            <img 
              src={`${API_BASE}/uploads/${item.verification_photo}`} 
              style={{ width: "100px" }} 
              alt="coach"
            />
            <span>{item.coach_name || "No Name"} - {item.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}