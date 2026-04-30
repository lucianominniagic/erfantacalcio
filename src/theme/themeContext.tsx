'use client'
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

type ThemeMode = 'dark' | 'light'

interface ThemeModeContextValue {
  mode: ThemeMode
  toggleMode: () => void
}

const ThemeModeContext = createContext<ThemeModeContextValue>({
  mode: 'dark',
  toggleMode: () => undefined,
})

export function useThemeMode() {
  return useContext(ThemeModeContext)
}

export function ThemeModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('dark')

  useEffect(() => {
    const stored = localStorage.getItem('themeMode') as ThemeMode | null
    if (stored === 'light' || stored === 'dark') {
      setMode(stored)
    }
  }, [])

  const toggleMode = () => {
    setMode((prev) => {
      const next: ThemeMode = prev === 'dark' ? 'light' : 'dark'
      localStorage.setItem('themeMode', next)
      return next
    })
  }

  return (
    <ThemeModeContext.Provider value={{ mode, toggleMode }}>
      {children}
    </ThemeModeContext.Provider>
  )
}
