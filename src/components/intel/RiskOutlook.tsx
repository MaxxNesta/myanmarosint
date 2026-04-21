'use client'

import { useMemo, useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import type { RiskScoreDTO } from '@/lib/types'
import { format, parseISO } from 'date-fns'

interface Props {
  scores: RiskScoreDTO[]
}

const PALETTE = [
  '#ef4444','#f97316','#f59e0b','#22c55e','#3b82f6',
  '#8b5cf6','#06b6d4','#ec4899','#84cc16','#14b8a6',
]

const TREND_ICON = { rising: '↑', stable: '→', declining: '↓' } as const
const TREND_COLOR = { rising: 'text-red-400', stable: 'text-slate-400', declining: 'text-green-400' }

export default function RiskOutlook({ scores }: Props) {
  const [filter, setFilter] = useState<'all' | 'top5'>('top5')

  // Aggregate region risk by date for the line chart
  const { regions, chartData } = useMemo(() => {
    if (!scores.length) return { regions: [], chartData: [] }

    const allRegions = [...new Set(scores.map(s => s.region))].sort()

    // Latest score per region (for legend + table)
    const latestByRegion = allRegions.reduce<Record<string, RiskScoreDTO>>((acc, region) => {
      const regionScores = scores.filter(s => s.region === region).sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      )
      if (regionScores[0]) acc[region] = regionScores[0]
      return acc
    }, {})

    const top5 = Object.values(latestByRegion)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(s => s.region)

    const displayRegions = filter === 'top5' ? top5 : allRegions

    // Group by date for chart
    const byDate = scores
      .filter(s => displayRegions.includes(s.region))
      .reduce<Record<string, Record<string, number>>>((acc, s) => {
        const d = s.date.split('T')[0]
        if (!acc[d]) acc[d] = { date: d as unknown as number }
        acc[d][s.region] = s.score
        return acc
      }, {})

    const chartData = Object.values(byDate).sort(
      (a, b) => String(a.date).localeCompare(String(b.date)),
    )

    return { regions: displayRegions, chartData, latestByRegion }
  }, [scores, filter])

  // Latest per-region summary
  const latestScores = useMemo(() => {
    return regions.map(region => {
      const rs = scores.filter(s => s.region === region).sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      )
      return rs[0]
    }).filter(Boolean) as RiskScoreDTO[]
  }, [regions, scores])

  return (
    <div className="panel flex flex-col h-full">
      <div className="panel-header">
        <span className="text-xs font-bold tracking-widest text-slate-300 font-mono">
          📈 RISK OUTLOOK
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('top5')}
            className={`text-[0.65rem] font-mono px-2 py-1 rounded transition-colors ${
              filter === 'top5' ? 'bg-accent-blue/20 text-accent-blue-light' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Top 5
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`text-[0.65rem] font-mono px-2 py-1 rounded transition-colors ${
              filter === 'all' ? 'bg-accent-blue/20 text-accent-blue-light' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            All Regions
          </button>
        </div>
      </div>

      {/* Line chart */}
      <div className="px-2 py-3 flex-1 min-h-0" style={{ minHeight: 220 }}>
        {chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-xs text-slate-500 font-mono">Insufficient data for trend chart.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="date"
                tick={{ fill: '#64748b', fontSize: 9, fontFamily: 'monospace' }}
                tickFormatter={v => format(parseISO(String(v)), 'dd MMM')}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: '#64748b', fontSize: 9, fontFamily: 'monospace' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{ background: '#0d1520', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 6, fontSize: '0.75rem' }}
                labelStyle={{ color: '#94a3b8', fontFamily: 'monospace' }}
                itemStyle={{ color: '#e2e8f0' }}
              />
              {regions.map((region, i) => (
                <Line
                  key={region}
                  type="monotone"
                  dataKey={region}
                  stroke={PALETTE[i % PALETTE.length]}
                  strokeWidth={1.5}
                  dot={false}
                  activeDot={{ r: 3 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Region summary table */}
      <div className="border-t border-white/[0.06] overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-[0.65rem] font-mono text-slate-600 uppercase tracking-wide">
              <th className="px-4 py-2 text-left">Region</th>
              <th className="px-3 py-2 text-right">Score</th>
              <th className="px-3 py-2 text-right">Trend</th>
              <th className="px-3 py-2 text-right">Events</th>
            </tr>
          </thead>
          <tbody>
            {latestScores.slice(0, 8).map((s, i) => (
              <tr key={s.region} className="border-t border-white/[0.04] hover:bg-white/[0.02]">
                <td className="px-4 py-2 text-slate-300 flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ background: PALETTE[i % PALETTE.length] }}
                  />
                  {s.region}
                </td>
                <td className="px-3 py-2 text-right font-mono font-bold text-slate-200">
                  {s.score.toFixed(0)}
                </td>
                <td className={`px-3 py-2 text-right font-mono font-bold ${TREND_COLOR[s.trend as keyof typeof TREND_COLOR]}`}>
                  {TREND_ICON[s.trend as keyof typeof TREND_ICON]} {s.trend}
                </td>
                <td className="px-3 py-2 text-right text-slate-500 font-mono">{s.eventCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
