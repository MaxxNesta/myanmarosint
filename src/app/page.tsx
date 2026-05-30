import Link from 'next/link'

export const metadata = {
  title: 'Myanmar War Map — OSINT Platform',
}

// ── CSS mockup previews for each dashboard ────────────────────────────────────

function MapPreview() {
  return (
    <div className="relative w-full h-36 rounded overflow-hidden bg-[#0a1628] border border-white/10">
      {/* grid lines */}
      <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
      {/* simulated coastline / region blobs */}
      <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 280 144" xmlns="http://www.w3.org/2000/svg">
        <path d="M80,20 C90,15 110,18 120,30 C130,42 125,60 130,75 C135,90 145,100 140,115 C135,130 120,135 110,130 C100,125 88,115 82,100 C76,85 70,70 72,50 Z" fill="#1d4ed8" opacity="0.3"/>
        <path d="M120,25 C135,20 155,22 160,35 C165,48 155,65 150,80 C145,95 148,110 140,115" fill="none" stroke="#3b82f6" strokeWidth="1.5" opacity="0.5"/>
      </svg>
      {/* event dots */}
      {[
        { x: '22%', y: '28%', c: '#ef4444', r: 7 },
        { x: '38%', y: '45%', c: '#f97316', r: 5 },
        { x: '55%', y: '35%', c: '#ef4444', r: 9 },
        { x: '48%', y: '62%', c: '#f59e0b', r: 5 },
        { x: '70%', y: '50%', c: '#ef4444', r: 6 },
        { x: '30%', y: '70%', c: '#06b6d4', r: 4 },
        { x: '62%', y: '78%', c: '#8b5cf6', r: 4 },
        { x: '82%', y: '40%', c: '#f97316', r: 5 },
      ].map((d, i) => (
        <div key={i} className="absolute rounded-full opacity-80 ring-1 ring-white/20"
          style={{ left: d.x, top: d.y, width: d.r*2, height: d.r*2, background: d.c, transform: 'translate(-50%,-50%)' }} />
      ))}
      {/* heatmap overlay */}
      <div className="absolute inset-0 bg-gradient-radial opacity-20" style={{background: 'radial-gradient(ellipse at 55% 38%, #ef444440 0%, transparent 50%)'}} />
      <div className="absolute bottom-2 left-2 text-[8px] font-mono text-slate-500 uppercase tracking-widest">Live events · Mapbox GL</div>
    </div>
  )
}

function IntelPreview() {
  const bars = [62, 88, 45, 95, 72, 38, 81]
  return (
    <div className="w-full h-36 rounded overflow-hidden bg-[#070b12] border border-white/10 p-2 flex flex-col gap-1.5">
      <div className="flex gap-1.5">
        {/* mini risk bars */}
        <div className="flex-1 bg-[#0d1520] rounded p-1.5">
          <div className="text-[7px] font-mono text-slate-600 mb-1 uppercase tracking-wider">Region Risk</div>
          <div className="flex items-end gap-0.5 h-10">
            {bars.map((h, i) => (
              <div key={i} className="flex-1 rounded-sm" style={{
                height: `${h}%`,
                background: h > 80 ? '#ef4444' : h > 60 ? '#f97316' : h > 40 ? '#f59e0b' : '#22c55e',
                opacity: 0.8,
              }}/>
            ))}
          </div>
        </div>
        {/* mini escalation */}
        <div className="w-24 bg-[#0d1520] rounded p-1.5 flex flex-col gap-1">
          <div className="text-[7px] font-mono text-slate-600 mb-0.5 uppercase tracking-wider">Escalation</div>
          {['Sagaing', 'Rakhine', 'Shan'].map((r, i) => (
            <div key={r} className="flex items-center justify-between">
              <span className="text-[7px] font-mono text-slate-400 truncate">{r}</span>
              <span className="text-[7px] font-mono font-bold" style={{color: i===0 ? '#ef4444' : i===1 ? '#f97316' : '#f59e0b'}}>↑{[32,28,15][i]}%</span>
            </div>
          ))}
        </div>
      </div>
      {/* volatility table mini */}
      <div className="flex-1 bg-[#0d1520] rounded p-1.5">
        <div className="grid grid-cols-3 gap-1">
          {[['Sagaing', 47], ['Rakhine', 52], ['Chin', 31]].map(([r, s]) => (
            <div key={r as string} className="flex items-center gap-1">
              <div className="w-8 h-1 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full rounded-full bg-orange-500" style={{width: `${s}%`}}/>
              </div>
              <span className="text-[7px] font-mono text-slate-500 truncate">{r}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function BasesPreview() {
  const bases = [
    { x: '40%', y: '30%', c: '#ef4444', label: 'MIL' },
    { x: '60%', y: '45%', c: '#ef4444', label: 'MIL' },
    { x: '25%', y: '55%', c: '#f97316', label: 'AIR' },
    { x: '72%', y: '35%', c: '#ef4444', label: 'MIL' },
    { x: '50%', y: '65%', c: '#8b5cf6', label: 'HQ' },
    { x: '35%', y: '72%', c: '#f97316', label: 'AIR' },
  ]
  return (
    <div className="relative w-full h-36 rounded overflow-hidden bg-[#0a1628] border border-white/10">
      <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid2" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid2)" />
      </svg>
      {bases.map((b, i) => (
        <div key={i} className="absolute flex flex-col items-center" style={{left: b.x, top: b.y, transform: 'translate(-50%,-50%)'}}>
          <div className="w-3 h-3 rounded-sm border border-white/30 flex items-center justify-center" style={{background: b.c + '40', borderColor: b.c}}>
            <div className="w-1 h-1 rounded-full" style={{background: b.c}}/>
          </div>
        </div>
      ))}
      {/* legend */}
      <div className="absolute bottom-2 left-2 flex gap-2">
        {[['#ef4444','Military'],['#f97316','Airbase'],['#8b5cf6','Command']].map(([c,l]) => (
          <div key={l} className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-sm" style={{background: c + '60', border: `1px solid ${c}`}}/>
            <span className="text-[7px] font-mono text-slate-500">{l}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function OpsPreview() {
  const ops = [
    { name: '1027', start: 5, end: 55, c: '#f97316' },
    { name: 'Anawrahta', start: 20, end: 70, c: '#ef4444' },
    { name: 'NW Offensive', start: 35, end: 85, c: '#8b5cf6' },
    { name: 'Rakhine', start: 45, end: 95, c: '#06b6d4' },
  ]
  return (
    <div className="w-full h-36 rounded overflow-hidden bg-[#070b12] border border-white/10 p-2.5 flex flex-col gap-2">
      <div className="flex justify-between items-center mb-0.5">
        <span className="text-[7px] font-mono text-slate-600 uppercase tracking-wider">Operations Timeline</span>
        <div className="flex gap-1 text-[7px] font-mono text-slate-600">
          <span>2023</span><span>2024</span><span>2025</span>
        </div>
      </div>
      {ops.map(op => (
        <div key={op.name} className="flex items-center gap-2">
          <span className="text-[8px] font-mono text-slate-400 w-20 truncate shrink-0">{op.name}</span>
          <div className="flex-1 h-3 bg-white/5 rounded-sm relative overflow-hidden">
            <div className="absolute h-full rounded-sm opacity-70"
              style={{left: `${op.start}%`, width: `${op.end - op.start}%`, background: op.c}}/>
          </div>
        </div>
      ))}
      <div className="flex items-center gap-1 mt-auto">
        <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse opacity-70"/>
        <span className="text-[7px] font-mono text-slate-600">Ongoing operations highlighted</span>
      </div>
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
    preview: <MapPreview />,
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
    preview: <IntelPreview />,
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
    preview: <BasesPreview />,
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
    preview: <OpsPreview />,
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
