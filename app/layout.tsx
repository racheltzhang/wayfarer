import type { Metadata, Viewport } from 'next'
import './globals.css'
import Providers from './providers'

export const metadata: Metadata = {
  title: 'Wayfarer — Social Travel',
  description: 'Share travel itineraries with friends, see ratings on a map, and build your next trip from those you love.',
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0B0B14',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="app-shell">
          <Providers>
            {children}
          </Providers>
        </div>
      </body>
    </html>
  )
}
