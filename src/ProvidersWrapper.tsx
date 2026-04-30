'use client'
import { useMemo } from 'react'
import { SessionProvider } from 'next-auth/react'
import { TRPCReactProvider } from '~/components/TRPCReactProvider'
import type { ReactNode } from 'react'

// material-ui
import { createTheme, ThemeProvider } from '@mui/material/styles'

// project import
import { themeOptions } from './theme'
import { lightThemeOptions } from './theme/lightTheme'
import componentsOverride from './theme/overrides'
import { ThemeModeProvider, useThemeMode } from './theme/themeContext'

function ThemedApp({ children }: { children: ReactNode }) {
  const { mode } = useThemeMode()

  const myCustomTheme = useMemo(() => {
    const base = mode === 'dark' ? themeOptions : { ...themeOptions, ...lightThemeOptions, palette: lightThemeOptions.palette }
    const defaultTheme = createTheme(base)
    const components = componentsOverride(defaultTheme)
    return createTheme({ ...base, components })
  }, [mode])

  return (
    <ThemeProvider theme={myCustomTheme}>
      {children}
    </ThemeProvider>
  )
}

export default function ProvidersWrapper({
  children,
}: {
  children: ReactNode
}) {
  return (
    <ThemeModeProvider>
      <TRPCReactProvider>
        <SessionProvider>
          <ThemedApp>{children}</ThemedApp>
        </SessionProvider>
      </TRPCReactProvider>
    </ThemeModeProvider>
  )
}
