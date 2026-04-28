import { Montserrat } from 'next/font/google'
import ClientLayout from '~/components/ClientLayout'
import type { ReactNode } from 'react'

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-montserrat',
})

export default async function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html className={montserrat.variable}>
      <head></head>
      <body className={montserrat.className}>
        <main>
          <ClientLayout>{children}</ClientLayout>
        </main>
      </body>
    </html>
  )
}

