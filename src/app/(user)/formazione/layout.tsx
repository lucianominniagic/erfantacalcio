import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'
import { auth } from '~/server/auth.config'

/**
 * Auth guard for /formazione.
 * Only authenticated users (presidenti) can submit their lineup.
 */
export default async function FormazioneLayout({
  children,
}: {
  children: ReactNode
}) {
  const session = await auth()
  if (!session) redirect('/login')
  return <>{children}</>
}
