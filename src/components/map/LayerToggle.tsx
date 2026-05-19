import type { EventType } from '@/lib/types'
import { EVENT_TYPE_META } from '@/lib/types'
import clsx from 'clsx'

interface Props {
  activeLayers: Set<EventType>
  onToggle:     (type: EventType) => void
}

export default function LayerToggle({ activeLayers, onToggle }: Props) {
  return (
    <div className="space-y-1">
      {(Object.entries(EVENT_TYPE_META) as [EventType, typeof EVENT_TYPE_META[EventType]][]).map(
        ([type, meta]) => {
          const active = activeLayers.has(type)
          return (
            <button
              key={type}
              onClick={() => onToggle(type)}
              className={clsx(
                'w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs font-medium transition-all',
                active
                  ? 'bg-white/[0.06] text-slate-200'
                  : 'text-slate-500 hover:bg-white/[0.03]',
              )}
            >
              {/* Color dot */}
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0 transition-opacity"
                style={{
                  background:  active ? meta.color : 'transparent',
                  border:      `2px solid ${meta.color}`,
                  opacity:     active ? 1 : 0.4,
                }}
              />
              <span>{meta.icon} {meta.label}</span>
              {active && (
                <span
                  className="ml-auto text-[0.6rem] font-bold px-1 py-0.5 rounded"
                  style={{ background: `${meta.color}22`, color: meta.color }}
                >
                  ON
                </span>
              )}
            </button>
          )
        },
      )}
    </div>
  )
}
