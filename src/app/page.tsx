import Link from 'next/link'
import Image from 'next/image'

export const metadata = {
  title: 'Myanmar War Map — OSINT Platform',
}

const DASHBOARDS = [
  {
    href:    '/map',
    id:      'MOD-01',
    label:   'CONFLICT MAP',
    title:   'Live Conflict Events',
    color:   '#3b82f6',
    src:     '/screenshots/map.png',
    desc:    'Every extracted conflict event plotted as a geocoded marker. Airstrikes, clashes, sieges, displacement — pulled from news RSS feeds and processed daily.',
    features: [
      'Click any marker — event brief, attacker, defender, fatality count',
      'Heatmap layer shows density by region',
      'Marker size scales with reported fatalities',
      'Filter by event type via the legend panel',
    ],
    legend: [
      { color: '#ef4444', label: 'Clash' },
      { color: '#f97316', label: 'Airstrike' },
      { color: '#fb923c', label: 'Shelling' },
      { color: '#7c3aed', label: 'Seized' },
      { color: '#10b981', label: 'Recaptured' },
      { color: '#f59e0b', label: 'Displacement' },
      { color: '#06b6d4', label: 'Humanitarian' },
      { color: '#8b5cf6', label: 'Political' },
    ],
  },
  {
    href:    '/intel',
    id:      'MOD-02',
    label:   'INTEL DASHBOARD',
    title:   'Regional Intelligence',
    color:   '#8b5cf6',
    src:     '/screenshots/intel.png',
    desc:    'Aggregated risk scores, escalation detection, and volatility analysis across all states and regions. Updated each time the pipeline runs.',
    features: [
      'Daily Brief — event delta vs prior week, top active region',
      'Risk Outlook — composite score per state/region (0–100)',
      'Escalation Signals — regions trending >25% above prior week baseline',
      'Volatility score weighted by event count, actor diversity, fatalities, recency',
    ],
    legend: [
      { color: '#ef4444', label: '80–100  Critical' },
      { color: '#f97316', label: '60–79   High' },
      { color: '#f59e0b', label: '40–59   Elevated' },
      { color: '#22c55e', label: '0–39    Guarded' },
    ],
  },
  {
    href:    '/bases',
    id:      'MOD-03',
    label:   'MILITARY BASES',
    title:   'Known Installations',
    color:   '#ef4444',
    src:     '/screenshots/bases.png',
    desc:    'Open-source mapped Tatmadaw military bases, airbases, naval posts, and command HQs. Sourced from ACLED, NeatoGeo, and satellite imagery.',
    features: [
      'Filter by type — Army, Air Force, Navy, Command HQ',
      'Click a base for unit designation, coordinates, and status',
      'Cross-reference with conflict map for proximity analysis',
    ],
    legend: [
      { color: '#ef4444', label: 'Army Base' },
      { color: '#f97316', label: 'Airbase / Airport' },
      { color: '#3b82f6', label: 'Naval Post' },
      { color: '#8b5cf6', label: 'Command HQ' },
    ],
  },
  {
    href:    '/operations',
    id:      'MOD-04',
    label:   'OPS TIMELINE',
    title:   'Major Operations',
    color:   '#f97316',
    src:     '/screenshots/operations.png',
    desc:    'Chronological record of major offensives since the 2021 coup. Resistance operations, junta counter-offensives, territorial control shifts.',
    features: [
      'Gantt-style bars show operation duration and overlap',
      'Momentum panel — actor territorial gains/losses over time',
      'Scrub the timeline to see the war\'s state on any date',
    ],
    legend: [
      { color: '#f97316', label: 'EAO / Resistance' },
      { color: '#ef4444', label: 'Tatmadaw' },
      { color: '#8b5cf6', label: 'Multi-front' },
      { color: '#06b6d4', label: 'Ceasefire' },
    ],
  },
]

const GLOSSARY = [
  { term: 'PDF',        def: 'People\'s Defence Force — armed wing of the NUG, formed after the 2021 coup' },
  { term: 'Tatmadaw',  def: 'Myanmar\'s military, ruling as the State Administration Council (SAC) since Feb 2021' },
  { term: 'EAO',       def: 'Ethnic Armed Organisation — KIA, AA, TNLA, MNDAA, KNU/KNLA, CNF, RCSS and others' },
  { term: 'NUG',       def: 'National Unity Government — parallel government formed by ousted civilian MPs' },
  { term: '3BHA',      def: 'Three Brotherhood Alliance — TNLA + MNDAA + AA. Launched Operation 1027 in Oct 2023' },
  { term: 'Confidence',def: 'Event reliability score (0–1). Source quality × corroboration count × geocoding precision' },
  { term: 'Bias Flag', def: 'neutral | pro_resistance | pro_junta | unverified_claim — AI-assessed per article' },
  { term: 'Volatility',def: 'Composite regional score: event frequency + actor diversity + fatalities + recency decay' },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#070b12] text-slate-200" style={{ fontFamily: 'var(--font-inter), system-ui, sans-serif' }}>

      {/* ── Classification header ── */}
      <div className="border-b border-white/[0.07] px-6 py-2.5 flex items-center justify-between">
        <span className="text-[9px] font-mono text-slate-600 tracking-[0.18em] uppercase">
          // Myanmar Civil War · Open-Source Intelligence //
        </span>
        <span className="text-[9px] font-mono text-slate-700 tracking-widest uppercase">
          Unclassified / Public Domain
        </span>
      </div>

      {/* ── Hero ── */}
      <section className="border-b border-white/[0.07] px-6 pt-10 pb-8">
        <div className="max-w-screen-xl mx-auto">
          <div className="flex items-start gap-3 mb-1">
            <span className="mt-1 w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shrink-0" />
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-100 leading-none mb-2">
                Myanmar War Map
              </h1>
              <p className="text-sm text-slate-500 leading-relaxed max-w-2xl">
                Independent OSINT platform tracking the Myanmar Civil War.
                Conflict events are extracted from news sources, geocoded, and analysed
                using AI — updated daily. All data is open-source and unclassified.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Dashboard briefing files ── */}
      <section className="max-w-screen-xl mx-auto px-6 pt-10 pb-4">
        <p className="text-[9px] font-mono text-slate-600 tracking-[0.18em] uppercase mb-6">
          Platform Modules
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-white/[0.05]">
          {DASHBOARDS.map(d => (
            <div key={d.href} className="bg-[#070b12] flex flex-col">

              {/* Screenshot — full bleed, no padding */}
              <div className="relative w-full bg-[#0a0e17]" style={{ aspectRatio: '16/9' }}>
                <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: d.color }} />
                <Image
                  src={d.src}
                  alt={d.label}
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                {/* ID badge — top right */}
                <div className="absolute top-3 right-3 px-2 py-0.5 text-[8px] font-mono tracking-widest"
                  style={{ background: '#070b12cc', color: d.color, border: `1px solid ${d.color}40` }}>
                  {d.id}
                </div>
              </div>

              {/* Info strip */}
              <div className="flex flex-col flex-1 border-t border-white/[0.06]" style={{ borderLeftWidth: 2, borderLeftColor: d.color + '60', borderLeftStyle: 'solid' }}>

                {/* Title row */}
                <div className="px-5 pt-4 pb-3 flex items-start justify-between gap-4 border-b border-white/[0.05]">
                  <div>
                    <div className="text-[9px] font-mono tracking-[0.15em] uppercase mb-1" style={{ color: d.color }}>
                      {d.label}
                    </div>
                    <div className="text-sm font-semibold text-slate-100">{d.title}</div>
                  </div>
                  <Link
                    href={d.href}
                    className="shrink-0 text-[10px] font-mono tracking-wider text-slate-500 hover:text-slate-200 transition-colors pt-0.5 whitespace-nowrap"
                    style={{ textDecorationColor: d.color }}>
                    OPEN →
                  </Link>
                </div>

                {/* Description */}
                <div className="px-5 py-3 border-b border-white/[0.05]">
                  <p className="text-xs text-slate-500 leading-relaxed">{d.desc}</p>
                </div>

                {/* Features */}
                <div className="px-5 py-3 border-b border-white/[0.05]">
                  <div className="text-[8px] font-mono text-slate-700 tracking-widest uppercase mb-2">Usage</div>
                  <ul className="space-y-1">
                    {d.features.map((f, i) => (
                      <li key={i} className="text-[11px] text-slate-500 leading-relaxed flex gap-2">
                        <span className="font-mono text-slate-700 shrink-0">›</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Legend */}
                <div className="px-5 py-3">
                  <div className="text-[8px] font-mono text-slate-700 tracking-widest uppercase mb-2">Legend</div>
                  <div className="flex flex-wrap gap-x-5 gap-y-1">
                    {d.legend.map(l => (
                      <div key={l.label} className="flex items-center gap-1.5">
                        <div className="w-2 h-2 shrink-0" style={{ background: l.color }} />
                        <span className="text-[9px] font-mono text-slate-600">{l.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pipeline ── */}
      <section className="max-w-screen-xl mx-auto px-6 py-10 border-t border-white/[0.07]">
        <p className="text-[9px] font-mono text-slate-600 tracking-[0.18em] uppercase mb-5">
          Data Pipeline
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/[0.06]">
          {[
            {
              step: '01 — SCRAPE',
              engine: 'RSS + HTTP',
              desc: 'RFA, Irrawaddy, Myanmar Now, BNI, DVB and other outlets scraped daily. Articles matching Myanmar conflict keywords saved to the raw article store.',
            },
            {
              step: '02 — EXTRACT',
              engine: 'Groq · Llama 3.3 70B',
              desc: 'Each article is parsed for structured events — date, location, event type, actors, casualty range. Business, economic, and conscription articles are discarded.',
            },
            {
              step: '03 — ANALYSE',
              engine: 'DeepSeek · deepseek-chat',
              desc: 'Military intelligence layer: identifies attacker and defender, detects allied actors (PDF+CDF = same side), writes a summary, assigns confidence score.',
            },
          ].map(s => (
            <div key={s.step} className="px-5 py-4 sm:first:pl-0 sm:last:pr-0">
              <div className="text-[9px] font-mono text-slate-400 tracking-widest uppercase mb-1">{s.step}</div>
              <div className="text-[9px] font-mono text-slate-600 mb-3">{s.engine}</div>
              <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Glossary ── */}
      <section className="max-w-screen-xl mx-auto px-6 py-10 border-t border-white/[0.07]">
        <p className="text-[9px] font-mono text-slate-600 tracking-[0.18em] uppercase mb-5">
          Reference — Key Terms
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-16">
          {GLOSSARY.map(g => (
            <div key={g.term} className="flex gap-4 py-2.5 border-b border-white/[0.04]">
              <span className="font-mono text-[10px] font-semibold text-slate-400 w-20 shrink-0 pt-px">{g.term}</span>
              <span className="text-[11px] text-slate-600 leading-relaxed">{g.def}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/[0.07] px-6 py-5 max-w-screen-xl mx-auto">
        <p className="text-[9px] font-mono text-slate-700">
          All data derived from open-source public reporting. Not affiliated with any government, military, or political organisation.
          For verified reporting consult ACLED, UN OCHA, and established Myanmar news outlets.
        </p>
      </footer>

    </div>
  )
}
