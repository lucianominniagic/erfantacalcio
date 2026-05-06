import type { ReactNode } from 'react'

/**
 * Passthrough layout for the (user) route group.
 * Pages under this group are mostly public — individual protected pages
 * (formazione, foto, maglia) enforce auth in their own layout.tsx files.
 */
export default function UserLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
