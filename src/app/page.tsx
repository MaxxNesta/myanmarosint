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
      <section className="border-t border-white/[0.07] py-20 overflow-hidden">
        <div className="max-w-screen-xl mx-auto px-6">

          {/* Header */}
          <div className="mb-16">
            <p className="text-[9px] font-mono text-slate-700 tracking-[0.3em] uppercase mb-4">Intelligence Pipeline</p>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <h2 className="text-[28px] font-bold text-slate-100 leading-tight tracking-tight">
                How 28 sources become<br />
                <span className="text-slate-600 font-light">one verified event on the map</span>
              </h2>
              <div className="flex items-center gap-2 pb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-mono text-slate-600">automated · every 6h</span>
              </div>
            </div>
          </div>

          <div className="relative">
            {/* Spine */}
            <div className="absolute left-0 top-2 bottom-2 w-px hidden lg:block"
              style={{ background: 'linear-gradient(to bottom, #3b82f6 0%, #eab308 20%, #f97316 40%, #a855f7 60%, #22c55e 80%, #ef4444 100%)', opacity: 0.18 }} />

            {/* ── 01 INGEST ── */}
            <div className="lg:pl-8 py-10 border-b border-white/[0.05]">
              <div className="flex items-center gap-3 mb-7">
                <span className="text-[9px] font-mono text-slate-700">01</span>
                <span className="text-[10px] font-mono font-bold tracking-[0.25em] text-blue-400">INGEST</span>
                <span className="text-[9px] font-mono text-slate-700 ml-1">RSS · Telegram MTProto · 6h cadence</span>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-[160px_1fr_280px] gap-8 items-start">
                <div>
                  <div className="text-[72px] font-black leading-none font-mono text-blue-500/25 select-none"
                    style={{ textShadow: '0 0 60px #3b82f620', WebkitTextStroke: '1px #3b82f635' }}>28</div>
                  <p className="text-[9px] font-mono text-slate-600 mt-0.5">sources monitored</p>
                  <div className="flex items-baseline gap-1.5 mt-3">
                    <span className="text-[18px] font-bold font-mono text-blue-400/70">312</span>
                    <span className="text-[9px] text-slate-600">articles/run</span>
                  </div>
                </div>
                <div>
                  <p className="text-[9px] font-mono text-slate-700 tracking-widest mb-3 uppercase">Active feeds</p>
                  <div className="flex flex-wrap gap-1.5">
                    {['Irrawaddy','DVB','Myanmar Now','RFA Burma','BNI Multimedia','Narinjara','Kachin News','BBC Burmese','Al Jazeera','Reuters','Karen News','SHAN','Mizzima','7Day News','The Diplomat','VOA Burmese','+11 feeds'].map(s => (
                      <span key={s} className="text-[9px] font-mono px-2 py-0.5 rounded-sm border border-blue-500/15 text-blue-400/60 bg-blue-500/[0.04]">{s}</span>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-4 leading-relaxed">Each article pre-screened for Myanmar relevance before entering the pipeline. Non-Myanmar content dropped before any AI call.</p>
                </div>
                <div className="rounded border border-blue-500/20 bg-black/50 overflow-hidden">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-blue-500/10 bg-blue-950/20">
                    <div className="w-2 h-2 rounded-full bg-red-500/30" /><div className="w-2 h-2 rounded-full bg-yellow-500/30" /><div className="w-2 h-2 rounded-full bg-green-500/30" />
                    <span className="font-mono text-[9px] text-slate-700 ml-1.5">ingest.log</span>
                  </div>
                  <div className="p-3 font-mono text-[10px] space-y-1">
                    <div><span className="text-green-400">GET</span><span className="text-slate-600"> irrawaddy.com/feed · 200 OK</span></div>
                    <div><span className="text-green-400">GET</span><span className="text-slate-600"> @theirrawaddy · 47 new</span></div>
                    <div><span className="text-green-400">GET</span><span className="text-slate-600"> dvb.no/feed · 200 OK</span></div>
                    <div className="text-slate-700">    ··· +25 more sources</div>
                    <div className="mt-2 pt-2 border-t border-blue-500/10">
                      <span className="text-blue-400">→ </span><span className="text-slate-400">312 queued for filter</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── 02 FILTER ── */}
            <div className="lg:pl-8 py-10 border-b border-white/[0.05]">
              <div className="flex items-center gap-3 mb-7">
                <span className="text-[9px] font-mono text-slate-700">02</span>
                <span className="text-[10px] font-mono font-bold tracking-[0.25em] text-yellow-400">FILTER</span>
                <span className="text-[9px] font-mono text-slate-700 ml-1">regex · EN + Burmese · pre-LLM gate</span>
              </div>

              {/* Funnel visual */}
              <div className="mb-8">
                <div className="flex items-center gap-4 mb-2">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[32px] font-black font-mono text-slate-400 leading-none">312</span>
                    <span className="text-[9px] font-mono text-slate-600">in</span>
                  </div>
                  <div className="flex-1 relative h-6">
                    <div className="absolute inset-0 rounded-sm overflow-hidden flex">
                      <div className="bg-yellow-500/25 border-r-2 border-yellow-500/40" style={{ width: '10%' }} />
                      <div className="bg-red-900/20 flex-1" />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[9px] font-mono text-yellow-500/60 tracking-widest">90% REJECTED</span>
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[32px] font-black font-mono text-yellow-400 leading-none">31</span>
                    <span className="text-[9px] font-mono text-slate-600">out</span>
                  </div>
                </div>
                <p className="text-[9px] font-mono text-slate-700">281 articles discarded · zero LLM calls wasted</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8 items-start">
                <div>
                  <p className="text-[9px] font-mono text-slate-700 tracking-widest mb-3 uppercase">Keyword triggers</p>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {['clash','battle','airstrike','shelling','seized','killed','strike','offensive','displaced','တိုက်ပွဲ','လေကြောင်း','သိမ်းပိုက်','ကျဆုံး','ဒုံး','စစ်ဆင်ရေး','+35 more'].map(t => (
                      <span key={t} className="text-[9px] font-mono px-2 py-0.5 rounded-sm border border-yellow-500/15 text-yellow-400/60 bg-yellow-500/[0.04]">{t}</span>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed">Articles must match at least one conflict signal before Groq is called. Opinion pieces, economic news, and elections are rejected here.</p>
                </div>
                <div className="rounded border border-yellow-500/20 bg-black/50 overflow-hidden">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-yellow-500/10 bg-yellow-950/20">
                    <div className="w-2 h-2 rounded-full bg-red-500/30" /><div className="w-2 h-2 rounded-full bg-yellow-500/30" /><div className="w-2 h-2 rounded-full bg-green-500/30" />
                    <span className="font-mono text-[9px] text-slate-700 ml-1.5">keyword-gate.ts</span>
                  </div>
                  <div className="p-3 font-mono text-[10px] space-y-1">
                    <div className="text-slate-700">{'// article #2847'}</div>
                    <div><span className="text-yellow-400">test</span><span className="text-slate-500"> &quot;clash&quot;</span><span className="text-green-400">  ✓ MATCH</span></div>
                    <div className="text-slate-700">test &quot;economic&quot;  skip</div>
                    <div className="text-slate-700">test &quot;election&quot;  skip</div>
                    <div className="mt-2 pt-2 border-t border-yellow-500/10">
                      <span className="text-yellow-400">→ </span><span className="text-slate-400">PASSED · send to Groq</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── 03 EXTRACT ── */}
            <div className="lg:pl-8 py-10 border-b border-white/[0.05]">
              <div className="flex items-center gap-3 mb-7">
                <span className="text-[9px] font-mono text-slate-700">03</span>
                <span className="text-[10px] font-mono font-bold tracking-[0.25em] text-orange-400">EXTRACT</span>
                <span className="text-[9px] font-mono text-slate-700 ml-1">Groq · Llama 3.3 70B · EN + Burmese</span>
              </div>

              {/* Raw → JSON transformation */}
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_28px_1fr] gap-4 items-start mb-6">
                <div>
                  <p className="text-[9px] font-mono text-slate-700 tracking-widest mb-2 uppercase">Raw article excerpt</p>
                  <div className="rounded border border-white/[0.05] bg-white/[0.02] p-3 font-mono text-[10px] text-slate-500 leading-relaxed">
                    &ldquo;At least{' '}<span className="bg-orange-500/20 text-orange-300 px-0.5 rounded-sm">4 soldiers killed</span>{' '}in a{' '}
                    <span className="bg-orange-500/20 text-orange-300 px-0.5 rounded-sm">clash</span>{' '}near{' '}
                    <span className="bg-blue-500/20 text-blue-300 px-0.5 rounded-sm">Sagaing</span>{' '}on{' '}
                    <span className="bg-green-500/20 text-green-300 px-0.5 rounded-sm">June 1</span>{' '}between{' '}
                    <span className="bg-purple-500/20 text-purple-300 px-0.5 rounded-sm">PDF</span>{' '}and{' '}
                    <span className="bg-purple-500/20 text-purple-300 px-0.5 rounded-sm">Tatmadaw</span>{' '}
                    forces according to local sources...&rdquo;
                  </div>
                  <div className="flex gap-3 mt-2 font-mono text-[8px] text-slate-700">
                    <span><span className="inline-block w-2 h-2 rounded-sm bg-orange-500/20 mr-1" />event signal</span>
                    <span><span className="inline-block w-2 h-2 rounded-sm bg-blue-500/20 mr-1" />location</span>
                    <span><span className="inline-block w-2 h-2 rounded-sm bg-green-500/20 mr-1" />date</span>
                    <span><span className="inline-block w-2 h-2 rounded-sm bg-purple-500/20 mr-1" />actors</span>
                  </div>
                </div>
                <div className="items-center justify-center pt-10 hidden lg:flex">
                  <span className="text-orange-500/30 text-lg font-mono">→</span>
                </div>
                <div>
                  <p className="text-[9px] font-mono text-slate-700 tracking-widest mb-2 uppercase">Structured output</p>
                  <div className="rounded border border-orange-500/20 bg-black/50 overflow-hidden">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-orange-500/10 bg-orange-950/20">
                      <div className="w-2 h-2 rounded-full bg-red-500/30" /><div className="w-2 h-2 rounded-full bg-yellow-500/30" /><div className="w-2 h-2 rounded-full bg-green-500/30" />
                      <span className="font-mono text-[9px] text-slate-700 ml-1.5">extraction-output.json</span>
                    </div>
                    <div className="p-3 font-mono text-[10px] space-y-0.5">
                      <div className="text-slate-700">{'{'}</div>
                      <div className="pl-3"><span className="text-orange-400">&quot;eventType&quot;</span><span className="text-slate-600">: </span><span className="text-green-400">&quot;CLASH&quot;</span></div>
                      <div className="pl-3"><span className="text-orange-400">&quot;date&quot;</span><span className="text-slate-600">:      </span><span className="text-slate-300">&quot;2026-06-01&quot;</span></div>
                      <div className="pl-3"><span className="text-orange-400">&quot;location&quot;</span><span className="text-slate-600">:  </span><span className="text-yellow-400">&quot;Sagaing&quot;</span><span className="text-yellow-600/60"> ⚠ unverified</span></div>
                      <div className="pl-3"><span className="text-orange-400">&quot;actors&quot;</span><span className="text-slate-600">:   </span><span className="text-slate-300">[&quot;PDF&quot;,&quot;Tatmadaw&quot;]</span></div>
                      <div className="pl-3"><span className="text-orange-400">&quot;fatalities&quot;</span><span className="text-slate-600">: </span><span className="text-slate-300">4</span></div>
                      <div className="text-slate-700">{'}'}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {['CLASH','AIRSTRIKE','SHELLING','SIEGE_SEIZED','RECAPTURED','DISPLACEMENT','HUMANITARIAN','POLITICAL'].map(t => (
                  <span key={t} className="text-[9px] font-mono px-2 py-0.5 rounded-sm border border-orange-500/15 text-orange-400/60 bg-orange-500/[0.04]">{t}</span>
                ))}
              </div>
            </div>

            {/* ── 04 VALIDATE ── */}
            <div className="lg:pl-8 py-10 border-b border-white/[0.05]">
              <div className="flex items-center gap-3 mb-7">
                <span className="text-[9px] font-mono text-slate-700">04</span>
                <span className="text-[10px] font-mono font-bold tracking-[0.25em] text-purple-400">VALIDATE</span>
                <span className="text-[9px] font-mono text-slate-700 ml-1">DeepSeek · deepseek-chat</span>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8 items-start">
                <div>
                  <p className="text-[9px] font-mono text-slate-700 tracking-widest mb-4 uppercase">Corrections applied</p>
                  <div className="space-y-3 mb-6 font-mono text-[10px]">
                    {[
                      { label: 'state assignment', before: '"Sagaing"', after: '"Sagaing Region"' },
                      { label: 'location vs source', before: 'mixed up', after: 'event location only' },
                    ].map(d => (
                      <div key={d.label} className="flex items-center gap-3">
                        <span className="text-slate-700 w-32 shrink-0">{d.label}</span>
                        <span className="text-red-400/40 line-through">{d.before}</span>
                        <span className="text-slate-700">→</span>
                        <span className="text-green-400">{d.after}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[9px] font-mono text-slate-700 tracking-widest mb-3 uppercase">Hard alliance rules</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: 'PDF + CDF', desc: 'always same side' },
                      { label: '3BHA coalition', desc: 'TNLA + MNDAA + AA never split' },
                    ].map(r => (
                      <div key={r.label} className="flex items-center gap-2 text-[9px] font-mono px-2.5 py-1.5 rounded border border-purple-500/20 bg-purple-500/[0.04]">
                        <span className="text-purple-400">{r.label}</span>
                        <span className="text-slate-700">{r.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded border border-purple-500/20 bg-black/50 overflow-hidden">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-purple-500/10 bg-purple-950/20">
                    <div className="w-2 h-2 rounded-full bg-red-500/30" /><div className="w-2 h-2 rounded-full bg-yellow-500/30" /><div className="w-2 h-2 rounded-full bg-green-500/30" />
                    <span className="font-mono text-[9px] text-slate-700 ml-1.5">validation-result.json</span>
                  </div>
                  <div className="p-3 font-mono text-[10px] space-y-1">
                    <div className="text-slate-700">{'// location fix'}</div>
                    <div className="text-red-400/40 line-through">&quot;Sagaing&quot;</div>
                    <div><span className="text-purple-400">→ </span><span className="text-green-400">&quot;Sagaing Region&quot; ✓</span></div>
                    <div className="mt-2 text-slate-700">{'// alliance check'}</div>
                    <div><span className="text-green-400">PDF + CDF</span><span className="text-slate-600">  same side ✓</span></div>
                    <div><span className="text-green-400">3BHA</span><span className="text-slate-600">       never split ✓</span></div>
                    <div className="mt-2 pt-2 border-t border-purple-500/10">
                      <span className="text-purple-400">&quot;confidence&quot;</span><span className="text-slate-500">: </span><span className="text-green-400">0.82</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── 05 GEOCODE ── */}
            <div className="lg:pl-8 py-10 border-b border-white/[0.05]">
              <div className="flex items-center gap-3 mb-7">
                <span className="text-[9px] font-mono text-slate-700">05</span>
                <span className="text-[10px] font-mono font-bold tracking-[0.25em] text-green-400">GEOCODE</span>
                <span className="text-[9px] font-mono text-slate-700 ml-1">200+ township DB · GeoJSON polygons</span>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8 items-start">
                <div>
                  <p className="text-[9px] font-mono text-slate-700 tracking-widest mb-4 uppercase">Precision cascade</p>
                  <div className="space-y-2.5 font-mono text-[10px]">
                    {[
                      { sym: '●', label: 'exact town', example: 'Sagaing township', coords: '21.8833°N  95.9833°E', color: '#22c55e' },
                      { sym: '◉', label: 'township centroid', example: 'Sagaing District', coords: '21.9°N  96.1°E', color: '#22c55e88' },
                      { sym: '◎', label: 'district centroid', example: 'Sagaing Region', coords: '22.1°N  95.8°E', color: '#22c55e55' },
                      { sym: '○', label: 'state / region', example: 'Sagaing', coords: '22.5°N  95.7°E', color: '#22c55e30' },
                      { sym: '✕', label: 'Myanmar only — discard', example: 'no specific state', coords: '— dropped', color: '#ef4444' },
                    ].map(p => (
                      <div key={p.label} className="flex items-center gap-3">
                        <span className="w-4 shrink-0 text-center text-base leading-none" style={{ color: p.color }}>{p.sym}</span>
                        <span className="text-slate-600 w-32 shrink-0">{p.label}</span>
                        <span className="text-slate-700 flex-1">{p.example}</span>
                        <span className="text-slate-700 hidden sm:block tabular-nums">{p.coords}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded border border-green-500/20 bg-black/50 overflow-hidden">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-green-500/10 bg-green-950/20">
                    <div className="w-2 h-2 rounded-full bg-red-500/30" /><div className="w-2 h-2 rounded-full bg-yellow-500/30" /><div className="w-2 h-2 rounded-full bg-green-500/30" />
                    <span className="font-mono text-[9px] text-slate-700 ml-1.5">geocode.ts</span>
                  </div>
                  <div className="p-3 font-mono text-[10px] space-y-1">
                    <div className="text-slate-700">resolve(&quot;Sagaing Region&quot;)</div>
                    <div><span className="text-green-400">→ </span><span className="text-slate-500">match: Sagaing township</span></div>
                    <div><span className="text-green-400">→ </span><span className="text-slate-400">lat: <span className="text-green-300">21.8833</span></span></div>
                    <div><span className="text-green-400">→ </span><span className="text-slate-400">lng: <span className="text-green-300">95.9833</span></span></div>
                    <div><span className="text-green-400">→ </span><span className="text-slate-400">precision: <span className="text-green-300">township ✓</span></span></div>
                    <div className="mt-2 pt-2 border-t border-green-500/10">
                      <span className="text-green-400">✓ </span><span className="text-slate-500">quality gate passed</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── 06 STORE ── */}
            <div className="lg:pl-8 py-10">
              <div className="flex items-center gap-3 mb-7">
                <span className="text-[9px] font-mono text-slate-700">06</span>
                <span className="text-[10px] font-mono font-bold tracking-[0.25em] text-red-400">STORE</span>
                <span className="text-[9px] font-mono text-slate-700 ml-1">Neon PostgreSQL · SHA-256 dedup</span>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8 items-start">
                <div>
                  <p className="text-[9px] font-mono text-slate-700 tracking-widest mb-4 uppercase">3-stage schema</p>
                  <div className="flex items-center gap-0 font-mono text-[9px] mb-6 flex-wrap gap-y-2">
                    {[
                      { table: 'RawArticle', fields: 'url · title · body · fetched_at' },
                      null,
                      { table: 'ConflictEvent', fields: 'type · date · region · actors · hash' },
                      null,
                      { table: 'AnalysedEvent', fields: 'coords · confidence · source_count' },
                    ].map((item, i) => item === null ? (
                      <span key={i} className="text-red-500/25 px-2 font-mono">→</span>
                    ) : (
                      <div key={i} className="rounded border border-red-500/20 bg-red-500/[0.04] px-3 py-2">
                        <div className="font-bold text-red-400 mb-1">{item.table}</div>
                        <div className="text-slate-700 text-[8px]">{item.fields}</div>
                      </div>
                    ))}
                  </div>
                  <p className="text-[9px] font-mono text-slate-700 tracking-widest mb-2 uppercase">Dedup fingerprint</p>
                  <div className="font-mono text-[9px] text-slate-600 mb-1">
                    SHA-256(<span className="text-slate-500">&quot;PDF+Tatmadaw | Sagaing | CLASH | 2026-06-01&quot;</span>)
                  </div>
                  <div className="font-mono text-[9px] text-red-400/40">→ a7f3e9c2...d841f</div>
                  <p className="text-[10px] text-slate-500 leading-relaxed mt-3">Same clash from multiple outlets → confidence increases, not duplicate pins.</p>
                </div>
                <div className="rounded border border-red-500/20 bg-black/50 overflow-hidden">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-red-500/10 bg-red-950/20">
                    <div className="w-2 h-2 rounded-full bg-red-500/30" /><div className="w-2 h-2 rounded-full bg-yellow-500/30" /><div className="w-2 h-2 rounded-full bg-green-500/30" />
                    <span className="font-mono text-[9px] text-slate-700 ml-1.5">upsert.sql</span>
                  </div>
                  <div className="p-3 font-mono text-[10px] space-y-1">
                    <div className="text-slate-700">hash ← sha256(</div>
                    <div className="pl-2 text-slate-600">&quot;PDF+Tatmadaw|Sagaing|</div>
                    <div className="pl-2 text-slate-600"> CLASH|2026-06-01&quot;</div>
                    <div className="text-slate-700">)</div>
                    <div><span className="text-red-400">→ </span><span className="text-green-400">a7f3e9...  new event</span></div>
                    <div className="mt-2 pt-2 border-t border-red-500/10">
                      <div><span className="text-red-400">INSERT</span><span className="text-slate-500"> ConflictEvent ✓</span></div>
                      <div><span className="text-red-400">INSERT</span><span className="text-slate-500"> AnalysedEvent</span></div>
                      <div><span className="text-slate-700">  confidence = </span><span className="text-green-400">0.79</span></div>
                      <div className="mt-1"><span className="text-green-400">→ </span><span className="text-slate-400">Mapbox pin live ✓</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom flow */}
          <div className="mt-12 pt-6 border-t border-white/[0.05]">
            <div className="flex flex-wrap items-end gap-x-0 gap-y-2">
              {([
                { label: '28 sources', sub: 'RSS/Telegram', color: '#3b82f6' },
                null,
                { label: 'keyword gate', sub: 'regex filter', color: '#eab308' },
                null,
                { label: 'Llama 3.3 70B', sub: 'extract', color: '#f97316' },
                null,
                { label: 'DeepSeek', sub: 'validate', color: '#a855f7' },
                null,
                { label: 'township DB', sub: 'geocode', color: '#22c55e' },
                null,
                { label: 'SHA-256', sub: 'dedup', color: '#ef4444' },
                null,
                { label: 'Mapbox GL', sub: 'map', color: '#94a3b8' },
              ] as ({ label: string; sub: string; color: string } | null)[]).map((item, i) => item === null ? (
                <span key={i} className="text-[8px] font-mono text-slate-800 px-1.5 pb-1">──→</span>
              ) : (
                <div key={i} className="flex flex-col items-center">
                  <span className="text-[10px] font-mono font-semibold" style={{ color: item.color }}>{item.label}</span>
                  <span className="text-[8px] font-mono text-slate-700">{item.sub}</span>
                </div>
              ))}
            </div>
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
