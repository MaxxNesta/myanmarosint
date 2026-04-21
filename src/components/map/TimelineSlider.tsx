'use client'

import { format } from 'date-fns'

interface Props {
  min:      Date
  max:      Date
  value:    [Date, Date]
  onChange: (range: [Date, Date]) => void
}

export default function TimelineSlider({ min, max, value, onChange }: Props) {
  const rangeMs  = max.getTime() - min.getTime()
  const startPct = rangeMs > 0 ? ((value[0].getTime() - min.getTime()) / rangeMs) * 100 : 0
  const endPct   = rangeMs > 0 ? ((value[1].getTime() - min.getTime()) / rangeMs) * 100 : 100

  function pctToDate(pct: number): Date {
    return new Date(min.getTime() + (pct / 100) * rangeMs)
  }

  function handleStart(e: React.ChangeEvent<HTMLInputElement>) {
    const next = pctToDate(Number(e.target.value))
    if (next < value[1]) onChange([next, value[1]])
  }

  function handleEnd(e: React.ChangeEvent<HTMLInputElement>) {
    const next = pctToDate(Number(e.target.value))
    if (next > value[0]) onChange([value[0], next])
  }

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between text-xs font-mono text-slate-500">
        <span>⏱ TIMELINE</span>
        <span className="text-slate-300">
          {format(value[0], 'dd MMM yyyy')} — {format(value[1], 'dd MMM yyyy')}
        </span>
        <span>{format(max, 'dd MMM yyyy')}</span>
      </div>

      {/* Dual-range track */}
      <div className="relative h-6 flex items-center select-none">
        {/* Background track */}
        <div className="absolute inset-x-0 h-1 rounded-full bg-white/[0.08]" />

        {/* Active range fill */}
        <div
          className="absolute h-1 rounded-full bg-accent-blue pointer-events-none"
          style={{ left: `${startPct}%`, right: `${100 - endPct}%` }}
        />

        {/* Start thumb (lower z-index) */}
        <input
          type="range" min={0} max={100} step={0.2}
          value={startPct}
          onChange={handleStart}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-full z-10"
        />

        {/* End thumb (higher z-index so it's on top when handles overlap) */}
        <input
          type="range" min={0} max={100} step={0.2}
          value={endPct}
          onChange={handleEnd}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-full z-20"
        />

        {/* Visual thumb — start */}
        <div
          className="absolute w-3.5 h-3.5 rounded-full bg-accent-blue border-2 border-white/50 pointer-events-none z-30 -translate-x-1/2 shadow-lg"
          style={{ left: `${startPct}%` }}
        />

        {/* Visual thumb — end */}
        <div
          className="absolute w-3.5 h-3.5 rounded-full bg-white border-2 border-accent-blue/70 pointer-events-none z-30 -translate-x-1/2 shadow-lg"
          style={{ left: `${endPct}%` }}
        />
      </div>
    </div>
  )
}
