"use client";

import { useEffect, useState } from "react";

type Theme = "dark" | "light";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const current = document.documentElement.dataset.theme;
    if (current === "light") setTheme("light");
  }, []);

  const apply = (t: Theme) => {
    setTheme(t);
    document.documentElement.dataset.theme = t;
    try {
      localStorage.setItem("sb-theme", t);
    } catch {
      /* private mode: theme just won't persist */
    }
  };

  return (
    <div className="theme-toggle" role="group" aria-label="Colour theme">
      <button aria-pressed={theme === "dark"} onClick={() => apply("dark")}>
        Night
      </button>
      <button aria-pressed={theme === "light"} onClick={() => apply("light")}>
        Day
      </button>
    </div>
  );
}
