import React, { useState, useCallback, useMemo } from "react";
import {
  Box, Typography, List, ListItem, ListItemText,
  IconButton, Drawer, Divider, Collapse
} from "@mui/material";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import MenuIcon from "@mui/icons-material/Menu";

// 🚀 HOISTED CONSTANTS (Zero re-allocation)
const DRAWER_WIDTH = 260;
const PRIMARY_RED = "#ef4444";

const menuGroups = [
  { group: "Main", items: [{ label: "📊 Dashboard", path: "/admin" }] },
  {
    group: "Academy",
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
      { label: "📝 Leaves", path: "/admin/leaves" },
      { label: "🟢 Live Coaches", path: "/admin/live" },
      { label: "📸 Verifications", path: "/admin/verify-checkins" },
    ]
  },
  {
    group: "Finance",
    items: [
      { label: "💰 Revenue", path: "/admin/revenue" },
      { label: "💼 Payroll", path: "/admin/payroll" },
      { label: "📊 Reports", path: "/admin/reports" },
    ]
  },
  {
    group: "Events",
    items: [
      { label: "🏆 Tournaments", path: "/admin/tournaments" },
      { label: "🎾 Private", path: "/admin/private-bookings" },
      { label: "🏟️ Courts", path: "/admin/court-bookings" },
      { label: "📰 News", path: "/admin/news" },
    ]
  }
];

// 🚀 OPTIMIZED NAV ITEM
const NavItem = React.memo(({ item, isActive, isChild, onCloseMobile }: any) => (
  <ListItem
    button
    component={Link}
    to={item.path}
    onClick={onCloseMobile}
    sx={{
      ...navItemBase,
      pl: isChild ? 4 : 2,
      bgcolor: isActive ? "rgba(239,64,64,0.08)" : "transparent",
      borderLeft: `4px solid ${isActive ? PRIMARY_RED : "transparent"}`,
    }}
  >
    <ListItemText
      primary={item.label}
      primaryTypographyProps={{
        fontSize: "0.82rem",
        fontWeight: isActive ? 700 : 500,
        color: isActive ? PRIMARY_RED : "#9ca3af",
        letterSpacing: "0.02em"
      }}
    />
  </ListItem>
));

function AdminLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({ Academy: true });

  const { pathname } = useLocation();
  const navigate = useNavigate();

  const toggleGroup = useCallback((name: string) => {
    setOpenGroups(prev => ({ ...prev, [name]: !prev[name] }));
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.clear();
    navigate("/login", { replace: true });
  }, [navigate]);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  const Sidebar = useMemo(() => (
    <Box sx={sidebarWrapper}>
      <Box sx={logoContainer}>
        <Box component="img" src="/logo.png" sx={{ height: 32 }} />
        <Typography variant="subtitle2" fontWeight={900} letterSpacing={1}>SAT ADMIN</Typography>
      </Box>

      <List sx={listContainer} dense>
        {menuGroups.map(g => {
          const isSingle = g.items.length === 1 && g.group === "Main";
          const isOpen = openGroups[g.group];

          return (
            <Box key={g.group} sx={{ mb: 0.5 }}>
              {isSingle ? (
                <NavItem item={g.items[0]} isActive={pathname === g.items[0].path} onCloseMobile={closeMobile} />
              ) : (
                <>
                  <ListItem button onClick={() => toggleGroup(g.group)} sx={groupHeaderStyle}>
                    <ListItemText 
                      primary={g.group.toUpperCase()} 
                      primaryTypographyProps={{ fontSize: '0.65rem', fontWeight: 900, color: '#4b5563', letterSpacing: 1 }} 
                    />
                    {isOpen ? <ExpandLess sx={iconSize} /> : <ExpandMore sx={iconSize} />}
                  </ListItem>
                  <Collapse in={isOpen} timeout="auto" unmountOnExit>
                    <List disablePadding>
                      {g.items.map(i => (
                        <NavItem key={i.path} item={i} isActive={pathname === i.path} isChild onCloseMobile={closeMobile} />
                      ))}
                    </List>
                  </Collapse>
                </>
              )}
            </Box>
          );
        })}
      </List>

      <Box sx={{ p: 2, mt: 'auto' }}>
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)', mb: 1 }} />
        <ListItem button onClick={handleLogout} sx={logoutBtnStyle}>
          <ListItemText primary="LOGOUT" primaryTypographyProps={{ fontSize: '0.75rem', fontWeight: 900 }} />
        </ListItem>
      </Box>
    </Box>
  ), [openGroups, pathname, toggleGroup, handleLogout, closeMobile]);

  return (
    <Box sx={{ display: "flex", bgcolor: "#f8fafc", minHeight: "100vh" }}>
      {/* MOBILE TRIGGER */}
      <IconButton 
        onClick={() => setMobileOpen(true)} 
        sx={mobileMenuTrigger}
      >
        <MenuIcon fontSize="small" />
      </IconButton>

      {/* DESKTOP SIDEBAR */}
      <Box component="nav" sx={{ width: DRAWER_WIDTH, flexShrink: 0, display: { xs: "none", md: "block" } }}>
        {Sidebar}
      </Box>

      {/* MOBILE DRAWER */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={closeMobile}
        ModalProps={{ keepMounted: true }} // Faster opening on mobile
        PaperProps={{ sx: { width: DRAWER_WIDTH, border: 'none' } }}
      >
        {Sidebar}
      </Drawer>

      {/* MAIN CONTENT AREA */}
      <Box component="main" sx={mainContentStyle}>
        {children}
      </Box>
    </Box>
  );
}

// --- STATIC STYLES (NO RE-RENDERS) ---
const sidebarWrapper = { height: "100%", display: "flex", flexDirection: "column", bgcolor: "#111827", color: "#f3f4f6", borderRight: '1px solid rgba(255,255,255,0.05)' };
const logoContainer = { p: 3, display: "flex", alignItems: "center", gap: 1.5, borderBottom: '1px solid rgba(255,255,255,0.05)' };
const listContainer = { flexGrow: 1, overflowY: "auto", py: 2, '&::-webkit-scrollbar': { width: '4px' }, '&::-webkit-scrollbar-thumb': { bgcolor: '#1f2937', borderRadius: '10px' } };
const navItemBase = { mx: 1, mb: 0.3, borderRadius: '8px', transition: 'all 0.2s ease', "&:hover": { bgcolor: "rgba(255,255,255,0.03)" } };
const groupHeaderStyle = { px: 2, py: 1, cursor: 'pointer', "&:hover": { bgcolor: 'transparent' } };
const iconSize = { fontSize: '1.1rem', color: '#4b5563' };
const logoutBtnStyle = { borderRadius: '8px', color: '#9ca3af', "&:hover": { bgcolor: 'rgba(239,68,68,0.1)', color: PRIMARY_RED } };
const mobileMenuTrigger = { position: 'fixed', bottom: 20, right: 20, zIndex: 1000, bgcolor: '#111827', color: 'white', display: { md: 'none' }, boxShadow: '0 4px 20px rgba(0,0,0,0.3)', "&:hover": { bgcolor: '#1f2937' } };
const mainContentStyle = { flexGrow: 1, minWidth: 0, p: { xs: 2, md: 3 }, mt: { xs: 2, md: 0 } };

export default React.memo(AdminLayout);