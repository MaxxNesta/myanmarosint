'use client'

import { useState } from 'react'
import { ACTORS, TOWN_CONTROL_EVENTS } from '@/lib/operations-data'
import type { ActorId } from '@/lib/operations-types'

// ── Phase town data ───────────────────────────────────────────────────────────
// flyId: slug from myanmar-cities.json when it differs from townId used for control-event lookup
interface PhaseEntry { townId: string; town: string; date: string; actor: ActorId; flyId?: string }

const PHASE1: PhaseEntry[] = [
  { townId: 'chinshwehaw', town: 'Chinshwehaw', date: '2023-10-27', actor: 'MNDAA' },
  { townId: 'hpawngsheng', town: 'Hpawngsheng', date: '2023-11-02', actor: 'MNDAA', flyId: 'pang-hseng-kyu-koke' },
  { townId: 'kyukoke',     town: 'Kyukoke',     date: '2023-11-02', actor: 'MNDAA', flyId: 'pang-hseng-kyu-koke' },
  { townId: 'hseinni',     town: 'Hseni',       date: '2023-11-02', actor: 'MNDAA', flyId: 'hseni' },
  { townId: 'monekoe',     town: 'Mong Ko',     date: '2023-11-07', actor: 'MNDAA' },
  { townId: 'kunlong',     town: 'Kunlong',     date: '2023-11-12', actor: 'MNDAA' },
  { townId: 'kongeyan',    town: 'Konkyan',     date: '2023-11-28', actor: 'MNDAA', flyId: 'konkyan' },
  { townId: 'monglon',     town: 'Monglon',     date: '2023-12-05', actor: 'TNLA'  },
  { townId: 'manhsan',     town: 'Namhsan',     date: '2023-12-15', actor: 'TNLA',  flyId: 'namhsan' },
  { townId: 'namkham',     town: 'Namhkan',     date: '2023-12-18', actor: 'TNLA',  flyId: 'namhkan' },
  { townId: 'mantong',     town: 'Manton',      date: '2023-12-22', actor: 'TNLA',  flyId: 'manton'  },
  { townId: 'kutkai',      town: 'Kutkai',      date: '2024-01-07', actor: 'MNDAA' },
  { townId: 'hopang',      town: 'Hopang',      date: '2024-01-10', actor: 'UWSA'  },
  { townId: 'mahein',      town: 'Mabein',      date: '2024-01-21', actor: 'KIA',   flyId: 'mabein'  },
]

const PHASE2: PhaseEntry[] = [
  { townId: 'nawnghkio',   town: 'Nawnghkio',   date: '2024-06-26', actor: 'TNLA'    },
  { townId: 'lailempi',    town: 'Lailempi',    date: '2024-07-11', actor: 'AA'      },
  { townId: 'thandwe',     town: 'Thandwe',     date: '2024-07-16', actor: 'AA'      },
  { townId: 'mongmit',     town: 'Mongmit',     date: '2024-07-16', actor: 'TNLA'    },
  { townId: 'singu',       town: 'Singu',       date: '2024-07-17', actor: 'PDF_NUG' },
  { townId: 'mogok',       town: 'Mogok',       date: '2024-07-24', actor: 'TNLA',    flyId: 'mogoke' },
  { townId: 'lashio',      town: 'Lashio',      date: '2024-07-25', actor: 'MNDAA'   },
  { townId: 'kyaukme',     town: 'Kyaukme',     date: '2024-08-06', actor: 'TNLA'    },
  { townId: 'nyaphu',      town: 'Nyaphu',      date: '2024-08-12', actor: 'UNKNOWN' },
  { townId: 'takaung',     town: 'Takaung',     date: '2024-08-12', actor: 'PDF_NUG', flyId: 'takaung' },
  { townId: 'kyeintali',   town: 'Kyeintali',   date: '2024-08-14', actor: 'AA'      },
  { townId: 'naungcho',    town: 'Naungcho',    date: '2024-08-19', actor: 'TNLA'    },
  { townId: 'thabeikkyin', town: 'Thabeikkyin', date: '2024-08-25', actor: 'PDF_NUG' },
  { townId: 'hsipaw',      town: 'Hsipaw',      date: '2024-09-15', actor: 'TNLA'    },
]

export const PHASE_COLORS: Record<string, string> = {
  '1027-1':   '#f97316',
  '1027-2':   '#ef4444',
  'combined': '#a78bfa',
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

interface PhaseData {
  key:        string
  roman:      string
  label:      string
  sub:        string
  entries:    PhaseEntry[]
  color:      string
  actors:     string
  phaseEnd:   Date
}

const PHASES: PhaseData[] = [
  {
    key: '1027-1', roman: 'I', label: 'PHASE I',
    sub: 'Oct 2023 – Jan 2024',
    entries: PHASE1,
    color: PHASE_COLORS['1027-1'],
    actors: 'MNDAA · TNLA · UWSA · KIA',
    phaseEnd: new Date('2024-01-31T23:59:59Z'),
  },
  {
    key: '1027-2', roman: 'II', label: 'PHASE II',
    sub: 'Jun – Sep 2024',
    entries: PHASE2,
    color: PHASE_COLORS['1027-2'],
    actors: 'MNDAA · TNLA · AA · PDF/NUG',
    phaseEnd: new Date('2024-09-30T23:59:59Z'),
  },
]

interface Props {
  currentDate:   Date
  activePhase:   string | null
  onPhaseChange: (phase: string | null) => void
  onTownClick:   (townId: string) => void
}

function TownRow({ entry, effectiveDate, onTownClick }: {
  entry:       PhaseEntry
  effectiveDate: Date
  onTownClick: (townId: string) => void
}) {
  const captureDate = new Date(entry.date + 'T00:00:00Z')
  const captured    = captureDate <= effectiveDate
  const ctrl        = captured ? getCurrentControl(entry.townId, effectiveDate) : null
  const ctrlActor   = ctrl ? ACTORS[ctrl.actor] ?? ACTORS.UNKNOWN : null
  const capActor    = ACTORS[entry.actor] ?? ACTORS.UNKNOWN

  return (
    <button
      onClick={() => onTownClick(entry.flyId ?? entry.townId)}
      className="w-full flex items-center gap-2 px-3.5 py-1.5 border-b border-white/[0.03] text-left hover:bg-white/[0.04] transition-colors cursor-pointer"
    >
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ background: capActor.color, opacity: captured ? 1 : 0.3 }}
      />
      <span
        className="text-[8.5px] font-mono flex-1 truncate"
        style={{ color: captured ? '#e2e8f0' : '#475569' }}
      >
        {entry.town}
      </span>
      <span className="text-[6.5px] font-mono text-slate-700 shrink-0">{fmtDate(entry.date)}</span>
      <div className="shrink-0 text-right" style={{ minWidth: '3.5rem' }}>
        {!captured ? (
          <span className="text-[6.5px] font-mono text-slate-700">upcoming</span>
        ) : ctrl?.contested ? (
          <span className="text-[6.5px] font-mono text-red-400">⚡ contested</span>
        ) : ctrl?.actor === 'MILITARY' ? (
          <span className="text-[6.5px] font-mono text-slate-600">↩ SAC</span>
        ) : (
          <span className="text-[6.5px] font-mono" style={{ color: ctrlActor?.color }}>
            {ctrlActor?.shortName}
          </span>
        )}
      </div>
    </button>
  )
}

export default function OperationsPanel({ currentDate, activePhase, onPhaseChange, onTownClick }: Props) {
  const [open, setOpen] = useState(false)

  const totalEntries = PHASES.reduce((s, p) => s + p.entries.length, 0)

  function handlePhaseToggle(key: string) {
    onPhaseChange(activePhase === key ? null : key)
  }

  const isPhaseOnMap = (key: string) =>
    activePhase === key || activePhase === 'combined'

  return (
    <div className="absolute top-[108px] right-0 z-20 flex items-start">

      {/* ── Panel content ─────────────────────────────────────────────── */}
      {open && (
        <div
          className="flex flex-col shadow-2xl"
          style={{
            width:          288,
            maxHeight:      'calc(100vh - 220px)',
            background:     'rgba(11,15,20,0.98)',
            backdropFilter: 'blur(12px)',
            border:         '1px solid rgba(255,255,255,0.09)',
            borderRight:    'none',
            borderRadius:   '0 0 0 8px',
            overflowY:      'auto',
          }}
        >
          {/* ── Operation masthead ──────────────────────────────────── */}
          <div
            className="px-4 py-3"
            style={{
              borderBottom: '1px solid rgba(255,255,255,0.07)',
              borderLeft:   '3px solid #f59e0b',
            }}
          >
            <div className="text-[6.5px] font-mono text-slate-600 uppercase tracking-[0.18em] mb-1">
              Three Brotherhood Alliance
            </div>
            <div className="text-[15px] font-mono font-black text-amber-400 leading-none tracking-wider">
              OPERATION 1027
            </div>
            <div className="text-[7px] font-mono text-slate-500 mt-1 leading-relaxed">
              Shan (N) · Mandalay · Rakhine · Oct 2023 – Sep 2024
            </div>

            {/* ── Map overlay selector ────────────────────────────── */}
            <div
              className="flex items-center gap-1.5 mt-2.5 pt-2.5"
              style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
            >
              <span className="text-[6px] font-mono text-slate-700 uppercase tracking-widest mr-1">
                Show on map
              </span>
              {PHASES.map(p => (
                <button
                  key={p.key}
                  onClick={() => handlePhaseToggle(p.key)}
                  className="px-2 py-0.5 rounded text-[7px] font-mono font-bold tracking-wider border transition-all"
                  style={isPhaseOnMap(p.key) ? {
                    color:       p.color,
                    borderColor: `${p.color}50`,
                    background:  `${p.color}15`,
                    boxShadow:   `0 0 6px ${p.color}20`,
                  } : {
                    color:       '#475569',
                    borderColor: 'rgba(255,255,255,0.07)',
                    background:  'transparent',
                  }}
                >
                  {p.roman}
                </button>
              ))}
              <button
                onClick={() => handlePhaseToggle('combined')}
                className="px-2 py-0.5 rounded text-[7px] font-mono font-bold tracking-wider border transition-all"
                style={activePhase === 'combined' ? {
                  color:       PHASE_COLORS['combined'],
                  borderColor: `${PHASE_COLORS['combined']}50`,
                  background:  `${PHASE_COLORS['combined']}12`,
                  boxShadow:   `0 0 6px ${PHASE_COLORS['combined']}18`,
                } : {
                  color:       '#475569',
                  borderColor: 'rgba(255,255,255,0.07)',
                  background:  'transparent',
                }}
              >
                I+II
              </button>
            </div>
          </div>

          {/* ── Phase sections ──────────────────────────────────────── */}
          {PHASES.map(p => {
            // Always show the completed operation record frozen at phase end
            const effectiveDate = p.phaseEnd
            const taken = p.entries.filter(e => new Date(e.date + 'T00:00:00Z') <= effectiveDate).length
            const pct   = (taken / p.entries.length) * 100
            const onMap = isPhaseOnMap(p.key)

            return (
              <div
                key={p.key}
                style={{
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                  borderLeft:   `3px solid ${onMap ? p.color : 'transparent'}`,
                  transition:   'border-color 0.2s',
                }}
              >
                {/* Phase header */}
                <div className={`px-3.5 pt-2.5 pb-2 ${onMap ? 'bg-white/[0.015]' : ''}`}>
                  <div className="flex items-center gap-2.5 mb-2">
                    <div
                      className="w-7 h-7 rounded flex items-center justify-center shrink-0 text-[11px] font-mono font-black"
                      style={{
                        background: `${p.color}15`,
                        border:     `1px solid ${p.color}35`,
                        color:      p.color,
                        boxShadow:  onMap ? `0 0 10px ${p.color}20` : 'none',
                      }}
                    >
                      {p.roman}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[9px] font-mono font-bold text-slate-200 tracking-wider">{p.label}</div>
                      <div className="text-[6.5px] font-mono text-slate-500">{p.sub}</div>
                      <div className="text-[6px] font-mono text-slate-700 truncate mt-0.5">{p.actors}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <span
                        className="text-[8px] font-mono font-bold"
                        style={{ color: taken > 0 ? p.color : '#334155' }}
                      >
                        {taken}/{p.entries.length}
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="h-0.5 bg-white/[0.05] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, background: p.color, opacity: 0.6 }}
                    />
                  </div>
                </div>

                {/* Town list — always fully visible */}
                <div
                  className="max-h-48 overflow-y-auto"
                  style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
                >
                  {p.entries.map(e => (
                    <TownRow key={e.townId} entry={e} effectiveDate={effectiveDate} onTownClick={onTownClick} />
                  ))}
                </div>
              </div>
            )
          })}

          {/* Footer */}
          <div
            className="px-4 py-2 flex items-center justify-between"
            style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
          >
            <span className="text-[6px] font-mono text-slate-700 uppercase tracking-widest">
              Historical record · Op 1027
            </span>
            <span className="text-[6px] font-mono" style={{ color: PHASE_COLORS['combined'], opacity: 0.5 }}>
              {totalEntries}/{totalEntries} total
            </span>
          </div>
        </div>
      )}

      {/* ── Vertical tab strip ────────────────────────────────────────── */}
      <button
        onClick={() => setOpen(v => !v)}
        className="flex flex-col items-center pt-3 pb-4 gap-3 transition-all cursor-pointer"
        style={{
          width:        36,
          minHeight:    200,
          background:   open ? 'rgba(30,41,59,0.97)' : 'rgba(15,23,42,0.93)',
          border:       `1px solid ${open ? 'rgba(245,158,11,0.35)' : 'rgba(255,255,255,0.22)'}`,
          borderRight:  'none',
          borderRadius: '8px 0 0 8px',
          backdropFilter: 'blur(10px)',
          boxShadow:    open
            ? '0 4px 24px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.04)'
            : '0 4px 20px rgba(0,0,0,0.45), inset 0 0 0 1px rgba(255,255,255,0.04)',
        }}
      >
        {/* Phase indicator dots */}
        <div className="flex flex-col gap-2 pt-1">
          {PHASES.map(p => (
            <span
              key={p.key}
              className="w-2 h-2 rounded-full transition-all duration-300"
              style={{
                background: p.color,
                opacity:    isPhaseOnMap(p.key) ? 1 : 0.5,
                boxShadow:  isPhaseOnMap(p.key) ? `0 0 6px ${p.color}` : 'none',
              }}
            />
          ))}
          {/* Combined dot */}
          <span
            className="w-2 h-2 rounded-full transition-all duration-300"
            style={{
              background: PHASE_COLORS['combined'],
              opacity:    activePhase === 'combined' ? 1 : 0.35,
              boxShadow:  activePhase === 'combined' ? `0 0 6px ${PHASE_COLORS['combined']}` : 'none',
            }}
          />
        </div>

        {/* Divider */}
        <div style={{ width: 18, height: 1, background: 'rgba(255,255,255,0.15)' }} />

        {/* Vertical label */}
        <div className="flex-1 flex items-center justify-center">
          <span
            className="text-[7.5px] font-mono font-black tracking-[0.22em] whitespace-nowrap select-none"
            style={{
              writingMode: 'vertical-lr',
              color:       open ? '#fbbf24' : '#cbd5e1',
              transition:  'color 0.2s',
            }}
          >
            OPERATION 1027
          </span>
        </div>

        {/* Obj count */}
        <div className="flex flex-col items-center gap-0.5">
          <span
            className="text-[7px] font-mono font-bold"
            style={{ color: totalEntries > 0 ? '#94a3b8' : '#475569' }}
          >
            {totalEntries}
          </span>
          <span className="text-[5.5px] font-mono text-slate-500 leading-none">OBJ</span>
        </div>

        {/* Expand arrow */}
        <div
          className="text-[8px] font-mono transition-all duration-200"
          style={{ color: open ? '#f59e0b' : '#94a3b8' }}
        >
          {open ? '▶' : '◀'}
        </div>
      </button>
    </div>
  )
}
