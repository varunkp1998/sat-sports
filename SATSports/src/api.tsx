// ✅ FIX: Use the VITE_ prefix for all frontend environment variables
const API_BASE = import.meta.env.VITE_API_URL || "https://sat-sports.onrender.com";

export default API_BASE;