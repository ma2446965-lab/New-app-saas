"use client";

import { Sun, Moon, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="relative overflow-hidden"
      aria-label={theme === "dark" ? "التبديل إلى الوضع الفاتح" : "التبديل إلى الوضع الداكن"}
    >
      <div className="absolute inset-0 flex items-center justify-center w-full h-full opacity-0 transition-opacity duration-300 rotate-90 scale-150">
        {theme === "dark" ? (
          <Sun className="w-4 h-4 text-yellow-400" />
        ) : (
          <Moon className="w-4 h-4 text-indigo-500" />
        )}
      </div>
      <div className="flex items-center justify-center w-full h-full transition-all duration-300">
        {theme === "dark" ? (
          <Moon className="w-4 h-4 text-gray-300" />
        ) : (
          <Sun className="w-4 h-4 text-yellow-500" />
        )}
      </div>
      <RotateCcw className="absolute inset-0 w-full h-full flex items-center justify-center opacity-0 transition-opacity duration-300" />
    </Button>
  );
}