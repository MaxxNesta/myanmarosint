import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/shared/Navbar'
import { Analytics } from '@vercel/analytics/next'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://myanmarosint.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Myanmar Civil War',
    template: '%s | Myanmar Civil War',
  },
  description:
    'Independent OSINT, conflict mapping, military analysis, and situation updates on the Myanmar Civil War.',
  keywords: ['Myanmar', 'civil war', 'OSINT', 'conflict', 'military', 'risk analysis', 'geopolitical', 'intelligence'],
  openGraph: {
    title: 'Myanmar Civil War',
    description:
      'Independent OSINT, conflict mapping, military analysis, and situation updates on the Myanmar Civil War.',
    url: BASE_URL,
    siteName: 'Myanmar Civil War',
    images: [{ url: '/mcw-logo.jpg', width: 512, height: 512, alt: 'Myanmar Civil War' }],
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Myanmar Civil War',
    description:
      'Independent OSINT, conflict mapping, military analysis, and situation updates on the Myanmar Civil War.',
    images: ['/mcw-logo.jpg'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`}>
      <body className="min-h-screen bg-surface-0 text-slate-200 antialiased">
        <Navbar />
        <main className="pt-14">{children}</main>
        <Analytics />
      </body>
    </html>
  )
}
