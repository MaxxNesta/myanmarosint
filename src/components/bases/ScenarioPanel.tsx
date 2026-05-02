'use client'

import { useState } from 'react'
import type { AreaSelection, ScenarioAnalysis, ThreatItem } from '@/lib/analyze-types'
import type { ConflictEventDTO } from '@/lib/types'

type Tab = 'ANALYSIS' | 'THREATS' | 'NEWS'

const RISK_COLORS: Record<string, string> = {
  CRITICAL: '#dc2626',
  HIGH:     '#ef4444',
  MEDIUM:   '#f59e0b',
  LOW:      '#22c55e',
}

const PROB_BADGE: Record<string, string> = {
  CRITICAL: 'bg-red-900/60 text-red-400 border-red-700/50',
  HIGH:     'bg-red-900/40 text-red-400 border-red-800/40',
  MEDIUM:   'bg-yellow-900/40 text-yellow-400 border-yellow-800/40',
  LOW:      'bg-green-900/40 text-green-400 border-green-800/40',
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[9px] font-mono font-bold tracking-widest text-slate-500 uppercase mb-1.5">
      {children}
    </div>
  )
}

function ProjectionPill({ label, value }: { label: string; value: string }) {
  const color = RISK_COLORS[value] ?? '#6b7280'
  return (
    <div className="flex-1 bg-white/[0.04] rounded p-2 text-center">
      <div className="text-[8px] font-mono text-slate-600 uppercase tracking-widest mb-1">{label}</div>
      <div className="text-[10px] font-mono font-bold" style={{ color }}>{value}</div>
    </div>
  )
}

function ThreatCard({ threat }: { threat: ThreatItem }) {
  return (
    <div className="flex items-start gap-2.5 px-3 py-2.5 border-b border-white/[0.05] last:border-b-0">
      <span className={`shrink-0 mt-0.5 px-1.5 py-0.5 rounded text-[8px] font-mono font-bold border ${PROB_BADGE[threat.probability] ?? PROB_BADGE.LOW}`}>
        {threat.probability}
      </span>
      <div className="min-w-0">
        <div className="text-[10px] font-mono font-bold text-slate-200 mb-0.5">{threat.name}</div>
        <div className="text-[9px] text-slate-500 leading-relaxed">{threat.description}</div>
      </div>
    </div>
  )
}

function NewsItem({ event }: { event: ConflictEventDTO }) {
  const color = event.eventType === 'AIRSTRIKE' || event.eventType === 'CLASH' ? '#ef4444'
    : event.eventType === 'ARTILLERY_SHELLING' ? '#f97316'
    : event.eventType === 'SIEGE_SEIZED' ? '#7c3aed'
    : '#6b7280'
  return (
    <div className="px-3 py-2.5 border-b border-white/[0.05] last:border-b-0">
      <div className="flex items-center gap-1.5 mb-1">
        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color }} />
        <span className="text-[9px] font-mono text-slate-500">{String(event.date).slice(0, 10)}</span>
        <span className="text-[9px] font-mono" style={{ color }}>{event.eventType.replace(/_/g, ' ')}</span>
      </div>
      <div className="text-[10px] font-mono text-slate-300 leading-relaxed line-clamp-2">
        {event.summary || `${event.location ?? event.region}`}
      </div>
      {event.fatalities > 0 && (
        <div className="text-[9px] font-mono text-red-400 mt-0.5">{event.fatalities} casualties</div>
      )}
    </div>
  )
}

interface Props {
  selection:    AreaSelection | null
  analysis:     ScenarioAnalysis | null
  analyzing:    boolean
  analyzeError: string | null
  nearbyEvents: ConflictEventDTO[]
  onAnalyze:    () => void
  open:         boolean
  onClose:      () => void
}

export default function ScenarioPanel({
  selection, analysis, analyzing, analyzeError,
  nearbyEvents, onAnalyze, open, onClose,
}: Props) {
  const [tab, setTab] = useState<Tab>('ANALYSIS')
  const riskColor = analysis ? (RISK_COLORS[analysis.riskLevel] ?? '#6b7280') : '#6b7280'

  const panelHeader = (
    <div className="px-3 py-2 border-b border-white/[0.07] shrink-0">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-mono font-bold tracking-widest text-slate-300">✦ SCENARIO ANALYSIS</span>
        <div className="flex items-center gap-2">
          {analysis && (
            <span
              className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded"
              style={{ background: riskColor + '25', color: riskColor, border: `1px solid ${riskColor}44` }}
            >
              {analysis.riskLevel} RISK
            </span>
          )}
          <button
            onClick={onClose}
            className="w-5 h-5 flex items-center justify-center rounded text-slate-500 hover:text-slate-200 hover:bg-white/[0.08] transition-colors text-base leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>
      </div>
      <div className="flex gap-0.5">
        {(['ANALYSIS', 'THREATS', 'NEWS'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            disabled={!analysis}
            className={`flex-1 py-1 rounded text-[9px] font-mono tracking-wide transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
              tab === t && analysis
                ? 'bg-accent-blue/20 text-accent-blue-light border border-accent-blue/30'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {t}
            {t === 'NEWS' && nearbyEvents.length > 0 && (
              <span className="ml-1 text-[8px] text-slate-600">({nearbyEvents.length})</span>
            )}
          </button>
        ))}
      </div>
    </div>
  )

  const panelBody = (
    <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0">

      {analyzeError && !analyzing && (
        <div className="m-3 bg-red-900/20 border border-red-800/40 rounded p-3">
          <div className="text-[10px] font-mono font-bold text-red-400 mb-1">ANALYSIS FAILED</div>
          <div className="text-[9px] text-red-400/70 font-mono break-all leading-relaxed">{analyzeError}</div>
          <button onClick={onAnalyze} className="mt-2 text-[9px] font-mono text-red-400 hover:text-red-300 underline">Retry</button>
        </div>
      )}

      {!selection && !analyzing && !analysis && !analyzeError && (
        <div className="flex flex-col items-center justify-center h-full min-h-[200px] px-6 text-center gap-4">
          <div className="w-12 h-12 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-xl">⬡</div>
          <div>
            <div className="text-xs font-mono font-bold text-slate-300 mb-1">DRAW AREA</div>
            <div className="text-[10px] text-slate-500 leading-relaxed">
              Use the polygon tool on the map to select an operational area. AI will analyze bases and conflict intel.
            </div>
          </div>
          <div className="text-[9px] font-mono text-slate-600 tracking-widest">POWERED BY GROQ</div>
        </div>
      )}

      {analyzing && (
        <div className="flex flex-col items-center justify-center h-full min-h-[200px] px-6 text-center gap-3">
          <div className="w-8 h-8 border-2 border-accent-blue/30 border-t-accent-blue rounded-full animate-spin" />
          <div>
            <div className="text-xs font-mono font-bold text-slate-300 mb-1">ANALYZING AREA…</div>
            <div className="text-[10px] text-slate-500">Running intelligence assessment</div>
          </div>
        </div>
      )}

      {analysis && !analyzing && tab === 'ANALYSIS' && (
        <div className="p-3 space-y-3">
          <div className="bg-white/[0.03] border border-white/[0.06] rounded p-3">
            <SectionLabel>Scenario Overview</SectionLabel>
            <p className="text-[10px] text-slate-300 leading-relaxed">{analysis.scenarioOverview}</p>
          </div>

          <div>
            <SectionLabel>Area Summary</SectionLabel>
            <div className="grid grid-cols-3 gap-1.5 mb-2">
              {[
                { label: 'Operational', value: analysis.areaSummary.operational, color: '#22c55e' },
                { label: 'Contested',   value: analysis.areaSummary.contested,   color: '#eab308' },
                { label: 'Seized',      value: analysis.areaSummary.seized,      color: '#ef4444' },
              ].map(item => (
                <div key={item.label} className="bg-white/[0.04] rounded p-2 text-center">
                  <div className="text-sm font-mono font-bold" style={{ color: item.color }}>{item.value}</div>
                  <div className="text-[8px] font-mono text-slate-600 uppercase tracking-widest">{item.label}</div>
                </div>
              ))}
            </div>
            <div className="text-[9px] font-mono text-slate-500">
              Dominant: <span className="text-slate-300">{analysis.areaSummary.dominant_actor}</span>
            </div>
          </div>

          <div>
            <SectionLabel>Projection</SectionLabel>
            <div className="flex gap-1.5 mb-1.5">
              <ProjectionPill label="Hold"       value={analysis.projection.holdPosition} />
              <ProjectionPill label="Loss Risk"  value={analysis.projection.lossRisk} />
              <ProjectionPill label="Confidence" value={analysis.projection.confidence} />
            </div>
            <div className="text-[9px] font-mono text-slate-500 text-right">
              Confidence: <span className="text-slate-300 font-bold">{analysis.projection.confidence_pct}%</span>
            </div>
          </div>

          <div>
            <SectionLabel>Key Drivers</SectionLabel>
            <ul className="space-y-1">
              {analysis.keyDrivers.map((d, i) => (
                <li key={i} className="flex items-start gap-2 text-[10px] text-slate-400">
                  <span className="shrink-0 text-slate-600 mt-0.5">▸</span>
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white/[0.03] border border-white/[0.06] rounded p-3">
            <SectionLabel>Interpretation</SectionLabel>
            <p className="text-[10px] text-slate-300 leading-relaxed">{analysis.interpretation}</p>
          </div>

          <div>
            <SectionLabel>Recommended Actions</SectionLabel>
            <ul className="space-y-1.5">
              {analysis.recommendedActions.map((a, i) => (
                <li key={i} className="flex items-start gap-2 text-[10px]">
                  <span className="shrink-0 w-4 h-4 rounded bg-accent-blue/20 text-accent-blue-light flex items-center justify-center font-mono text-[8px] font-bold mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-slate-300 leading-relaxed">{a}</span>
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={onAnalyze}
            disabled={analyzing}
            className="w-full py-2 text-[10px] font-mono text-slate-400 border border-white/[0.07] rounded hover:border-accent-blue/40 hover:text-slate-200 transition-colors disabled:opacity-40"
          >
            ↺ Re-analyze Area
          </button>
          <div className="text-[8px] font-mono text-slate-700 text-center">
            Generated {new Date(analysis.generatedAt).toLocaleTimeString()}
          </div>
        </div>
      )}

      {analysis && !analyzing && tab === 'THREATS' && (
        <div>{analysis.threats.map((t, i) => <ThreatCard key={i} threat={t} />)}</div>
      )}

      {analysis && !analyzing && tab === 'NEWS' && (
        <div>
          {nearbyEvents.length === 0 ? (
            <div className="px-4 py-8 text-center text-[10px] font-mono text-slate-600">No recent events in selected area</div>
          ) : (
            nearbyEvents.slice(0, 50).map(e => <NewsItem key={e.id} event={e} />)
          )}
        </div>
      )}
    </div>
  )

  return (
    <>
      {/* ── Desktop: fixed right overlay ───────────────────────────── */}
      <div
        className={`hidden md:flex fixed right-0 top-14 bottom-0 z-40 w-80 flex-col bg-[#0b0f14]/95 backdrop-blur-md border-l border-white/[0.10] shadow-2xl transition-transform duration-300 ease-out ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {panelHeader}
        {panelBody}
      </div>

      {/* ── Mobile: bottom sheet ────────────────────────────────────── */}
      {/* Backdrop */}
      <div
        className={`md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      {/* Sheet */}
      <div
        className={`md:hidden fixed bottom-0 left-0 right-0 z-50 flex flex-col bg-[#0d1117] border-t border-white/[0.10] rounded-t-2xl max-h-[78vh] transition-transform duration-300 ease-out ${open ? 'translate-y-0' : 'translate-y-full'}`}
      >
        {/* Pull handle */}
        <button
          className="flex justify-center pt-3 pb-1 shrink-0"
          onClick={onClose}
          aria-label="Close"
        >
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </button>
        {panelHeader}
        {panelBody}
      </div>
    </>
  )
}
