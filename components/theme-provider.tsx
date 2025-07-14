"use client"
import { useEffect, useState } from "react"

// Safe theme provider that doesn't rely on next-themes
export function ThemeProvider({ 
  children, 
  defaultTheme = "dark",
  enableSystem = true,
  disableTransitionOnChange = true,
  ...props 
}: {
  children: React.ReactNode;
  defaultTheme?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
  [key: string]: any;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Initialize theme from localStorage or default
    try {
      const savedTheme = localStorage.getItem("theme") || defaultTheme;
      const root = document.documentElement;
      
      if (savedTheme === "dark") {
        root.classList.add("dark");
      } else if (savedTheme === "light") {
        root.classList.remove("dark");
      } else if (savedTheme === "system" && enableSystem) {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        if (systemTheme === "dark") {
          root.classList.add("dark");
        } else {
          root.classList.remove("dark");
        }
      }
    } catch (error) {
      console.warn("Could not initialize theme:", error);
    }
  }, [defaultTheme, enableSystem]);

  // Listen for system theme changes
  useEffect(() => {
    if (!enableSystem) return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      try {
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme === "system") {
          const root = document.documentElement;
          if (mediaQuery.matches) {
            root.classList.add("dark");
          } else {
            root.classList.remove("dark");
          }
        }
      } catch (error) {
        console.warn("Could not handle system theme change:", error);
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [enableSystem]);

  return <>{children}</>;
}

