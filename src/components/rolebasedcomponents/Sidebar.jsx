// Sidebar.jsx
import React from "react";
import {
  LayoutDashboard,
  Users,
  LogOut,
  UserCheck,
} from "lucide-react";
import {
  Drawer,
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
} from "@mui/material";
import LogoImg from "../../assets/LogoImg.png";

const drawerWidth = 240;
const collapsedDrawerWidth = 60;

const Sidebar = ({ role, onMenuSelect, selectedMenu, isCollapsed = false }) => {
  const safeRole = role || localStorage.getItem("userRole") || "guest";

  const menus = {
    admin: [
      { name: "Dashboard", icon: LayoutDashboard },
      { name: "Users", icon: Users },
    ],
    hr: [
      { name: "Dashboard", icon: LayoutDashboard },
      { name: "Student Management", icon: Users },
      {name :"Interview Management",icon:UserCheck},
    ],
    guest: [{ name: "Login", icon: LogOut }],
  };

  const roleMenus = menus[safeRole] || [];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: isCollapsed ? collapsedDrawerWidth : drawerWidth,
        flexShrink: 0,
        transition: "width 0.3s ease",
        "& .MuiDrawer-paper": {
          width: isCollapsed ? collapsedDrawerWidth : drawerWidth,
          boxSizing: "border-box",
          backgroundColor: "#0f766e", // teal-700
          color: "white",
          transition: "width 0.3s ease",
          overflowX: "hidden",
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          px: isCollapsed ? 1 : 3,
          py: 2,
          borderBottom: "1px solid #0d6b63", // teal-600
          minHeight: "80px",
        }}
      >
        <Box sx={{ width: 55, height: 55, flexShrink: 0 }}>
          <img
            src={LogoImg}
            alt="KalviTrack Logo"
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        </Box>
        {!isCollapsed && (
          <Box>
            <Typography variant="h6" fontWeight="bold" color="white">
              <span style={{ color: "black" }}>Kalvi</span>Track
            </Typography>
            <Typography variant="caption" color="gray.200">
              Track, Learn and Achieve
            </Typography>
          </Box>
        )}
      </Box>

      {/* Menu */}
      <Box sx={{ flex: 1, p: isCollapsed ? 1 : 2 }}>
        <List>
          {roleMenus.map((item) => (
            <ListItem key={item.name} disablePadding>
              {isCollapsed ? (
                <Tooltip title={item.name} placement="right">
                  <ListItemButton
                    onClick={() => onMenuSelect(item.name)}
                    sx={{
                      borderRadius: 2,
                      mb: 1,
                      justifyContent: "center",
                      backgroundColor:
                        selectedMenu === item.name ? "#0d9488" : "transparent",
                      "&:hover": { backgroundColor: "#0d9488" },
                    }}
                  >
                    <ListItemIcon sx={{ color: "white", minWidth: "auto" }}>
                      <item.icon size={20} />
                    </ListItemIcon>
                  </ListItemButton>
                </Tooltip>
              ) : (
                <ListItemButton
                  onClick={() => onMenuSelect(item.name)}
                  sx={{
                    borderRadius: 2,
                    mb: 1,
                    backgroundColor:
                      selectedMenu === item.name ? "#0d9488" : "transparent",
                    "&:hover": { backgroundColor: "#0d9488" },
                  }}
                >
                  <ListItemIcon sx={{ color: "white", minWidth: 36 }}>
                    <item.icon size={20} />
                  </ListItemIcon>
                  <ListItemText primary={item.name} />
                </ListItemButton>
              )}
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar;