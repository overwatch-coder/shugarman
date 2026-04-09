"use client"

import * as React from "react"

type Theme = "dark" | "light"

interface ThemeContextValue {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = React.createContext<ThemeContextValue | null>(null)

const STORAGE_KEY = "shugarman-theme"

function ThemeProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [theme, setThemeState] = React.useState<Theme>("dark")

  const setTheme = React.useCallback((nextTheme: Theme) => {
    setThemeState(nextTheme)
    document.documentElement.classList.toggle("dark", nextTheme === "dark")
    document.documentElement.style.colorScheme = nextTheme
    window.localStorage.setItem(STORAGE_KEY, nextTheme)
  }, [])

  const toggleTheme = React.useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark")
  }, [setTheme, theme])

  React.useEffect(() => {
    const storedTheme = window.localStorage.getItem(STORAGE_KEY)

    if (storedTheme === "light" || storedTheme === "dark") {
      setTheme(storedTheme)
      return
    }

    setTheme("dark")
  }, [setTheme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

function useAppTheme() {
  const context = React.useContext(ThemeContext)

  if (!context) {
    throw new Error("useAppTheme must be used within ThemeProvider")
  }

  return context
}

export { ThemeProvider, useAppTheme }
