"use client";

import * as React from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center space-x-1 bg-white/10 dark:bg-black/10 backdrop-blur-sm rounded-lg p-1">
        <div className="w-8 h-8 rounded-md bg-transparent" />
      </div>
    );
  }

  const themes = [
    { name: 'light', icon: Sun, label: 'Light' },
    { name: 'dark', icon: Moon, label: 'Dark' },
    { name: 'system', icon: Monitor, label: 'System' }
  ];

  return (
    <div className="flex items-center space-x-1 bg-white/10 dark:bg-black/10 backdrop-blur-sm rounded-lg p-1">
      {themes.map(({ name, icon: Icon, label }) => (
        <button
          key={name}
          onClick={() => setTheme(name)}
          className={`
            p-2 rounded-md transition-all duration-200 hover:bg-white/20 dark:hover:bg-black/20
            ${theme === name ? 'bg-white/30 dark:bg-black/30 text-primary dark:text-primary' : 'text-foreground/70'}
          `}
          title={label}
        >
          <Icon className="h-4 w-4" />
        </button>
      ))}
    </div>
  );
}