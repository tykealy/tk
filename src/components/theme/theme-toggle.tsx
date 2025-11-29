"use client"

import * as React from "react"
import { Button } from "@/components/tiptap-ui-primitive/button"
import { MoonStarIcon } from "../tiptap-icons/moon-star-icon"
import { SunIcon } from "../tiptap-icons/sun-icon"
import { useTheme } from "./theme-provider"

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <Button
        aria-label="Toggle theme"
        data-style="ghost"
      >
        <SunIcon className="tiptap-button-icon" />
      </Button>
    )
  }

  const isDarkMode = theme === "dark"

  return (
    <Button
      onClick={toggleTheme}
      aria-label={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
      data-style="ghost"
    >
      {isDarkMode ? (
        <MoonStarIcon className="tiptap-button-icon" />
      ) : (
        <SunIcon className="tiptap-button-icon" />
      )}
    </Button>
  )
}
