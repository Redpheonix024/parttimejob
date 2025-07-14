"use client";
import { Moon, Sun, Check } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Safe theme hook
function useSafeTheme() {
  const [theme, setTheme] = useState<string>("system");
  const [resolvedTheme, setResolvedTheme] = useState<string>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Try to get theme from localStorage
    try {
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme) {
        setTheme(savedTheme);
        setResolvedTheme(savedTheme === "system" ? "light" : savedTheme);
      }
    } catch (error) {
      console.warn("Could not access localStorage:", error);
    }
  }, []);

  const setThemeSafe = (newTheme: string) => {
    try {
      setTheme(newTheme);
      setResolvedTheme(newTheme === "system" ? "light" : newTheme);
      localStorage.setItem("theme", newTheme);
      
      // Apply theme to document
      const root = document.documentElement;
      if (newTheme === "dark") {
        root.classList.add("dark");
      } else if (newTheme === "light") {
        root.classList.remove("dark");
      } else {
        // System theme
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        if (systemTheme === "dark") {
          root.classList.add("dark");
        } else {
          root.classList.remove("dark");
        }
        setResolvedTheme(systemTheme);
      }
    } catch (error) {
      console.warn("Could not set theme:", error);
    }
  };

  return {
    theme,
    resolvedTheme,
    setTheme: setThemeSafe,
    mounted
  };
}

// Create a client-side only wrapper component
function ClientOnly({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-9 h-9 flex items-center justify-center" aria-hidden="true">
        <Sun className="h-[1.2rem] w-[1.2rem] opacity-0" />
      </div>
    );
  }

  return <>{children}</>;
}

export function ThemeToggle() {
  const { setTheme, theme, resolvedTheme, mounted } = useSafeTheme();
  
  if (!mounted) {
    return (
      <div className="w-9 h-9 flex items-center justify-center" aria-hidden="true">
        <Sun className="h-[1.2rem] w-[1.2rem] opacity-0" />
      </div>
    );
  }
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          type="button"
          aria-label="Toggle theme"
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 stroke-[1.5] stroke-foreground" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className="flex items-center justify-between"
        >
          Light
          {resolvedTheme === "light" && <Check className="h-4 w-4" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className="flex items-center justify-between"
        >
          Dark
          {resolvedTheme === "dark" && <Check className="h-4 w-4" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className="flex items-center justify-between"
        >
          System
          {theme === "system" && <Check className="h-4 w-4" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
