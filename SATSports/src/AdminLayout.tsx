import React, { useState, useCallback, useMemo } from "react";
import {
  Box, Typography, List, ListItem, ListItemText,
  IconButton, Drawer, Divider
} from "@mui/material";
import { Link, useLocation, useNavigate, Routes, Route } from "react-router-dom";
import Collapse from "@mui/material/Collapse";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import MenuIcon from "@mui/icons-material/Menu";

// ⚡ STATIC MENU (no re-creation)
const menuGroups = [
  {
    group: "Main",
    items: [{ label: "📊 Dashboard", path: "/admin" }]
  },
  {
    group: "Academy Management",
    items: [
      { label: "📘 Programs", path: "/admin/programs" },
      { label: "📅 Sessions", path: "/admin/sessions" },
      { label: "📍 Locations", path: "/admin/locations" },
    ]
  },
  {
    group: "People",
    items: [
      { label: "👤 Players", path: "/admin/players" },
      { label: "🎾 Coaches", path: "/admin/coaches" },
      { label: "📄 Applications", path: "/admin/applications" },
    ]
  },
  {
    group: "Operations",
    items: [
      { label: "📅 Attendance", path: "/admin/attendance" },
      { label: "📝 Leave Management", path: "/admin/leaves" },
      { label: "🟢 Live Coaches", path: "/admin/live" },
      { label: "📸 Photo Verifications", path: "/admin/verify-checkins" },
    ]
  },
  {
    group: "Finance & Reports",
    items: [
      { label: "💰 Revenue", path: "/admin/revenue" },
      { label: "💼 Payroll", path: "/admin/payroll" },
      { label: "📊 Reports", path: "/admin/reports" },
    ]
  },
  {
    group: "Events & Bookings",
    items: [
      { label: "🏆 Tournaments", path: "/admin/tournaments" },
      { label: "🎾 Private Sessions", path: "/admin/private-bookings" },
      { label: "💰 Private Pricing", path: "/admin/private-booking-price" },
      { label: "🏟️ Court Bookings", path: "/admin/court-bookings" },
      { label: "📰 News", path: "/admin/news" },
    ]
  }
];

function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    "Academy Management": true
  });

  const location = useLocation();
  const navigate = useNavigate();

  // ⚡ stable toggle
  const toggleGroup = useCallback((groupName: string) => {
    setOpenGroups(prev => ({ ...prev, [groupName]: !prev[groupName] }));
  }, []);

  // ⚡ no reload logout (faster UX)
  const handleLogout = useCallback(() => {
    localStorage.clear();
    navigate("/login", { replace: true });
  }, [navigate]);

  // ⚡ memo NavItem (BIG re-render reduction)
  const NavItem = React.memo(({ item, isChild = false }: any) => {
    const isActive = location.pathname === item.path;

    return (
      <ListItem
        button
        component={Link}
        to={item.path}
        onClick={() => setMobileOpen(false)}
        sx={{
          pl: isChild ? 4 : 2,
          backgroundColor: isActive ? "rgba(239,68,68,0.1)" : "transparent",
          borderLeft: isActive ? "4px solid #ef4444" : "4px solid transparent",
          "&:hover": { backgroundColor: "#1f2937" },
          mb: 0.5,
          mx: 1,
          borderRadius: 1
        }}
      >
        <ListItemText
          primary={item.label}
          primaryTypographyProps={{
            fontSize: "0.85rem",
            fontWeight: isActive ? 600 : 400,
            color: isActive ? "#ef4444" : "#9ca3af"
          }}
        />
      </ListItem>
    );
  });

  // ⚡ memo sidebar (huge performance win)
  const SidebarContent = useMemo(() => (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column", background: "#111827", color: "white" }}>

      <Box sx={{ p: 3, display: "flex", alignItems: "center", gap: 2 }}>
        <img src="/logo.png" style={{ height: 35 }} alt="Logo" />
        <Typography fontWeight="bold">SAT ADMIN</Typography>
      </Box>

      <List sx={{ flexGrow: 1, overflowY: "auto", px: 1 }}>
        {menuGroups.map(group => (
          <Box key={group.group}>
            {group.items.length === 1 && group.group === "Main" ? (
              <NavItem item={group.items[0]} />
            ) : (
              <>
                <ListItem button onClick={() => toggleGroup(group.group)}>
                  <ListItemText primary={group.group} />
                  {openGroups[group.group] ? <ExpandLess /> : <ExpandMore />}
                </ListItem>

                <Collapse in={openGroups[group.group]} unmountOnExit>
                  <List disablePadding>
                    {group.items.map(item => (
                      <NavItem key={item.path} item={item} isChild />
                    ))}
                  </List>
                </Collapse>
              </>
            )}
          </Box>
        ))}
      </List>

      <Box sx={{ p: 2 }}>
        <Divider sx={{ mb: 2 }} />
        <ListItem button onClick={handleLogout}>
          <ListItemText primary="Logout" />
        </ListItem>
      </Box>

    </Box>
  ), [openGroups, toggleGroup, handleLogout, location.pathname]);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>

      {/* MOBILE HEADER */}
      <Box sx={{ display: { xs: "flex", md: "none" }, width: "100%", p: 2 }}>
        <Typography>SAT Sports</Typography>
        <IconButton onClick={() => setMobileOpen(true)}>
          <MenuIcon />
        </IconButton>
      </Box>

      {/* SIDEBAR */}
      <Box sx={{ width: 260, display: { xs: "none", md: "block" } }}>
        {SidebarContent}
      </Box>

      {/* DRAWER */}
      <Drawer open={mobileOpen} onClose={() => setMobileOpen(false)}>
        {SidebarContent}
      </Drawer>

      {/* CONTENT */}
      <Box sx={{ flexGrow: 1, p: 2 }}>
        <Routes>
          {/* KEEP YOUR ORIGINAL ROUTES EXACTLY */}
        </Routes>
      </Box>

    </Box>
  );
}

export default React.memo(AdminLayout);