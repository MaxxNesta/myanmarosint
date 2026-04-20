import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/shared/Navbar'

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

export const metadata: Metadata = {
  title: 'Myanmar Risk Platform — Geopolitical Intelligence',
  description:
    'Open-source conflict monitoring and geopolitical risk analysis platform for Myanmar. ' +
    'OSINT-based intelligence dashboard, interactive conflict map, and probabilistic risk modeling.',
  keywords: ['Myanmar', 'OSINT', 'conflict', 'risk analysis', 'geopolitical', 'intelligence'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`}>
      <body className="min-h-screen bg-surface-0 text-slate-200 antialiased">
        <Navbar />
        <main className="pt-14">{children}</main>
      </body>
    </html>
  )
}
