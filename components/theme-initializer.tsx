"use client"

import { useEffect } from "react"
import { useAppStore } from "@/lib/store"

export function ThemeInitializer() {
  const { theme, setTheme } = useAppStore()

  useEffect(() => {
    // Apply stored theme on mount
    setTheme(theme)
  }, [])

  return null
}
