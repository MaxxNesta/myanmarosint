'use client'

import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import {
  BASES, STATUS_COLORS, STATUS_LABELS, baseStats,
  type MilitaryBase, type BaseStatus, type ThreatLevel,
} from '@/lib/bases-data'
import type { AreaSelection, ScenarioAnalysis } from '@/lib/analyze-types'
import type { ConflictEventDTO } from '@/lib/types'
import ScenarioPanel from './ScenarioPanel'

const BasesMap = dynamic(() => import('./BasesMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-surface-1">
      <div className="text-xs font-mono text-slate-500 animate-pulse">Initializing map…</div>
    </div>
  ),
})

const ALL_STATUSES: BaseStatus[] = ['OPERATIONAL', 'CONTESTED', 'SEIZED_PDF', 'SEIZED_EAO', 'UNKNOWN']
const ALL_REGIONS = Array.from(new Set(BASES.map(b => b.region))).sort()

const LAYER_META: Record<BaseStatus, { icon: string; label: string }> = {
  OPERATIONAL: { icon: '●', label: 'Operational'  },
  CONTESTED:   { icon: '◆', label: 'Contested'    },
  SEIZED_PDF:  { icon: '▲', label: 'Seized — PDF' },
  SEIZED_EAO:  { icon: '▲', label: 'Seized — EAO' },
  UNKNOWN:     { icon: '○', label: 'Unknown'       },
}

const RISK_COLORS: Record<string, string> = {
  CRITICAL: '#dc2626',
  HIGH:     '#ef4444',
  MEDIUM:   '#f59e0b',
  LOW:      '#22c55e',
}

function StatPill({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className="flex items-center gap-2 px-4 h-full border-r border-white/[0.07] last:border-r-0 shrink-0">
      {color && <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color }} />}
      <span className="text-[10px] font-mono text-slate-500 tracking-widest uppercase">{label}</span>
      <span className="text-sm font-bold font-mono text-slate-200">{value}</span>
    </div>
  )
}

// Get bounding box of a polygon feature with buffer in degrees
function getPolygonBBox(polygon: object, buffer = 0.5): [number, number, number, number] {
  try {
    const coords = (polygon as { geometry: { coordinates: number[][][] } }).geometry.coordinates[0]
    let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity
    coords.forEach(([lng, lat]) => {
      if (lng < minLng) minLng = lng
      if (lat < minLat) minLat = lat
      if (lng > maxLng) maxLng = lng
      if (lat > maxLat) maxLat = lat
    })
    return [minLng - buffer, minLat - buffer, maxLng + buffer, maxLat + buffer]
  } catch { return [-180, -90, 180, 90] }
}

export default function BasesShell() {
  const [selected,        setSelected]        = useState<number | null>(null)
  const [filterRegion,    setFilterRegion]    = useState<string>('')
  const [filterThreat,    setFilterThreat]    = useState<ThreatLevel | ''>('')
  const [visibleStatuses, setVisibleStatuses] = useState<Set<BaseStatus>>(new Set(ALL_STATUSES))
  const [sidebarOpen,        setSidebarOpen]        = useState(true)
  const [scenarioPanelOpen,  setScenarioPanelOpen]  = useState(false)
  const [search,             setSearch]             = useState('')

  // Commander dashboard state
  const [areaSelection,   setAreaSelection]   = useState<AreaSelection | null>(null)
  const [analysis,        setAnalysis]        = useState<ScenarioAnalysis | null>(null)
  const [analyzing,       setAnalyzing]       = useState(false)
  const [analyzeError,    setAnalyzeError]    = useState<string | null>(null)
  const [clearSignal,     setClearSignal]     = useState(0)
  const [conflictEvents,  setConflictEvents]  = useState<ConflictEventDTO[]>([])

  const analyzeAbortRef = useRef<AbortController | null>(null)

  const stats = useMemo(() => baseStats(BASES), [])

  // Close sidebar by default on mobile
  useEffect(() => {
    if (window.innerWidth < 768) setSidebarOpen(false)
  }, [])

  // Auto-open scenario sheet on mobile when analysis arrives
  useEffect(() => {
    if (analysis && window.innerWidth < 768) setScenarioPanelOpen(true)
  }, [analysis])

  // Load recent conflict events for the news feed
  useEffect(() => {
    fetch('/api/conflict-events?limit=3000&days=90')
      .then(r => r.json())
      .then(d => setConflictEvents(d.events ?? []))
      .catch(() => {})
  }, [])

  function toggleLayer(s: BaseStatus) {
    setVisibleStatuses(prev => {
      const next = new Set(prev)
      next.has(s) ? next.delete(s) : next.add(s)
      return next
    })
  }

  const filtered = useMemo<MilitaryBase[]>(() => {
    return BASES.filter(b => {
      if (filterRegion && b.region !== filterRegion) return false
      if (filterThreat && b.threat !== filterThreat) return false
      if (search) {
        const q = search.toLowerCase()
        return (
          b.regimentEn.toLowerCase().includes(q) ||
          b.locationEn.toLowerCase().includes(q) ||
          b.region.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [filterRegion, filterThreat, search])

  const visibleIds = useMemo<Set<number>>(
    () => new Set(filtered.filter(b => visibleStatuses.has(b.status)).map(b => b.id)),
    [filtered, visibleStatuses]
  )

  const handleSelect = useCallback((id: number) => {
    setSelected(prev => prev === id ? null : id)
  }, [])

  const selectedBase = selected ? BASES.find(b => b.id === selected) : null

  // Events near the drawn polygon
  const nearbyEvents = useMemo<ConflictEventDTO[]>(() => {
    if (!areaSelection?.polygon) return []
    const [minLng, minLat, maxLng, maxLat] = getPolygonBBox(areaSelection.polygon)
    return conflictEvents.filter(e =>
      e.lat !== null && e.lng !== null &&
      e.lat >= minLat && e.lat <= maxLat &&
      e.lng >= minLng && e.lng <= maxLng
    ).slice(0, 100)
  }, [areaSelection, conflictEvents])

  const runAnalysis = useCallback(async (sel: AreaSelection) => {
    if (analyzeAbortRef.current) analyzeAbortRef.current.abort()
    const ctrl = new AbortController()
    analyzeAbortRef.current = ctrl

    setAnalyzing(true)
    setAnalysis(null)
    setAnalyzeError(null)

    try {
      const bbox = getPolygonBBox(sel.polygon)
      const eventsInBBox = conflictEvents.filter(e =>
        e.lat !== null && e.lng !== null &&
        e.lat >= bbox[1] && e.lat <= bbox[3] &&
        e.lng >= bbox[0] && e.lng <= bbox[2]
      ).slice(0, 50)

      const res = await fetch('/api/analyze-area', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: ctrl.signal,
        body: JSON.stringify({
          bases:    sel.bases,
          events:   eventsInBBox,
          area_km2: sel.area_km2,
          center:   sel.center,
        }),
      })

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({})) as { error?: string }
        throw new Error(errBody.error ?? `HTTP ${res.status}`)
      }
      const data = await res.json() as ScenarioAnalysis
      setAnalysis(data)
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.error('Analysis failed:', err)
        setAnalyzeError(String(err))
      }
    } finally {
      setAnalyzing(false)
    }
  }, [conflictEvents])

  const handleAreaSelected = useCallback((sel: AreaSelection | null) => {
    setAreaSelection(sel)
    if (sel) {
      runAnalysis(sel)
    } else {
      setAnalysis(null)
      setAnalyzing(false)
      setAnalyzeError(null)
    }
  }, [runAnalysis])

  const areaStatuses = useMemo(() => {
    if (!areaSelection) return null
    const bases = areaSelection.bases
    return {
      total:       bases.length,
      operational: bases.filter(b => b.status === 'OPERATIONAL').length,
      contested:   bases.filter(b => b.status === 'CONTESTED').length,
      seized:      bases.filter(b => b.status.startsWith('SEIZED')).length,
    }
  }, [areaSelection])

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden">

      {/* ── Top stats bar ─────────────────────────────────────────────────── */}
      <div className="bg-surface-1 border-b border-white/[0.07] flex items-center h-10 shrink-0 overflow-x-auto">
        <div className="px-4 h-full border-r border-white/[0.07] shrink-0 flex items-center gap-3">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shrink-0" />
          <span className="text-[10px] font-mono font-bold tracking-widest text-red-400">OSINT · UNCLASSIFIED</span>
          <span className="text-[9px] font-mono text-slate-600 hidden sm:inline">Myanmar Armed Forces · LIB ORBAT</span>
        </div>
        <StatPill label="Total"        value={stats.total}       />
        <StatPill label="Operational"  value={stats.operational} color={STATUS_COLORS.OPERATIONAL} />
        <StatPill label="Contested"    value={stats.contested}   color={STATUS_COLORS.CONTESTED}   />
        <StatPill label="Seized — PDF" value={stats.seizedPdf}   color={STATUS_COLORS.SEIZED_PDF}  />
        <StatPill label="Seized — EAO" value={stats.seizedEao}   color={STATUS_COLORS.SEIZED_EAO}  />
      </div>

      {/* ── Main 3-column layout ──────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden relative">

        {/* Mobile backdrop */}
        {sidebarOpen && (
          <div
            className="md:hidden fixed inset-0 z-30 bg-black/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ── Left sidebar: Regiment list ───────────────────────────────── */}
        <aside className={`
          flex flex-col bg-surface-1 border-r border-white/[0.07] shrink-0
          transition-all duration-300 ease-in-out overflow-hidden
          fixed md:relative z-40 md:z-auto h-full top-0 md:top-auto
          ${sidebarOpen ? 'w-60 translate-x-0' : 'w-0 -translate-x-full md:translate-x-0'}
        `}>

          {/* Header */}
          <div className="px-3 py-2 border-b border-white/[0.07] flex items-center justify-between shrink-0">
            <span className="text-[10px] font-mono font-bold tracking-widest text-slate-300">✦ REGIMENT LIST</span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-slate-500">{filtered.length}</span>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-slate-500 hover:text-slate-300 text-lg leading-none px-1 md:hidden"
              >×</button>
            </div>
          </div>

          {/* Search + filters */}
          <div className="px-3 py-2 border-b border-white/[0.07] space-y-2 shrink-0">
            <input
              type="text"
              placeholder="Search…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-white/[0.05] border border-white/[0.08] rounded px-2.5 py-1.5 text-xs font-mono text-slate-300 placeholder-slate-600 focus:outline-none focus:border-accent-blue/50"
            />
            <div className="flex gap-2">
              <select
                value={filterRegion}
                onChange={e => setFilterRegion(e.target.value)}
                className="flex-1 bg-white/[0.05] border border-white/[0.08] rounded px-2 py-1.5 text-[10px] font-mono text-slate-400 focus:outline-none"
              >
                <option value="">All Regions</option>
                {ALL_REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              <select
                value={filterThreat}
                onChange={e => setFilterThreat(e.target.value as ThreatLevel | '')}
                className="flex-1 bg-white/[0.05] border border-white/[0.08] rounded px-2 py-1.5 text-[10px] font-mono text-slate-400 focus:outline-none"
              >
                <option value="">All</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Med</option>
                <option value="LOW">Low</option>
              </select>
            </div>
          </div>

          {/* Layer toggles */}
          <div className="px-3 py-2 border-b border-white/[0.07] shrink-0">
            <div className="space-y-1">
              {ALL_STATUSES.map(s => {
                const on  = visibleStatuses.has(s)
                const clr = STATUS_COLORS[s]
                const cnt = BASES.filter(b => b.status === s).length
                return (
                  <button
                    key={s}
                    onClick={() => toggleLayer(s)}
                    className={`w-full flex items-center gap-2 px-2 py-1 rounded text-[9px] font-mono transition-colors ${
                      on ? 'bg-white/[0.05] text-slate-300' : 'text-slate-600 opacity-50'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: clr }} />
                    <span className="flex-1 text-left">{LAYER_META[s].label}</span>
                    <span className="text-slate-600">{cnt}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Regiment list */}
          <div className="flex-1 overflow-y-auto">
            {filtered.map(base => {
              const isActive = selected === base.id
              const clr      = STATUS_COLORS[base.status]
              const dimmed   = !visibleStatuses.has(base.status)
              const inArea   = areaSelection?.bases.some(b => b.id === base.id)
              return (
                <button
                  key={base.id}
                  onClick={() => handleSelect(base.id)}
                  className={`
                    w-full text-left px-3 py-2 border-b border-white/[0.05] transition-colors
                    flex items-start gap-2
                    ${isActive ? 'bg-accent-blue/10 border-l-2 border-l-accent-blue' : 'hover:bg-white/[0.03]'}
                    ${dimmed   ? 'opacity-40' : ''}
                  `}
                >
                  <div
                    className="shrink-0 w-7 h-7 rounded flex items-center justify-center font-mono text-[9px] font-bold mt-0.5"
                    style={{ background: clr + '20', border: `1px solid ${clr}44`, color: clr }}
                  >
                    {base.regimentEn.replace('LIB ', '')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-mono font-bold text-slate-200 truncate">{base.regimentEn}</span>
                      {inArea && <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-accent-blue" />}
                    </div>
                    <div className="text-[9px] text-slate-500 truncate">{base.locationEn}</div>
                  </div>
                </button>
              )
            })}
            {filtered.length === 0 && (
              <div className="px-4 py-8 text-center text-xs font-mono text-slate-600">No bases match</div>
            )}
          </div>

          {/* Selected unit detail */}
          {selectedBase && (
            <div className="border-t border-white/[0.07] p-3 shrink-0 bg-surface-0/40">
              <div className="text-[9px] font-mono text-slate-600 tracking-widest mb-1.5">SELECTED UNIT</div>
              <div className="text-xs font-mono font-bold text-slate-200">{selectedBase.regimentEn}</div>
              <div className="text-[9px] text-slate-500 mt-0.5">{selectedBase.locationEn} · {selectedBase.region}</div>
              <div
                className="text-[9px] font-mono font-bold mt-1"
                style={{ color: STATUS_COLORS[selectedBase.status] }}
              >
                {STATUS_LABELS[selectedBase.status]}
              </div>
            </div>
          )}
        </aside>

        {/* ── Center: Map ───────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0 relative pb-14 md:pb-0">
          <div className="flex-1 relative">

            {/* Sidebar toggle */}
            <button
              onClick={() => setSidebarOpen(v => !v)}
              className="absolute top-3 left-3 z-20 flex items-center gap-1.5 px-2.5 py-1.5 bg-surface-1/90 backdrop-blur border border-white/[0.10] rounded text-xs font-mono text-slate-300 hover:bg-surface-1 transition-colors shadow-lg"
            >
              <span className="text-base leading-none">{sidebarOpen ? '◀' : '▶'}</span>
              <span className="hidden sm:inline">{sidebarOpen ? 'Hide' : 'Units'}</span>
            </button>

            {/* Draw hint */}
            {!areaSelection && (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 px-3 py-1.5 bg-surface-1/90 backdrop-blur border border-white/[0.10] rounded text-[10px] font-mono text-slate-400 shadow-lg pointer-events-none">
                ⬡ Use polygon tool (top-right) to analyze an area
              </div>
            )}

            {/* Area highlight badge */}
            {areaSelection && (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3 py-1.5 bg-surface-1/90 backdrop-blur border border-accent-blue/30 rounded text-[10px] font-mono text-accent-blue-light shadow-lg">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-blue animate-pulse shrink-0" />
                {areaSelection.bases.length} bases · {areaSelection.area_km2.toFixed(0)} km²
                {analyzing && <span className="text-slate-500 ml-1">· analyzing…</span>}
              </div>
            )}

            {/* Legend */}
            <div className="absolute bottom-4 left-3 z-20 bg-surface-1/90 backdrop-blur border border-white/[0.10] rounded px-2.5 py-2 shadow-lg">
              <div className="text-[9px] font-mono text-slate-500 tracking-widest mb-1.5 uppercase">Status</div>
              {ALL_STATUSES.map(s => (
                <div key={s} className="flex items-center gap-1.5 mb-1 last:mb-0">
                  <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: STATUS_COLORS[s] }} />
                  <span className="text-[9px] font-mono text-slate-500">{STATUS_LABELS[s]}</span>
                </div>
              ))}
            </div>

            <BasesMap
              selected={selected}
              onSelect={handleSelect}
              visibleIds={visibleIds}
              sidebarOpen={sidebarOpen}
              clearSignal={clearSignal}
              onAreaSelected={handleAreaSelected}
            />
          </div>

          {/* ── Area stats bottom bar ──────────────────────────────────── */}
          {areaStatuses && (
            <div className="h-10 bg-surface-1 border-t border-white/[0.07] flex items-center px-4 gap-4 shrink-0 overflow-x-auto">
              <span className="text-[9px] font-mono text-slate-600 tracking-widest uppercase shrink-0">Selected Area</span>
              <div className="w-px h-4 bg-white/[0.07] shrink-0" />
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-sm font-bold font-mono text-slate-200">{areaStatuses.total}</span>
                <span className="text-[9px] font-mono text-slate-500">Bases</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: STATUS_COLORS.OPERATIONAL }} />
                <span className="text-sm font-bold font-mono" style={{ color: STATUS_COLORS.OPERATIONAL }}>{areaStatuses.operational}</span>
                <span className="text-[9px] font-mono text-slate-500">Ops</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: STATUS_COLORS.CONTESTED }} />
                <span className="text-sm font-bold font-mono" style={{ color: STATUS_COLORS.CONTESTED }}>{areaStatuses.contested}</span>
                <span className="text-[9px] font-mono text-slate-500">Contested</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: STATUS_COLORS.SEIZED_PDF }} />
                <span className="text-sm font-bold font-mono" style={{ color: STATUS_COLORS.SEIZED_PDF }}>{areaStatuses.seized}</span>
                <span className="text-[9px] font-mono text-slate-500">Seized</span>
              </div>
              <div className="w-px h-4 bg-white/[0.07] shrink-0" />
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-sm font-bold font-mono text-slate-200">{areaSelection!.area_km2.toFixed(0)}</span>
                <span className="text-[9px] font-mono text-slate-500">km²</span>
              </div>
              {analysis && (
                <>
                  <div className="w-px h-4 bg-white/[0.07] shrink-0" />
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded"
                      style={{
                        background: (RISK_COLORS[analysis.riskLevel] ?? '#6b7280') + '25',
                        color:       RISK_COLORS[analysis.riskLevel] ?? '#6b7280',
                        border:     `1px solid ${(RISK_COLORS[analysis.riskLevel] ?? '#6b7280')}44`,
                      }}
                    >
                      {analysis.riskLevel} RISK
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[9px] font-mono text-slate-500">Confidence</span>
                    <span className="text-sm font-bold font-mono text-slate-200">{analysis.projection.confidence_pct}%</span>
                  </div>
                </>
              )}
              <button
                onClick={() => { setAreaSelection(null); setAnalysis(null); setAnalyzeError(null); setClearSignal(s => s + 1) }}
                className="ml-auto shrink-0 text-[9px] font-mono text-slate-600 hover:text-slate-300 px-2 py-1 border border-white/[0.07] rounded transition-colors"
              >
                ✕ Clear Area
              </button>
            </div>
          )}
        </div>

        {/* ── Right panel: Scenario analysis ───────────────────────────── */}
        <ScenarioPanel
          selection={areaSelection}
          analysis={analysis}
          analyzing={analyzing}
          analyzeError={analyzeError}
          nearbyEvents={nearbyEvents}
          onAnalyze={() => areaSelection && runAnalysis(areaSelection)}
          mobileOpen={scenarioPanelOpen}
          onMobileClose={() => setScenarioPanelOpen(false)}
        />
      </div>

      {/* ── Mobile bottom toolbar ─────────────────────────────────────────── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-surface-1/95 backdrop-blur border-t border-white/[0.10] flex items-stretch h-14">

        {/* Units toggle */}
        <button
          onClick={() => setSidebarOpen(v => !v)}
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors ${
            sidebarOpen ? 'text-accent-blue-light' : 'text-slate-500'
          }`}
        >
          <span className="text-base leading-none">☰</span>
          <span className="text-[9px] font-mono tracking-widest">UNITS</span>
        </button>

        {/* Center area status */}
        <div className="flex flex-col items-center justify-center px-4 border-x border-white/[0.07]">
          {areaSelection ? (
            <>
              <span className="text-[10px] font-mono font-bold text-amber-400">{areaSelection.bases.length} BASES</span>
              <span className="text-[8px] font-mono text-amber-600">{areaSelection.area_km2.toFixed(0)} km²</span>
            </>
          ) : analyzing ? (
            <div className="w-4 h-4 border-2 border-accent-blue/30 border-t-accent-blue rounded-full animate-spin" />
          ) : (
            <span className="text-[9px] font-mono text-slate-600 text-center leading-tight">DRAW<br/>AREA</span>
          )}
        </div>

        {/* Analysis toggle */}
        <button
          onClick={() => setScenarioPanelOpen(v => !v)}
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 relative transition-colors ${
            scenarioPanelOpen ? 'text-accent-blue-light' : analysis ? 'text-amber-400' : 'text-slate-500'
          }`}
        >
          {analysis && !scenarioPanelOpen && (
            <span className="absolute top-2 right-5 w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          )}
          <span className="text-base leading-none">⊡</span>
          <span className="text-[9px] font-mono tracking-widest">ANALYSIS</span>
        </button>
      </div>
    </div>
  )
}
