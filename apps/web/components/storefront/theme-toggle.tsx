"use client"

import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"

import { cn } from "@workspace/ui/lib/utils"

const STORAGE_KEY = "shugarman-theme"

export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<"dark" | "light">("dark")
  const isDark = theme === "dark"

  useEffect(() => {
    const storedTheme = window.localStorage.getItem(STORAGE_KEY)
    const nextTheme = storedTheme === "light" ? "light" : "dark"

    setTheme(nextTheme)
    document.documentElement.classList.toggle("dark", nextTheme === "dark")
    document.documentElement.style.colorScheme = nextTheme
  }, [])

  function toggleTheme() {
    const nextTheme = isDark ? "light" : "dark"
    setTheme(nextTheme)
    document.documentElement.classList.toggle("dark", nextTheme === "dark")
    document.documentElement.style.colorScheme = nextTheme
    window.localStorage.setItem(STORAGE_KEY, nextTheme)
  }

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
