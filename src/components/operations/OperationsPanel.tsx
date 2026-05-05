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

export const PHASE_COLORS: Record<string, string> = {
  '1027-1': '#f97316',
  '1027-2': '#06b6d4',
}

export const PHASE_POLY_NAMES: Record<string, string[]> = {
  '1027-1': [
    'MNDAA - Myanmar National Democratic Alliance Army',
    'Shan State - Muse',
  ],
  '1027-2': [
    'Shan State - Lashio',
    'PDF - Mandalay',
    'PDF - Sagaing, Tagaung Taung',
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
  currentDate:   Date
  activePhase:   string | null
  onPhaseChange: (phase: string | null) => void
}

interface PhaseData {
  key:     string
  roman:   string
  label:   string
  sub:     string
  entries: PhaseEntry[]
  color:   string
  actors:  string
}

const PHASES: PhaseData[] = [
  {
    key: '1027-1', roman: 'I',  label: 'PHASE I',
    sub: 'Oct 2023 – Jan 2024',
    entries: PHASE1,
    color: PHASE_COLORS['1027-1'],
    actors: 'MNDAA · TNLA · UWSA · KIA',
  },
  {
    key: '1027-2', roman: 'II', label: 'PHASE II',
    sub: 'Jun – Sep 2024',
    entries: PHASE2,
    color: PHASE_COLORS['1027-2'],
    actors: 'MNDAA · TNLA · AA · PDF/NUG',
  },
]

function PhaseSection({
  phase, isActive, currentDate, onToggle,
}: {
  phase: PhaseData
  isActive: boolean
  currentDate: Date
  onToggle: () => void
}) {
  const rows = useMemo(() => phase.entries.map(e => {
    const captured  = new Date(e.date + 'T00:00:00Z') <= currentDate
    const ctrl      = captured ? getCurrentControl(e.townId, currentDate) : null
    const ctrlActor = ctrl ? ACTORS[ctrl.actor] ?? ACTORS.UNKNOWN : null
    const capActor  = ACTORS[e.actor] ?? ACTORS.UNKNOWN
    return { ...e, captured, ctrl, ctrlActor, capActor }
  }), [phase.entries, currentDate])

  const taken = rows.filter(r => r.captured).length
  const pct   = rows.length > 0 ? (taken / rows.length) * 100 : 0

  return (
    <div
      className="border-b border-white/[0.06] transition-colors"
      style={{ borderLeft: `3px solid ${isActive ? phase.color : 'transparent'}` }}
    >
      {/* Phase header row */}
      <div className={`px-3 pt-3 pb-2 ${isActive ? 'bg-white/[0.02]' : ''}`}>
        <div className="flex items-start gap-2.5 mb-2.5">
          {/* Phase roman numeral badge */}
          <div
            className="w-8 h-8 rounded flex items-center justify-center shrink-0 text-[11px] font-mono font-black"
            style={{
              background: `${phase.color}15`,
              border:     `1px solid ${phase.color}35`,
              color:      phase.color,
              boxShadow:  isActive ? `0 0 12px ${phase.color}20` : 'none',
            }}
          >
            {phase.roman}
          </div>
          <div className="flex-1 min-w-0 pt-0.5">
            <div className="text-[9px] font-mono font-bold text-slate-200 tracking-widest">
              {phase.label}
            </div>
            <div className="text-[7px] font-mono text-slate-500 mt-0.5">{phase.sub}</div>
            <div className="text-[6.5px] font-mono text-slate-700 mt-0.5 truncate">{phase.actors}</div>
          </div>
          {/* Map toggle */}
          <button
            onClick={onToggle}
            className="shrink-0 mt-0.5 px-2 py-1 rounded text-[7px] font-mono font-bold tracking-wider border transition-all"
            style={isActive ? {
              color:      phase.color,
              borderColor:`${phase.color}50`,
              background: `${phase.color}12`,
              boxShadow:  `0 0 8px ${phase.color}18`,
            } : {
              color:       '#475569',
              borderColor: 'rgba(255,255,255,0.08)',
              background:  'transparent',
            }}
          >
            {isActive ? '▶ MAP' : 'SHOW'}
          </button>
        </div>

        {/* Progress bar */}
        <div className="mb-0.5 flex items-center justify-between">
          <span className="text-[6.5px] font-mono text-slate-700 uppercase tracking-widest">Objective</span>
          <span className="text-[7px] font-mono font-bold" style={{ color: taken > 0 ? phase.color : '#334155' }}>
            {taken} / {rows.length}
          </span>
        </div>
        <div className="h-0.5 bg-white/[0.05] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, background: phase.color, opacity: 0.65 }}
          />
        </div>
      </div>

      {/* Town list */}
      <div className="border-t border-white/[0.04] max-h-44 overflow-y-auto">
        {rows.map((row, i) => (
          <div
            key={row.townId}
            className={`
              flex items-center gap-2 px-3 py-1.5 transition-opacity
              ${i < rows.length - 1 ? 'border-b border-white/[0.03]' : ''}
              ${row.captured ? '' : 'opacity-25'}
            `}
          >
            <span
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ background: row.capActor.color }}
            />
            <span className="text-[8.5px] font-mono text-slate-200 flex-1 truncate">{row.town}</span>
            <span className="text-[6.5px] font-mono text-slate-600 shrink-0">{fmtDate(row.date)}</span>
            <div className="shrink-0 text-right" style={{ minWidth: '4rem' }}>
              {!row.captured ? (
                <span className="text-[6.5px] font-mono text-slate-700">pending</span>
              ) : row.ctrl?.contested ? (
                <span className="text-[6.5px] font-mono text-red-400">⚡ contested</span>
              ) : row.ctrl?.actor === 'MILITARY' ? (
                <span className="text-[6.5px] font-mono text-slate-500">↩ SAC</span>
              ) : (
                <span className="text-[6.5px] font-mono" style={{ color: row.ctrlActor?.color }}>
                  {row.ctrlActor?.shortName}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function OperationsPanel({ currentDate, activePhase, onPhaseChange }: Props) {
  const [open, setOpen] = useState(false)

  const totalTaken = useMemo(() =>
    PHASES.reduce((sum, p) =>
      sum + p.entries.filter(e => new Date(e.date + 'T00:00:00Z') <= currentDate).length, 0),
    [currentDate],
  )
  const totalEntries = PHASES.reduce((s, p) => s + p.entries.length, 0)

  return (
    <div className="absolute top-14 right-0 z-20 flex flex-col items-end">

      {/* ── Trigger card ─────────────────────────────────────────────── */}
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-stretch overflow-hidden shadow-xl transition-all"
        style={{
          background:  '#0b0f14',
          border:      `1px solid ${open ? 'rgba(245,158,11,0.25)' : 'rgba(255,255,255,0.09)'}`,
          borderRight: 'none',
          borderRadius: '6px 0 0 6px',
        }}
      >
        {/* Amber left accent stripe */}
        <div
          className="w-1 shrink-0"
          style={{ background: open ? '#f59e0b' : '#1e293b' }}
        />

        <div className="flex items-center gap-3 px-3 py-2.5">
          {/* Phase status dots */}
          <div className="flex flex-col gap-1.5">
            {PHASES.map(p => (
              <span
                key={p.key}
                className="w-2 h-2 rounded-full transition-all"
                style={{
                  background: p.color,
                  opacity:    activePhase === p.key ? 1 : activePhase === null ? 0.35 : 0.12,
                  boxShadow:  activePhase === p.key ? `0 0 6px ${p.color}` : 'none',
                }}
              />
            ))}
          </div>

          {/* Title block */}
          <div className="text-left">
            <div
              className="text-[9px] font-mono font-black tracking-[0.18em]"
              style={{ color: open ? '#fbbf24' : '#94a3b8' }}
            >
              OPERATION
            </div>
            <div
              className="text-[13px] font-mono font-black leading-none tracking-wider"
              style={{ color: open ? '#f59e0b' : '#64748b' }}
            >
              1027
            </div>
            <div className="text-[6px] font-mono text-slate-700 tracking-widest mt-0.5">
              {totalTaken}/{totalEntries} OBJ
            </div>
          </div>

          {/* Expand arrow */}
          <div className="flex flex-col items-center justify-center self-stretch pl-1 border-l border-white/[0.06]">
            <span
              className="text-[8px] font-mono"
              style={{ color: open ? '#f59e0b' : '#334155' }}
            >
              {open ? '▶' : '◀'}
            </span>
          </div>
        </div>
      </button>

      {/* ── Panel ────────────────────────────────────────────────────── */}
      {open && (
        <div
          className="shadow-2xl w-72 overflow-hidden"
          style={{
            background:   'rgba(11,15,20,0.98)',
            backdropFilter: 'blur(12px)',
            border:       '1px solid rgba(255,255,255,0.09)',
            borderRight:  'none',
            borderTop:    'none',
            borderRadius: '0 0 0 8px',
          }}
        >
          {/* Operation masthead */}
          <div
            className="px-4 py-3"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', borderLeft: '3px solid #f59e0b' }}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[6.5px] font-mono text-slate-600 uppercase tracking-[0.18em] mb-1">
                  Three Brotherhood Alliance
                </div>
                <div className="text-[15px] font-mono font-black text-amber-400 leading-none tracking-wider">
                  OPERATION 1027
                </div>
                <div className="text-[7px] font-mono text-slate-500 mt-1.5 leading-relaxed">
                  Shan (North) · Mandalay · Sagaing<br />
                  Oct 2023 – Sep 2024
                </div>
              </div>
              {/* Mini phase legend */}
              <div className="flex flex-col gap-1.5 pt-0.5">
                {PHASES.map(p => (
                  <div key={p.key} className="flex items-center gap-1.5">
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ background: p.color }}
                    />
                    <span className="text-[6.5px] font-mono text-slate-600">{p.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Phase sections */}
          {PHASES.map(p => (
            <PhaseSection
              key={p.key}
              phase={p}
              isActive={activePhase === p.key}
              currentDate={currentDate}
              onToggle={() => onPhaseChange(activePhase === p.key ? null : p.key)}
            />
          ))}

          {/* Footer */}
          <div className="px-4 py-2 flex items-center justify-between"
               style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
            <span className="text-[6px] font-mono text-slate-700 uppercase tracking-widest">
              Control reflects timeline date
            </span>
            <span className="text-[6px] font-mono text-slate-700">
              polygon = territory
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
