'use client'

import { useState, useMemo } from 'react'
import { ACTORS, TOWN_CONTROL_EVENTS } from '@/lib/operations-data'
import type { ActorId } from '@/lib/operations-types'

interface PhaseEntry {
  townId: string
  town:   string
  date:   string    // YYYY-MM-DD — date resistance captured
  actor:  ActorId   // capturing actor
}

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
  { townId: 'nawnghkio',   town: 'Nawnghkio',   date: '2024-06-26', actor: 'TNLA'    },
  { townId: 'singu',       town: 'Singu',        date: '2024-07-17', actor: 'PDF_NUG' },
  { townId: 'mogok',       town: 'Mogok',        date: '2024-07-24', actor: 'TNLA'    },
  { townId: 'lashio',      town: 'Lashio',       date: '2024-07-25', actor: 'MNDAA'   },
  { townId: 'kyaukme',     town: 'Kyaukme',      date: '2024-08-06', actor: 'TNLA'    },
  { townId: 'nyaphu',      town: 'Nyaphu',       date: '2024-08-12', actor: 'UNKNOWN' },
  { townId: 'tagauging',   town: 'Tagaung',      date: '2024-08-12', actor: 'PDF_NUG' },
  { townId: 'thabeikkyin', town: 'Thabeikkyin',  date: '2024-08-25', actor: 'PDF_NUG' },
]

function getCurrentControl(townId: string, currentDate: Date): { actor: ActorId; contested: boolean } {
  const relevant = TOWN_CONTROL_EVENTS
    .filter(e => e.townId === townId && new Date(e.date) <= currentDate)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  if (!relevant.length) return { actor: 'MILITARY', contested: false }
  return { actor: relevant[0].actor, contested: relevant[0].contested ?? false }
}

function fmtDate(iso: string) {
  const d = new Date(iso + 'T00:00:00Z')
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit', timeZone: 'UTC' })
}

interface Props {
  currentDate: Date
}

export default function Operation1027Panel({ currentDate }: Props) {
  const [open,  setOpen]  = useState(false)
  const [phase, setPhase] = useState<1 | 2>(1)

  const entries = phase === 1 ? PHASE1 : PHASE2

  const rows = useMemo(() => entries.map(e => {
    const captureDate = new Date(e.date + 'T00:00:00Z')
    const captured    = captureDate <= currentDate
    const ctrl        = captured ? getCurrentControl(e.townId, currentDate) : null
    const ctrlActor   = ctrl ? ACTORS[ctrl.actor] ?? ACTORS.UNKNOWN : null
    const capActor    = ACTORS[e.actor] ?? ACTORS.UNKNOWN
    const isJunta     = ctrl?.actor === 'MILITARY'
    const contested   = ctrl?.contested ?? false
    return { ...e, captured, ctrl, ctrlActor, capActor, isJunta, contested, captureDate }
  }), [entries, currentDate])

  const capturedCount = rows.filter(r => r.captured).length

  return (
    <div className="absolute top-14 right-3 z-20 flex flex-col items-end gap-1">

      {/* Toggle button */}
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 px-2.5 py-1 bg-[#0b0f14]/90 backdrop-blur border border-amber-500/30 rounded text-[9px] font-mono font-bold tracking-widest text-amber-400 hover:text-amber-300 hover:border-amber-400/50 transition-colors shadow-lg"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        OP 1027
        <span className="text-amber-600 ml-0.5">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="bg-[#0b0f14]/95 backdrop-blur border border-white/[0.10] rounded shadow-xl w-52 overflow-hidden">

          {/* Header */}
          <div className="px-3 pt-2.5 pb-1.5 border-b border-white/[0.07]">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-mono font-bold tracking-widest text-amber-400">OPERATION 1027</span>
              <span className="text-[8px] font-mono text-slate-600">{capturedCount}/{rows.length} taken</span>
            </div>
            {/* Phase tabs */}
            <div className="flex gap-1">
              {([1, 2] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setPhase(p)}
                  className={`flex-1 py-0.5 rounded text-[8px] font-mono font-bold tracking-wider transition-colors ${
                    phase === p
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'text-slate-500 hover:text-slate-300 border border-transparent'
                  }`}
                >
                  {p === 1 ? 'PHASE I · Oct–Jan' : 'PHASE II · Jun–Aug'}
                </button>
              ))}
            </div>
            <div className="text-[7px] font-mono text-slate-600 mt-1">
              {phase === 1 ? '27 Oct 2023 – Jan 2024 · 3BA + allies' : 'Jun 2024 – Aug 2024 · 3BA + PDF'}
            </div>
          </div>

          {/* Town list */}
          <div className="overflow-y-auto max-h-72 py-1">
            {rows.map(row => (
              <div
                key={row.townId}
                className={`flex items-center gap-2 px-3 py-1 ${row.captured ? '' : 'opacity-35'}`}
              >
                {/* Capturing actor dot */}
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ background: row.capActor.color }}
                />

                {/* Town name + capture date */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[9px] font-mono text-slate-200 truncate">{row.town}</span>
                    <span className="text-[7px] font-mono text-slate-600 shrink-0">{fmtDate(row.date)}</span>
                  </div>
                  {/* Current control line */}
                  <div className="flex items-center gap-1 mt-0.5">
                    {!row.captured ? (
                      <span className="text-[7px] font-mono text-slate-700">SAC · not yet</span>
                    ) : row.contested ? (
                      <span className="text-[7px] font-mono text-red-400">⚡ CONTESTED</span>
                    ) : row.isJunta ? (
                      <span className="text-[7px] font-mono text-slate-500">↩ SAC recaptured</span>
                    ) : (
                      <>
                        <span
                          className="w-1 h-1 rounded-full shrink-0"
                          style={{ background: row.ctrlActor?.color }}
                        />
                        <span className="text-[7px] font-mono" style={{ color: row.ctrlActor?.color }}>
                          {row.ctrlActor?.shortName} holds
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer note */}
          <div className="px-3 py-1.5 border-t border-white/[0.07] text-[7px] font-mono text-slate-700">
            Control status reflects timeline date
          </div>
        </div>
      )}
    </div>
  )
}
