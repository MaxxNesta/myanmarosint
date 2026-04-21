'use client'

import { useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import type { ProcessedEventDTO, RiskScoreDTO, EventType } from '@/lib/types'
import { EVENT_TYPE_META } from '@/lib/types'
import LayerToggle from './LayerToggle'
import TimelineSlider from './TimelineSlider'
import RiskPanel from '../shared/RiskPanel'

const MapView = dynamic(() => import('./MapView'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-surface-1">
      <div className="text-xs font-mono text-slate-500 animate-pulse">Initializing map…</div>
    </div>
  ),
})

interface Props {
  initialEvents:    ProcessedEventDTO[]
  initialRiskScores: RiskScoreDTO[]
}

export default function MapShell({ initialEvents, initialRiskScores }: Props) {
  const allDates = useMemo(() => {
    const dates = initialEvents
      .map(e => new Date(e.date).getTime())
      .filter(Boolean)
    return dates.length
      ? { min: new Date(Math.min(...dates)), max: new Date(Math.max(...dates)) }
      : { min: new Date(Date.now() - 365 * 86400_000), max: new Date() }
  }, [initialEvents])

  const [activeLayers, setActiveLayers] = useState<Set<EventType>>(
    new Set(Object.keys(EVENT_TYPE_META) as EventType[]),
  )
  const [dateRange, setDateRange] = useState<[Date, Date]>([allDates.min, allDates.max])
  const [showRisk, setShowRisk] = useState(false)

  function toggleLayer(type: EventType) {
    setActiveLayers(prev => {
      const next = new Set(prev)
      next.has(type) ? next.delete(type) : next.add(type)
      return next
    })
  }

  const filteredEvents = useMemo(
    () =>
      initialEvents.filter(e => {
        const d = new Date(e.date)
        return activeLayers.has(e.type) && d >= dateRange[0] && d <= dateRange[1]
      }),
    [initialEvents, activeLayers, dateRange],
  )

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* ── Left sidebar ──────────────────────────────── */}
      <aside className="w-64 shrink-0 bg-surface-1 border-r border-white/[0.07] flex flex-col overflow-hidden">
        <div className="panel-header">
          <span className="text-xs font-bold tracking-widest text-slate-300 font-mono">LAYERS</span>
          <span className="text-xs text-slate-500 font-mono">{filteredEvents.length} events</span>
        </div>

        <div className="p-3 space-y-2 border-b border-white/[0.07]">
          <LayerToggle activeLayers={activeLayers} onToggle={toggleLayer} />
        </div>

        {/* Heatmap toggle */}
        <div className="px-3 py-2 border-b border-white/[0.07]">
          <button
            onClick={() => setShowRisk(v => !v)}
            className={`w-full text-left px-3 py-2 rounded text-xs font-mono tracking-wide transition-colors ${
              showRisk
                ? 'bg-accent-blue/20 text-accent-blue-light border border-accent-blue/30'
                : 'text-slate-400 hover:bg-white/[0.04] border border-transparent'
            }`}
          >
            🌡 Risk Heatmap
          </button>
        </div>

        {/* Risk panel */}
        <div className="flex-1 overflow-hidden">
          <RiskPanel scores={initialRiskScores} />
        </div>
      </aside>

      {/* ── Map area ──────────────────────────────────── */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 relative">
          <MapView
            events={filteredEvents}
            showHeatmap={showRisk}
          />
        </div>

        {/* Timeline slider at bottom */}
        <div className="h-20 bg-surface-1 border-t border-white/[0.07] px-6 flex items-center">
          <TimelineSlider
            min={allDates.min}
            max={allDates.max}
            value={dateRange}
            onChange={setDateRange}
          />
        </div>
      </div>
    </div>
  )
}
