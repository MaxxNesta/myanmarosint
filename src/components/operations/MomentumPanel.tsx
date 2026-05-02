'use client'

import { useMemo, useState } from 'react'
import { ACTORS } from '@/lib/operations-data'
import type { ActorId, TownControlEvent } from '@/lib/operations-types'
import type { ConflictEventDTO } from '@/lib/types'

interface Props {
  currentDate: Date
  incidents:   ConflictEventDTO[]
  controlEvents: TownControlEvent[]
}

const TRACKED: ActorId[] = ['MILITARY', 'TNLA', 'MNDAA', 'AA', 'KIA', 'PDF_NUG', 'KNLA', 'KNPP', 'CNF']

function actorInEvent(ev: ConflictEventDTO, id: ActorId): boolean {
  const a = ACTORS[id]
  const terms = [id, a.shortName].map(s => s.toLowerCase())
  const pool = [
    ...(ev.actors ?? []),
    ev.attackerActor ?? '',
    ev.defenderActor ?? '',
  ].map(s => s.toLowerCase())
  return pool.some(p => terms.some(t => p.includes(t)))
}

export default function MomentumPanel({ currentDate, incidents, controlEvents }: Props) {
  const [open, setOpen] = useState(true)
  const DAY = 86400000

  const rows = useMemo(() => {
    const now = currentDate.getTime()

    return TRACKED.map(id => {
      const a = ACTORS[id]

      const recent = incidents.filter(e => {
        const age = (now - new Date(e.date as string).getTime()) / DAY
        return age >= 0 && age < 7 && actorInEvent(e, id)
      }).length

      const prev = incidents.filter(e => {
        const age = (now - new Date(e.date as string).getTime()) / DAY
        return age >= 7 && age < 14 && actorInEvent(e, id)
      }).length

      const captures = controlEvents.filter(e => {
        const age = (now - new Date(e.date).getTime()) / DAY
        return e.actor === id && age >= 0 && age < 30
      }).length

      const losses = controlEvents.filter(ev => {
        if (ev.actor === id) return false
        const age = (now - new Date(ev.date).getTime()) / DAY
        if (age < 0 || age >= 30) return false
        return controlEvents.some(p =>
          p.townId === ev.townId && p.actor === id && new Date(p.date) < new Date(ev.date)
        )
      }).length

      if (recent === 0 && prev === 0 && captures === 0) return null

      const net = captures - losses
      const pct = prev > 0 ? (recent - prev) / prev : recent > 0 ? 1 : 0

      let trend: 'up' | 'down' | 'stable'
      let label: string
      if (net > 0 || pct > 0.2) {
        trend = 'up'
        label = net > 0 ? 'Expanding' : 'Increasing'
      } else if (net < 0 || pct < -0.2) {
        trend = 'down'
        label = net < 0 ? 'Losing ground' : 'Declining'
      } else {
        trend = 'stable'
        label = 'Stable'
      }

      const parts: string[] = []
      if (net !== 0) parts.push(`${net > 0 ? '+' : ''}${net} towns`)
      if (Math.abs(pct) >= 0.1 && prev > 0) parts.push(`${pct > 0 ? '+' : ''}${Math.round(pct * 100)}% activity`)

      return { id, a, trend, label, delta: parts.join(' · '), recent }
    }).filter(Boolean) as { id: ActorId; a: typeof ACTORS[ActorId]; trend: 'up'|'down'|'stable'; label: string; delta: string; recent: number }[]
  }, [currentDate, incidents, controlEvents, DAY])

  const icon  = (t: string) => t === 'up' ? '↑' : t === 'down' ? '↓' : '→'
  const color = (t: string) => t === 'up' ? '#4ade80' : t === 'down' ? '#f87171' : '#94a3b8'

  return (
    <div className="absolute top-3 left-3 z-20 w-52 sm:w-56">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-2.5 py-1.5 bg-[#0b0f14]/90 backdrop-blur border border-white/[0.10] rounded text-[9px] font-mono text-slate-400 hover:text-slate-200 transition-colors"
      >
        <span className="tracking-widest uppercase">Actor Momentum · 7d</span>
        <span className="text-slate-600">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="mt-1 bg-[#0b0f14]/95 backdrop-blur border border-white/[0.10] rounded shadow-xl overflow-hidden">
          {rows.length === 0 ? (
            <p className="text-[9px] font-mono text-slate-600 text-center py-3">No recent data</p>
          ) : (
            <div className="divide-y divide-white/[0.05]">
              {rows.map(r => (
                <div key={r.id} className="flex items-center gap-2 px-2.5 py-1.5">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: r.a.color }} />
                  <span className="text-[9px] font-mono text-slate-300 w-9 shrink-0">{r.a.shortName}</span>
                  <span className="text-[11px] font-mono font-bold shrink-0 leading-none" style={{ color: color(r.trend) }}>
                    {icon(r.trend)}
                  </span>
                  <span className="text-[8px] font-mono text-slate-400 flex-1 min-w-0 truncate">{r.label}</span>
                  {r.delta && (
                    <span className="hidden sm:block text-[7px] font-mono text-slate-600 shrink-0 text-right leading-tight">
                      {r.delta}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
          <div className="px-2.5 py-1 border-t border-white/[0.05] text-[7px] font-mono text-slate-700">
            Based on incident data · last 14 days
          </div>
        </div>
      )}
    </div>
  )
}
