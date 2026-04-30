'use client'

import { useEffect, useState } from 'react'
import type { EscalationSignal } from '@/lib/derived-intelligence'

export default function EscalationSignals() {
  const [signals, setSignals]   = useState<EscalationSignal[]>([])
  const [loading, setLoading]   = useState(true)
  const [updatedAt, setUpdated] = useState<string>('')

  useEffect(() => {
    fetch('/api/intelligence?window=7')
      .then(r => r.json())
      .then(d => {
        setSignals(d.escalation ?? [])
        setUpdated(d.generatedAt ?? '')
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const escalating = signals.filter(s => s.isEscalating)
  const stable     = signals.filter(s => !s.isEscalating).slice(0, 5)

  return (
    <div className="panel flex flex-col h-full">
      <div className="panel-header flex items-center justify-between px-4 py-3 border-b border-white/[0.07]">
        <div>
          <span className="text-xs font-bold tracking-widest text-slate-200 font-mono">⚠ ESCALATION SIGNALS</span>
          <span className="ml-2 text-[9px] font-mono text-slate-500">7-day vs prior 7-day</span>
        </div>
        {updatedAt && (
          <span className="text-[9px] font-mono text-slate-600">
            {new Date(updatedAt).toLocaleTimeString()}
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="px-4 py-8 text-center text-xs font-mono text-slate-600 animate-pulse">Loading…</div>
        ) : signals.length === 0 ? (
          <div className="px-4 py-8 text-center text-xs font-mono text-slate-600">No data — run npm run extract first</div>
        ) : (
          <>
            {/* Escalating regions */}
            {escalating.length > 0 && (
              <div className="p-3 border-b border-white/[0.07]">
                <div className="text-[9px] font-mono text-red-500 tracking-widest mb-2 uppercase">Escalating</div>
                <div className="space-y-2">
                  {escalating.map(s => (
                    <EscalationRow key={s.region} signal={s} />
                  ))}
                </div>
              </div>
            )}

            {/* Other regions */}
            {stable.length > 0 && (
              <div className="p-3">
                <div className="text-[9px] font-mono text-slate-600 tracking-widest mb-2 uppercase">Other Active Regions</div>
                <div className="space-y-2">
                  {stable.map(s => (
                    <EscalationRow key={s.region} signal={s} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function EscalationRow({ signal: s }: { signal: EscalationSignal }) {
  const pct      = s.deltaPercent
  const isUp     = pct > 0
  const isDown   = pct < 0
  const color    = s.isEscalating ? '#ef4444' : isUp ? '#f59e0b' : isDown ? '#22c55e' : '#64748b'
  const arrow    = isUp ? '↑' : isDown ? '↓' : '→'
  const pctLabel = `${isUp ? '+' : ''}${pct}%`

  return (
    <div className={`flex items-start gap-3 px-2.5 py-2 rounded ${s.isEscalating ? 'bg-red-500/[0.07] border border-red-500/20' : 'bg-white/[0.02]'}`}>
      <div className="shrink-0 text-sm font-bold leading-none mt-0.5" style={{ color }}>{arrow}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-mono font-bold text-slate-200 truncate">{s.region}</span>
          <span className="text-[10px] font-mono font-bold shrink-0" style={{ color }}>{pctLabel}</span>
        </div>
        <div className="text-[9px] font-mono text-slate-500 mt-0.5">
          {s.windowEvents} this week · {s.priorEvents} prior
        </div>
        {s.topActors.length > 0 && (
          <div className="text-[9px] font-mono text-slate-600 mt-0.5 truncate">
            {s.topActors.slice(0, 2).join(', ')}
          </div>
        )}
      </div>
    </div>
  )
}
