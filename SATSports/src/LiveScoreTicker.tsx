import { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import API_BASE from "./api";
import "./ticker.css"; // See CSS below

export default function LiveScoreTicker({ tournamentId }) {
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    const fetchScores = () => {
      fetch(`${API_BASE}/api/tournaments/${tournamentId}/matches`)
        .then(res => res.json())
        .then(setMatches);
    };
    fetchScores();
    const interval = setInterval(fetchScores, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [tournamentId]);

  return (
    <Box sx={{ bgcolor: "#000", color: "#fff", overflow: "hidden", py: 1, whiteSpace: "nowrap", borderBottom: "2px solid #800000" }}>
      <div className="ticker-scroll">
        {matches.map((m, i) => (
          <Typography key={i} component="span" sx={{ display: "inline-block", px: 4, fontSize: "0.9rem", fontWeight: "bold" }}>
            <span style={{ color: "#800000" }}>ROUND {m.round}:</span> {m.player1} {m.score1 || 0} - {m.score2 || 0} {m.player2}
            {m.winner && <span style={{ color: "#16a34a", marginLeft: "10px" }}>✓</span>}
          </Typography>
        ))}
        {/* Duplicate list for seamless loop */}
        {matches.map((m, i) => (
          <Typography key={`loop-${i}`} component="span" sx={{ display: "inline-block", px: 4, fontSize: "0.9rem", fontWeight: "bold" }}>
             <span style={{ color: "#800000" }}>ROUND {m.round}:</span> {m.player1} {m.score1 || 0} - {m.score2 || 0} {m.player2}
          </Typography>
        ))}
      </div>
    </Box>
  );
}