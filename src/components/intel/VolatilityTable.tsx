'use client'

import { useEffect, useState } from 'react'
import type { RegionVolatility } from '@/lib/derived-intelligence'

const TYPE_COLORS: Record<string, string> = {
  CLASH:                 '#ef4444',
  AIRSTRIKE:             '#f97316',
  ARTILLERY_SHELLING:    '#fb923c',
  AMBUSH:                '#dc2626',
  SIEGE_SEIZED:          '#7c3aed',
  RECAPTURED:            '#10b981',
  WITHDRAWAL:            '#6b7280',
  CEASEFIRE:             '#22c55e',
  ARMED_MOBILIZATION:    '#3b82f6',
  CIVILIAN_HARM:         '#b91c1c',
  DISPLACEMENT:          '#f59e0b',
  HUMANITARIAN_CRISIS:   '#06b6d4',
  POLITICAL_DEVELOPMENT: '#8b5cf6',
}

function scoreColor(s: number): string {
  if (s >= 80) return '#ef4444'
  if (s >= 60) return '#f97316'
  if (s >= 40) return '#f59e0b'
  if (s >= 20) return '#22c55e'
  return '#64748b'
}

export default function VolatilityTable() {
  const [rows, setRows]   = useState<RegionVolatility[]>([])
  const [loading, setLoading] = useState(true)
  const [days, setDays]   = useState(30)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/intelligence?days=${days}`)
      .then(r => r.json())
      .then(d => setRows(d.volatility ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [days])

  return (
    <div className="panel flex flex-col h-full">
      <div className="panel-header flex items-center justify-between px-4 py-3 border-b border-white/[0.07]">
        <span className="text-xs font-bold tracking-widest text-slate-200 font-mono">📊 REGION VOLATILITY</span>
        <div className="flex items-center gap-1">
          {([7, 30, 90] as const).map(d => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-2 py-0.5 text-[9px] font-mono rounded transition-colors ${
                days === d
                  ? 'bg-accent-blue/20 text-accent-blue-light border border-accent-blue/30'
                  : 'text-slate-500 border border-white/[0.06] hover:text-slate-300'
              }`}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="px-4 py-8 text-center text-xs font-mono text-slate-600 animate-pulse">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="px-4 py-8 text-center text-xs font-mono text-slate-600">No conflict events in window</div>
        ) : (
          <table className="w-full text-[10px] font-mono">
            <thead>
              <tr className="border-b border-white/[0.07]">
                <th className="text-left px-4 py-2 text-slate-600 font-normal tracking-wider uppercase text-[9px]">Region</th>
                <th className="text-right px-3 py-2 text-slate-600 font-normal tracking-wider uppercase text-[9px]">Score</th>
                <th className="text-right px-3 py-2 text-slate-600 font-normal tracking-wider uppercase text-[9px]">Events</th>
                <th className="text-right px-3 py-2 text-slate-600 font-normal tracking-wider uppercase text-[9px]">KIA</th>
                <th className="px-3 py-2 text-slate-600 font-normal tracking-wider uppercase text-[9px]">Top Types</th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 12).map(r => {
                const color = scoreColor(r.volatilityScore)
                return (
                  <tr key={r.region} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        {/* Score bar */}
                        <div className="w-16 h-1 rounded-full bg-white/[0.08] overflow-hidden shrink-0">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${r.volatilityScore}%`, background: color }}
                          />
                        </div>
                        <span className="text-slate-300 truncate max-w-[110px]">{r.region}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-right font-bold" style={{ color }}>{r.volatilityScore}</td>
                    <td className="px-3 py-2.5 text-right text-slate-400">{r.eventCount}</td>
                    <td className="px-3 py-2.5 text-right">
                      <span className={r.fatalitiesTotal > 0 ? 'text-red-400' : 'text-slate-600'}>
                        {r.fatalitiesTotal > 0 ? r.fatalitiesTotal : '—'}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex gap-1 flex-wrap">
                        {r.hotEventTypes.slice(0, 2).map(t => (
                          <span
                            key={t}
                            className="px-1.5 py-0.5 rounded text-[8px]"
                            style={{
                              background: `${TYPE_COLORS[t] ?? '#64748b'}20`,
                              color:       TYPE_COLORS[t] ?? '#64748b',
                            }}
                          >
                            {t.replace(/_/g, ' ')}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
