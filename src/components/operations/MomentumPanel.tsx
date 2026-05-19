'use client'

import { useMemo, useState, useEffect, useRef } from 'react'
import { ACTORS } from '@/lib/operations-data'
import type { ActorId, TownControlEvent } from '@/lib/operations-types'
import type { ConflictEventDTO } from '@/lib/types'

interface Props {
  currentDate:   Date
  incidents:     ConflictEventDTO[]
  controlEvents: TownControlEvent[]
}

interface LocalStat {
  id:        ActorId
  shortName: string
  recent7:   number
  prev7:     number
  captures:  number
  losses:    number
  trend:     'up' | 'down' | 'stable'
  label:     string
  delta:     string
  recent:    number
}

interface Row {
  id:      ActorId
  trend:   'up' | 'down' | 'stable'
  label:   string
  note:    string
  delta:   string
  recent:  number
  aiReady: boolean
}

const TRACKED: ActorId[] = ['MILITARY', 'TNLA', 'MNDAA', 'AA', 'KIA', 'PDF_NUG', 'KNLA', 'KNPP', 'CNF']
const DAY = 86400000

function actorInEvent(ev: ConflictEventDTO, id: ActorId): boolean {
  const terms = [id, ACTORS[id].shortName].map(s => s.toLowerCase())
  return [
    ...(ev.actors ?? []),
    ev.attackerActor ?? '',
    ev.defenderActor ?? '',
  ].some(p => terms.some(t => p.toLowerCase().includes(t)))
}

export default function MomentumPanel({ currentDate, incidents, controlEvents }: Props) {
  const [open,    setOpen]    = useState(true)
  const [aiRows,  setAiRows]  = useState<Record<string, { trend: 'up'|'down'|'stable'; label: string; note: string }>>({})
  const [aiState, setAiState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const fetchedForRef = useRef<string>('')

  // ── Compute local stats ────────────────────────────────────────────
  const localStats = useMemo(() => {
    const now = currentDate.getTime()

    return TRACKED.map(id => {
      const recent7  = incidents.filter(e => { const age = (now - new Date(e.date as string).getTime()) / DAY; return age >= 0 && age < 7  && actorInEvent(e, id) }).length
      const prev7    = incidents.filter(e => { const age = (now - new Date(e.date as string).getTime()) / DAY; return age >= 7 && age < 14 && actorInEvent(e, id) }).length
      const captures = controlEvents.filter(e => { const age = (now - new Date(e.date).getTime()) / DAY; return e.actor === id && age >= 0 && age < 30 }).length
      const losses   = controlEvents.filter(ev => {
        if (ev.actor === id) return false
        const age = (now - new Date(ev.date).getTime()) / DAY
        if (age < 0 || age >= 30) return false
        return controlEvents.some(p => p.townId === ev.townId && p.actor === id && new Date(p.date) < new Date(ev.date))
      }).length

      if (recent7 === 0 && prev7 === 0 && captures === 0) return null

      const net = captures - losses
      const pct = prev7 > 0 ? (recent7 - prev7) / prev7 : recent7 > 0 ? 1 : 0

      let trend: 'up' | 'down' | 'stable'
      let label: string
      if      (net > 0 || pct > 0.2)  { trend = 'up';     label = net > 0 ? 'Expanding' : 'Increasing' }
      else if (net < 0 || pct < -0.2) { trend = 'down';   label = net < 0 ? 'Losing ground' : 'Declining' }
      else                             { trend = 'stable'; label = 'Stable' }

      const parts: string[] = []
      if (net !== 0) parts.push(`${net > 0 ? '+' : ''}${net} towns`)
      if (Math.abs(pct) >= 0.1 && prev7 > 0) parts.push(`${pct > 0 ? '+' : ''}${Math.round(pct * 100)}%`)

      return { id, shortName: ACTORS[id].shortName, recent7, prev7, captures, losses, trend, label, delta: parts.join(' · '), recent: recent7 }
    }).filter((s): s is LocalStat => s !== null)
  }, [currentDate, incidents, controlEvents])

  // ── Call Groq when incidents load or date changes significantly ────
  useEffect(() => {
    if (localStats.length === 0 || incidents.length === 0) return

    // Debounce: only re-call if week bucket changed
    const weekBucket = Math.floor(currentDate.getTime() / (7 * DAY)).toString()
    if (fetchedForRef.current === weekBucket) return
    fetchedForRef.current = weekBucket

    setAiState('loading')

    const payload = localStats.map(s => ({
      id:        s.id,
      shortName: s.shortName,
      recent7:   s.recent7,
      prev7:     s.prev7,
      captures:  s.captures,
      losses:    s.losses,
    }))

    fetch('/api/actor-momentum', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ stats: payload }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.momentum) {
          const map: Record<string, { trend: 'up'|'down'|'stable'; label: string; note: string }> = {}
          for (const m of data.momentum) map[m.id] = { trend: m.trend, label: m.label, note: m.note }
          setAiRows(map)
          setAiState('done')
        } else {
          setAiState('error')
        }
      })
      .catch(() => setAiState('error'))
  }, [localStats, currentDate, incidents.length])

  // ── Merge local + AI ───────────────────────────────────────────────
  const rows: Row[] = useMemo(() => {
    return localStats.map(s => {
      const ai = aiRows[s.id]
      return {
        id:      s.id,
        trend:   ai?.trend  ?? s.trend,
        label:   ai?.label  ?? s.label,
        note:    ai?.note   ?? '',
        delta:   s.delta,
        recent:  s.recent,
        aiReady: !!ai,
      }
    }).sort((a, b) => {
      const order = { up: 0, stable: 1, down: 2 }
      return order[a.trend] - order[b.trend]
    })
  }, [localStats, aiRows])

  const trendIcon  = (t: string) => t === 'up' ? '↑' : t === 'down' ? '↓' : '→'
  const trendColor = (t: string) => t === 'up' ? '#4ade80' : t === 'down' ? '#f87171' : '#94a3b8'

  return (
    <div className="absolute top-3 left-3 z-20 w-52 sm:w-60">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-2.5 py-1.5 bg-[#0b0f14]/90 backdrop-blur border border-white/[0.10] rounded text-[9px] font-mono text-slate-400 hover:text-slate-200 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="tracking-widest uppercase">Actor Momentum · 7d</span>
          {aiState === 'loading' && (
            <span className="w-2 h-2 rounded-full bg-blue-500/60 animate-pulse" />
          )}
          {aiState === 'done' && (
            <span className="text-[7px] text-blue-400/60 tracking-widest">AI</span>
          )}
        </div>
        <span className="text-slate-600">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="mt-1 bg-[#0b0f14]/95 backdrop-blur border border-white/[0.10] rounded shadow-xl overflow-hidden">
          {rows.length === 0 ? (
            <p className="text-[9px] font-mono text-slate-600 text-center py-3">No recent data</p>
          ) : (
            <div className="divide-y divide-white/[0.05]">
              {rows.map(r => (
                <div key={r.id} className="px-2.5 py-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: ACTORS[r.id].color }} />
                    <span className="text-[9px] font-mono text-slate-300 w-9 shrink-0">{ACTORS[r.id].shortName}</span>
                    <span className="text-[11px] font-mono font-bold shrink-0 leading-none" style={{ color: trendColor(r.trend) }}>
                      {trendIcon(r.trend)}
                    </span>
                    <span className="text-[8.5px] font-mono text-slate-300 flex-1 min-w-0 truncate">{r.label}</span>
                    {r.delta && (
                      <span className="hidden sm:block text-[7px] font-mono text-slate-600 shrink-0">{r.delta}</span>
                    )}
                  </div>
                  {r.note && (
                    <p className="text-[7.5px] font-mono text-slate-500 mt-0.5 pl-4 leading-tight line-clamp-2">{r.note}</p>
                  )}
                </div>
              ))}
            </div>
          )}
          <div className="px-2.5 py-1 border-t border-white/[0.05] flex items-center justify-between">
            <span className="text-[7px] font-mono text-slate-700">Based on incident data · 14-day window</span>
            {aiState === 'done' && <span className="text-[7px] font-mono text-blue-500/50">Groq AI</span>}
            {aiState === 'error' && <span className="text-[7px] font-mono text-red-500/50">algorithmic</span>}
          </div>
        </div>
      )}
    </div>
  )
}
