"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { motion } from "framer-motion"

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="relative p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
      aria-label="Toggle Theme"
    >
      <motion.div
        initial={false}
        animate={{
          scale: theme === "light" ? 0 : 1,
          opacity: theme === "light" ? 0 : 1,
          rotate: theme === "light" ? 90 : 0
        }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 flex items-center justify-center text-sky-400"
      >
        <Moon className="w-5 h-5" />
      </motion.div>
      
      <motion.div
        initial={false}
        animate={{
          scale: theme === "light" ? 1 : 0,
          opacity: theme === "light" ? 1 : 0,
          rotate: theme === "light" ? 0 : -90
        }}
        transition={{ duration: 0.2 }}
        className="flex items-center justify-center text-amber-500"
      >
        <Sun className="w-5 h-5" />
      </motion.div>
      <span className="sr-only">Toggle theme</span>
    </button>
  )
}
