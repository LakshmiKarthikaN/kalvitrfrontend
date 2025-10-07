// src/components/CustomButton.jsx
import React from "react";
import { Button } from "@mui/material";

const CustomButton = ({
  children,
  onClick,
  type = "button",
  variant = "contained",
  disabled = false,
}) => {
  return (
    <Button
      type={type}
      onClick={onClick}
      disabled={disabled}
      variant={variant}
      sx={{
        backgroundColor: variant === "contained" ? "#38B698" : "transparent",
        color: variant === "contained" ? "#fff" : "#38B698",
        padding: "12px 24px",       // same as py-3 px-6
        borderRadius: "9999px",     // fully rounded
        fontWeight: "500",
        textTransform: "none",      // keep text as-is (not uppercase)
        transition: "all 0.2s",
        "&:hover": {
          opacity: 0.9,
          backgroundColor: variant === "contained" ? "#38B698" : "transparent",
          textDecoration: variant === "text" ? "underline" : "none",
        },
        "&:disabled": {
          opacity: 0.5,
          cursor: "not-allowed",
          backgroundColor: variant === "contained" ? "#38B698" : "transparent",
        },
      }}
    >
      {children}
    </Button>
  );
};

export default CustomButton;
