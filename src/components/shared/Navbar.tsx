'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'

const TATMADAW_URL = process.env.NEXT_PUBLIC_TATMADAW_URL ?? '/tatmadaw'
const EAOS_URL     = process.env.NEXT_PUBLIC_EAOS_URL     ?? '/eaos'

const NAV_LINKS = [
  { href: '/map',        label: '🗺 Conflict Map'      },
  { href: '/intel',      label: '📡 Intel Dashboard'   },
  { href: '/bases',      label: '🛡 Military Bases'    },
  { href: '/operations', label: '⚔ Ops Timeline'      },
]

export default function Navbar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <nav className="fixed top-0 inset-x-0 z-50 h-14 bg-surface-1 border-b border-white/[0.07] flex items-center px-4 gap-2">

      {/* Militias portals (desktop) */}
      <div className="hidden md:flex flex-col shrink-0 mr-3 border-r border-white/[0.07] pr-4 gap-0.5">
        <span className="text-[8px] font-mono text-slate-600 tracking-widest uppercase">Militias</span>
        <div className="flex items-center gap-2">
          <a
            href={`${TATMADAW_URL}/index.html`}
            className="text-[10px] font-mono text-slate-400 hover:text-slate-200 transition-colors tracking-wide"
            title="Tatmadaw Portal"
          >
            🪖 Tatmadaw
          </a>
          <span className="text-slate-700 text-[10px]">|</span>
          <a
            href={`${EAOS_URL}/index.html`}
            className="text-[10px] font-mono text-orange-600 hover:text-orange-400 transition-colors tracking-wide"
            title="EAO Portal"
          >
            ⚔ EAOs
          </a>
        </div>
      </div>

      {/* Brand */}
      <Link href="/map" className="flex items-center gap-2 mr-6 shrink-0">
        <span className="text-sm font-bold tracking-widest text-slate-100">MYANMAR WAR MAP</span>
      </Link>

      {/* Desktop nav links */}
      <div className="hidden md:flex items-center gap-1 flex-1">
        {NAV_LINKS.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={clsx(
              'px-3 py-1.5 rounded text-xs font-medium tracking-wide transition-colors',
              pathname === href
                ? 'bg-accent-blue/20 text-accent-blue-light'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]',
            )}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* Status badge */}
      <div className="hidden md:flex items-center gap-2 ml-auto text-xs font-mono text-slate-600">
        <span className="live-dot" />
        <span>OSINT / UNCLASSIFIED</span>
      </div>

      {/* Mobile toggle */}
      <button
        className="md:hidden ml-auto text-slate-400 hover:text-slate-200 p-1"
        onClick={() => setOpen(o => !o)}
        aria-label="Toggle menu"
      >
        {open ? 'X' : '='}
      </button>

      {/* Mobile dropdown */}
      {open && (
        <div className="absolute top-14 inset-x-0 bg-surface-1 border-b border-white/[0.07] md:hidden z-50">
          <div className="px-5 py-2 border-b border-white/[0.04]">
            <div className="text-[9px] font-mono text-slate-600 tracking-widest uppercase mb-1.5">Militias</div>
            <div className="flex items-center gap-4">
              <a
                href={`${TATMADAW_URL}/index.html`}
                className="text-sm text-slate-400 hover:text-slate-200"
                onClick={() => setOpen(false)}
              >
                🪖 Tatmadaw
              </a>
              <a
                href={`${EAOS_URL}/index.html`}
                className="text-sm text-orange-600 hover:text-orange-400"
                onClick={() => setOpen(false)}
              >
                ⚔ EAOs
              </a>
            </div>
          </div>
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="block px-5 py-3 text-sm text-slate-300 hover:bg-white/[0.04]"
              onClick={() => setOpen(false)}
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}
