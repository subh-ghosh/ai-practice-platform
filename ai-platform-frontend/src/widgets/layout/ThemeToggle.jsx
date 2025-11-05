// src/widgets/layout/ThemeToggle.jsx
import React from 'react';
import { IconButton } from "@material-tailwind/react";
import { SunIcon, MoonIcon } from "@heroicons/react/24/solid";
import { useTheme } from "@/context/ThemeContext";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <IconButton
      variant="text"
      color="blue-gray"
      onClick={toggleTheme}
    >
      {theme === "light" ? (
        <MoonIcon className="h-5 w-5 text-blue-gray-500" />
      ) : (
        <SunIcon className="h-5 w-5 text-yellow-500" />
      )}
    </IconButton>
  );
}

export default ThemeToggle;