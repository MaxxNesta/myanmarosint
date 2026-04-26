import type { RiskScoreDTO } from '@/lib/types'
import { RISK_LEVEL_META } from '@/lib/types'
import clsx from 'clsx'

interface Props {
  scores: RiskScoreDTO[]
}

function scoreToLevel(score: number): 1 | 2 | 3 | 4 | 5 {
  if (score >= 80) return 5
  if (score >= 60) return 4
  if (score >= 40) return 3
  if (score >= 20) return 2
  return 1
}

const TREND_ICON: Record<string, string> = {
  rising:   '↑',
  stable:   '→',
  declining:'↓',
}
const TREND_COLOR: Record<string, string> = {
  rising:   'text-red-400',
  stable:   'text-slate-400',
  declining:'text-green-400',
}

export default function RiskPanel({ scores }: Props) {
  const sorted = [...scores].sort((a, b) => b.score - a.score)

  return (
    <div className="panel h-full flex flex-col">
      <div className="panel-header">
        <span className="text-xs font-bold tracking-widest text-slate-300 font-mono">REGIONAL RISK</span>
        <span className="text-xs text-slate-500 font-mono">0–100</span>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-white/[0.04]">
        {sorted.length === 0 && (
          <p className="px-4 py-6 text-xs text-slate-500 text-center">No risk data available.</p>
        )}
        {sorted.map(s => {
          const level = scoreToLevel(s.score)
          const meta  = RISK_LEVEL_META[level]
          return (
            <div key={s.region} className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.02]">
              {/* Score bar */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-300 truncate">{s.region}</span>
                  <span
                    className={clsx('text-xs font-bold font-mono', TREND_COLOR[s.trend])}
                  >
                    {TREND_ICON[s.trend]} {s.score.toFixed(0)}
                  </span>
                </div>
                <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${s.score}%`, background: meta.color }}
                  />
                </div>
              </div>

              {/* Level badge */}
              <span
                className="shrink-0 text-[0.6rem] font-mono font-bold px-1.5 py-0.5 rounded border"
                style={{ color: meta.color, borderColor: `${meta.color}44`, background: `${meta.color}11` }}
              >
                {meta.label.toUpperCase()}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
