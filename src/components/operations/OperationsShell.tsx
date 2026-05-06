'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import dynamic from 'next/dynamic'
import { ACTORS, CAMPAIGNS, TOWN_CONTROL_EVENTS } from '@/lib/operations-data'
import type { ActorId, Campaign, TownControlEvent } from '@/lib/operations-types'
import type { ConflictEventDTO } from '@/lib/types'
import { parseNeatogeo } from '@/lib/parse-neatogeo'
import TimelineControl from './TimelineControl'
import MomentumPanel from './MomentumPanel'
import OperationsPanel, { PHASE_COLORS, PHASE_POLY_NAMES } from './OperationsPanel'

const OperationsMap = dynamic(() => import('./OperationsMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#0a0e14]">
      <div className="text-xs font-mono text-slate-500 animate-pulse">Initializing operations map…</div>
    </div>
  ),
})

type Speed = 0.5 | 1 | 2 | 5

const DEFAULT_MIN   = new Date('2021-02-01')
const DEFAULT_MAX   = new Date()
const DEFAULT_START = new Date()

const ALL_ACTOR_IDS = Object.keys(ACTORS) as ActorId[]

export default function OperationsShell() {
  const [currentDate,      setCurrentDate]  = useState<Date>(DEFAULT_START)
  const [minDate,          setMinDate]      = useState<Date>(DEFAULT_MIN)
  const [maxDate]                           = useState<Date>(DEFAULT_MAX)
  const [playing,          setPlaying]      = useState(false)
  const [speed,            setSpeed]        = useState<Speed>(1)
  const [incidents,        setIncidents]    = useState<ConflictEventDTO[]>([])
  const [incidentsLoading, setLoading]      = useState(true)
  const [actorFilter,      setActorFilter]  = useState<Set<ActorId>>(new Set())
  const [legendOpen,       setLegendOpen]   = useState(false)
  const [activePhase,      setActivePhase]  = useState<string | null>(null)
  const [rawNeatogeo,      setRawNeatogeo]  = useState<{ features: unknown[] } | null>(null)
  const [flyToTown,        setFlyToTown]    = useState<string | null>(null)

  const campaigns:    Campaign[]         = CAMPAIGNS
  const controlEvents: TownControlEvent[] = TOWN_CONTROL_EVENTS

  useEffect(() => {
    setLoading(true)
    Promise.all([
      fetch('/data/neatogeo-myanmar.geojson').then(r => r.json()),
      fetch('/data/state-regions.geojson').then(r => r.json()),
    ])
      .then(([geojson, stateGeoJSON]) => {
        setRawNeatogeo(geojson)
        const evts: ConflictEventDTO[] = parseNeatogeo(geojson, stateGeoJSON.features)
        setIncidents(evts)
        if (evts.length > 0) {
          const dates = evts.map(e => new Date(e.date as string).getTime()).filter(n => !isNaN(n))
          const earliest = new Date(Math.min(...dates))
          if (earliest < DEFAULT_MIN) setMinDate(earliest)
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const playRef = useRef(playing)
  useEffect(() => { playRef.current = playing }, [playing])

  useEffect(() => {
    if (!playing) return
    const DAYS_PER_TICK = 2 * speed
    const id = setInterval(() => {
      setCurrentDate(prev => {
        const next = new Date(prev.getTime() + DAYS_PER_TICK * 86400000)
        if (next >= maxDate) { setPlaying(false); return maxDate }
        return next
      })
    }, 50)
    return () => clearInterval(id)
  }, [playing, speed, maxDate])

  const stats = useMemo(() => {
    const cutoff = currentDate
    const recent = incidents.filter(e => {
      const d = new Date(e.date as string)
      return d <= cutoff && (cutoff.getTime() - d.getTime()) < 30 * 86400000
    })
    const total      = incidents.filter(e => new Date(e.date as string) <= cutoff).length
    const fatalities = recent.reduce((s, e) => s + (e.fatalities ?? 0), 0)
    const hotZones   = new Set(recent.map(e => e.region)).size
    return { total, recent: recent.length, fatalities, hotZones }
  }, [incidents, currentDate])

  const operationOverlay = useMemo((): GeoJSON.FeatureCollection | null => {
    if (!activePhase || !rawNeatogeo) return null
    const geo = rawNeatogeo

    function cleanRings(rings: number[][][]): number[][][] {
      return rings
        .map(ring => ring.filter(([lng, lat]) => !(lng === 0 && lat === 0)))
        .filter(ring => ring.length >= 4)
    }

    type RawFeature = {
      type: string
      properties: { name?: string }
      geometry: { type: string; coordinates: unknown }
    }

    function extractFeatures(phaseKey: string): GeoJSON.Feature[] {
      const names = PHASE_POLY_NAMES[phaseKey] ?? []
      const color = PHASE_COLORS[phaseKey]
      return (geo.features as RawFeature[])
        .filter(f => f.geometry.type === 'Polygon' || f.geometry.type === 'MultiPolygon')
        .filter(f => names.some(n => (f.properties.name ?? '').includes(n)))
        .map(f => {
          const geometry: GeoJSON.Geometry = f.geometry.type === 'Polygon'
            ? { type: 'Polygon', coordinates: cleanRings(f.geometry.coordinates as number[][][]) }
            : { type: 'MultiPolygon', coordinates: (f.geometry.coordinates as number[][][][]).map(cleanRings) }
          return {
            type: 'Feature' as const,
            geometry,
            properties: { overlayColor: color, name: f.properties.name ?? '' },
          }
        })
    }

    const phaseKeys = activePhase === 'combined' ? ['1027-1', '1027-2'] : [activePhase]
    const features  = phaseKeys.flatMap(extractFeatures)
    return { type: 'FeatureCollection', features }
  }, [activePhase, rawNeatogeo])

  const toggleActor = useCallback((id: ActorId) => {
    setActorFilter(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }, [])

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden bg-[#0a0e14]">

      {/* ── Top header bar ───────────────────────────────────────────── */}
      <div className="h-10 bg-[#0b0f14] border-b border-white/[0.07] flex items-center px-3 gap-3 shrink-0 overflow-x-auto scrollbar-none">

        {/* Title */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shrink-0" />
          <span className="text-[10px] font-mono font-bold tracking-widest text-red-400 whitespace-nowrap">OPS TIMELINE</span>
          <span className="text-[9px] font-mono text-slate-600 hidden md:inline whitespace-nowrap">
            Myanmar · {currentDate.toISOString().slice(0, 10)}
          </span>
        </div>

        <div className="w-px h-4 bg-white/[0.07] shrink-0" />

        {/* Stats — hide lower-priority ones on small screens */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[9px] font-mono text-slate-600 uppercase tracking-widest hidden sm:inline">Events</span>
          <span className="text-sm font-bold font-mono text-slate-200">{stats.total.toLocaleString()}</span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[9px] font-mono text-slate-600 uppercase tracking-widest hidden sm:inline">30d</span>
          <span className="text-sm font-bold font-mono" style={{ color: stats.recent > 20 ? '#ef4444' : '#f59e0b' }}>
            {stats.recent}
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 shrink-0">
          <span className="text-[9px] font-mono text-slate-600 uppercase tracking-widest">KIA</span>
          <span className="text-sm font-bold font-mono text-red-400">{stats.fatalities}</span>
        </div>

        <div className="hidden md:flex items-center gap-1.5 shrink-0">
          <span className="text-[9px] font-mono text-slate-600 uppercase tracking-widest">Zones</span>
          <span className="text-sm font-bold font-mono text-orange-400">{stats.hotZones}</span>
        </div>

        {incidentsLoading && (
          <div className="w-3 h-3 border border-blue-500/30 border-t-blue-500 rounded-full animate-spin shrink-0 ml-auto" />
        )}
      </div>

      {/* ── Map area ─────────────────────────────────────────────────── */}
      <div className="flex-1 relative overflow-hidden">
        <OperationsMap
          currentDate={currentDate}
          campaigns={campaigns}
          controlEvents={controlEvents}
          incidents={incidents}
          actorFilter={actorFilter}
          operationOverlay={operationOverlay}
          flyToTown={flyToTown}
        />

        {/* ── Momentum Panel (top-left) ────────────────────────────── */}
        <MomentumPanel
          currentDate={currentDate}
          incidents={incidents}
          controlEvents={controlEvents}
        />

        {/* ── Actor Legend / Filter (bottom-left) ─────────────────── */}
        <div className="absolute bottom-4 left-3 z-20">
          <button
            onClick={() => setLegendOpen(v => !v)}
            className="mb-1 flex items-center gap-1.5 px-2 py-1 bg-[#0b0f14]/90 backdrop-blur border border-white/[0.10] rounded text-[9px] font-mono text-slate-400 hover:text-slate-200 transition-colors"
          >
            <span>⊞</span>
            <span className="tracking-widest">ACTORS</span>
            <span className="text-slate-600">{legendOpen ? '▲' : '▼'}</span>
          </button>

          {legendOpen && (
            <div className="bg-[#0b0f14]/95 backdrop-blur border border-white/[0.10] rounded shadow-xl p-2 space-y-0.5 w-44 max-h-64 overflow-y-auto">
              {ALL_ACTOR_IDS.map(id => {
                const actor  = ACTORS[id]
                const active = actorFilter.size === 0 || actorFilter.has(id)
                return (
                  <button
                    key={id}
                    onClick={() => toggleActor(id)}
                    className={`w-full flex items-center gap-2 px-2 py-1 rounded text-left transition-colors ${
                      active ? 'bg-white/[0.04] hover:bg-white/[0.07]' : 'opacity-35 hover:opacity-60'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: actor.color }} />
                    <span className="text-[9px] font-mono text-slate-300 truncate">{actor.shortName}</span>
                    <span className="ml-auto text-[8px] font-mono text-slate-600">
                      {actor.side === 'junta' ? 'JNT' : 'RES'}
                    </span>
                  </button>
                )
              })}
              {actorFilter.size > 0 && (
                <button
                  onClick={() => setActorFilter(new Set())}
                  className="w-full mt-1 pt-1 border-t border-white/[0.07] text-[8px] font-mono text-slate-600 hover:text-slate-300 text-center transition-colors"
                >
                  Clear filter
                </button>
              )}
            </div>
          )}
        </div>

        {/* ── Operations Panel (right) ────────────────────────────── */}
        <OperationsPanel
          currentDate={currentDate}
          activePhase={activePhase}
          onPhaseChange={setActivePhase}
          onTownClick={setFlyToTown}
        />

        {/* ── Date overlay (top-right) ─────────────────────────────── */}
        <div className="absolute top-3 right-12 z-10 pointer-events-none">
          <div className="px-2.5 py-1.5 bg-[#0b0f14]/90 backdrop-blur border border-white/[0.08] rounded text-[10px] font-mono text-slate-300 text-right">
            <div className="text-[8px] text-slate-600 tracking-widest mb-0.5">TIMELINE</div>
            <div className="font-bold">
              {currentDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Timeline control ─────────────────────────────────────────── */}
      <TimelineControl
        currentDate={currentDate}
        minDate={minDate}
        maxDate={maxDate}
        playing={playing}
        speed={speed as 0.5 | 1 | 2 | 5}
        onDateChange={setCurrentDate}
        onPlayPause={() => setPlaying(v => !v)}
        onSpeedChange={s => setSpeed(s as Speed)}
      />
    </div>
  )
}
