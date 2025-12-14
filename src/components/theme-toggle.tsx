"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ThemeToggleProps {
  variant?: 'default' | 'header'
}

export function ThemeToggle({ variant = 'default' }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="h-9 w-9 transition-all hover:scale-105 group"
      suppressHydrationWarning
    >
      {/* Render both icons and use CSS to show/hide based on document theme class */}
      {/* This prevents flash because CSS handles visibility immediately, before React hydrates */}
      <Moon className="h-4 w-4 text-white dark:hidden" />
      <Sun className="h-4 w-4 group-hover:text-white transition-colors hidden dark:block" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
