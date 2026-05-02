'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import dynamic from 'next/dynamic'
import { ACTORS, CAMPAIGNS, TOWN_CONTROL_EVENTS } from '@/lib/operations-data'
import type { ActorId, Campaign, TownControlEvent } from '@/lib/operations-types'
import type { ConflictEventDTO } from '@/lib/types'
import TimelineControl from './TimelineControl'

const OperationsMap = dynamic(() => import('./OperationsMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#0a0e14]">
      <div className="text-xs font-mono text-slate-500 animate-pulse">Initializing operations map…</div>
    </div>
  ),
})

type Speed = 0.5 | 1 | 2 | 5

// Default date range: 2021-02-01 (coup) → today
const DEFAULT_MIN = new Date('2021-02-01')
const DEFAULT_MAX = new Date()
const DEFAULT_START = new Date('2023-10-27') // Operation 1027

const ALL_ACTOR_IDS = Object.keys(ACTORS) as ActorId[]

export default function OperationsShell() {
  // ── Timeline state ─────────────────────────────────────────────────
  const [currentDate,  setCurrentDate]  = useState<Date>(DEFAULT_START)
  const [minDate,      setMinDate]      = useState<Date>(DEFAULT_MIN)
  const [maxDate]                       = useState<Date>(DEFAULT_MAX)
  const [playing,      setPlaying]      = useState(false)
  const [speed,        setSpeed]        = useState<Speed>(1)

  // ── Data ───────────────────────────────────────────────────────────
  const [incidents,    setIncidents]    = useState<ConflictEventDTO[]>([])
  const [incidentsLoading, setLoading] = useState(true)

  // ── Filters ────────────────────────────────────────────────────────
  const [actorFilter, setActorFilter] = useState<Set<ActorId>>(new Set())
  const [legendOpen,  setLegendOpen]  = useState(true)

  const campaigns: Campaign[]           = CAMPAIGNS
  const controlEvents: TownControlEvent[] = TOWN_CONTROL_EVENTS

  // ── Load incidents ─────────────────────────────────────────────────
  useEffect(() => {
    setLoading(true)
    fetch('/api/conflict-events?limit=5000&days=1825')  // 5 years
      .then(r => r.json())
      .then(d => {
        const evts: ConflictEventDTO[] = d.events ?? []
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

  // ── Auto-play ──────────────────────────────────────────────────────
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

  // ── Derived stats ──────────────────────────────────────────────────
  const stats = useMemo(() => {
    const cutoff = currentDate
    const recent = incidents.filter(e => {
      const d = new Date(e.date as string)
      return d <= cutoff && (cutoff.getTime() - d.getTime()) < 30 * 86400000
    })
    const total = incidents.filter(e => new Date(e.date as string) <= cutoff).length
    const fatalities = recent.reduce((s, e) => s + (e.fatalities ?? 0), 0)
    const hotZones = new Set(recent.map(e => e.region)).size
    return { total, recent: recent.length, fatalities, hotZones }
  }, [incidents, currentDate])

  const toggleActor = useCallback((id: ActorId) => {
    setActorFilter(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }, [])

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden bg-[#0a0e14]">

      {/* ── Top header bar ─────────────────────────────────────────── */}
      <div className="h-10 bg-[#0b0f14] border-b border-white/[0.07] flex items-center px-4 gap-4 shrink-0 overflow-x-auto">
        <div className="flex items-center gap-2 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shrink-0" />
          <span className="text-[10px] font-mono font-bold tracking-widest text-red-400">OPERATIONS TIMELINE</span>
          <span className="text-[9px] font-mono text-slate-600 hidden sm:inline">Myanmar Conflict · {currentDate.toISOString().slice(0, 10)}</span>
        </div>

        <div className="w-px h-4 bg-white/[0.07] shrink-0" />

        {/* Live stats */}
        {[
          { label: 'Events',    value: stats.total.toLocaleString() },
          { label: '30-day',    value: stats.recent.toString(),     color: stats.recent > 20 ? '#ef4444' : '#f59e0b' },
          { label: 'Casualties', value: stats.fatalities.toString(), color: '#ef4444' },
          { label: 'Hot Zones', value: stats.hotZones.toString(),   color: '#f97316' },
        ].map(s => (
          <div key={s.label} className="flex items-center gap-1.5 shrink-0">
            <span className="text-[9px] font-mono text-slate-600 uppercase tracking-widest">{s.label}</span>
            <span className="text-sm font-bold font-mono" style={{ color: s.color ?? '#e2e8f0' }}>{s.value}</span>
          </div>
        ))}

        {incidentsLoading && (
          <div className="w-3 h-3 border border-accent-blue/30 border-t-accent-blue rounded-full animate-spin shrink-0 ml-auto" />
        )}

        {/* Campaign count */}
        {campaigns.length > 0 && (
          <>
            <div className="w-px h-4 bg-white/[0.07] shrink-0 ml-auto" />
            <span className="text-[9px] font-mono text-slate-500 shrink-0">
              {campaigns.filter(c => new Date(c.startDate) <= currentDate).length} campaigns active
            </span>
          </>
        )}
      </div>

      {/* ── Map area ───────────────────────────────────────────────── */}
      <div className="flex-1 relative overflow-hidden">
        <OperationsMap
          currentDate={currentDate}
          campaigns={campaigns}
          controlEvents={controlEvents}
          incidents={incidents}
          actorFilter={actorFilter}
        />

        {/* ── Legend / Actor Filter ───────────────────────────────── */}
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
            <div className="bg-[#0b0f14]/95 backdrop-blur border border-white/[0.10] rounded shadow-xl p-2 space-y-0.5 w-44">
              {ALL_ACTOR_IDS.map(id => {
                const actor = ACTORS[id]
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

        {/* ── Date overlay (top-right of map) ─────────────────────── */}
        <div className="absolute top-3 right-12 z-10 pointer-events-none">
          <div className="px-3 py-1.5 bg-[#0b0f14]/90 backdrop-blur border border-white/[0.08] rounded text-[10px] font-mono text-slate-300 text-right">
            <div className="text-[8px] text-slate-600 tracking-widest mb-0.5">TIMELINE</div>
            <div className="font-bold">{currentDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
          </div>
        </div>
      </div>

      {/* ── Timeline control ───────────────────────────────────────── */}
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
