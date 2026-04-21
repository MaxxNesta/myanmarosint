const COLORS: Record<number, { bg: string; text: string; border: string }> = {
  1: { bg: 'bg-green-900/30',  text: 'text-green-400',  border: 'border-green-500/30' },
  2: { bg: 'bg-lime-900/30',   text: 'text-lime-400',   border: 'border-lime-500/30'  },
  3: { bg: 'bg-amber-900/30',  text: 'text-amber-400',  border: 'border-amber-500/30' },
  4: { bg: 'bg-orange-900/30', text: 'text-orange-400', border: 'border-orange-500/30'},
  5: { bg: 'bg-red-900/30',    text: 'text-red-400',    border: 'border-red-500/30'   },
}

interface Props {
  level: 1 | 2 | 3 | 4 | 5
  label: string
}

export default function ThreatconBanner({ level, label }: Props) {
  const c = COLORS[level]
  return (
    <div className={`${c.bg} ${c.border} border-b px-5 py-3 flex items-center gap-3`}>
      <span className="live-dot" />
      <span className={`font-mono text-xs font-bold tracking-widest ${c.text}`}>
        THREATCON {level} — {label}
      </span>
      <span className="text-slate-500 text-xs font-mono ml-auto hidden sm:inline">
        Myanmar Geopolitical Risk Platform · OSINT · UNCLASSIFIED
      </span>
    </div>
  )
}
