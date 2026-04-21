'use client'

import { useState } from 'react'

type StepStatus = 'idle' | 'running' | 'done' | 'error'

interface StepResult {
  status: StepStatus
  data: unknown
}

export default function AdminPage() {
  const [scrape,  setScrape]  = useState<StepResult>({ status: 'idle', data: null })
  const [process, setProcess] = useState<StepResult>({ status: 'idle', data: null })
  const [running, setRunning] = useState(false)

  async function triggerIngest() {
    setRunning(true)
    setScrape({ status: 'running', data: null })
    setProcess({ status: 'idle', data: null })

    // Step 1 — scrape RSS feeds
    try {
      const res  = await fetch('/api/scrape', { cache: 'no-store' })
      const data = await res.json()
      setScrape({ status: res.ok ? 'done' : 'error', data })
    } catch (err) {
      setScrape({ status: 'error', data: String(err) })
      setRunning(false)
      return
    }

    // Step 2 — process articles through Claude (up to 3 batches)
    setProcess({ status: 'running', data: null })
    const batches: unknown[] = []
    for (let i = 0; i < 3; i++) {
      try {
        const res  = await fetch('/api/cron/process', { cache: 'no-store' })
        const data = await res.json() as { message?: string; articles?: number }
        batches.push(data)
        if (!res.ok || data.message === 'No unprocessed articles' || (data.articles ?? 0) === 0) break
      } catch (err) {
        batches.push({ error: String(err) })
        break
      }
    }
    setProcess({ status: 'done', data: batches })
    setRunning(false)
  }

  return (
    <div className="min-h-screen bg-surface-0 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-sm font-bold font-mono tracking-widest text-slate-200">ADMIN — INGEST PIPELINE</h1>
          <p className="text-xs font-mono text-slate-500 mt-1">
            Runs: RSS scrape → Claude OSINT processing → database save
          </p>
        </div>

        <button
          onClick={triggerIngest}
          disabled={running}
          className="px-4 py-2 text-xs font-mono tracking-wide bg-accent-blue/20 text-accent-blue-light border border-accent-blue/30 rounded hover:bg-accent-blue/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {running ? 'Running…' : 'Run Ingest Pipeline'}
        </button>

        <Step label="1. Scrape RSS Feeds" result={scrape} />
        <Step label="2. Process with Claude" result={process} />
      </div>
    </div>
  )
}

function Step({ label, result }: { label: string; result: StepResult }) {
  const colors: Record<StepStatus, string> = {
    idle:    'text-slate-600',
    running: 'text-yellow-400 animate-pulse',
    done:    'text-green-400',
    error:   'text-red-400',
  }
  const icons: Record<StepStatus, string> = {
    idle: '○', running: '◌', done: '✓', error: '✗',
  }

  return (
    <div className="border border-white/[0.07] rounded p-4 space-y-2">
      <div className="flex items-center gap-2">
        <span className={`font-mono text-sm ${colors[result.status]}`}>{icons[result.status]}</span>
        <span className="text-xs font-mono text-slate-300">{label}</span>
        <span className={`text-[10px] font-mono ${colors[result.status]}`}>{result.status}</span>
      </div>
      {result.data !== null && (
        <pre className="text-[10px] font-mono text-slate-400 bg-surface-1 p-3 rounded overflow-x-auto whitespace-pre-wrap">
          {JSON.stringify(result.data, null, 2)}
        </pre>
      )}
    </div>
  )
}
