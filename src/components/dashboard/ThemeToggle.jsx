import React from "react";
import { Sun, Moon } from "lucide-react";
import { LINE, MUTED } from "../../styles/dashboardTheme";

export default function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === "dark";
  return (
    <button
      onClick={onToggle}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="flex items-center justify-center rounded-full border transition-colors hover:bg-black/5"
      style={{ borderColor: LINE, color: MUTED, width: 30, height: 30 }}
    >
      {isDark ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  );
}
