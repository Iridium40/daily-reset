import type { Metadata } from 'next'
import Providers from './providers'

export const metadata: Metadata = {
  title: 'The Daily Metabolic Reboot',
  description: 'Multi-tenant Optavia client hub for coaching organizations',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
