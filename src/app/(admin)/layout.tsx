import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'
import { auth } from '~/server/auth.config'

/**
 * Server-side auth guard for all (admin) routes.
 * Redirects to /login if the user is not authenticated or does not have
 * the 'admin' role. No UI markup — pure guard.
 */
export default async function AdminLayout({
  children,
}: {
  children: ReactNode
}) {
  const session = await auth()

  if (!session || !session.user || session.user.ruolo !== 'admin') {
    redirect('/login')
  }

  return <>{children}</>
}
