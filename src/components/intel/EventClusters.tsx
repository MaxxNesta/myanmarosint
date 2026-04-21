'use client'

import { useMemo, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { ProcessedEventDTO, EventType } from '@/lib/types'
import { EVENT_TYPE_META } from '@/lib/types'

interface Props {
  events: ProcessedEventDTO[]
}

type GroupBy = 'region' | 'type' | 'week'

interface Cluster {
  label:     string
  count:     number
  avgSev:    number
  fatalities:number
  dominant:  EventType
}

function buildClusters(events: ProcessedEventDTO[], groupBy: GroupBy): Cluster[] {
  const groups: Record<string, ProcessedEventDTO[]> = {}

  for (const e of events) {
    let key: string
    if (groupBy === 'region') key = e.region
    else if (groupBy === 'type') key = e.type
    else {
      // ISO week bucket
      const d = new Date(e.date)
      const wk = Math.floor(d.getTime() / (7 * 86400_000))
      key = `Week ${wk}`
    }
    if (!groups[key]) groups[key] = []
    groups[key].push(e)
  }

  return Object.entries(groups)
    .map(([label, evts]) => {
      const typeCounts = evts.reduce<Record<string, number>>((acc, e) => {
        acc[e.type] = (acc[e.type] ?? 0) + 1
        return acc
      }, {})
      const dominant = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] as EventType ?? 'ARMED_CONFLICT'

      return {
        label: groupBy === 'type' ? EVENT_TYPE_META[label as EventType]?.label ?? label : label,
        count:      evts.length,
        avgSev:     Math.round((evts.reduce((s, e) => s + e.severity, 0) / evts.length) * 10) / 10,
        fatalities: evts.reduce((s, e) => s + e.fatalities, 0),
        dominant,
      }
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 12)
}

export default function EventClusters({ events }: Props) {
  const [groupBy, setGroupBy] = useState<GroupBy>('region')

  const clusters = useMemo(() => buildClusters(events, groupBy), [events, groupBy])

  const chartData = clusters.map(c => ({
    label:      c.label.length > 14 ? c.label.substring(0, 13) + '…' : c.label,
    count:      c.count,
    fatalities: c.fatalities,
    color:      EVENT_TYPE_META[c.dominant]?.color ?? '#6b7280',
  }))

  const totalFatalities = clusters.reduce((s, c) => s + c.fatalities, 0)

  return (
    <div className="panel flex flex-col">
      <div className="panel-header">
        <span className="text-xs font-bold tracking-widest text-slate-300 font-mono">
          🔍 EVENT CLUSTERS
        </span>
        <div className="flex items-center gap-1">
          {(['region', 'type', 'week'] as GroupBy[]).map(g => (
            <button
              key={g}
              onClick={() => setGroupBy(g)}
              className={`text-[0.65rem] font-mono px-2 py-1 rounded transition-colors capitalize ${
                groupBy === g
                  ? 'bg-accent-blue/20 text-accent-blue-light'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Summary stats */}
      <div className="px-4 py-2.5 border-b border-white/[0.06] flex gap-6 text-xs font-mono">
        <span className="text-slate-400">
          <span className="text-slate-200 font-bold">{events.length}</span> events
        </span>
        <span className="text-slate-400">
          <span className="text-red-400 font-bold">{totalFatalities.toLocaleString()}</span> fatalities
        </span>
        <span className="text-slate-400">
          <span className="text-slate-200 font-bold">{clusters.length}</span> clusters
        </span>
      </div>

      {/* Chart */}
      <div className="px-2 pt-3 pb-1" style={{ height: 200 }}>
        {chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-xs text-slate-500 font-mono">No events to cluster.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#64748b', fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis
                type="category" dataKey="label"
                tick={{ fill: '#94a3b8', fontSize: 9 }}
                axisLine={false} tickLine={false} width={100}
              />
              <Tooltip
                contentStyle={{ background: '#0d1520', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 6, fontSize: '0.75rem' }}
                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
              />
              <Bar dataKey="count" radius={[0, 3, 3, 0]} fill="#1d6fa8" label={false} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Cluster table */}
      <div className="flex-1 overflow-y-auto border-t border-white/[0.06]">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-[0.65rem] font-mono text-slate-600 uppercase tracking-wide">
              <th className="px-4 py-2 text-left">{groupBy === 'type' ? 'Type' : groupBy === 'region' ? 'Region' : 'Period'}</th>
              <th className="px-3 py-2 text-right">Events</th>
              <th className="px-3 py-2 text-right">Avg Sev</th>
              <th className="px-3 py-2 text-right">KIA</th>
            </tr>
          </thead>
          <tbody>
            {clusters.map((c, i) => {
              const meta = EVENT_TYPE_META[c.dominant]
              return (
                <tr key={i} className="border-t border-white/[0.04] hover:bg-white/[0.02]">
                  <td className="px-4 py-2 text-slate-300 flex items-center gap-2">
                    <span>{meta?.icon}</span>
                    <span className="truncate max-w-[140px]">{c.label}</span>
                  </td>
                  <td className="px-3 py-2 text-right font-mono font-bold text-slate-200">{c.count}</td>
                  <td className="px-3 py-2 text-right font-mono text-slate-400">{c.avgSev.toFixed(1)}</td>
                  <td className={`px-3 py-2 text-right font-mono ${c.fatalities > 0 ? 'text-red-400' : 'text-slate-600'}`}>
                    {c.fatalities > 0 ? c.fatalities.toLocaleString() : '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
