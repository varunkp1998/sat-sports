import React, { useEffect, useState, type ReactNode } from "react"; // Added ReactNode
import { Navigate } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import API_BASE from "./api";

interface ProtectedRouteProps {
  children: ReactNode; // Fixed namespace issue
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [status, setStatus] = useState<'loading' | 'auth' | 'no-auth'>('loading');

  useEffect(() => {
    const verifySession = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setStatus('no-auth');
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/api/auth/verify`, {
          method: "GET",
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (res.ok) {
          setStatus('auth');
        } else {
          localStorage.removeItem("token");
          setStatus('no-auth');
        }
      } catch (err) {
        console.error("Verification error:", err);
        setStatus('no-auth');
      }
    };

    verifySession();
  }, []);

  if (status === 'loading') {
    return (
      <Box sx={loaderContainerStyle}>
        <CircularProgress color="error" thickness={5} size={60} />
      </Box>
    );
  }

  return status === 'auth' ? <>{children}</> : <Navigate to="/login" replace />;
}

const loaderContainerStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100vh',
  width: '100vw',
  bgcolor: '#020617',
  position: 'fixed',
  top: 0, left: 0, zIndex: 9999
};