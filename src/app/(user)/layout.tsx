import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'
import { auth } from '~/server/auth.config'

/**
 * Server-side auth guard for all (user) routes.
 * Redirects to /login if the user is not authenticated.
 * No UI markup — pure guard.
 */
export default async function UserLayout({
  children,
}: {
  children: ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  return <>{children}</>
}
