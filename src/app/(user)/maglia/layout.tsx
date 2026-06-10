import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'
import { auth } from '~/server/auth.config'

/**
 * Auth guard for /maglia.
 * Only authenticated users can configure their jersey.
 */
export default async function MagliaLayout({
  children,
}: {
  children: ReactNode
}) {
  const session = await auth()
  if (!session) redirect('/login')
  return <>{children}</>
}
