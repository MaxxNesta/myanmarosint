'use client'

const SPEEDS = [0.5, 1, 2, 5] as const
type Speed = typeof SPEEDS[number]

interface Props {
  currentDate: Date
  minDate: Date
  maxDate: Date
  playing: boolean
  speed: Speed
  onDateChange: (d: Date) => void
  onPlayPause: () => void
  onSpeedChange: (s: Speed) => void
}

function fmt(d: Date) {
  return d.toISOString().slice(0, 10)
}

function fmtShort(d: Date) {
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function TimelineControl({
  currentDate, minDate, maxDate, playing, speed,
  onDateChange, onPlayPause, onSpeedChange,
}: Props) {
  const range = maxDate.getTime() - minDate.getTime()
  const progress = range > 0
    ? (currentDate.getTime() - minDate.getTime()) / range
    : 0

  function handleSlider(e: React.ChangeEvent<HTMLInputElement>) {
    const v = parseFloat(e.target.value) / 10000
    onDateChange(new Date(minDate.getTime() + v * range))
  }

  return (
    <div className="bg-[#0b0f14]/95 backdrop-blur border-t border-white/[0.08] px-4 py-3 flex flex-col gap-2 shrink-0">

      {/* Scrubber row */}
      <div className="flex items-center gap-3">
        {/* Play / Pause */}
        <button
          onClick={onPlayPause}
          className="shrink-0 w-8 h-8 rounded-full border border-white/[0.12] bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center text-slate-200 transition-colors"
          aria-label={playing ? 'Pause' : 'Play'}
        >
          {playing
            ? <span className="text-xs">⏸</span>
            : <span className="text-xs">▶</span>
          }
        </button>

        {/* Date label */}
        <div className="shrink-0 w-28 text-center">
          <div className="text-[10px] font-mono font-bold text-slate-200 leading-none">{fmtShort(currentDate)}</div>
        </div>

        {/* Slider */}
        <div className="flex-1 relative flex items-center">
          <input
            type="range"
            min={0}
            max={10000}
            step={1}
            value={Math.round(progress * 10000)}
            onChange={handleSlider}
            className="timeline-slider w-full h-1 appearance-none rounded-full outline-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #3b82f6 ${progress * 100}%, rgba(255,255,255,0.08) ${progress * 100}%)`,
            }}
          />
        </div>

        {/* Min/max dates */}
        <div className="shrink-0 text-[9px] font-mono text-slate-600 text-right leading-tight hidden sm:block">
          <div>{fmt(minDate)}</div>
          <div className="text-slate-500">→ {fmt(maxDate)}</div>
        </div>

        {/* Speed selector */}
        <div className="shrink-0 flex items-center gap-0.5 bg-white/[0.04] border border-white/[0.08] rounded px-1 py-0.5">
          {SPEEDS.map(s => (
            <button
              key={s}
              onClick={() => onSpeedChange(s)}
              className={`px-1.5 py-0.5 rounded text-[9px] font-mono transition-colors ${
                speed === s
                  ? 'bg-accent-blue/30 text-accent-blue-light'
                  : 'text-slate-600 hover:text-slate-300'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* Timeline bar (visual tick marks) */}
      <div className="relative h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
        <div
          className="absolute left-0 top-0 h-full bg-accent-blue/50 rounded-full transition-none"
          style={{ width: `${progress * 100}%` }}
        />
        {/* Playhead */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-accent-blue border border-white/30 shadow transition-none"
          style={{ left: `calc(${progress * 100}% - 5px)` }}
        />
      </div>

    </div>
  )
}
