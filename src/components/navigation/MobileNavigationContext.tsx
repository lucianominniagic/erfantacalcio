'use client'
import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import type { MobileHomeSection } from './mobileNavigation'

interface MobileNavigationContextValue {
  homeSection: MobileHomeSection
  setHomeSection: (section: MobileHomeSection) => void
}

const MobileNavigationContext =
  createContext<MobileNavigationContextValue | null>(null)

export function MobileNavigationProvider({
  children,
}: {
  children: ReactNode
}) {
  const [homeSection, setHomeSection] =
    useState<MobileHomeSection>('calendario')

  return (
    <MobileNavigationContext.Provider value={{ homeSection, setHomeSection }}>
      {children}
    </MobileNavigationContext.Provider>
  )
}

export function useMobileNavigation() {
  const context = useContext(MobileNavigationContext)
  if (!context) {
    throw new Error(
      'useMobileNavigation must be used within MobileNavigationProvider',
    )
  }
  return context
}
