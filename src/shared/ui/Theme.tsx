'use client'

/**
 * Gestionnaire du thème (Clair / Sombre) pour AlgoPlanR.
 * Permet de basculer instantanément entre mode clair et mode sombre,
 * avec persistance dans localStorage et détection automatique de prefers-color-scheme.
 */

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'

export type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  setTheme: () => {},
  toggleTheme: () => {},
})

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light')

  const appliquerTheme = useCallback((nouveau: Theme) => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', nouveau)
      if (nouveau === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }, [])

  useEffect(() => {
    try {
      const stocke = localStorage.getItem('algoplanr.theme') as Theme | null
      if (stocke === 'light' || stocke === 'dark') {
        setThemeState(stocke)
        appliquerTheme(stocke)
      } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setThemeState('dark')
        appliquerTheme('dark')
      } else {
        appliquerTheme('light')
      }
    } catch {
      appliquerTheme('light')
    }
  }, [appliquerTheme])

  const setTheme = useCallback(
    (nouveau: Theme) => {
      setThemeState(nouveau)
      appliquerTheme(nouveau)
      try {
        localStorage.setItem('algoplanr.theme', nouveau)
      } catch {
        // En cas de stockage désactivé
      }
    },
    [appliquerTheme],
  )

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }, [theme, setTheme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextType {
  return useContext(ThemeContext)
}
