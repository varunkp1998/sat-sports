import { useState } from "react";
import {
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Typography
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Link, Outlet } from "react-router-dom";

export default function CoachLayout() {
  const [open, setOpen] = useState(false);

  const menuItems = [
    { label: "🏠 Dashboard", path: "/coach" },
    { label: "📅 My Sessions", path: "/coach/sessions" },
    { label: "📝 Apply Leave", path: "/coach/leave" },
    { label: "👤 My Profile", path: "/coach/profile" }
  ];

  return (
    <Box sx={{ width: "100%" }}>

      {/* 🔝 MOBILE TOP BAR */}
      <Box
        sx={{
          display: { xs: "flex", md: "none" },
          width: "100%",
          background: "#111827",
          color: "white",
          p: 1.5,
          alignItems: "center"
        }}
      >
        <IconButton onClick={() => setOpen(true)} sx={{ color: "white" }}>
          <MenuIcon />
        </IconButton>

        <Typography sx={{ ml: 1, fontWeight: 600 }}>
          🎾 Coach Panel
        </Typography>
      </Box>

      {/* 🔥 MAIN LAYOUT */}
      <Box sx={{ display: "flex", minHeight: "100vh" }}>

        {/* 🖥️ DESKTOP SIDEBAR */}
        <Box
          sx={{
            width: 240,
            minWidth: 240,   // ✅ prevents shrink
            background: "#111827",
            color: "white",
            p: 2,
            display: { xs: "none", md: "block" }
          }}
        >
          <Typography variant="h6" mb={2}>
            🎾 Coach Panel
          </Typography>

          <List>
            {menuItems.map((item) => (
              <ListItem
                button
                key={item.path}
                component={Link}
                to={item.path}
              >
                <ListItemText primary={item.label} />
              </ListItem>
            ))}
          </List>
        </Box>

        {/* 📄 CONTENT */}
        <Box
          sx={{
            flex: 1,
            minWidth: 0,    // ✅ CRITICAL FIX
            background: "#f5f7fb",
            p: { xs: 2, md: 3 }
          }}
        >
          <Outlet />
        </Box>
      </Box>

      {/* 📱 MOBILE DRAWER */}
      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
      >
        <Box
          sx={{
            width: 240,
            background: "#111827",
            color: "white",
            height: "100%",
            p: 2
          }}
        >
          <Typography variant="h6" mb={2}>
            🎾 Coach Panel
          </Typography>

          <List>
            {menuItems.map((item) => (
              <ListItem
                button
                key={item.path}
                component={Link}
                to={item.path}
                onClick={() => setOpen(false)}
              >
                <ListItemText primary={item.label} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

    </Box>
  );
}