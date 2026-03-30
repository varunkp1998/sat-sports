import React, { useState } from "react";
import {
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Box,
  Button,
  Typography,
  Divider,
  Menu,
  MenuItem
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { Link, useNavigate } from "react-router-dom";

export default function Header() {
  const role = localStorage.getItem("role");
  const username = localStorage.getItem("username");
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  
  // State for Desktop Dropdown
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openDropdown = Boolean(anchorEl);

  const handleDropdownOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleDropdownClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/"; 
  };

  // Main Nav Links
  const mainLinks = [
    { label: "Home", path: "/" },
    { label: "About", path: "/about" },
    { label: "Programs", path: "/programs" },
    { label: "News", path: "/news" },
    { label: "Tournaments", path: "/tournaments" },
  ];

  // Dropdown / Booking Links
  const bookingLinks = [
    { label: "Private Session", path: "/book-private-session" },
    { label: "Book Court", path: "/book-court" },
    { label: "Join Academy", path: "/register-player" },
    { label: "Contact", path: "/contact" },
  ];

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 1100,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 24px",
        background: "#111827",
        color: "white",
        boxShadow: "0 4px 12px rgba(0,0,0,0.5)"
      }}
    >
      {/* LOGO */}
      <Box 
        display="flex" 
        alignItems="center" 
        gap={1.5} 
        component={Link} 
        to="/" 
        sx={{ textDecoration: 'none', color: 'inherit' }}
      >
        <img src="/logo.png" alt="logo" style={{ height: 42 }} />
        <Typography variant="h6" fontWeight={800} sx={{ letterSpacing: 0.5 }}>
          SAT SPORTS
        </Typography>
      </Box>

      {/* DESKTOP MENU */}
      <Box sx={{ display: { xs: "none", md: "flex" }, gap: 3, alignItems: "center" }}>
        {mainLinks.map(item => (
          <Link 
            key={item.path} 
            to={item.path} 
            style={{ color: "#9ca3af", textDecoration: 'none', fontSize: '0.95rem', fontWeight: 500 }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "white")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#9ca3af")}
          >
            {item.label}
          </Link>
        ))}

        {/* SERVICES DROPDOWN */}
        <Button
          id="services-button"
          aria-controls={openDropdown ? 'services-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={openDropdown ? 'true' : undefined}
          onClick={handleDropdownOpen}
          endIcon={<KeyboardArrowDownIcon />}
          sx={{ color: "#9ca3af", textTransform: 'none', fontSize: '0.95rem', fontWeight: 500, '&:hover': { color: 'white' } }}
        >
          Bookings
        </Button>
        <Menu
          id="services-menu"
          anchorEl={anchorEl}
          open={openDropdown}
          onClose={handleDropdownClose}
          MenuListProps={{ 'aria-labelledby': 'services-button' }}
          PaperProps={{
            sx: { bgcolor: '#1f2937', color: 'white', minWidth: 180, mt: 1, border: '1px solid #374151' }
          }}
        >
          {bookingLinks.map((item) => (
            <MenuItem 
              key={item.path} 
              onClick={() => { navigate(item.path); handleDropdownClose(); }}
              sx={{ fontSize: '0.9rem', py: 1.5, '&:hover': { bgcolor: '#374151' } }}
            >
              {item.label}
            </MenuItem>
          ))}
        </Menu>

        <Divider orientation="vertical" flexItem sx={{ bgcolor: '#374151', mx: 1 }} />

        {!role ? (
          <Button
            variant="contained"
            sx={{ bgcolor: '#ef4444', '&:hover': { bgcolor: '#dc2626' }, fontWeight: 700 }}
            onClick={() => navigate("/login")}
          >
            Login
          </Button>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" sx={{ color: '#9ca3af' }}>Hi, {username}</Typography>
            <Button
              variant="text"
              sx={{ color: '#ef4444', fontWeight: 700 }}
              onClick={() => navigate(role === "admin" ? "/admin" : role === "coach" ? "/coach/profile" : "/portal")}
            >
              Profile
            </Button>
            <IconButton size="small" onClick={handleLogout} sx={{ color: 'white', border: '1px solid #374151' }}>
              <Typography variant="caption" fontWeight={700}>OUT</Typography>
            </IconButton>
          </Box>
        )}
      </Box>

      {/* MOBILE MENU BUTTON */}
      <IconButton
        sx={{ display: { xs: "flex", md: "none" }, color: "white" }}
        onClick={() => setMobileOpen(true)}
      >
        <MenuIcon />
      </IconButton>

      {/* MOBILE DRAWER (Flat list is better for Mobile) */}
      <Drawer 
        anchor="right" 
        open={mobileOpen} 
        onClose={() => setMobileOpen(false)}
        PaperProps={{ sx: { bgcolor: '#111827', color: 'white', width: 280 } }}
      >
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 800, color: '#ef4444' }}>SAT SPORTS</Typography>
          <Divider sx={{ bgcolor: '#374151', mb: 2 }} />
          
          <List>
            {[...mainLinks, ...bookingLinks].map(item => (
              <ListItem
                button
                key={item.path}
                component={Link}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                sx={{ borderRadius: '8px', mb: 0.5 }}
              >
                <ListItemText primary={item.label} />
              </ListItem>
            ))}

            <Divider sx={{ my: 3, bgcolor: '#374151' }} />

            {!role ? (
              <Button fullWidth variant="contained" color="error" onClick={() => navigate("/login")}>
                Login
              </Button>
            ) : (
              <>
                <Typography variant="caption" sx={{ color: '#9ca3af', pl: 2 }}>USER: {username}</Typography>
                <ListItem 
                  button 
                  onClick={() => { navigate(role === "admin" ? "/admin" : role === "coach" ? "/coach/profile" : "/portal"); setMobileOpen(false); }}
                >
                  <ListItemText primary="Go to Dashboard" />
                </ListItem>
                <ListItem button onClick={handleLogout} sx={{ mt: 2, bgcolor: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}>
                  <ListItemText primary="Logout" sx={{ color: '#ef4444', textAlign: 'center' }} />
                </ListItem>
              </>
            )}
          </List>
        </Box>
      </Drawer>
    </header>
  );
}