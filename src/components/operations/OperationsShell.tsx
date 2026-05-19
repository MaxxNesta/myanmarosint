'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import dynamic from 'next/dynamic'
import { jsPDF } from 'jspdf'
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
  // const [exportOpen, setExportOpen] = useState(false)

  const canvasRef = useRef<(() => HTMLCanvasElement | null) | null>(null)

  /* exportPNG — re-enable with export button
  const exportPNG = useCallback(() => {
    const canvas = canvasRef.current?.()
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `myanmar-ops-${currentDate.toISOString().slice(0, 10)}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
    setExportOpen(false)
  }, [currentDate])
  */

  /* exportPDF — re-enable with export button
  const exportPDF = useCallback(() => {
    const canvas = canvasRef.current?.()
    if (!canvas) return
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
    const W = 297, H = 210
    const mapH = H * 0.72

    // Header bar
    pdf.setFillColor(10, 14, 20)
    pdf.rect(0, 0, W, H, 'F')
    pdf.setFillColor(15, 23, 42)
    pdf.rect(0, 0, W, 14, 'F')

    pdf.setTextColor(239, 68, 68)
    pdf.setFontSize(9)
    pdf.setFont('helvetica', 'bold')
    pdf.text('MYANMAR CONFLICT OPERATIONS REPORT', 10, 9)

    pdf.setTextColor(100, 116, 139)
    pdf.setFontSize(7)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`DATE: ${currentDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}`, W - 10, 9, { align: 'right' })
    pdf.text('CLASSIFICATION: OSINT / UNCLASSIFIED', W / 2, 9, { align: 'center' })

    // Map image
    pdf.addImage(imgData, 'PNG', 0, 14, W, mapH)

    // Stats bar
    const sy = 14 + mapH + 2
    const stats = [
      { label: 'TOTAL EVENTS', value: incidents.filter(e => new Date(e.date as string) <= currentDate).length.toLocaleString() },
      { label: '30-DAY EVENTS', value: incidents.filter(e => { const d = new Date(e.date as string); return d <= currentDate && (currentDate.getTime() - d.getTime()) < 30 * 86400000 }).length.toString() },
      { label: '30-DAY KIA', value: incidents.filter(e => { const d = new Date(e.date as string); return d <= currentDate && (currentDate.getTime() - d.getTime()) < 30 * 86400000 }).reduce((s, e) => s + (e.fatalities ?? 0), 0).toString() },
      { label: 'SOURCE', value: 'ACLED / NEATOGEO OSINT' },
    ]
    const colW = W / stats.length
    stats.forEach(({ label, value }, i) => {
      const x = i * colW + 4
      pdf.setFillColor(15, 23, 42)
      pdf.rect(i * colW, sy - 1, colW - 1, H - sy + 1, 'F')
      pdf.setTextColor(100, 116, 139)
      pdf.setFontSize(5.5)
      pdf.setFont('helvetica', 'normal')
      pdf.text(label, x, sy + 4)
      pdf.setTextColor(226, 232, 240)
      pdf.setFontSize(9)
      pdf.setFont('helvetica', 'bold')
      pdf.text(value, x, sy + 10)
    })

    pdf.save(`myanmar-ops-${currentDate.toISOString().slice(0, 10)}.pdf`)
    setExportOpen(false)
  }, [currentDate, incidents])
  */

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

    type RawGeometry = { type: string; coordinates: unknown; geometries?: RawGeometry[] }
    type RawFeature  = { type: string; properties: { name?: string }; geometry: RawGeometry }

    function geometriesToPolygons(geom: RawGeometry): GeoJSON.Geometry[] {
      if (geom.type === 'Polygon') {
        const rings = cleanRings(geom.coordinates as number[][][])
        return rings.length ? [{ type: 'Polygon', coordinates: rings }] : []
      }
      if (geom.type === 'MultiPolygon') {
        return [{ type: 'MultiPolygon', coordinates: (geom.coordinates as number[][][][]).map(cleanRings) }]
      }
      if (geom.type === 'GeometryCollection') {
        return (geom.geometries ?? []).flatMap(geometriesToPolygons)
      }
      return []
    }

    function extractFeatures(phaseKey: string): GeoJSON.Feature[] {
      const names = PHASE_POLY_NAMES[phaseKey] ?? []
      const color = PHASE_COLORS[phaseKey]
      return (geo.features as RawFeature[])
        .filter(f => names.some(n => (f.properties.name ?? '').includes(n)))
        .flatMap(f =>
          geometriesToPolygons(f.geometry).map(geometry => ({
            type: 'Feature' as const,
            geometry,
            properties: { overlayColor: color, name: f.properties.name ?? '' },
          }))
        )
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

        {/* Export button — disabled for now
        <div className="relative ml-auto shrink-0">
          <button
            onClick={() => setExportOpen(v => !v)}
            className="flex items-center gap-1.5 px-2 py-1 text-[9px] font-mono text-slate-400 hover:text-slate-200 border border-white/[0.08] hover:border-white/20 rounded transition-colors bg-white/[0.03]"
          >
            ↓ EXPORT
          </button>
          {exportOpen && (
            <div className="absolute right-0 top-full mt-1 z-50 bg-[#0b0f14] border border-white/[0.10] rounded shadow-xl overflow-hidden">
              <button
                onClick={exportPNG}
                className="flex items-center gap-2 w-full px-3 py-2 text-[10px] font-mono text-slate-300 hover:bg-white/[0.06] whitespace-nowrap"
              >
                🖼 PNG — Map snapshot
              </button>
              <button
                onClick={exportPDF}
                className="flex items-center gap-2 w-full px-3 py-2 text-[10px] font-mono text-slate-300 hover:bg-white/[0.06] whitespace-nowrap border-t border-white/[0.06]"
              >
                📄 PDF — Full report
              </button>
            </div>
          )}
        </div>
        */}
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
          canvasRef={canvasRef}
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
