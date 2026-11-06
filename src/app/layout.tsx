import localFont from 'next/font/local'
import ClientLayout from '~/components/ClientLayout'
import type { ReactNode } from 'react'

// Self-hosting avoids intermittent failures from extensionless Google Fonts URLs.
const montserrat = localFont({
  src: './fonts/Montserrat-latin.woff2',
  weight: '300 700',
  style: 'normal',
  display: 'swap',
  variable: '--font-montserrat',
  declarations: [{ prop: 'font-family', value: 'Montserrat' }],
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
