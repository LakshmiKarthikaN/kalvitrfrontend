import React from "react";
import { Bell, User } from "lucide-react";
import { IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

const Header = ({ role, user, onMenuToggle }) => {
  const safeRole = role ? role.charAt(0).toUpperCase() + role.slice(1).toLowerCase() : "Guest";

  return (
    <header className="bg-white shadow-sm border-b px-6 py-4 flex justify-between items-center">
      <div className="flex items-center gap-4">
        <IconButton
          onClick={onMenuToggle}
          sx={{
            color: "#0f766e", // teal-700 to match sidebar
            "&:hover": {
              backgroundColor: "rgba(15, 118, 110, 0.1)",
            },
          }}
        >
          <MenuIcon />
        </IconButton>
        <h2 className="text-xl font-bold text-gray-800">
          {safeRole} Dashboard
        </h2>
      </div>
      <div className="flex items-center gap-4">
        <button className="p-2 rounded-full hover:bg-gray-100">
          <Bell className="h-5 w-5 text-gray-600" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white font-semibold">
            {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
          </div>
          <span className="text-sm text-gray-700">
            {user?.name || "Unknown User"}
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;