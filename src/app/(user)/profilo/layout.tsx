import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'
import { auth } from '~/server/auth.config'

/**
 * Auth guard for /profilo.
 * Only authenticated users can change their password.
 */
export default async function ProfiloLayout({
  children,
}: {
  children: ReactNode
}) {
  const session = await auth()
  if (!session) redirect('/login')
  return <>{children}</>
}
