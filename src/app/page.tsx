import Link from 'next/link'
import Image from 'next/image'

export const metadata = {
  title: 'Myanmar War Map — OSINT Platform',
}

const DASHBOARDS = [
  {
    href:  '/map',
    label: 'CONFLICT MAP',
    title: 'Live Conflict Events',
    color: '#3b82f6',
    src:   '/screenshots/map.jpeg',
    w: 2868, h: 1456,
    desc:  'Every conflict event extracted from news — airstrikes, clashes, sieges, displacement — plotted as a geocoded marker on a live map of Myanmar.',
    features: [
      'Click any marker to see the event brief, attacker, defender, and fatality count',
      'Toggle heatmap overlay to see intensity clusters by region',
      'Marker size scales with reported fatalities',
      'Filter by event type via the legend panel (bottom-right)',
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
    href:  '/intel',
    label: 'INTEL DASHBOARD',
    title: 'Regional Intelligence',
    color: '#8b5cf6',
    src:   '/screenshots/intel.jpeg',
    w: 3806, h: 1936,
    desc:  'Aggregated risk scores, escalation detection, and volatility analysis across all states and regions — updated each time the pipeline runs.',
    features: [
      'Daily Brief — event count vs prior week, top active region',
      'Risk Outlook — composite score (0–100) per state or region',
      'Escalation Signals — regions trending more than 25% above prior week baseline',
      'Volatility score weighted by event frequency, actor diversity, fatalities, and recency',
    ],
    legend: [
      { color: '#ef4444', label: '80–100  Critical' },
      { color: '#f97316', label: '60–79   High' },
      { color: '#f59e0b', label: '40–59   Elevated' },
      { color: '#22c55e', label: '0–39    Guarded' },
    ],
  },
  {
    href:  '/bases',
    label: 'MILITARY BASES',
    title: 'Known Installations',
    color: '#ef4444',
    src:   '/screenshots/bases.jpeg',
    w: 2400, h: 1222,
    desc:  'Open-source mapped Tatmadaw military bases, airbases, naval posts, and command headquarters. Sourced from ACLED, NeatoGeo, and satellite imagery.',
    features: [
      'Filter by installation type — Army, Air Force, Navy, Command HQ',
      'Click any base for unit designation, coordinates, and status',
      'Cross-reference with the conflict map to see fighting near installations',
    ],
    legend: [
      { color: '#ef4444', label: 'Army Base' },
      { color: '#f97316', label: 'Airbase' },
      { color: '#3b82f6', label: 'Naval Post' },
      { color: '#8b5cf6', label: 'Command HQ' },
    ],
  },
  {
    href:  '/operations',
    label: 'OPS TIMELINE',
    title: 'Major Operations',
    color: '#f97316',
    src:   '/screenshots/operations.jpeg',
    w: 3156, h: 1596,
    desc:  'Chronological record of major offensives since the 2021 coup — resistance operations, junta counter-offensives, territorial control shifts.',
    features: [
      'Gantt-style bars show operation duration and overlap',
      'Momentum panel tracks each actor\'s territorial gains and losses over time',
      'Scrub the timeline to see the state of the war on any date',
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
  { term: 'PDF',         def: "People's Defence Force — armed wing of the NUG, formed after the 2021 coup" },
  { term: 'Tatmadaw',   def: "Myanmar's military, ruling as the State Administration Council (SAC) since Feb 2021" },
  { term: 'EAO',        def: 'Ethnic Armed Organisation — KIA, AA, TNLA, MNDAA, KNU/KNLA, CNF, RCSS and others' },
  { term: 'NUG',        def: 'National Unity Government — parallel government formed by ousted civilian MPs' },
  { term: '3BHA',       def: 'Three Brotherhood Alliance — TNLA + MNDAA + AA. Launched Operation 1027 in Oct 2023' },
  { term: 'Confidence', def: 'Event reliability score (0–1): source quality × corroboration count × geocoding precision' },
  { term: 'Bias Flag',  def: 'neutral | pro_resistance | pro_junta | unverified_claim — AI-assessed per article' },
  { term: 'Volatility', def: 'Composite regional score: event frequency + actor diversity + fatalities + recency decay' },
]

function DashboardRow({
  d,
  index,
}: {
  d: (typeof DASHBOARDS)[0]
  index: number
}) {
  const reversed = index % 2 === 1

  const textBlock = (
    <div className="flex flex-col justify-center py-14 px-10 lg:px-14">
      {/* label */}
      <div
        className="text-[9px] font-mono tracking-[0.22em] uppercase mb-4"
        style={{ color: d.color }}
      >
        {d.label}
      </div>

      {/* title */}
      <h2 className="text-2xl font-bold text-white mb-3 leading-snug" style={{ fontFamily: 'var(--font-inter), Arial, sans-serif' }}>
        {d.title}
      </h2>

      {/* description */}
      <p className="text-sm text-slate-400 leading-relaxed mb-7">{d.desc}</p>

      {/* usage list — white, bigger, sans-serif */}
      <ul className="space-y-2 mb-7">
        {d.features.map((f, i) => (
          <li key={i} className="flex gap-2.5 leading-snug" style={{ fontFamily: 'Arial, sans-serif', fontSize: '0.8rem', color: '#cbd5e1' }}>
            <span className="shrink-0 mt-0.5" style={{ color: d.color }}>›</span>
            {f}
          </li>
        ))}
      </ul>

      {/* legend */}
      <div className="flex flex-wrap gap-x-5 gap-y-2 mb-8">
        {d.legend.map(l => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 shrink-0" style={{ background: l.color }} />
            <span className="text-[10px] font-mono text-slate-500">{l.label}</span>
          </div>
        ))}
      </div>

      {/* open link */}
      <Link
        href={d.href}
        className="self-start text-sm font-medium text-slate-300 hover:text-white transition-colors border border-white/[0.12] hover:border-white/25 px-5 py-2.5"
        style={{ fontFamily: 'Arial, sans-serif' }}
      >
        Open {d.title} →
      </Link>
    </div>
  )

  // Screenshot: 3/5 columns, natural aspect ratio, no cropping
  const imageBlock = (
    <div className="lg:col-span-3 flex items-center bg-[#070b12]">
      <Image
        src={d.src}
        alt={d.label}
        width={d.w}
        height={d.h}
        className="w-full h-auto block"
        quality={90}
      />
    </div>
  )

  // Text: 2/5 columns
  const textCol = (
    <div className="lg:col-span-2">
      {textBlock}
    </div>
  )

  return (
    <div className="border-b border-white/[0.06]">
      <div className="max-w-screen-xl mx-auto grid grid-cols-1 lg:grid-cols-5">
        {reversed ? (
          <>
            {textCol}
            {imageBlock}
          </>
        ) : (
          <>
            {imageBlock}
            {textCol}
          </>
        )}
      </div>
    </div>
  )
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#070b12] text-slate-200">

      {/* ── Hero ── */}
      <section className="border-b border-white/[0.07] px-6 py-14">
        <div className="max-w-screen-xl mx-auto">
          <div className="flex items-start gap-3 mb-4">
            <span className="mt-2 w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shrink-0" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-100 mb-3">
                Myanmar War Map
              </h1>
              <p className="text-sm text-slate-500 leading-relaxed max-w-xl">
                Independent open-source intelligence platform tracking the Myanmar Civil War.
                Conflict events are extracted from news sources, geocoded, and analysed using AI — updated daily.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 pl-4">
            {DASHBOARDS.map(d => (
              <Link
                key={d.href}
                href={d.href}
                className="text-[10px] font-mono text-slate-500 hover:text-slate-300 transition-colors px-3 py-1.5 border border-white/[0.07] hover:border-white/[0.14]"
              >
                {d.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Dashboard rows ── */}
      <section>
        {DASHBOARDS.map((d, i) => (
          <DashboardRow key={d.href} d={d} index={i} />
        ))}
      </section>

      {/* ── Pipeline ── */}
      <section className="border-t border-white/[0.07] py-14">
        <div className="max-w-screen-xl mx-auto px-6">

          <div className="flex items-center justify-between mb-10">
            <div>
              <p className="text-[9px] font-mono text-slate-600 tracking-[0.2em] uppercase mb-1">Intelligence Pipeline</p>
              <h2 className="text-lg font-bold text-slate-200">How raw news becomes a verified conflict event</h2>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono text-slate-600">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Runs every 6 hours · automated
            </div>
          </div>

          {/* Step flow */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

            {/* 01 */}
            <div className="border border-white/[0.08] rounded p-5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[10px] font-mono text-slate-600 bg-white/[0.06] px-2 py-0.5 rounded">01</span>
                <span className="text-xs font-mono text-blue-400 tracking-wide">INGEST</span>
                <span className="text-[10px] font-mono text-slate-700 ml-auto">RSS + Telegram</span>
              </div>
              <p className="text-sm font-medium text-slate-300 mb-2">28 sources scraped</p>
              <p className="text-xs text-slate-500 leading-relaxed mb-3">
                28 Myanmar news RSS feeds + 7 Telegram channels (Irrawaddy, DVB, Khit Thit, BBC Burmese, Myanmar Now and more) polled every 6 hours. Each article is checked for Myanmar relevance before storage.
              </p>
              <div className="text-[10px] font-mono text-slate-600 border-t border-white/[0.05] pt-3">
                Sources: Irrawaddy · DVB · Myanmar Now · RFA · BNI · Narinjara · Kachin News · Karen News · Mizzima · Al Jazeera · Reuters +17 more
              </div>
            </div>

            {/* 02 */}
            <div className="border border-white/[0.08] rounded p-5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[10px] font-mono text-slate-600 bg-white/[0.06] px-2 py-0.5 rounded">02</span>
                <span className="text-xs font-mono text-yellow-400 tracking-wide">FILTER</span>
                <span className="text-[10px] font-mono text-slate-700 ml-auto">~90% discarded</span>
              </div>
              <p className="text-sm font-medium text-slate-300 mb-2">Conflict keyword gate</p>
              <p className="text-xs text-slate-500 leading-relaxed mb-3">
                Articles must match at least one conflict signal in English or Burmese script before being processed. Economy, politics, sports, opinion pieces, and advocacy articles are discarded before any AI call is made.
              </p>
              <div className="flex flex-wrap gap-1 border-t border-white/[0.05] pt-3">
                {['clash','airstrike','shelling','seized','killed','တိုက်ပွဲ','လေကြောင်း','သိမ်းပိုက်','ကျဆုံး','ဒုံး'].map(k => (
                  <span key={k} className="text-[9px] font-mono text-slate-600 bg-white/[0.04] px-1.5 py-0.5 rounded">{k}</span>
                ))}
                <span className="text-[9px] font-mono text-slate-700">+40 more</span>
              </div>
            </div>

            {/* 03 */}
            <div className="border border-white/[0.08] rounded p-5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[10px] font-mono text-slate-600 bg-white/[0.06] px-2 py-0.5 rounded">03</span>
                <span className="text-xs font-mono text-orange-400 tracking-wide">EXTRACT</span>
                <span className="text-[10px] font-mono text-slate-700 ml-auto">Groq · Llama 3.3 70B</span>
              </div>
              <p className="text-sm font-medium text-slate-300 mb-2">Structured event extraction</p>
              <p className="text-xs text-slate-500 leading-relaxed mb-3">
                Llama 3.3 70B reads each article (English and Burmese) and extracts a structured conflict event: event type, date, location, actors, attacker, defender, and casualty estimates. Non-conflict articles return empty.
              </p>
              <div className="flex flex-wrap gap-1 border-t border-white/[0.05] pt-3">
                {['CLASH','AIRSTRIKE','SHELLING','SIEGE','RECAPTURED','DISPLACEMENT','HUMANITARIAN','POLITICAL'].map(t => (
                  <span key={t} className="text-[9px] font-mono text-slate-600 bg-white/[0.04] px-1.5 py-0.5 rounded">{t}</span>
                ))}
              </div>
            </div>

            {/* 04 */}
            <div className="border border-white/[0.08] rounded p-5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[10px] font-mono text-slate-600 bg-white/[0.06] px-2 py-0.5 rounded">04</span>
                <span className="text-xs font-mono text-purple-400 tracking-wide">VALIDATE</span>
                <span className="text-[10px] font-mono text-slate-700 ml-auto">DeepSeek · deepseek-chat</span>
              </div>
              <p className="text-sm font-medium text-slate-300 mb-2">Location correction + alliance rules</p>
              <p className="text-xs text-slate-500 leading-relaxed mb-3">
                DeepSeek corrects common extraction errors — wrong state assignment, source location vs. event location. Enforces alliance rules: PDF/CDF always fight together, 3BHA (TNLA+MNDAA+AA) are never split across sides.
              </p>
              <div className="text-[10px] font-mono text-slate-600 border-t border-white/[0.05] pt-3">
                Output: attackerActor · defenderActor · corrected region · confidence 0–1
              </div>
            </div>

            {/* 05 */}
            <div className="border border-white/[0.08] rounded p-5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[10px] font-mono text-slate-600 bg-white/[0.06] px-2 py-0.5 rounded">05</span>
                <span className="text-xs font-mono text-green-400 tracking-wide">GEOCODE</span>
                <span className="text-[10px] font-mono text-slate-700 ml-auto">200+ township DB</span>
              </div>
              <p className="text-sm font-medium text-slate-300 mb-2">Coordinate resolution</p>
              <p className="text-xs text-slate-500 leading-relaxed mb-3">
                Location names are matched against a 200+ Myanmar township coordinate database. Falls back to state polygon centroid lookup using GeoJSON boundaries. Events with no resolvable state are discarded — no vague country-level pins.
              </p>
              <div className="text-[10px] font-mono text-slate-600 border-t border-white/[0.05] pt-3">
                Precision levels: exact town → township centroid → district → state/region
              </div>
            </div>

            {/* 06 */}
            <div className="border border-white/[0.08] rounded p-5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[10px] font-mono text-slate-600 bg-white/[0.06] px-2 py-0.5 rounded">06</span>
                <span className="text-xs font-mono text-red-400 tracking-wide">STORE</span>
                <span className="text-[10px] font-mono text-slate-700 ml-auto">Neon PostgreSQL</span>
              </div>
              <p className="text-sm font-medium text-slate-300 mb-2">Deduplication + confidence scoring</p>
              <p className="text-xs text-slate-500 leading-relaxed mb-3">
                Each event is SHA-256 hashed on actors + region + type + date. Duplicate events from different sources increment confidence rather than creating duplicate pins. Confidence = source reliability × corroboration count × DeepSeek score.
              </p>
              <div className="text-[10px] font-mono text-slate-600 border-t border-white/[0.05] pt-3">
                Schema: RawArticle → ConflictEvent → AnalysedEvent · 3-stage pipeline
              </div>
            </div>

          </div>

          {/* Flow bar */}
          <div className="mt-6 flex flex-wrap items-center gap-2 text-[10px] font-mono text-slate-700">
            {['RSS / Telegram','Keyword filter','Llama 3.3 70B','DeepSeek validation','Township geocode','Dedup + score','Mapbox GL map'].map((s, i, arr) => (
              <span key={s} className="flex items-center gap-2">
                <span className="text-slate-500">{s}</span>
                {i < arr.length - 1 && <span className="text-slate-800">→</span>}
              </span>
            ))}
          </div>

        </div>
      </section>

      {/* ── Glossary ── */}
      <section className="border-t border-white/[0.07] py-12">
        <div className="max-w-screen-xl mx-auto px-6">
          <p className="text-[9px] font-mono text-slate-600 tracking-[0.2em] uppercase mb-6">
            Key Terms
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-16">
            {GLOSSARY.map(g => (
              <div key={g.term} className="flex gap-4 py-2.5 border-b border-white/[0.04]">
                <span className="font-mono text-[10px] font-semibold text-slate-400 w-20 shrink-0 pt-px">
                  {g.term}
                </span>
                <span className="text-[11px] text-slate-600 leading-relaxed">{g.def}</span>
              </div>
            ))}
          </div>
        </div>
      </section>


    </div>
  )
}
