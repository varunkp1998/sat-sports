import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import API_BASE from "./api";

interface ProtectedRouteProps {
  children: JSX.Element;
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
          // Token might be expired or tampered with
          console.warn("Session expired. Clearing local storage.");
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          setStatus('no-auth');
        }
      } catch (err) {
        // Network error - stay on loading or go to login depending on preference
        console.error("Auth verification failed:", err);
        setStatus('no-auth');
      }
    };

    verifySession();
  }, []);

  // 1. LOADING STATE (Matches SAT Sports Dark Theme)
  if (status === 'loading') {
    return (
      <Box sx={loaderContainerStyle}>
        <CircularProgress color="error" thickness={5} size={60} />
      </Box>
    );
  }

  // 2. NO AUTH STATE
  if (status === 'no-auth') {
    return <Navigate to="/login" replace />;
  }

  // 3. AUTHORIZED STATE
  return children;
}

// Design Styles
const loaderContainerStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100vh',
  width: '100vw',
  bgcolor: '#020617', // Deep dark background
  position: 'fixed',
  top: 0,
  left: 0,
  zIndex: 9999
};