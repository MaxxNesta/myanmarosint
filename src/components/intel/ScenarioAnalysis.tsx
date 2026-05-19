'use client'

import { useState, useCallback } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import type { SimulationOutput, ScenarioParams } from '@/lib/types'

const DEFAULT_PARAMS: ScenarioParams = {
  initialConflict:        0.75,
  initialEconomy:         0.30,
  externalSupport:        false,
  internationalSanctions: true,
  ceasefireAttempt:       false,
  timeHorizonDays:        90,
  iterations:             1000,
}

function Slider({
  label, value, onChange, min = 0, max = 1, step = 0.05,
}: {
  label: string; value: number; onChange: (v: number) => void
  min?: number; max?: number; step?: number
}) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs font-mono">
        <span className="text-slate-400">{label}</span>
        <span className="text-slate-200 font-bold">{(value * 100).toFixed(0)}%</span>
      </div>
      <input
        type="range"
        min={min} max={max} step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none bg-white/[0.08] accent-accent-blue cursor-pointer"
      />
    </div>
  )
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`flex items-center justify-between w-full px-3 py-2 rounded text-xs transition-colors ${
        value
          ? 'bg-accent-blue/15 text-accent-blue-light border border-accent-blue/30'
          : 'bg-white/[0.04] text-slate-500 hover:text-slate-300 border border-white/[0.06]'
      }`}
    >
      <span>{label}</span>
      <span className={`font-mono font-bold text-[0.65rem] ${value ? 'text-accent-blue-light' : 'text-slate-600'}`}>
        {value ? 'ON' : 'OFF'}
      </span>
    </button>
  )
}

function ProbabilityMeter({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs font-mono">
        <span className="text-slate-400">{label}</span>
        <span className="font-bold" style={{ color }}>{(value * 100).toFixed(1)}%</span>
      </div>
      <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${value * 100}%`, background: color }}
        />
      </div>
    </div>
  )
}

export default function ScenarioAnalysis() {
  const [params, setParams]   = useState<ScenarioParams>(DEFAULT_PARAMS)
  const [result, setResult]   = useState<SimulationOutput | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  const runSimulation = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/simulate', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(params),
      })
      if (!res.ok) throw new Error(await res.text())
      setResult(await res.json())
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }, [params])

  function set<K extends keyof ScenarioParams>(key: K, val: ScenarioParams[K]) {
    setParams(p => ({ ...p, [key]: val }))
  }

  return (
    <div className="panel flex flex-col">
      <div className="panel-header">
        <span className="text-xs font-bold tracking-widest text-slate-300 font-mono">
          🎲 SCENARIO ANALYSIS — MONTE CARLO
        </span>
        <span className="text-xs text-slate-500 font-mono">{params.iterations.toLocaleString()} iterations</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-0 flex-1">
        {/* ── Input panel ───────────────────────────── */}
        <div className="lg:w-64 p-4 space-y-4 border-b lg:border-b-0 lg:border-r border-white/[0.06] shrink-0">
          <div className="space-y-3">
            <p className="text-[0.65rem] font-mono font-bold tracking-widest text-slate-500">
              STATE VARIABLES
            </p>
            <Slider label="Conflict Intensity"  value={params.initialConflict} onChange={v => set('initialConflict', v)} />
            <Slider label="Economic Stability"  value={params.initialEconomy}  onChange={v => set('initialEconomy', v)} />
          </div>

          <div className="space-y-2">
            <p className="text-[0.65rem] font-mono font-bold tracking-widest text-slate-500">
              MODIFIERS
            </p>
            <Toggle label="External Support (EAOs)"    value={params.externalSupport}        onChange={v => set('externalSupport', v)} />
            <Toggle label="International Sanctions"    value={params.internationalSanctions}  onChange={v => set('internationalSanctions', v)} />
            <Toggle label="Ceasefire Attempt"          value={params.ceasefireAttempt}        onChange={v => set('ceasefireAttempt', v)} />
          </div>

          <div className="space-y-2">
            <p className="text-[0.65rem] font-mono font-bold tracking-widest text-slate-500">
              TIME HORIZON
            </p>
            <div className="grid grid-cols-4 gap-1">
              {([30, 60, 90, 180] as const).map(d => (
                <button
                  key={d}
                  onClick={() => set('timeHorizonDays', d)}
                  className={`text-xs font-mono py-1.5 rounded transition-colors ${
                    params.timeHorizonDays === d
                      ? 'bg-accent-blue/20 text-accent-blue-light border border-accent-blue/30'
                      : 'bg-white/[0.04] text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {d}d
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={runSimulation}
            disabled={loading}
            className="w-full py-2.5 rounded font-bold text-sm tracking-wide transition-all bg-accent-blue hover:bg-accent-blue-light text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '⟳ Running…' : '▶ Run Simulation'}
          </button>

          {error && <p className="text-xs text-red-400 font-mono">{error}</p>}
        </div>

        {/* ── Output panel ──────────────────────────── */}
        <div className="flex-1 p-4 space-y-5">
          {!result && !loading && (
            <div className="h-full flex flex-col items-center justify-center text-center gap-3 opacity-40">
              <span className="text-3xl">🎲</span>
              <p className="text-xs text-slate-400 font-mono">Configure parameters and run simulation<br />to see probability distributions</p>
            </div>
          )}

          {loading && (
            <div className="h-full flex items-center justify-center">
              <p className="text-xs text-slate-400 font-mono animate-pulse">
                Running {params.iterations.toLocaleString()} Monte Carlo iterations…
              </p>
            </div>
          )}

          {result && !loading && (
            <>
              {/* Key probabilities */}
              <div className="space-y-3">
                <p className="text-[0.65rem] font-mono font-bold tracking-widest text-slate-500">
                  OUTCOME PROBABILITIES — {params.timeHorizonDays}d HORIZON
                </p>
                <ProbabilityMeter value={result.escalationProbability}         label="Escalation Risk > 70%"        color="#ef4444" />
                <ProbabilityMeter value={result.humanitarianCrisisProbability} label="Humanitarian Crisis > 75%"    color="#f97316" />
                <ProbabilityMeter value={result.collapseRisk}                  label="Economic Collapse < 20%"      color="#f59e0b" />
              </div>

              {/* Confidence interval */}
              <div className="bg-surface-3/50 rounded-lg p-3 grid grid-cols-4 gap-2 text-center">
                {[
                  { l: 'P10', v: result.p10 },
                  { l: 'P50 (Median)', v: result.p50 },
                  { l: 'Mean', v: result.mean },
                  { l: 'P90', v: result.p90 },
                ].map(({ l, v }) => (
                  <div key={l}>
                    <div className="text-sm font-bold font-mono text-slate-100">{(v * 100).toFixed(1)}%</div>
                    <div className="text-[0.6rem] text-slate-500 uppercase tracking-wide">{l}</div>
                  </div>
                ))}
              </div>

              {/* Distribution histogram */}
              <div>
                <p className="text-[0.65rem] font-mono font-bold tracking-widest text-slate-500 mb-2">
                  ESCALATION RISK DISTRIBUTION
                </p>
                <ResponsiveContainer width="100%" height={140}>
                  <BarChart data={result.distribution} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis
                      dataKey="bin"
                      tick={{ fill: '#64748b', fontSize: 8, fontFamily: 'monospace' }}
                      tickFormatter={v => `${(Number(v) * 100).toFixed(0)}%`}
                      axisLine={false} tickLine={false}
                      interval={3}
                    />
                    <YAxis hide />
                    <Tooltip
                      contentStyle={{ background: '#0d1520', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 6, fontSize: '0.75rem' }}
                      formatter={(v: number, _: string, props: { payload?: { bin: number } }) => [
                        `${(v * 100).toFixed(1)}%`,
                        `p=${((props.payload?.bin ?? 0) * 100).toFixed(0)}–${((props.payload?.bin ?? 0) + 0.05) * 100}%`,
                      ]}
                    />
                    <ReferenceLine x={0.7} stroke="#ef4444" strokeDasharray="4 2" strokeWidth={1} />
                    <Bar
                      dataKey="probability"
                      radius={[2, 2, 0, 0]}
                      fill="#1d6fa8"
                    />
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-[0.6rem] text-slate-600 font-mono mt-1">
                  Red line = escalation threshold (70%). σ = {(result.stdDev * 100).toFixed(1)}%
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
