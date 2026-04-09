"use client"

import { Moon, Sun } from "lucide-react"

import { cn } from "@workspace/ui/lib/utils"
import { useAppTheme } from "@/components/theme-provider"

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useAppTheme()
  const isDark = theme === "dark"

  return (
    <button
      type="button"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={toggleTheme}
      className={cn(
        "inline-flex size-10 items-center justify-center rounded-full text-content-secondary transition-colors hover:bg-white/10 hover:text-foreground dark:hover:bg-white/10",
        className
      )}
    >
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  )
}
