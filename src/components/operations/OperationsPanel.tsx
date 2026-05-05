'use client'

import { useState, useMemo } from 'react'
import { ACTORS, TOWN_CONTROL_EVENTS } from '@/lib/operations-data'
import type { ActorId } from '@/lib/operations-types'

// ── Phase town data ───────────────────────────────────────────────────────────
interface PhaseEntry { townId: string; town: string; date: string; actor: ActorId }

const PHASE1: PhaseEntry[] = [
  { townId: 'chinshwehaw', town: 'Chinshwehaw', date: '2023-10-27', actor: 'MNDAA' },
  { townId: 'hpawngsheng', town: 'Hpawngsheng', date: '2023-11-02', actor: 'MNDAA' },
  { townId: 'kyukoke',     town: 'Kyukoke',     date: '2023-11-02', actor: 'MNDAA' },
  { townId: 'theinni',     town: 'Theinni',     date: '2023-11-02', actor: 'MNDAA' },
  { townId: 'monekoe',     town: 'Mong Ko',     date: '2023-11-07', actor: 'MNDAA' },
  { townId: 'kunlong',     town: 'Kunlong',     date: '2023-11-12', actor: 'MNDAA' },
  { townId: 'kongeyan',    town: 'Kongeyan',    date: '2023-11-28', actor: 'MNDAA' },
  { townId: 'monglon',     town: 'Monglon',     date: '2023-12-05', actor: 'TNLA'  },
  { townId: 'manhsan',     town: 'Namhsan',     date: '2023-12-15', actor: 'TNLA'  },
  { townId: 'namkham',     town: 'Namkham',     date: '2023-12-18', actor: 'TNLA'  },
  { townId: 'mantong',     town: 'Mantong',     date: '2023-12-22', actor: 'TNLA'  },
  { townId: 'kutkai',      town: 'Kutkai',      date: '2024-01-07', actor: 'MNDAA' },
  { townId: 'hopang',      town: 'Hopang',      date: '2024-01-10', actor: 'UWSA'  },
  { townId: 'mahein',      town: 'Mahein',      date: '2024-01-21', actor: 'KIA'   },
]

const PHASE2: PhaseEntry[] = [
  { townId: 'nawnghkio',   town: 'Nawnghkio',  date: '2024-06-26', actor: 'TNLA'    },
  { townId: 'singu',       town: 'Singu',       date: '2024-07-17', actor: 'PDF_NUG' },
  { townId: 'mogok',       town: 'Mogok',       date: '2024-07-24', actor: 'TNLA'    },
  { townId: 'lashio',      town: 'Lashio',      date: '2024-07-25', actor: 'MNDAA'   },
  { townId: 'kyaukme',     town: 'Kyaukme',     date: '2024-08-06', actor: 'TNLA'    },
  { townId: 'nyaphu',      town: 'Nyaphu',      date: '2024-08-12', actor: 'UNKNOWN' },
  { townId: 'tagauging',   town: 'Tagaung',     date: '2024-08-12', actor: 'PDF_NUG' },
  { townId: 'thabeikkyin', town: 'Thabeikkyin', date: '2024-08-25', actor: 'PDF_NUG' },
]

// Overlay colors per phase
export const PHASE_COLORS: Record<string, string> = {
  '1027-1': '#f97316',  // orange — MNDAA-led
  '1027-2': '#06b6d4',  // cyan — expanded push
}

// Neatogeo polygon names to show per phase
export const PHASE_POLY_NAMES: Record<string, string[]> = {
  '1027-1': [
    'MNDAA - Myanmar National Democratic Alliance Army',
    'Shan State - Muse',
  ],
  '1027-2': [
    'MNDAA - Myanmar National Democratic Alliance Army',
    'Shan State - Lashio',
  ],
}

function getCurrentControl(townId: string, currentDate: Date): { actor: ActorId; contested: boolean } {
  const relevant = TOWN_CONTROL_EVENTS
    .filter(e => e.townId === townId && new Date(e.date) <= currentDate)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  if (!relevant.length) return { actor: 'MILITARY', contested: false }
  return { actor: relevant[0].actor, contested: relevant[0].contested ?? false }
}

function fmtDate(iso: string) {
  return new Date(iso + 'T00:00:00Z').toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: '2-digit', timeZone: 'UTC',
  })
}

interface Props {
  currentDate:  Date
  activePhase:  string | null
  onPhaseChange: (phase: string | null) => void
}

function TownList({ entries, currentDate }: { entries: PhaseEntry[]; currentDate: Date }) {
  const rows = useMemo(() => entries.map(e => {
    const captured  = new Date(e.date + 'T00:00:00Z') <= currentDate
    const ctrl      = captured ? getCurrentControl(e.townId, currentDate) : null
    const ctrlActor = ctrl ? ACTORS[ctrl.actor] ?? ACTORS.UNKNOWN : null
    const capActor  = ACTORS[e.actor] ?? ACTORS.UNKNOWN
    return { ...e, captured, ctrl, ctrlActor, capActor }
  }), [entries, currentDate])

  const capturedCount = rows.filter(r => r.captured).length

  return (
    <>
      <div className="px-3 py-1 flex items-center justify-between">
        <span className="text-[7px] font-mono text-slate-600 uppercase tracking-widest">Towns</span>
        <span className="text-[7px] font-mono text-slate-600">{capturedCount}/{rows.length} taken</span>
      </div>
      {rows.map(row => (
        <div
          key={row.townId}
          className={`flex items-start gap-2 px-3 py-1 transition-opacity ${row.captured ? '' : 'opacity-30'}`}
        >
          <span className="w-1.5 h-1.5 rounded-full mt-1 shrink-0" style={{ background: row.capActor.color }} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[9px] font-mono text-slate-200 truncate">{row.town}</span>
              <span className="text-[7px] font-mono text-slate-600 shrink-0">{fmtDate(row.date)}</span>
            </div>
            <div className="mt-0.5">
              {!row.captured ? (
                <span className="text-[7px] font-mono text-slate-700">SAC · not yet</span>
              ) : row.ctrl?.contested ? (
                <span className="text-[7px] font-mono text-red-400">⚡ contested</span>
              ) : row.ctrl?.actor === 'MILITARY' ? (
                <span className="text-[7px] font-mono text-slate-500">↩ SAC recaptured</span>
              ) : (
                <span className="text-[7px] font-mono" style={{ color: row.ctrlActor?.color }}>
                  {row.ctrlActor?.shortName} holds
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </>
  )
}

export default function OperationsPanel({ currentDate, activePhase, onPhaseChange }: Props) {
  const [open, setOpen] = useState(false)

  function togglePhase(key: string) {
    onPhaseChange(activePhase === key ? null : key)
  }

  const phases = [
    { key: '1027-1', label: 'PHASE I',  sub: 'Oct 2023 – Jan 2024', entries: PHASE1, color: PHASE_COLORS['1027-1'] },
    { key: '1027-2', label: 'PHASE II', sub: 'Jun – Aug 2024',       entries: PHASE2, color: PHASE_COLORS['1027-2'] },
  ]

  return (
    <div className="absolute top-14 right-0 z-20 flex flex-col items-end">

      {/* ── Tab / toggle button ───────────────────────────────── */}
      <button
        onClick={() => setOpen(v => !v)}
        className={`
          flex items-center gap-1.5 px-3 py-1.5
          bg-[#0b0f14]/95 backdrop-blur border-l border-t border-b border-white/[0.10]
          rounded-l text-[9px] font-mono font-bold tracking-widest
          transition-colors shadow-lg
          ${open ? 'text-amber-400 border-amber-500/30' : 'text-slate-400 hover:text-slate-200'}
        `}
      >
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${open ? 'bg-amber-500 animate-pulse' : 'bg-slate-600'}`} />
        OPERATIONS
        <span className="text-slate-600 ml-0.5">{open ? '▶' : '◀'}</span>
      </button>

      {/* ── Panel ────────────────────────────────────────────── */}
      {open && (
        <div className="bg-[#0b0f14]/97 backdrop-blur border-l border-b border-white/[0.10] rounded-bl shadow-2xl w-56 overflow-hidden">

          {/* Operation header */}
          <div className="px-3 pt-2.5 pb-2 border-b border-white/[0.07]">
            <div className="text-[8px] font-mono text-slate-600 uppercase tracking-widest mb-0.5">Three Brotherhood Alliance</div>
            <div className="text-[11px] font-mono font-bold text-amber-400">OPERATION 1027</div>
            <div className="text-[7px] font-mono text-slate-500 mt-0.5">Oct 2023 – Aug 2024 · Shan (North) + Mandalay</div>
          </div>

          {/* Phase sections */}
          {phases.map(p => {
            const isActive = activePhase === p.key
            return (
              <div key={p.key} className={`border-b border-white/[0.06] ${isActive ? 'bg-white/[0.025]' : ''}`}>

                {/* Phase header + map toggle */}
                <div className="flex items-center justify-between px-3 py-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: p.color, opacity: 0.8 }} />
                      <span className="text-[9px] font-mono font-bold text-slate-200">{p.label}</span>
                    </div>
                    <div className="text-[7px] font-mono text-slate-600 ml-3.5">{p.sub}</div>
                  </div>
                  <button
                    onClick={() => togglePhase(p.key)}
                    className={`
                      px-2 py-0.5 rounded text-[7px] font-mono font-bold tracking-wider border transition-colors
                      ${isActive
                        ? 'text-amber-400 border-amber-500/40 bg-amber-500/10'
                        : 'text-slate-600 border-white/[0.08] hover:text-slate-300 hover:border-white/20'}
                    `}
                  >
                    {isActive ? '▶ ON MAP' : 'SHOW'}
                  </button>
                </div>

                {/* Town list — always visible */}
                <div className="max-h-44 overflow-y-auto border-t border-white/[0.04] pb-1">
                  <TownList entries={p.entries} currentDate={currentDate} />
                </div>
              </div>
            )
          })}

          <div className="px-3 py-1.5 text-[7px] font-mono text-slate-700">
            Control reflects timeline date · polygon = territory
          </div>
        </div>
      )}
    </div>
  )
}
