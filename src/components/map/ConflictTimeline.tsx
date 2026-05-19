'use client'

import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import type { ConflictEventDTO } from '@/lib/types'
import { CONFLICT_EVENT_META } from '@/lib/types'
import { format, parseISO, startOfMonth } from 'date-fns'

interface Props {
  events: ConflictEventDTO[]
}

const SHOWN_TYPES = ['CLASH', 'AIRSTRIKE', 'ARTILLERY_SHELLING', 'AMBUSH', 'SIEGE_SEIZED'] as const

export default function ConflictTimeline({ events }: Props) {
  const data = useMemo(() => {
    const buckets = new Map<string, Record<string, number>>()
    for (const e of events) {
      const key = format(startOfMonth(parseISO(e.date)), 'MMM yy')
      if (!buckets.has(key)) buckets.set(key, {})
      const b = buckets.get(key)!
      b[e.eventType] = (b[e.eventType] ?? 0) + 1
    }
    return Array.from(buckets.entries())
      .sort((a, b) => a[0] < b[0] ? -1 : 1)
      .map(([month, counts]) => ({ month, ...counts }))
  }, [events])

  if (data.length === 0) return null

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -20 }} barSize={6}>
        <XAxis
          dataKey="month"
          tick={{ fill: '#475569', fontSize: 9, fontFamily: 'monospace' }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fill: '#475569', fontSize: 9, fontFamily: 'monospace' }}
          axisLine={false}
          tickLine={false}
          width={28}
        />
        <Tooltip
          contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, fontSize: 11 }}
          labelStyle={{ color: '#94a3b8', fontFamily: 'monospace', marginBottom: 4 }}
          itemStyle={{ color: '#cbd5e1' }}
          cursor={{ fill: 'rgba(255,255,255,0.04)' }}
        />
        {SHOWN_TYPES.map(type => (
          <Bar
            key={type}
            dataKey={type}
            stackId="a"
            fill={CONFLICT_EVENT_META[type].color}
            name={CONFLICT_EVENT_META[type].label}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}
