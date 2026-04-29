'use client'

import { useState, useMemo, useCallback } from 'react'
import dynamic from 'next/dynamic'
import {
  BASES, STATUS_COLORS, STATUS_LABELS, baseStats,
  type MilitaryBase, type BaseStatus, type ThreatLevel,
} from '@/lib/bases-data'

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

function StatPill({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className="flex items-center gap-2 px-4 h-full border-r border-white/[0.07] last:border-r-0 shrink-0">
      {color && <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color }} />}
      <span className="text-[10px] font-mono text-slate-500 tracking-widest uppercase">{label}</span>
      <span className="text-sm font-bold font-mono text-slate-200">{value}</span>
    </div>
  )
}

export default function BasesShell() {
  const [selected,        setSelected]        = useState<number | null>(null)
  const [filterRegion,    setFilterRegion]    = useState<string>('')
  const [filterThreat,    setFilterThreat]    = useState<ThreatLevel | ''>('')
  const [visibleStatuses, setVisibleStatuses] = useState<Set<BaseStatus>>(
    new Set(ALL_STATUSES)
  )
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [search,      setSearch]      = useState('')

  const stats = useMemo(() => baseStats(BASES), [])

  function toggleLayer(s: BaseStatus) {
    setVisibleStatuses(prev => {
      const next = new Set(prev)
      next.has(s) ? next.delete(s) : next.add(s)
      return next
    })
  }

  // Bases that pass sidebar search + filters
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

  // IDs visible on the map = filtered list AND layer toggle
  const visibleIds = useMemo<Set<number>>(
    () => new Set(filtered.filter(b => visibleStatuses.has(b.status)).map(b => b.id)),
    [filtered, visibleStatuses]
  )

  const handleSelect = useCallback((id: number) => {
    setSelected(prev => prev === id ? null : id)
  }, [])

  const selectedBase = selected ? BASES.find(b => b.id === selected) : null

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden">

      {/* ── Top stats bar ─────────────────────────────────────────────────── */}
      <div className="bg-surface-1 border-b border-white/[0.07] flex items-center h-10 shrink-0 overflow-x-auto">
        {/* Classification badge */}
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

      {/* ── Main layout ───────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden relative">

        {/* Mobile backdrop */}
        {sidebarOpen && (
          <div
            className="md:hidden fixed inset-0 z-30 bg-black/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ── Sidebar ───────────────────────────────────────────────────── */}
        <aside className={`
          flex flex-col bg-surface-1 border-r border-white/[0.07] shrink-0
          transition-all duration-300 ease-in-out overflow-hidden
          fixed md:relative z-40 md:z-auto h-full top-0 md:top-auto
          ${sidebarOpen ? 'w-72 translate-x-0' : 'w-0 -translate-x-full md:translate-x-0'}
        `}>

          {/* Sidebar header */}
          <div className="px-3 py-2 border-b border-white/[0.07] flex items-center justify-between shrink-0">
            <span className="text-[10px] font-mono font-bold tracking-widest text-slate-300">✦ REGIMENT LIST</span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-slate-500">{filtered.length} bases</span>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-slate-500 hover:text-slate-300 text-lg leading-none px-1 md:hidden"
              >×</button>
            </div>
          </div>

          {/* Search + region/threat filters */}
          <div className="px-3 py-2 border-b border-white/[0.07] space-y-2 shrink-0">
            <input
              type="text"
              placeholder="Search regiment / location…"
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
                <option value="">All Threats</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
          </div>

          {/* ── Layer toggles ─────────────────────────────────────────────── */}
          <div className="px-3 py-2 border-b border-white/[0.07] shrink-0">
            <div className="text-[9px] font-mono text-slate-600 tracking-widest mb-2 uppercase">Layer Visibility</div>
            <div className="space-y-1">
              {ALL_STATUSES.map(s => {
                const on  = visibleStatuses.has(s)
                const clr = STATUS_COLORS[s]
                const cnt = BASES.filter(b => b.status === s).length
                return (
                  <button
                    key={s}
                    onClick={() => toggleLayer(s)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded text-[10px] font-mono transition-colors ${
                      on
                        ? 'bg-white/[0.05] text-slate-300'
                        : 'text-slate-600 opacity-50 hover:opacity-75'
                    }`}
                  >
                    {/* Checkbox */}
                    <span
                      className="w-3.5 h-3.5 rounded-sm border flex items-center justify-center shrink-0 transition-colors"
                      style={{
                        borderColor: on ? clr : '#475569',
                        background:  on ? clr + '33' : 'transparent',
                      }}
                    >
                      {on && <span style={{ color: clr, fontSize: '9px' }}>✓</span>}
                    </span>
                    {/* Color dot */}
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: clr }} />
                    <span className="flex-1 text-left">{STATUS_LABELS[s]}</span>
                    <span className="text-slate-600">{cnt}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* ── Regiment list ──────────────────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto">
            {filtered.map(base => {
              const isActive  = selected === base.id
              const clr       = STATUS_COLORS[base.status]
              const dimmed    = !visibleStatuses.has(base.status)
              return (
                <button
                  key={base.id}
                  onClick={() => handleSelect(base.id)}
                  className={`
                    w-full text-left px-3 py-2.5 border-b border-white/[0.05] transition-colors
                    flex items-start gap-3
                    ${isActive  ? 'bg-accent-blue/10 border-l-2 border-l-accent-blue' : 'hover:bg-white/[0.03]'}
                    ${dimmed    ? 'opacity-40' : ''}
                  `}
                >
                  {/* Shield badge */}
                  <div
                    className="shrink-0 w-8 h-8 rounded flex items-center justify-center font-mono text-[10px] font-bold mt-0.5"
                    style={{ background: clr + '20', border: `1px solid ${clr}44`, color: clr }}
                  >
                    {base.regimentEn.replace('LIB ', '')}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-mono font-bold text-slate-200">{base.regimentEn}</span>
                      <span
                        className="text-[9px] font-mono shrink-0"
                        style={{ color: clr }}
                      >
                        {LAYER_META[base.status].icon}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 truncate mt-0.5">{base.locationEn}</div>
                    <div
                      className="text-[9px] font-mono mt-0.5"
                      style={{ color: clr + 'aa' }}
                    >
                      {STATUS_LABELS[base.status]}
                    </div>
                  </div>
                </button>
              )
            })}
            {filtered.length === 0 && (
              <div className="px-4 py-8 text-center text-xs font-mono text-slate-600">No bases match filter</div>
            )}
          </div>

          {/* ── Selected unit detail ───────────────────────────────────────── */}
          {selectedBase && (
            <div className="border-t border-white/[0.07] p-3 shrink-0 bg-surface-0/40">
              <div className="text-[9px] font-mono text-slate-600 tracking-widest mb-2">SELECTED UNIT</div>
              <div className="text-sm font-mono font-bold text-slate-200">{selectedBase.regimentEn}</div>
              <div className="text-xs text-slate-500 mt-0.5">{selectedBase.regimentMm}</div>
              <div className="mt-2 grid grid-cols-2 gap-1.5">
                {([
                  ['Location', selectedBase.locationEn],
                  ['Region',   selectedBase.region],
                  ['Type',     selectedBase.type],
                ] as [string, string][]).map(([k, v]) => (
                  <div key={k} className="bg-white/[0.04] rounded p-1.5">
                    <div className="text-[9px] font-mono text-slate-600 uppercase">{k}</div>
                    <div className="text-[10px] font-mono text-slate-300 mt-0.5 truncate">{v}</div>
                  </div>
                ))}
                <div className="bg-white/[0.04] rounded p-1.5">
                  <div className="text-[9px] font-mono text-slate-600 uppercase">Status</div>
                  <div
                    className="text-[10px] font-mono mt-0.5 font-bold"
                    style={{ color: STATUS_COLORS[selectedBase.status] }}
                  >
                    {STATUS_LABELS[selectedBase.status]}
                  </div>
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* ── Map area ──────────────────────────────────────────────────── */}
        <div className="flex-1 relative min-w-0">

          {/* Toggle sidebar */}
          <button
            onClick={() => setSidebarOpen(v => !v)}
            className="absolute top-3 left-3 z-20 flex items-center gap-1.5 px-2.5 py-1.5 bg-surface-1/90 backdrop-blur border border-white/[0.10] rounded text-xs font-mono text-slate-300 hover:bg-surface-1 transition-colors shadow-lg"
          >
            <span className="text-base leading-none">{sidebarOpen ? '◀' : '▶'}</span>
            <span className="hidden sm:inline">{sidebarOpen ? 'Hide' : 'Regiments'}</span>
          </button>

          {/* Legend */}
          <div className="absolute bottom-4 left-3 z-20 bg-surface-1/90 backdrop-blur border border-white/[0.10] rounded px-3 py-2.5 shadow-lg">
            <div className="text-[9px] font-mono text-slate-500 tracking-widest mb-2 uppercase">Status</div>
            {ALL_STATUSES.map(s => (
              <div key={s} className="flex items-center gap-2 mb-1.5 last:mb-0">
                <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: STATUS_COLORS[s] }} />
                <span className="text-[10px] font-mono text-slate-400">{STATUS_LABELS[s]}</span>
              </div>
            ))}
          </div>

          <BasesMap
            selected={selected}
            onSelect={handleSelect}
            visibleIds={visibleIds}
          />
        </div>
      </div>
    </div>
  )
}
