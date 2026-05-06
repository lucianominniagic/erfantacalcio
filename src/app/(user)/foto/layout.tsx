import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'
import { auth } from '~/server/auth.config'

/**
 * Auth guard for /foto.
 * Only authenticated users can upload their profile photo.
 */
export default async function FotoLayout({
  children,
}: {
  children: ReactNode
}) {
  const session = await auth()
  if (!session) redirect('/login')
  return <>{children}</>
}
