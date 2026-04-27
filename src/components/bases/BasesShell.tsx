'use client'

import { useState, useMemo, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { BASES, THREAT_COLORS, baseStats, type MilitaryBase, type ThreatLevel } from '@/lib/bases-data'

const BasesMap = dynamic(() => import('./BasesMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-surface-1">
      <div className="text-xs font-mono text-slate-500 animate-pulse">Initializing map…</div>
    </div>
  ),
})

const THREAT_BG: Record<ThreatLevel, string> = {
  HIGH:   'bg-red-500/10 text-red-400 border-red-500/30',
  MEDIUM: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  LOW:    'bg-green-500/10 text-green-400 border-green-500/30',
}

const STATUS_STYLE = {
  ACTIVE:    'text-green-400',
  CONTESTED: 'text-amber-400',
  UNKNOWN:   'text-slate-500',
}

const ALL_REGIONS = Array.from(new Set(BASES.map(b => b.region))).sort()

function StatCard({ label, value, sub }: { label: string; value: number; sub?: string }) {
  return (
    <div className="flex flex-col gap-0.5 px-4 py-3 border-r border-white/[0.07] last:border-r-0">
      <span className="text-[10px] font-mono text-slate-500 tracking-widest uppercase">{label}</span>
      <span className="text-2xl font-bold font-mono text-slate-100">{value}</span>
      {sub && <span className="text-[10px] font-mono text-slate-600">{sub}</span>}
    </div>
  )
}

export default function BasesShell() {
  const [selected,     setSelected]     = useState<number | null>(null)
  const [filterRegion, setFilterRegion] = useState<string>('')
  const [filterThreat, setFilterThreat] = useState<ThreatLevel | ''>('')
  const [sidebarOpen,  setSidebarOpen]  = useState(true)
  const [search,       setSearch]       = useState('')

  const stats = useMemo(() => baseStats(BASES), [])

  const filtered = useMemo(() => {
    return BASES.filter(b => {
      if (filterRegion && b.region !== filterRegion) return false
      if (filterThreat && b.threat !== filterThreat) return false
      if (search) {
        const q = search.toLowerCase()
        return (
          b.regimentEn.toLowerCase().includes(q)  ||
          b.locationEn.toLowerCase().includes(q)   ||
          b.region.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [filterRegion, filterThreat, search])

  const handleSelect = useCallback((id: number) => {
    setSelected(prev => prev === id ? null : id)
  }, [])

  const selectedBase = selected ? BASES.find(b => b.id === selected) : null

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden">

      {/* ── Top stats bar ─────────────────────────────────────────────────── */}
      <div className="bg-surface-1 border-b border-white/[0.07] flex items-center shrink-0 overflow-x-auto">
        {/* Classification badge */}
        <div className="px-4 py-3 border-r border-white/[0.07] shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] font-mono font-bold tracking-widest text-red-400 uppercase">
              OSINT / UNCLASSIFIED
            </span>
          </div>
          <div className="text-[9px] font-mono text-slate-600 mt-0.5">Myanmar Armed Forces · LIB Order of Battle</div>
        </div>

        <StatCard label="Total Bases"  value={stats.total}     sub="tracked" />
        <StatCard label="Active"       value={stats.active}    sub="confirmed" />
        <StatCard label="Contested"    value={stats.contested} sub="under pressure" />
        <StatCard label="High Threat"  value={stats.highThreat} sub="assessed" />

        {/* Right — shield insignia branding */}
        <div className="ml-auto px-4 py-2 hidden md:flex flex-col items-end">
          <span className="text-[9px] font-mono text-slate-600 tracking-widest">ततमदॉ LIB ORBAT</span>
          <span className="text-[10px] font-mono text-slate-500">ပြည်တော်သာ · MYANMAR</span>
        </div>
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
          fixed md:relative z-40 md:z-auto
          h-full top-0 md:top-auto
          ${sidebarOpen ? 'w-72 translate-x-0' : 'w-0 -translate-x-full md:translate-x-0'}
        `}>
          {/* Sidebar header */}
          <div className="px-3 py-2 border-b border-white/[0.07] flex items-center justify-between shrink-0">
            <span className="text-[10px] font-mono font-bold tracking-widest text-slate-300">
              ✦ REGIMENT LIST
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-slate-500">{filtered.length} bases</span>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-slate-500 hover:text-slate-300 text-lg leading-none px-1 md:hidden"
              >×</button>
            </div>
          </div>

          {/* Filters */}
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

          {/* Regiment list */}
          <div className="flex-1 overflow-y-auto">
            {filtered.map((base, i) => {
              const isActive = selected === base.id
              const clr      = THREAT_COLORS[base.threat]
              return (
                <button
                  key={base.id}
                  onClick={() => handleSelect(base.id)}
                  className={`
                    w-full text-left px-3 py-2.5 border-b border-white/[0.05] transition-colors
                    flex items-start gap-3
                    ${isActive ? 'bg-accent-blue/10 border-l-2 border-l-accent-blue' : 'hover:bg-white/[0.03]'}
                  `}
                >
                  {/* Shield icon */}
                  <div
                    className="shrink-0 w-8 h-8 rounded flex items-center justify-center font-mono text-[10px] font-bold mt-0.5"
                    style={{ background: clr + '20', border: `1px solid ${clr}44`, color: clr }}
                  >
                    {base.regimentEn.replace('LIB ', '')}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-mono font-bold text-slate-200">{base.regimentEn}</span>
                      <span className={`text-[9px] font-mono ${STATUS_STYLE[base.status]}`}>
                        {base.status}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 truncate mt-0.5">{base.locationEn}</div>
                    <div className="text-[10px] text-slate-600 truncate">{base.region}</div>
                  </div>
                </button>
              )
            })}
            {filtered.length === 0 && (
              <div className="px-4 py-8 text-center text-xs font-mono text-slate-600">No bases match filter</div>
            )}
          </div>

          {/* Selected detail pane */}
          {selectedBase && (
            <div className="border-t border-white/[0.07] p-3 shrink-0 bg-surface-0/40">
              <div className="text-[9px] font-mono text-slate-600 tracking-widest mb-2">SELECTED UNIT</div>
              <div className="text-sm font-mono font-bold text-slate-200">{selectedBase.regimentEn}</div>
              <div className="text-xs text-slate-500 mt-0.5">{selectedBase.regimentMm}</div>
              <div className="mt-2 grid grid-cols-2 gap-1.5">
                {[
                  ['Location', selectedBase.locationEn],
                  ['Region',   selectedBase.region],
                  ['Type',     selectedBase.type],
                  ['Status',   selectedBase.status],
                ].map(([k, v]) => (
                  <div key={k} className="bg-white/[0.04] rounded p-1.5">
                    <div className="text-[9px] font-mono text-slate-600 uppercase">{k}</div>
                    <div className="text-[10px] font-mono text-slate-300 mt-0.5">{v}</div>
                  </div>
                ))}
              </div>
              <div
                className="mt-2 text-[10px] font-mono font-bold rounded px-2 py-1 inline-block"
                style={{
                  background: THREAT_COLORS[selectedBase.threat] + '20',
                  color:      THREAT_COLORS[selectedBase.threat],
                  border:     `1px solid ${THREAT_COLORS[selectedBase.threat]}44`,
                }}
              >
                ● {selectedBase.threat} THREAT
              </div>
            </div>
          )}
        </aside>

        {/* ── Map area ──────────────────────────────────────────────────── */}
        <div className="flex-1 relative min-w-0">

          {/* Toggle sidebar button */}
          <button
            onClick={() => setSidebarOpen(v => !v)}
            className="absolute top-3 left-3 z-20 flex items-center gap-1.5 px-2.5 py-1.5 bg-surface-1/90 backdrop-blur border border-white/[0.10] rounded text-xs font-mono text-slate-300 hover:bg-surface-1 transition-colors shadow-lg"
          >
            <span className="text-base leading-none">{sidebarOpen ? '◀' : '▶'}</span>
            <span className="hidden sm:inline">{sidebarOpen ? 'Hide' : 'Regiments'}</span>
          </button>

          {/* Threat legend */}
          <div className="absolute bottom-4 left-3 z-20 bg-surface-1/90 backdrop-blur border border-white/[0.10] rounded px-3 py-2 shadow-lg">
            <div className="text-[9px] font-mono text-slate-500 tracking-widest mb-1.5">THREAT LEVEL</div>
            {(['HIGH', 'MEDIUM', 'LOW'] as ThreatLevel[]).map(t => (
              <div key={t} className="flex items-center gap-2 mb-1 last:mb-0">
                <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: THREAT_COLORS[t] }} />
                <span className="text-[10px] font-mono text-slate-400">{t}</span>
              </div>
            ))}
            <div className="border-t border-white/[0.07] mt-2 pt-2">
              <div className="text-[9px] font-mono text-slate-500 tracking-widest mb-1">STATUS</div>
              {[['●', '#86efac', 'Active'], ['●', '#fcd34d', 'Contested'], ['●', '#64748b', 'Unknown']].map(([dot, clr, label]) => (
                <div key={label} className="flex items-center gap-2 mb-1 last:mb-0">
                  <span className="text-[8px]" style={{ color: clr }}>{dot}</span>
                  <span className="text-[10px] font-mono text-slate-400">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <BasesMap
            selected={selected}
            onSelect={handleSelect}
            filterRegion={filterRegion}
          />
        </div>
      </div>
    </div>
  )
}
