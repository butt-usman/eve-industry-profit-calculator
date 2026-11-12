import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'EVE Online Industry Profit Calculator',
  description: 'Advanced EVE Online manufacturing and reaction profit & ISK/hour calculator with live ESI pricing.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-eve-dark text-slate-100 antialiased min-h-screen">
        {children}
      </body>
    </html>
  )
}
