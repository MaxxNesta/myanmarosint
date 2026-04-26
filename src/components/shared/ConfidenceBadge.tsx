import clsx from 'clsx'

interface Props {
  value: number   // 0–1
  size?: 'sm' | 'md'
}

function label(v: number): string {
  if (v >= 0.85) return 'HIGH'
  if (v >= 0.65) return 'MEDIUM'
  if (v >= 0.45) return 'LOW'
  return 'VERY LOW'
}

function colorClass(v: number): string {
  if (v >= 0.85) return 'text-green-400  border-green-400/30  bg-green-400/10'
  if (v >= 0.65) return 'text-amber-400  border-amber-400/30  bg-amber-400/10'
  if (v >= 0.45) return 'text-orange-400 border-orange-400/30 bg-orange-400/10'
  return              'text-red-400    border-red-400/30    bg-red-400/10'
}

export default function ConfidenceBadge({ value, size = 'sm' }: Props) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded border font-mono font-semibold tracking-widest',
        colorClass(value),
        size === 'sm' ? 'px-1.5 py-0.5 text-[0.6rem]' : 'px-2 py-1 text-xs',
      )}
      title={`Confidence: ${(value * 100).toFixed(0)}%`}
    >
      {label(value)}
      <span className="opacity-60">{(value * 100).toFixed(0)}%</span>
    </span>
  )
}
