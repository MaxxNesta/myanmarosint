'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import type { ProcessedEventDTO, RiskScoreDTO, EventType, ConflictEventDTO } from '@/lib/types'
import { EVENT_TYPE_META, CONFLICT_EVENT_META, CONFLICT_TYPE_GROUP } from '@/lib/types'
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

const POLL_INTERVAL_MS = 5 * 60 * 1000

type ConflictGroup = 'combat' | 'territorial' | 'humanitarian' | 'political'

const GROUP_META: Record<ConflictGroup, { label: string; color: string }> = {
  combat:       { label: 'Combat',       color: '#ef4444' },
  territorial:  { label: 'Territorial',  color: '#7c3aed' },
  humanitarian: { label: 'Humanitarian', color: '#06b6d4' },
  political:    { label: 'Political',    color: '#8b5cf6' },
}

interface Props {
  initialEvents:     ProcessedEventDTO[]
  initialRiskScores: RiskScoreDTO[]
}

export default function MapShell({ initialEvents, initialRiskScores }: Props) {
  const [events, setEvents]           = useState<ProcessedEventDTO[]>(initialEvents)
  const [conflictEvents, setConflict] = useState<ConflictEventDTO[]>([])
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [polling, setPolling]         = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    if (window.innerWidth < 768) setSidebarOpen(false)
  }, [])

  const today    = useMemo(() => new Date(), [])
  const allDates = useMemo(() => ({ min: new Date('2021-01-01'), max: today }), [today])

  const [activeLayers,    setActiveLayers]    = useState<Set<EventType>>(new Set(Object.keys(EVENT_TYPE_META) as EventType[]))
  const [dateRange,       setDateRange]        = useState<[Date, Date]>([allDates.min, today])
  const [showRisk,        setShowRisk]         = useState(false)
  const [showConflict,    setShowConflict]     = useState(true)
  const [conflictGroups,  setConflictGroups]   = useState<Set<ConflictGroup>>(new Set(['combat', 'territorial', 'humanitarian', 'political']))
  const [actorSearch,     setActorSearch]      = useState('')

  // Load conflict events once on mount
  useEffect(() => {
    fetch('/api/conflict-events?days=730&limit=3000&minConfidence=0.3')
      .then(r => r.json())
      .then(d => setConflict(d.events ?? []))
      .catch(() => {})
  }, [])

  function toggleLayer(type: EventType) {
    setActiveLayers(prev => {
      const next = new Set(prev)
      next.has(type) ? next.delete(type) : next.add(type)
      return next
    })
  }

  function toggleGroup(g: ConflictGroup) {
    setConflictGroups(prev => {
      const next = new Set(prev)
      next.has(g) ? next.delete(g) : next.add(g)
      return next
    })
  }

  const fetchLatestEvents = useCallback(async () => {
    setPolling(true)
    try {
      const res  = await fetch('/api/events?limit=500', { cache: 'no-store' })
      if (!res.ok) return
      const data = await res.json() as { events?: ProcessedEventDTO[] }
      if (data.events?.length) { setEvents(data.events); setLastUpdated(new Date()) }
    } catch { /* keep stale */ } finally { setPolling(false) }
  }, [])

  useEffect(() => {
    const id = setInterval(fetchLatestEvents, POLL_INTERVAL_MS)
    return () => clearInterval(id)
  }, [fetchLatestEvents])

  const filteredEvents = useMemo(
    () => events.filter(e => {
      const d = new Date(e.date)
      return activeLayers.has(e.type) && d >= dateRange[0] && d <= dateRange[1]
    }),
    [events, activeLayers, dateRange],
  )

  const filteredConflict = useMemo(() => {
    if (!showConflict) return []
    const q = actorSearch.toLowerCase()
    return conflictEvents.filter(e => {
      const d = new Date(e.date)
      if (d < dateRange[0] || d > dateRange[1]) return false
      if (!conflictGroups.has(CONFLICT_TYPE_GROUP[e.eventType])) return false
      if (q && !e.actors.some(a => a.toLowerCase().includes(q))) return false
      return true
    })
  }, [conflictEvents, showConflict, conflictGroups, actorSearch, dateRange])

  const isEmpty = events.length === 0

  return (
    <div className="flex h-[calc(100vh-3.5rem)] relative overflow-hidden">

      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-30 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <aside className={`
        flex flex-col bg-surface-1 border-r border-white/[0.07] overflow-hidden
        transition-all duration-300 ease-in-out shrink-0
        fixed md:relative z-40 md:z-auto
        h-[calc(100vh-3.5rem)] top-14 md:top-auto
        ${sidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full md:translate-x-0'}
      `}>

        {/* Header */}
        <div className="panel-header flex items-center justify-between px-3 py-2 border-b border-white/[0.07] shrink-0">
          <span className="text-xs font-bold tracking-widest text-slate-300 font-mono">LAYERS</span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-mono">{filteredEvents.length} events</span>
            <button onClick={() => setSidebarOpen(false)} className="text-slate-500 hover:text-slate-300 text-lg leading-none px-1">×</button>
          </div>
        </div>

        {/* Event layer toggles */}
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

        {/* ── Incident Intel section ───────────────────────────────────────── */}
        <div className="px-3 py-2 border-b border-white/[0.07] space-y-2">
          {/* Section header + master toggle */}
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-mono text-slate-500 tracking-widest uppercase">Incident Intel</span>
            <button
              onClick={() => setShowConflict(v => !v)}
              className={`text-[9px] font-mono px-2 py-0.5 rounded transition-colors ${
                showConflict
                  ? 'bg-accent-red/20 text-red-400 border border-red-500/30'
                  : 'text-slate-600 border border-white/[0.06]'
              }`}
            >
              {showConflict ? 'ON' : 'OFF'}
            </button>
          </div>

          {showConflict && (
            <>
              {/* Group toggles */}
              <div className="grid grid-cols-2 gap-1">
                {(Object.entries(GROUP_META) as [ConflictGroup, typeof GROUP_META[ConflictGroup]][]).map(([g, m]) => {
                  const on = conflictGroups.has(g)
                  return (
                    <button
                      key={g}
                      onClick={() => toggleGroup(g)}
                      className={`flex items-center gap-1.5 px-2 py-1 rounded text-[9px] font-mono transition-colors ${
                        on ? 'bg-white/[0.05] text-slate-300' : 'text-slate-600 opacity-50'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: on ? m.color : '#475569' }} />
                      {m.label}
                    </button>
                  )
                })}
              </div>

              {/* Actor search */}
              <input
                type="text"
                placeholder="Filter by actor…"
                value={actorSearch}
                onChange={e => setActorSearch(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded px-2 py-1 text-[10px] font-mono text-slate-300 placeholder-slate-600 focus:outline-none focus:border-accent-blue/40"
              />

              {/* Count */}
              <div className="text-[9px] font-mono text-slate-600">
                {filteredConflict.length} incidents · {conflictEvents.length} total
              </div>
            </>
          )}
        </div>

        {/* Live update status */}
        <div className="px-3 py-2 border-b border-white/[0.07] flex items-center gap-2 shrink-0">
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${polling ? 'bg-yellow-400 animate-pulse' : 'bg-green-500'}`} />
          <span className="text-[10px] font-mono text-slate-500 truncate">
            {polling ? 'Updating…' : `Updated ${lastUpdated.toLocaleTimeString()}`}
          </span>
          <button onClick={fetchLatestEvents} disabled={polling} className="ml-auto text-[10px] font-mono text-slate-500 hover:text-slate-300 disabled:opacity-40">↺</button>
        </div>

        {/* Risk panel */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <RiskPanel scores={initialRiskScores} />
        </div>
      </aside>

      {/* ── Map + timeline ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 relative">

          <button
            onClick={() => setSidebarOpen(v => !v)}
            className="absolute top-3 left-3 z-20 flex items-center gap-1.5 px-2.5 py-1.5 bg-surface-1/90 backdrop-blur border border-white/[0.10] rounded text-xs font-mono text-slate-300 hover:bg-surface-1 transition-colors shadow-lg"
          >
            <span className="text-base leading-none">{sidebarOpen ? '◀' : '▶'}</span>
            <span className="hidden sm:inline">{sidebarOpen ? 'Hide' : 'Layers'}</span>
          </button>

          {/* Incident legend — floats bottom-right */}
          {showConflict && filteredConflict.length > 0 && (
            <div className="absolute bottom-4 right-4 z-20 bg-surface-1/90 backdrop-blur border border-white/[0.10] rounded px-3 py-2 shadow-lg max-h-48 overflow-y-auto">
              <div className="text-[9px] font-mono text-slate-500 tracking-widest mb-1.5 uppercase">Incident Type</div>
              {(Object.entries(CONFLICT_EVENT_META) as [string, { color: string; label: string }][]).map(([k, m]) => (
                <div key={k} className="flex items-center gap-2 mb-1 last:mb-0">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: m.color }} />
                  <span className="text-[9px] font-mono text-slate-400">{m.label}</span>
                </div>
              ))}
            </div>
          )}

          {isEmpty && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-surface-0/80 gap-3 pointer-events-none">
              <span className="text-xs font-mono text-slate-400 tracking-widest">NO EVENT DATA</span>
              <a href="/admin" className="pointer-events-auto text-[11px] font-mono text-accent-blue-light border border-accent-blue/30 px-3 py-1 rounded hover:bg-accent-blue/10 transition-colors">
                Go to Admin → Trigger Ingest
              </a>
            </div>
          )}

          <MapView
            events={filteredEvents}
            conflictEvents={filteredConflict}
            showHeatmap={showRisk}
            showConflict={showConflict}
          />
        </div>

        <div className="h-20 bg-surface-1 border-t border-white/[0.07] px-4 sm:px-6 flex items-center">
          <TimelineSlider min={allDates.min} max={allDates.max} value={dateRange} onChange={setDateRange} />
        </div>
      </div>
    </div>
  )
}
