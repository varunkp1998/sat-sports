import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Box, Typography, Button } from "@mui/material";
import API_BASE from "./api";

export default function TournamentBracket() {
  const { id } = useParams();
  const [matches, setMatches] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${API_BASE}/api/tournaments/${id}/matches`)
      .then(res => res.json())
      .then(setMatches);
  }, [id]);

  // group by round
  const rounds: any = {};
  matches.forEach(m => {
    if (!rounds[m.round]) rounds[m.round] = [];
    rounds[m.round].push(m);
  });

  const selectWinner = async (matchId: number, playerId: number) => {
    await fetch(`${API_BASE}/api/matches/${matchId}/winner`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ winnerId: playerId })
    });

    // reload
    fetch(`${API_BASE}/api/tournaments/${id}/matches`)
      .then(res => res.json())
      .then(setMatches);
  };

  return (
    <Box sx={{ p: 3, overflowX: "auto" }}>
      <Typography variant="h4" mb={3}>
        🏆 Tournament Bracket
      </Typography>

      <Box sx={{ display: "flex", gap: 4 }}>

        {Object.keys(rounds).map((roundKey) => (
          <Box key={roundKey}>
            <Typography fontWeight={700} mb={2}>
              Round {roundKey}
            </Typography>

            {rounds[roundKey].map((m: any) => (
              <Box
                key={m.id}
                sx={{
                  mb: 4,
                  p: 2,
                  background: "#fff",
                  borderRadius: 3,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  minWidth: 200
                }}
              >

                {/* PLAYER 1 */}
                <Button
                  fullWidth
                  variant={
                    m.winner_id === m.player1_id
                      ? "contained"
                      : "outlined"
                  }
                  onClick={() =>
                    selectWinner(m.id, m.player1_id)
                  }
                  sx={{ mb: 1 }}
                >
                  {m.player1 || "TBD"}
                </Button>

                {/* PLAYER 2 */}
                <Button
                  fullWidth
                  variant={
                    m.winner_id === m.player2_id
                      ? "contained"
                      : "outlined"
                  }
                  onClick={() =>
                    selectWinner(m.id, m.player2_id)
                  }
                >
                  {m.player2 || "TBD"}
                </Button>

              </Box>
            ))}
          </Box>
        ))}

      </Box>
    </Box>
  );
}