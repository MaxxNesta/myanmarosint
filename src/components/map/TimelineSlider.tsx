'use client'

import { useRef, useCallback, useEffect } from 'react'
import { format } from 'date-fns'

interface Props {
  min:      Date
  max:      Date
  value:    [Date, Date]
  onChange: (range: [Date, Date]) => void
}

export default function TimelineSlider({ min, max, value, onChange }: Props) {
  const trackRef  = useRef<HTMLDivElement>(null)
  const dragging  = useRef<'start' | 'end' | null>(null)

  const rangeMs = max.getTime() - min.getTime()

  function toPct(date: Date) {
    if (rangeMs <= 0) return 0
    return Math.max(0, Math.min(100, ((date.getTime() - min.getTime()) / rangeMs) * 100))
  }

  function toDate(pct: number) {
    return new Date(min.getTime() + (Math.max(0, Math.min(100, pct)) / 100) * rangeMs)
  }

  function pctFromPointer(clientX: number): number {
    if (!trackRef.current) return 0
    const rect = trackRef.current.getBoundingClientRect()
    return Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100))
  }

  const startPct = toPct(value[0])
  const endPct   = toPct(value[1])

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    const pct = pctFromPointer(e.clientX)
    const distStart = Math.abs(pct - startPct)
    const distEnd   = Math.abs(pct - endPct)
    dragging.current = distStart <= distEnd ? 'start' : 'end'
  }, [startPct, endPct])

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0]
    const pct   = pctFromPointer(touch.clientX)
    const distStart = Math.abs(pct - startPct)
    const distEnd   = Math.abs(pct - endPct)
    dragging.current = distStart <= distEnd ? 'start' : 'end'
  }, [startPct, endPct])

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (!dragging.current) return
      const pct  = pctFromPointer(e.clientX)
      const date = toDate(pct)
      if (dragging.current === 'start' && date < value[1])
        onChange([date, value[1]])
      if (dragging.current === 'end' && date > value[0])
        onChange([value[0], date])
    }

    function onTouchMove(e: TouchEvent) {
      if (!dragging.current) return
      const pct  = pctFromPointer(e.touches[0].clientX)
      const date = toDate(pct)
      if (dragging.current === 'start' && date < value[1])
        onChange([date, value[1]])
      if (dragging.current === 'end' && date > value[0])
        onChange([value[0], date])
    }

    function onUp() { dragging.current = null }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup',   onUp)
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('touchend',  onUp)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup',   onUp)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend',  onUp)
    }
  }, [value, onChange, min, max])

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between text-xs font-mono text-slate-500">
        <span>{format(min, 'yyyy')}</span>
        <span className="text-slate-300">
          {format(value[0], 'dd MMM yyyy')} — {format(value[1], 'dd MMM yyyy')}
        </span>
        <span>{format(max, 'dd MMM yyyy')}</span>
      </div>

      {/* Track */}
      <div
        ref={trackRef}
        className="relative h-6 flex items-center select-none cursor-pointer"
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
      >
        {/* Background */}
        <div className="absolute inset-x-0 h-1 rounded-full bg-white/[0.08]" />

        {/* Active fill */}
        <div
          className="absolute h-1 rounded-full bg-accent-blue pointer-events-none"
          style={{ left: `${startPct}%`, right: `${100 - endPct}%` }}
        />

        {/* Start thumb */}
        <div
          className="absolute w-3.5 h-3.5 rounded-full bg-accent-blue border-2 border-white/50 pointer-events-none z-30 -translate-x-1/2 shadow-lg"
          style={{ left: `${startPct}%` }}
        />

        {/* End thumb */}
        <div
          className="absolute w-3.5 h-3.5 rounded-full bg-white border-2 border-accent-blue/70 pointer-events-none z-30 -translate-x-1/2 shadow-lg"
          style={{ left: `${endPct}%` }}
        />
      </div>
    </div>
  )
}
