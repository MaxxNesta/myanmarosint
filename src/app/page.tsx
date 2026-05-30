import Link from 'next/link'
import Image from 'next/image'

export const metadata = {
  title: 'Myanmar War Map — OSINT Platform',
}

// ── Screenshot preview ────────────────────────────────────────────────────────

function ScreenshotPreview({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative w-full rounded overflow-hidden border border-white/10 bg-[#0a0e17]" style={{ aspectRatio: '16/9' }}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover object-top"
        sizes="(max-width: 1024px) 100vw, 50vw"
      />
    </div>
  )
}

// ── Dashboard cards data ──────────────────────────────────────────────────────

const DASHBOARDS = [
  {
    href:    '/map',
    icon:    '🗺',
    label:   'CONFLICT MAP',
    title:   'Live Conflict Map',
    tagline: 'Where is the fighting happening right now?',
    color:   '#3b82f6',
    preview: <ScreenshotPreview src="/screenshots/map.png" alt="Conflict Map" />,
    what: 'Plots every conflict event extracted from news sources — airstrikes, clashes, sieges, displacement — as colour-coded circles on a live map of Myanmar.',
    features: [
      'Click any dot to see the event brief, attacker/defender, date, and fatality count',
      'Toggle heatmap to see intensity clusters by region',
      'Filter by event type using the legend (bottom-right)',
      'Circles scale with fatality count — larger = more deaths',
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
    icon:    '📡',
    label:   'INTEL DASHBOARD',
    title:   'Intelligence Dashboard',
    tagline: 'How dangerous is each region, and is it getting worse?',
    color:   '#8b5cf6',
    preview: <ScreenshotPreview src="/screenshots/intel.png" alt="Intel Dashboard" />,
    what: 'Aggregates all conflict data into regional risk scores, escalation trends, and volatility analysis. Powered by the same pipeline that feeds the map.',
    features: [
      'Daily Brief: total events this week vs last week, top active region',
      'Risk Outlook: bar chart of risk score (0–100) per state/region',
      'Escalation Signals: regions with >25% more events than prior week',
      'Region Volatility: composite score from event count, actor diversity, fatalities, and recency',
      'Event Clusters: group events by region, type, or week to spot patterns',
    ],
    legend: [
      { color: '#ef4444', label: 'Score 80–100 Critical' },
      { color: '#f97316', label: 'Score 60–79 High' },
      { color: '#f59e0b', label: 'Score 40–59 Elevated' },
      { color: '#22c55e', label: 'Score 0–39 Guarded' },
    ],
  },
  {
    href:    '/bases',
    icon:    '🛡',
    label:   'MILITARY BASES',
    title:   'Military Installations',
    tagline: 'Where are the military bases, airbases, and command posts?',
    color:   '#ef4444',
    preview: <ScreenshotPreview src="/screenshots/bases.png" alt="Military Bases" />,
    what: 'Maps known Tatmadaw military bases, airbases, naval posts, and command headquarters across Myanmar sourced from open-source intelligence.',
    features: [
      'Filter by base type: Army, Air Force, Navy, Command HQ',
      'Click a base for details: unit designation, coordinates, status',
      'Cross-reference with conflict map to see fighting near installations',
      'Data sourced from ACLED, NeatoGeo, and satellite imagery analysis',
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
    icon:    '⚔',
    label:   'OPS TIMELINE',
    title:   'Operations Timeline',
    tagline: 'What major offensives have shaped the war?',
    color:   '#f97316',
    preview: <ScreenshotPreview src="/screenshots/operations.png" alt="Operations Timeline" />,
    what: 'Chronological view of major military operations since the 2021 coup — resistance offensives, junta counter-offensives, territorial control changes.',
    features: [
      'Gantt-style bars show operation duration and overlap',
      'Click an operation to see involved actors, regions, and key events',
      'Momentum panel tracks each actor\'s territorial gains/losses over time',
      'Scrub through time to see the state of the war at any date',
    ],
    legend: [
      { color: '#f97316', label: 'EAO / Resistance offensive' },
      { color: '#ef4444', label: 'Tatmadaw counter-offensive' },
      { color: '#8b5cf6', label: 'Multi-front operation' },
      { color: '#06b6d4', label: 'Ceasefire / negotiation' },
    ],
  },
]

// ── Glossary entries ──────────────────────────────────────────────────────────

const GLOSSARY = [
  { term: 'PDF',       def: 'People\'s Defence Force — armed wing of the NUG (opposition government), formed after the 2021 coup' },
  { term: 'Tatmadaw', def: 'Myanmar\'s military, now ruling the country as the State Administration Council (SAC) after the Feb 2021 coup' },
  { term: 'EAO',      def: 'Ethnic Armed Organisation — independent armed groups representing ethnic minorities (KIA, AA, TNLA, MNDAA, KNU/KNLA, CNF, RCSS…)' },
  { term: 'NUG',      def: 'National Unity Government — the parallel government formed by ousted civilian MPs and ministers' },
  { term: '3BHA',     def: 'Three Brotherhood Alliance — TNLA, MNDAA, and AA acting together, launched Operation 1027 in Oct 2023' },
  { term: 'Confidence', def: 'How reliable an event record is (0–1). Combines source reliability, corroboration count, geocoding precision, and bias flag' },
  { term: 'Bias Flag', def: 'neutral | pro_resistance | pro_junta | unverified_claim — assessed by AI on the source article' },
  { term: 'Volatility', def: 'Composite score (0–100) measuring a region\'s conflict intensity: event frequency + actor diversity + fatalities + recency' },
]

// ─────────────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#070b12] text-slate-200">

      {/* ── Hero ── */}
      <section className="border-b border-white/[0.07] px-6 py-12 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse"/>
            <span className="text-[10px] font-mono text-red-400 tracking-widest uppercase">Live · OSINT · Unclassified</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-100 mb-3">Myanmar War Map</h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Independent open-source intelligence platform tracking the Myanmar Civil War.
            Conflict events are automatically extracted from news sources, geocoded, and analysed
            using AI — updated daily.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            {DASHBOARDS.map(d => (
              <Link key={d.href} href={d.href}
                className="px-4 py-2 rounded text-xs font-mono font-medium border transition-colors hover:text-slate-100"
                style={{ borderColor: d.color + '40', color: d.color, background: d.color + '12' }}>
                {d.icon} {d.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Dashboard cards ── */}
      <section className="max-w-screen-xl mx-auto px-6 py-12">
        <div className="text-[10px] font-mono text-slate-600 tracking-widest uppercase mb-6">Dashboards</div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {DASHBOARDS.map(d => (
            <div key={d.href} className="rounded-xl border border-white/[0.07] bg-[#0a0e17] overflow-hidden flex flex-col">

              {/* header */}
              <div className="px-5 pt-5 pb-3 border-b border-white/[0.05]">
                <div className="flex items-start justify-between gap-3 mb-1">
                  <div>
                    <div className="text-[9px] font-mono tracking-widest mb-1" style={{ color: d.color }}>{d.icon} {d.label}</div>
                    <h2 className="text-base font-bold text-slate-100">{d.title}</h2>
                    <p className="text-xs text-slate-500 mt-0.5 italic">{d.tagline}</p>
                  </div>
                  <Link href={d.href}
                    className="shrink-0 px-3 py-1.5 rounded text-[10px] font-mono font-medium transition-colors border"
                    style={{ borderColor: d.color + '50', color: d.color, background: d.color + '15' }}>
                    Open →
                  </Link>
                </div>
              </div>

              {/* preview mockup */}
              <div className="px-5 py-4 border-b border-white/[0.05]">
                {d.preview}
              </div>

              {/* what is it */}
              <div className="px-5 py-4 border-b border-white/[0.05]">
                <div className="text-[9px] font-mono text-slate-600 tracking-widest uppercase mb-2">What it shows</div>
                <p className="text-xs text-slate-400 leading-relaxed">{d.what}</p>
              </div>

              {/* features */}
              <div className="px-5 py-4 border-b border-white/[0.05]">
                <div className="text-[9px] font-mono text-slate-600 tracking-widest uppercase mb-2">How to use it</div>
                <ul className="space-y-1.5">
                  {d.features.map((f, i) => (
                    <li key={i} className="flex gap-2 text-xs text-slate-400">
                      <span className="text-slate-700 shrink-0 font-mono">—</span>
                      <span className="leading-relaxed">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* legend */}
              <div className="px-5 py-4">
                <div className="text-[9px] font-mono text-slate-600 tracking-widest uppercase mb-2">Colour legend</div>
                <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                  {d.legend.map(l => (
                    <div key={l.label} className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: l.color + '80', border: `1px solid ${l.color}` }}/>
                      <span className="text-[9px] font-mono text-slate-500">{l.label}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ))}
        </div>
      </section>

      {/* ── How data is collected ── */}
      <section className="border-t border-white/[0.07] max-w-screen-xl mx-auto px-6 py-12">
        <div className="text-[10px] font-mono text-slate-600 tracking-widest uppercase mb-6">How the data pipeline works</div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              step: '01',
              title: 'Scrape',
              color: '#3b82f6',
              desc: 'RSS feeds from RFA, Irrawaddy, Myanmar Now, BNI, DVB, and others are scraped daily. Articles mentioning Myanmar conflict keywords are saved.',
            },
            {
              step: '02',
              title: 'Extract',
              color: '#8b5cf6',
              desc: 'Groq (Llama 3.3 70B) reads each article and extracts structured events — date, location, event type, actors, casualties. Business/economy articles are skipped.',
            },
            {
              step: '03',
              title: 'Analyse',
              color: '#f97316',
              desc: 'DeepSeek analyses each event to identify attacker vs defender, detect alliances (PDF+CDF = same side), write a military intelligence summary, and assign confidence.',
            },
          ].map(s => (
            <div key={s.step} className="rounded-lg border border-white/[0.07] bg-[#0a0e17] p-5">
              <div className="text-2xl font-bold font-mono mb-2 opacity-30" style={{ color: s.color }}>{s.step}</div>
              <div className="text-sm font-bold text-slate-200 mb-2">{s.title}</div>
              <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Glossary ── */}
      <section className="border-t border-white/[0.07] max-w-screen-xl mx-auto px-6 py-12">
        <div className="text-[10px] font-mono text-slate-600 tracking-widest uppercase mb-6">Key terms & abbreviations</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-3">
          {GLOSSARY.map(g => (
            <div key={g.term} className="flex gap-3 text-xs py-2 border-b border-white/[0.04]">
              <span className="font-mono font-bold text-slate-300 w-24 shrink-0">{g.term}</span>
              <span className="text-slate-500 leading-relaxed">{g.def}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/[0.07] px-6 py-8 text-center">
        <p className="text-[10px] font-mono text-slate-700 leading-relaxed">
          All data is derived from open-source news and public reporting.
          This platform does not represent any government, military, or political organisation.
          For verified reporting, consult{' '}
          <span className="text-slate-600">ACLED, UN OCHA, and established Myanmar news outlets</span>.
        </p>
      </footer>

    </div>
  )
}
