'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'

interface UpdateLog {
  id:        string
  timestamp: string
  change:    string
  reason:    string
  source:    string | null
  metadata:  Record<string, unknown> | null
}

const SOURCE_DOCS = [
  {
    name:        'ACLED',
    full:        'Armed Conflict Location & Event Data Project',
    reliability: 0.90,
    url:         'https://acleddata.com',
    description: 'Disaggregated conflict data — battles, explosions, protests, and civilian violence. Gold standard for conflict research.',
    refresh:     'Every 6 hours via cron',
  },
  {
    name:        'Irrawaddy',
    full:        'The Irrawaddy',
    reliability: 0.85,
    url:         'https://www.irrawaddy.com',
    description: 'Independent Myanmar news outlet. Strong track record for accurate, timely conflict reporting.',
    refresh:     'Manual / seed data',
  },
  {
    name:        'Myanmar Now',
    full:        'Myanmar Now News',
    reliability: 0.85,
    url:         'https://myanmar-now.org/en',
    description: 'Independent journalism covering civil war, political developments, and humanitarian conditions.',
    refresh:     'Manual / seed data',
  },
  {
    name:        'OCHA',
    full:        'UN Office for the Coordination of Humanitarian Affairs',
    reliability: 0.88,
    url:         'https://www.unocha.org/myanmar',
    description: 'Authoritative humanitarian situation reports. Displacement figures and access constraints.',
    refresh:     'Manual / seed data',
  },
  {
    name:        'DVB',
    full:        'Democratic Voice of Burma',
    reliability: 0.80,
    url:         'https://english.dvb.no',
    description: 'Exile media with strong ground networks. Useful for protest and civil disobedience reporting.',
    refresh:     'Manual / seed data',
  },
  {
    name:        'RFA Myanmar',
    full:        'Radio Free Asia Myanmar Service',
    reliability: 0.80,
    url:         'https://www.rfa.org/english/news/myanmar',
    description: 'Ethnic and regional conflict coverage, particularly Kachin and Shan states.',
    refresh:     'Manual / seed data',
  },
]

function ReliabilityBar({ value }: { value: number }) {
  const pct = value * 100
  const color = pct >= 85 ? '#22c55e' : pct >= 70 ? '#f59e0b' : '#ef4444'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1 rounded-full bg-white/[0.06]">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-xs font-mono font-bold w-8 text-right" style={{ color }}>
        {pct.toFixed(0)}%
      </span>
    </div>
  )
}

export default function SourceTransparency() {
  const [logs, setLogs] = useState<UpdateLog[]>([])
  const [tab, setTab]   = useState<'sources' | 'logs'>('sources')

  useEffect(() => {
    fetch('/api/update-logs?limit=20')
      .then(r => r.json())
      .then(d => setLogs(d.logs ?? []))
      .catch(() => {})
  }, [])

  return (
    <div className="panel flex flex-col">
      <div className="panel-header">
        <span className="text-xs font-bold tracking-widest text-slate-300 font-mono">
          🔎 SOURCE TRANSPARENCY
        </span>
        <div className="flex gap-1">
          {(['sources', 'logs'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`text-[0.65rem] font-mono px-2 py-1 rounded capitalize transition-colors ${
                tab === t
                  ? 'bg-accent-blue/20 text-accent-blue-light'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {tab === 'sources' && (
        <div className="overflow-y-auto divide-y divide-white/[0.04]">
          {SOURCE_DOCS.map(s => (
            <div key={s.name} className="px-4 py-3 space-y-2 hover:bg-white/[0.02]">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <a
                    href={s.url} target="_blank" rel="noopener noreferrer"
                    className="text-sm font-bold text-slate-200 hover:text-accent-blue-light transition-colors"
                  >
                    {s.name}
                  </a>
                  <div className="text-[0.65rem] text-slate-500 mt-0.5">{s.full}</div>
                </div>
                <div className="text-[0.6rem] font-mono text-slate-600 shrink-0">{s.refresh}</div>
              </div>
              <ReliabilityBar value={s.reliability} />
              <p className="text-xs text-slate-500 leading-relaxed">{s.description}</p>
            </div>
          ))}
        </div>
      )}

      {tab === 'logs' && (
        <div className="overflow-y-auto divide-y divide-white/[0.04]">
          {logs.length === 0 && (
            <p className="px-4 py-6 text-xs text-slate-500 text-center font-mono">
              No update logs yet. Run ingestion or seed to populate.
            </p>
          )}
          {logs.map(log => (
            <div key={log.id} className="px-4 py-3 space-y-1 hover:bg-white/[0.02]">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-mono text-slate-400">
                  {format(new Date(log.timestamp), 'dd MMM HH:mm')}
                </span>
                {log.source && (
                  <span className="text-[0.6rem] font-mono text-slate-600 bg-white/[0.04] px-1.5 py-0.5 rounded">
                    {log.source}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300">{log.change}</p>
              <p className="text-[0.65rem] text-slate-600">{log.reason}</p>
              {log.metadata && typeof log.metadata === 'object' && (
                <div className="flex gap-3 text-[0.6rem] font-mono text-slate-600">
                  {Object.entries(log.metadata as Record<string, unknown>)
                    .filter(([, v]) => typeof v === 'number')
                    .map(([k, v]) => (
                      <span key={k}>{k}: <span className="text-slate-400">{String(v)}</span></span>
                    ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
