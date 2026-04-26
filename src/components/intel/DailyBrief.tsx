import type { IntelSummaryDTO } from '@/lib/types'
import { EVENT_TYPE_META } from '@/lib/types'
import ConfidenceBadge from '../shared/ConfidenceBadge'
import { format } from 'date-fns'

interface Props {
  summary: IntelSummaryDTO | null
}

export default function DailyBrief({ summary }: Props) {
  if (!summary) {
    return (
      <div className="panel h-full flex items-center justify-center">
        <p className="text-xs text-slate-500 font-mono">No intelligence summary available.</p>
      </div>
    )
  }

  const { keyEvents, topAlerts, weeklyDelta, generatedAt } = summary

  return (
    <div className="panel flex flex-col h-full">
      <div className="panel-header">
        <span className="text-xs font-bold tracking-widest text-slate-300 font-mono">
          📋 INTELLIGENCE BRIEF
        </span>
        <span className="text-xs text-slate-500 font-mono">
          {format(new Date(generatedAt), 'dd MMM HH:mm')} UTC
        </span>
      </div>

      {/* Weekly delta */}
      <div className="px-4 py-3 border-b border-white/[0.06] grid grid-cols-3 gap-3">
        <StatBox label="Events / 7d" value={String(weeklyDelta.totalEvents)} />
        <StatBox
          label="vs Last Week"
          value={`${weeklyDelta.vsLastWeek > 0 ? '+' : ''}${weeklyDelta.vsLastWeek}%`}
          color={weeklyDelta.vsLastWeek > 10 ? '#ef4444' : weeklyDelta.vsLastWeek < -10 ? '#22c55e' : '#94a3b8'}
        />
        <StatBox label="Top Region" value={weeklyDelta.topRegion.split(' ')[0]} />
      </div>

      {/* Top alerts */}
      {topAlerts.length > 0 && (
        <div className="px-4 py-3 border-b border-white/[0.06] space-y-2">
          <p className="text-[0.65rem] font-mono font-bold tracking-widest text-amber-400 mb-2">
            ⚠ ALERTS
          </p>
          {topAlerts.map((alert, i) => (
            <div key={i} className="flex gap-2 text-xs text-slate-300">
              <span className="text-amber-500 shrink-0">▸</span>
              <span>{alert}</span>
            </div>
          ))}
        </div>
      )}

      {/* Key events */}
      <div className="flex-1 overflow-y-auto divide-y divide-white/[0.04]">
        <p className="px-4 py-2 text-[0.65rem] font-mono font-bold tracking-widest text-slate-500">
          KEY EVENTS
        </p>
        {keyEvents.length === 0 && (
          <p className="px-4 py-4 text-xs text-slate-500">No high-severity events this period.</p>
        )}
        {keyEvents.map(e => {
          const meta  = EVENT_TYPE_META[e.type]
          const date  = format(new Date(e.date), 'dd MMM')
          return (
            <div key={e.id} className="px-4 py-3 space-y-1.5 hover:bg-white/[0.02]">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs">
                  <span>{meta.icon}</span>
                  <span className="font-semibold text-slate-200">{e.region}</span>
                  <span className="text-slate-500">·</span>
                  <span className="font-mono text-slate-500 text-[0.7rem]">{date}</span>
                </div>
                <ConfidenceBadge value={e.confidence} />
              </div>
              <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">{e.summary}</p>
              <div className="flex items-center gap-2">
                <span
                  className="text-[0.6rem] px-1.5 py-0.5 rounded font-mono font-bold"
                  style={{ background: `${meta.color}22`, color: meta.color }}
                >
                  {meta.label.toUpperCase()}
                </span>
                {e.fatalities > 0 && (
                  <span className="text-[0.6rem] text-red-400 font-mono">
                    {e.fatalities} KIA
                  </span>
                )}
                <span className="text-[0.6rem] text-slate-600 font-mono ml-auto">
                  {e.source}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function StatBox({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="bg-surface-3/50 rounded-lg p-2.5 text-center">
      <div className="text-xs font-bold font-mono" style={{ color: color ?? '#e2e8f0' }}>
        {value}
      </div>
      <div className="text-[0.6rem] text-slate-500 mt-0.5 uppercase tracking-wide">{label}</div>
    </div>
  )
}
