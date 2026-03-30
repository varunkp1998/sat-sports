import { Box, Typography, keyframes } from "@mui/material";

// 1. Define the Bouncing Animation
const bounce = keyframes`
  0%, 100% { transform: translateY(0) scaleX(1); }
  30% { transform: translateY(-80px) scaleX(0.8); }
  70% { transform: translateY(0) scaleX(1.2); }
  90% { transform: translateY(5px) scaleX(1.1); }
`;

// 2. Define the Shadow Pulse
const shadow = keyframes`
  0%, 100% { transform: scale(1); opacity: 0.2; }
  30% { transform: scale(0.5); opacity: 0.05; }
`;

export default function TennisLoader({ message = "Loading Training Data..." }: { message?: string }) {
  return (
    <Box sx={overlayStyle}>
      <Box sx={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>
        
        {/* The Tennis Ball */}
        <Box sx={ballStyle} />

        {/* The Shadow */}
        <Box sx={shadowStyle} />

        {/* Loading Text */}
        <Typography sx={textStyle}>
          {message}
        </Typography>
      </Box>
    </Box>
  );
}

// --- STYLES ---
const overlayStyle = {
  position: "fixed", inset: 0, zIndex: 9999,
  bgcolor: "#020617", // Matches your login background
  display: "flex", alignItems: "center", justifyContent: "center",
};

const ballStyle = {
  width: 50, height: 50,
  bgcolor: "#ccff00", // Classic Tennis Ball Yellow
  borderRadius: "50%",
  boxShadow: "inset -5px -5px 15px rgba(0,0,0,0.2), 0 0 20px rgba(204,255,0,0.4)",
  border: "2px solid #a3cc00",
  animation: `${bounce} 0.8s infinite ease-in-out`,
  "&::after": { // The white curved line on a tennis ball
    content: '""', position: "absolute", top: "10%", left: "10%",
    width: "80%", height: "80%", borderRadius: "50%",
    border: "2px solid rgba(255,255,255,0.5)",
    clipPath: "inset(50% 0 0 0)",
  }
};

const shadowStyle = {
  width: 40, height: 10,
  bgcolor: "black", borderRadius: "50%",
  mt: 2, animation: `${shadow} 0.8s infinite ease-in-out`,
};

const textStyle = {
  mt: 4, color: "white", fontWeight: 800,
  letterSpacing: 2, fontSize: "0.75rem",
  textTransform: "uppercase", opacity: 0.8
};