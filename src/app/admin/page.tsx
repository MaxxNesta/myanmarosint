'use client'

import { useState } from 'react'

type Status = 'idle' | 'running' | 'done' | 'error'

interface StepState {
  status: Status
  data:   unknown
}

const ICON: Record<Status, string>  = { idle: '○', running: '◌', done: '✓', error: '✗' }
const COLOR: Record<Status, string> = {
  idle:    'text-slate-600',
  running: 'text-yellow-400 animate-pulse',
  done:    'text-green-400',
  error:   'text-red-400',
}

function Step({ label, state }: { label: string; state: StepState }) {
  return (
    <div className="border border-white/[0.07] rounded p-4 space-y-2">
      <div className="flex items-center gap-2">
        <span className={`font-mono text-sm ${COLOR[state.status]}`}>{ICON[state.status]}</span>
        <span className="text-xs font-mono text-slate-300">{label}</span>
        <span className={`text-[10px] font-mono ${COLOR[state.status]}`}>{state.status}</span>
      </div>
      {state.data !== null && (
        <pre className="text-[10px] font-mono text-slate-400 bg-surface-1 p-3 rounded overflow-x-auto whitespace-pre-wrap">
          {JSON.stringify(state.data, null, 2)}
        </pre>
      )}
    </div>
  )
}

export default function AdminPage() {
  const [scrape,  setScrape]  = useState<StepState>({ status: 'idle', data: null })
  const [extract, setExtract] = useState<StepState>({ status: 'idle', data: null })
  const [running, setRunning] = useState(false)

  async function call(step: string) {
    const res  = await fetch(`/api/admin/pipeline?step=${step}`, { method: 'POST', cache: 'no-store' })
    const data = await res.json()
    return { ok: res.ok, data }
  }

  async function run() {
    setRunning(true)
    setScrape({ status: 'idle', data: null })
    setExtract({ status: 'idle', data: null })

    // Step 1 — scrape
    setScrape({ status: 'running', data: null })
    try {
      const { ok, data } = await call('scrape')
      setScrape({ status: ok ? 'done' : 'error', data })
    } catch (err) {
      setScrape({ status: 'error', data: String(err) })
      setRunning(false)
      return
    }

    // Step 2 — extract (loop up to 4 batches)
    setExtract({ status: 'running', data: null })
    const batches: unknown[] = []
    for (let i = 0; i < 4; i++) {
      try {
        const { ok, data } = await call('extract')
        batches.push(data)
        const d = data as { message?: string; articles?: number }
        if (!ok || d.message || (d.articles ?? 0) === 0) break
      } catch (err) {
        batches.push({ error: String(err) })
        break
      }
    }
    setExtract({ status: 'done', data: batches })
    setRunning(false)
  }

  const totalSaved = Array.isArray(extract.data)
    ? (extract.data as { saved?: number }[]).reduce((s, b) => s + (b.saved ?? 0), 0)
    : 0

  return (
    <div className="min-h-screen bg-surface-0 p-8">
      <div className="max-w-2xl mx-auto space-y-6">

        <div>
          <h1 className="text-sm font-bold font-mono tracking-widest text-slate-200 uppercase">
            Admin — Ingest Pipeline
          </h1>
          <p className="text-xs font-mono text-slate-500 mt-1">
            RSS scrape → Groq extraction → DeepSeek analysis → database
          </p>
        </div>

        <button
          onClick={run}
          disabled={running}
          className="px-4 py-2 text-xs font-mono tracking-wide bg-accent-blue/20 text-accent-blue-light border border-accent-blue/30 rounded hover:bg-accent-blue/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {running ? 'Running…' : 'Run Pipeline'}
        </button>

        {extract.status === 'done' && totalSaved > 0 && (
          <div className="text-xs font-mono text-green-400">
            ✓ {totalSaved} new conflict events saved to database
          </div>
        )}

        <Step label="1. Scrape RSS feeds → RawArticle" state={scrape} />
        <Step label="2. Extract + Analyse → ConflictEvent + AnalysedEvent" state={extract} />

      </div>
    </div>
  )
}
