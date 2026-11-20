import Link from 'next/link'
import Image from 'next/image'
import { Barlow_Condensed } from 'next/font/google'
import type { ReactNode } from 'react'

export const metadata = {
  title: 'Myanmar War Map — OSINT Platform',
}

const stencil = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  display: 'swap',
})

/* ── Tactical palette (all text colours ≥ 7:1 on the page background) ── */
const C = {
  bg:      '#0b0d09',
  panel:   '#11140e',
  panel2:  '#161a12',
  line:    '#343b2a',
  line2:   '#4a5339',
  text:    '#eef0e2',
  text2:   '#c9cdb6',
  muted:   '#a8ad94',
  amber:   '#f2b33d',
  olive:   '#b5c27a',
  red:     '#ff6a5c',
  green:   '#8fe08a',
}

const DASHBOARDS = [
  {
    href:  '/map',
    code:  'MOD-01',
    label: 'CONFLICT MAP',
    title: 'Live Conflict Events',
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
    code:  'MOD-02',
    label: 'INTEL DASHBOARD',
    title: 'Regional Intelligence',
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
      { color: '#ef4444', label: '80–100 Critical' },
      { color: '#f97316', label: '60–79 High' },
      { color: '#f59e0b', label: '40–59 Elevated' },
      { color: '#22c55e', label: '0–39 Guarded' },
    ],
  },
  {
    href:  '/bases',
    code:  'MOD-03',
    label: 'MILITARY BASES',
    title: 'Known Installations',
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
    code:  'MOD-04',
    label: 'OPS TIMELINE',
    title: 'Major Operations',
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
  { term: 'PDF',        def: "People's Defence Force — armed wing of the NUG, formed after the 2021 coup" },
  { term: 'TATMADAW',   def: "Myanmar's military, ruling as the State Administration Council (SAC) since Feb 2021" },
  { term: 'EAO',        def: 'Ethnic Armed Organisation — KIA, AA, TNLA, MNDAA, KNU/KNLA, CNF, RCSS and others' },
  { term: 'NUG',        def: 'National Unity Government — parallel government formed by ousted civilian MPs' },
  { term: '3BHA',       def: 'Three Brotherhood Alliance — TNLA + MNDAA + AA. Launched Operation 1027 in Oct 2023' },
  { term: 'CONFIDENCE', def: 'Event reliability score (0–1): source quality × corroboration count × geocoding precision' },
  { term: 'BIAS FLAG',  def: 'neutral | pro_resistance | pro_junta | unverified_claim — AI-assessed per article' },
  { term: 'VOLATILITY', def: 'Composite regional score: event frequency + actor diversity + fatalities + recency decay' },
]

const SITREP = [
  { k: 'SOURCES',    v: '28',   sub: 'RSS + Telegram' },
  { k: 'CYCLE',      v: '06H',  sub: 'automated ingest' },
  { k: 'GAZETTEER',  v: '200+', sub: 'townships indexed' },
  { k: 'MODULES',    v: '04',   sub: 'operational' },
]

/* ── Primitives ─────────────────────────────────────────────── */

function Brackets({ color = C.line2 }: { color?: string }) {
  const s = { borderColor: color }
  return (
    <>
      <span aria-hidden className="pointer-events-none absolute -top-px -left-px w-3 h-3 border-t-2 border-l-2" style={s} />
      <span aria-hidden className="pointer-events-none absolute -top-px -right-px w-3 h-3 border-t-2 border-r-2" style={s} />
      <span aria-hidden className="pointer-events-none absolute -bottom-px -left-px w-3 h-3 border-b-2 border-l-2" style={s} />
      <span aria-hidden className="pointer-events-none absolute -bottom-px -right-px w-3 h-3 border-b-2 border-r-2" style={s} />
    </>
  )
}

function Tag({ children, tone = 'olive' }: { children: ReactNode; tone?: 'olive' | 'amber' }) {
  const col = tone === 'amber' ? C.amber : C.olive
  const burmese = typeof children === 'string' && /[\u1000-\u109F]/.test(children)
  return (
    <span
      className={`text-[11px] font-semibold px-2 py-1 border ${burmese ? 'text-[13px]' : 'font-mono tracking-wider uppercase'}`}
      style={{ color: col, borderColor: col + '66', background: col + '12' }}
    >
      {children}
    </span>
  )
}

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="font-mono text-[12px] font-bold tracking-[0.18em] uppercase mb-3" style={{ color: C.amber }}>
      {children}
    </p>
  )
}

function SubLabel({ children }: { children: ReactNode }) {
  return (
    <p className="font-mono text-[11px] font-bold tracking-[0.16em] uppercase mb-3" style={{ color: C.olive }}>
      {children}
    </p>
  )
}

function Terminal({ file, status = 'NOMINAL', children }: { file: string; status?: string; children: ReactNode }) {
  return (
    <div className="relative border" style={{ borderColor: C.line2, background: '#080a06' }}>
      <Brackets color={C.amber} />
      <div
        className="flex items-center justify-between px-3 py-2 border-b font-mono text-[11px] tracking-wider uppercase"
        style={{ borderColor: C.line, background: C.panel2 }}
      >
        <span style={{ color: C.text2 }}>FILE: {file}</span>
        <span className="font-bold" style={{ color: C.green }}>{status}</span>
      </div>
      <div className="p-3.5 font-mono text-[12px] leading-relaxed space-y-1" style={{ color: C.text2 }}>
        {children}
      </div>
    </div>
  )
}

function StageHeader({ n, name, meta }: { n: string; name: string; meta: string }) {
  return (
    <div className="flex flex-wrap items-stretch mb-8 border" style={{ borderColor: C.line2 }}>
      <span
        className="font-mono text-[13px] font-black px-3 py-2 flex items-center"
        style={{ background: C.amber, color: C.bg }}
      >
        PHASE {n}
      </span>
      <span
        className={`${stencil.className} text-[22px] font-bold tracking-[0.12em] uppercase px-4 py-1 flex items-center`}
        style={{ color: C.text }}
      >
        {name}
      </span>
      <span
        className="font-mono text-[12px] px-4 py-2 flex items-center w-full sm:w-auto border-t sm:border-t-0 sm:border-l sm:ml-auto"
        style={{ color: C.text2, borderColor: C.line }}
      >
        {meta}
      </span>
    </div>
  )
}

/* ── Dashboard row ─────────────────────────────────────────── */

function DashboardRow({ d, index }: { d: (typeof DASHBOARDS)[0]; index: number }) {
  const reversed = index % 2 === 1

  const imageBlock = (
    <div className="lg:col-span-3 p-4 lg:p-6 flex items-center">
      <div className="relative w-full border" style={{ borderColor: C.line2 }}>
        <Brackets color={C.amber} />
        <div
          className="flex items-center justify-between px-3 py-1.5 border-b font-mono text-[11px] tracking-wider uppercase"
          style={{ borderColor: C.line, background: C.panel2, color: C.text2 }}
        >
          <span>{d.code} // {d.label}</span>
          <span style={{ color: C.green }}>FEED ACTIVE</span>
        </div>
        <Image
          src={d.src}
          alt={`${d.title} screenshot`}
          width={d.w}
          height={d.h}
          className="w-full h-auto block"
          quality={90}
        />
      </div>
    </div>
  )

  const textBlock = (
    <div className="lg:col-span-2 flex flex-col justify-center py-10 px-6 lg:px-10">
      <div className="flex items-center gap-3 mb-4">
        <span
          className="font-mono text-[12px] font-black px-2 py-1"
          style={{ background: C.amber, color: C.bg }}
        >
          {d.code}
        </span>
        <span className="font-mono text-[12px] font-bold tracking-[0.18em]" style={{ color: C.amber }}>
          {d.label}
        </span>
      </div>

      <h2
        className={`${stencil.className} text-4xl font-bold uppercase tracking-wide mb-3 leading-none`}
        style={{ color: C.text }}
      >
        {d.title}
      </h2>

      <p className="text-[15px] leading-relaxed mb-6" style={{ color: C.text2 }}>{d.desc}</p>

      <SubLabel>Operating notes</SubLabel>
      <ol className="mb-6 border-l-2" style={{ borderColor: C.line2 }}>
        {d.features.map((f, i) => (
          <li key={i} className="flex gap-3 pl-3 py-1.5 text-[14px] leading-snug" style={{ color: C.text }}>
            <span className="font-mono text-[12px] font-bold shrink-0 pt-px" style={{ color: C.amber }}>
              {String(i + 1).padStart(2, '0')}
            </span>
            {f}
          </li>
        ))}
      </ol>

      <SubLabel>Map key</SubLabel>
      <div className="flex flex-wrap gap-x-5 gap-y-2 mb-8">
        {d.legend.map(l => (
          <div key={l.label} className="flex items-center gap-2">
            <div className="w-3 h-3 shrink-0 border border-black/40" style={{ background: l.color }} />
            <span className="font-mono text-[12px]" style={{ color: C.text2 }}>{l.label}</span>
          </div>
        ))}
      </div>

      <Link
        href={d.href}
        className="self-start font-mono text-[13px] font-bold tracking-[0.14em] uppercase px-5 py-3 border-2 transition-colors hover:bg-[#f2b33d] hover:text-[#0b0d09]"
        style={{ borderColor: C.amber, color: C.amber }}
      >
        Deploy {d.label}
      </Link>
    </div>
  )

  return (
    <div className="border-b" style={{ borderColor: C.line }}>
      <div className="max-w-screen-xl mx-auto grid grid-cols-1 lg:grid-cols-5">
        {reversed ? <>{textBlock}{imageBlock}</> : <>{imageBlock}{textBlock}</>}
      </div>
    </div>
  )
}

/* ── Page ───────────────────────────────────────────────────── */

export default function HomePage() {
  return (
    <div
      className="min-h-screen"
      style={{
        background: C.bg,
        color: C.text,
        backgroundImage:
          'linear-gradient(rgba(181,194,122,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(181,194,122,0.045) 1px, transparent 1px)',
        backgroundSize: '48px 48px',
      }}
    >
      {/* ── Classification strip ── */}
      <div
        className="text-center font-mono text-[11px] font-bold tracking-[0.3em] py-1.5"
        style={{ background: C.olive, color: C.bg }}
      >
        UNCLASSIFIED // OPEN SOURCE INTELLIGENCE // FOR PUBLIC RELEASE
      </div>

      {/* ── Hero ── */}
      <section className="border-b px-4 sm:px-6 py-14" style={{ borderColor: C.line }}>
        <div className="max-w-screen-xl mx-auto">
          <Eyebrow>Theatre: Myanmar // Situation report</Eyebrow>
          <h1
            className={`${stencil.className} text-6xl sm:text-7xl font-extrabold uppercase tracking-[0.04em] leading-[0.9] mb-5`}
            style={{ color: C.text }}
          >
            Myanmar War Map
          </h1>
          <p className="text-[16px] leading-relaxed max-w-2xl mb-10" style={{ color: C.text2 }}>
            Independent open-source intelligence platform tracking the Myanmar Civil War.
            Conflict events are extracted from news sources, geocoded, and analysed using AI — updated daily.
          </p>

          {/* SITREP grid */}
          <div className="relative grid grid-cols-2 lg:grid-cols-4 border mb-10" style={{ borderColor: C.line2, background: C.panel }}>
            <Brackets color={C.amber} />
            {SITREP.map((s, i) => (
              <div
                key={s.k}
                className={`px-5 py-4 ${i > 0 ? 'lg:border-l' : ''} ${i % 2 === 1 ? 'border-l' : ''} ${i > 1 ? 'border-t lg:border-t-0' : ''}`}
                style={{ borderColor: C.line }}
              >
                <div className="font-mono text-[11px] font-bold tracking-[0.18em]" style={{ color: C.olive }}>{s.k}</div>
                <div className={`${stencil.className} text-5xl font-bold leading-none mt-1`} style={{ color: C.amber }}>{s.v}</div>
                <div className="font-mono text-[12px] mt-1" style={{ color: C.text2 }}>{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Module launcher */}
          <SubLabel>Select module</SubLabel>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {DASHBOARDS.map(d => (
              <Link
                key={d.href}
                href={d.href}
                className="group relative border px-4 py-3 transition-colors hover:border-[#f2b33d] hover:bg-[#f2b33d14]"
                style={{ borderColor: C.line2, background: C.panel }}
              >
                <div className="font-mono text-[11px] font-bold tracking-[0.16em]" style={{ color: C.amber }}>{d.code}</div>
                <div className={`${stencil.className} text-[22px] font-bold tracking-wide uppercase`} style={{ color: C.text }}>
                  {d.label}
                </div>
                <div className="text-[13px]" style={{ color: C.text2 }}>{d.title}</div>
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
      <section className="py-20 overflow-hidden">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6">

          <div className="mb-14 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <Eyebrow>Intelligence pipeline // Order of processing</Eyebrow>
              <h2
                className={`${stencil.className} text-5xl font-bold uppercase leading-[0.95] tracking-wide`}
                style={{ color: C.text }}
              >
                How 28 sources become<br />
                <span style={{ color: C.olive }}>one verified event on the map</span>
              </h2>
            </div>
            <Tag tone="amber">Automated // every 6h</Tag>
          </div>

          <div className="space-y-6">

            {/* ── 01 INGEST ── */}
            <div className="relative border p-6" style={{ borderColor: C.line, background: C.panel }}>
              <StageHeader n="01" name="Ingest" meta="RSS // Telegram MTProto // 6h cadence" />
              <div className="grid grid-cols-1 lg:grid-cols-[170px_1fr_300px] gap-8 items-start">
                <div>
                  <div className={`${stencil.className} text-[84px] font-extrabold leading-none`} style={{ color: C.amber }}>28</div>
                  <p className="font-mono text-[12px] uppercase tracking-wider" style={{ color: C.text2 }}>sources monitored</p>
                  <div className="flex items-baseline gap-2 mt-3">
                    <span className={`${stencil.className} text-3xl font-bold`} style={{ color: C.text }}>312</span>
                    <span className="font-mono text-[12px] uppercase" style={{ color: C.text2 }}>articles / run</span>
                  </div>
                </div>
                <div>
                  <SubLabel>Active feeds</SubLabel>
                  <div className="flex flex-wrap gap-1.5">
                    {['Irrawaddy','DVB','Myanmar Now','RFA Burma','BNI Multimedia','Narinjara','Kachin News','BBC Burmese','Al Jazeera','Reuters','Karen News','SHAN','Mizzima','7Day News','The Diplomat','VOA Burmese','+11 feeds'].map(s => (
                      <Tag key={s}>{s}</Tag>
                    ))}
                  </div>
                  <p className="text-[15px] mt-4 leading-relaxed" style={{ color: C.text2 }}>
                    Each article pre-screened for Myanmar relevance before entering the pipeline. Non-Myanmar content dropped before any AI call.
                  </p>
                </div>
                <Terminal file="ingest.log">
                  <div><span style={{ color: C.green }}>GET</span> irrawaddy.com/feed · 200 OK</div>
                  <div><span style={{ color: C.green }}>GET</span> @theirrawaddy · 47 new</div>
                  <div><span style={{ color: C.green }}>GET</span> dvb.no/feed · 200 OK</div>
                  <div style={{ color: C.muted }}>... +25 more sources</div>
                  <div className="mt-2 pt-2 border-t" style={{ borderColor: C.line }}>
                    <span style={{ color: C.amber }}>RESULT:</span> <span style={{ color: C.text }}>312 queued for filter</span>
                  </div>
                </Terminal>
              </div>
            </div>

            {/* ── 02 FILTER ── */}
            <div className="relative border p-6" style={{ borderColor: C.line, background: C.panel }}>
              <StageHeader n="02" name="Filter" meta="regex // EN + Burmese // pre-LLM gate" />

              <div className="mb-8">
                <div className="flex items-center gap-4 mb-2">
                  <div className="flex items-baseline gap-1.5">
                    <span className={`${stencil.className} text-[40px] font-bold leading-none`} style={{ color: C.text }}>312</span>
                    <span className="font-mono text-[12px] uppercase" style={{ color: C.text2 }}>in</span>
                  </div>
                  <div className="flex-1 relative h-8 border" style={{ borderColor: C.line2 }}>
                    <div className="absolute inset-0 flex">
                      <div style={{ width: '10%', background: C.amber }} />
                      <div
                        className="flex-1"
                        style={{ background: 'repeating-linear-gradient(135deg, #2a1512 0 8px, #1a0e0c 8px 16px)' }}
                      />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="font-mono text-[12px] font-bold tracking-[0.2em] px-2" style={{ color: C.text, background: '#0b0d09cc' }}>
                        90% REJECTED
                      </span>
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className={`${stencil.className} text-[40px] font-bold leading-none`} style={{ color: C.amber }}>31</span>
                    <span className="font-mono text-[12px] uppercase" style={{ color: C.text2 }}>out</span>
                  </div>
                </div>
                <p className="font-mono text-[12px]" style={{ color: C.text2 }}>281 articles discarded // zero LLM calls wasted</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 items-start">
                <div>
                  <SubLabel>Keyword triggers</SubLabel>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {['clash','battle','airstrike','shelling','seized','killed','strike','offensive','displaced','တိုက်ပွဲ','လေကြောင်း','သိမ်းပိုက်','ကျဆုံး','ဒုံး','စစ်ဆင်ရေး','+35 more'].map(t => (
                      <Tag key={t} tone="amber">{t}</Tag>
                    ))}
                  </div>
                  <p className="text-[15px] leading-relaxed" style={{ color: C.text2 }}>
                    Articles must match at least one conflict signal before Groq is called. Opinion pieces, economic news, and elections are rejected here.
                  </p>
                </div>
                <Terminal file="keyword-gate.ts">
                  <div style={{ color: C.muted }}>{'// article #2847'}</div>
                  <div>test &quot;clash&quot; <span className="font-bold" style={{ color: C.green }}>MATCH</span></div>
                  <div>test &quot;economic&quot; <span style={{ color: C.muted }}>SKIP</span></div>
                  <div>test &quot;election&quot; <span style={{ color: C.muted }}>SKIP</span></div>
                  <div className="mt-2 pt-2 border-t" style={{ borderColor: C.line }}>
                    <span style={{ color: C.amber }}>RESULT:</span> <span style={{ color: C.text }}>PASSED // send to Groq</span>
                  </div>
                </Terminal>
              </div>
            </div>

            {/* ── 03 EXTRACT ── */}
            <div className="relative border p-6" style={{ borderColor: C.line, background: C.panel }}>
              <StageHeader n="03" name="Extract" meta="Groq // Llama 3.3 70B // EN + Burmese" />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start mb-6">
                <div>
                  <SubLabel>Raw article excerpt</SubLabel>
                  <div className="border p-4 text-[14px] leading-relaxed" style={{ borderColor: C.line2, background: '#080a06', color: C.text2 }}>
                    &ldquo;At least{' '}<mark className="px-1 font-semibold" style={{ background: '#5a3a10', color: '#ffd9a0' }}>4 soldiers killed</mark>{' '}in a{' '}
                    <mark className="px-1 font-semibold" style={{ background: '#5a3a10', color: '#ffd9a0' }}>clash</mark>{' '}near{' '}
                    <mark className="px-1 font-semibold" style={{ background: '#1d3a55', color: '#bfe0ff' }}>Sagaing</mark>{' '}on{' '}
                    <mark className="px-1 font-semibold" style={{ background: '#22421f', color: '#c8f5c2' }}>June 1</mark>{' '}between{' '}
                    <mark className="px-1 font-semibold" style={{ background: '#3d2a55', color: '#e2d0ff' }}>PDF</mark>{' '}and{' '}
                    <mark className="px-1 font-semibold" style={{ background: '#3d2a55', color: '#e2d0ff' }}>Tatmadaw</mark>{' '}
                    forces according to local sources...&rdquo;
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 font-mono text-[12px]" style={{ color: C.text2 }}>
                    <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3" style={{ background: '#5a3a10' }} />event signal</span>
                    <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3" style={{ background: '#1d3a55' }} />location</span>
                    <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3" style={{ background: '#22421f' }} />date</span>
                    <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3" style={{ background: '#3d2a55' }} />actors</span>
                  </div>
                </div>
                <div>
                  <SubLabel>Structured output</SubLabel>
                  <Terminal file="extraction-output.json" status="PARSED">
                    <div>{'{'}</div>
                    <div className="pl-4"><span style={{ color: C.amber }}>&quot;eventType&quot;</span>: <span style={{ color: C.green }}>&quot;CLASH&quot;</span></div>
                    <div className="pl-4"><span style={{ color: C.amber }}>&quot;date&quot;</span>: <span style={{ color: C.text }}>&quot;2026-06-01&quot;</span></div>
                    <div className="pl-4"><span style={{ color: C.amber }}>&quot;location&quot;</span>: <span style={{ color: C.text }}>&quot;Sagaing&quot;</span> <span className="font-bold" style={{ color: C.red }}>UNVERIFIED</span></div>
                    <div className="pl-4"><span style={{ color: C.amber }}>&quot;actors&quot;</span>: <span style={{ color: C.text }}>[&quot;PDF&quot;, &quot;Tatmadaw&quot;]</span></div>
                    <div className="pl-4"><span style={{ color: C.amber }}>&quot;fatalities&quot;</span>: <span style={{ color: C.text }}>4</span></div>
                    <div>{'}'}</div>
                  </Terminal>
                </div>
              </div>
              <SubLabel>Event classes</SubLabel>
              <div className="flex flex-wrap gap-1.5">
                {['CLASH','AIRSTRIKE','SHELLING','SIEGE_SEIZED','RECAPTURED','DISPLACEMENT','HUMANITARIAN','POLITICAL'].map(t => (
                  <Tag key={t}>{t}</Tag>
                ))}
              </div>
            </div>

            {/* ── 04 VALIDATE ── */}
            <div className="relative border p-6" style={{ borderColor: C.line, background: C.panel }}>
              <StageHeader n="04" name="Validate" meta="DeepSeek // deepseek-chat" />
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 items-start">
                <div>
                  <SubLabel>Corrections applied</SubLabel>
                  <div className="mb-6 border" style={{ borderColor: C.line }}>
                    {[
                      { label: 'State assignment',   before: '"Sagaing"',  after: '"Sagaing Region"' },
                      { label: 'Location vs source', before: 'mixed up',   after: 'event location only' },
                    ].map((d, i) => (
                      <div
                        key={d.label}
                        className={`grid grid-cols-[150px_1fr_1fr] gap-3 px-3 py-2 text-[14px] ${i ? 'border-t' : ''}`}
                        style={{ borderColor: C.line }}
                      >
                        <span className="font-mono text-[12px] uppercase pt-0.5" style={{ color: C.olive }}>{d.label}</span>
                        <span className="line-through" style={{ color: C.red }}>{d.before}</span>
                        <span className="font-semibold" style={{ color: C.green }}>{d.after}</span>
                      </div>
                    ))}
                  </div>
                  <SubLabel>Hard alliance rules</SubLabel>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: 'PDF + CDF',      desc: 'always same side' },
                      { label: '3BHA coalition', desc: 'TNLA + MNDAA + AA never split' },
                    ].map(r => (
                      <div key={r.label} className="flex items-center gap-2 px-3 py-2 border" style={{ borderColor: C.line2, background: C.panel2 }}>
                        <span className="font-mono text-[12px] font-bold" style={{ color: C.amber }}>{r.label}</span>
                        <span className="text-[13px]" style={{ color: C.text2 }}>{r.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <Terminal file="validation-result.json" status="VERIFIED">
                  <div style={{ color: C.muted }}>{'// location fix'}</div>
                  <div className="line-through" style={{ color: C.red }}>&quot;Sagaing&quot;</div>
                  <div><span style={{ color: C.amber }}>FIX:</span> <span style={{ color: C.green }}>&quot;Sagaing Region&quot;</span></div>
                  <div className="mt-2" style={{ color: C.muted }}>{'// alliance check'}</div>
                  <div>PDF + CDF same side <span className="font-bold" style={{ color: C.green }}>PASS</span></div>
                  <div>3BHA never split <span className="font-bold" style={{ color: C.green }}>PASS</span></div>
                  <div className="mt-2 pt-2 border-t" style={{ borderColor: C.line }}>
                    <span style={{ color: C.amber }}>&quot;confidence&quot;</span>: <span className="font-bold" style={{ color: C.green }}>0.82</span>
                  </div>
                </Terminal>
              </div>
            </div>

            {/* ── 05 GEOCODE ── */}
            <div className="relative border p-6" style={{ borderColor: C.line, background: C.panel }}>
              <StageHeader n="05" name="Geocode" meta="200+ township DB // GeoJSON polygons" />
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 items-start">
                <div>
                  <SubLabel>Precision cascade</SubLabel>
                  <div className="border" style={{ borderColor: C.line }}>
                    {[
                      { tier: 'T1', label: 'Exact town',        example: 'Sagaing township', coords: '21.8833°N 95.9833°E', ok: true },
                      { tier: 'T2', label: 'Township centroid', example: 'Sagaing District', coords: '21.9°N 96.1°E',       ok: true },
                      { tier: 'T3', label: 'District centroid', example: 'Sagaing Region',   coords: '22.1°N 95.8°E',       ok: true },
                      { tier: 'T4', label: 'State / region',    example: 'Sagaing',          coords: '22.5°N 95.7°E',       ok: true },
                      { tier: 'XX', label: 'Myanmar only',      example: 'no specific state', coords: 'DISCARDED',          ok: false },
                    ].map((p, i) => (
                      <div
                        key={p.label}
                        className={`grid grid-cols-[44px_150px_1fr] sm:grid-cols-[44px_160px_1fr_170px] items-center gap-3 px-3 py-2 text-[14px] ${i ? 'border-t' : ''}`}
                        style={{ borderColor: C.line }}
                      >
                        <span
                          className="font-mono text-[12px] font-black text-center py-0.5"
                          style={{ background: p.ok ? C.olive : C.red, color: C.bg }}
                        >
                          {p.tier}
                        </span>
                        <span className="font-semibold" style={{ color: C.text }}>{p.label}</span>
                        <span style={{ color: C.text2 }}>{p.example}</span>
                        <span className="hidden sm:block font-mono text-[12px] tabular-nums text-right" style={{ color: p.ok ? C.text2 : C.red }}>
                          {p.coords}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <Terminal file="geocode.ts" status="LOCKED">
                  <div style={{ color: C.muted }}>resolve(&quot;Sagaing Region&quot;)</div>
                  <div>match: <span style={{ color: C.text }}>Sagaing township</span></div>
                  <div>lat: <span style={{ color: C.green }}>21.8833</span></div>
                  <div>lng: <span style={{ color: C.green }}>95.9833</span></div>
                  <div>precision: <span style={{ color: C.green }}>township</span></div>
                  <div className="mt-2 pt-2 border-t" style={{ borderColor: C.line }}>
                    <span style={{ color: C.amber }}>RESULT:</span> <span style={{ color: C.text }}>quality gate passed</span>
                  </div>
                </Terminal>
              </div>
            </div>

            {/* ── 06 STORE ── */}
            <div className="relative border p-6" style={{ borderColor: C.line, background: C.panel }}>
              <StageHeader n="06" name="Store" meta="Neon PostgreSQL // SHA-256 dedup" />
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 items-start">
                <div>
                  <SubLabel>3-stage schema</SubLabel>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-6">
                    {[
                      { step: 'STAGE A', table: 'RawArticle',    fields: 'url · title · body · fetched_at' },
                      { step: 'STAGE B', table: 'ConflictEvent', fields: 'type · date · region · actors · hash' },
                      { step: 'STAGE C', table: 'AnalysedEvent', fields: 'coords · confidence · source_count' },
                    ].map(item => (
                      <div key={item.table} className="border px-3 py-2.5" style={{ borderColor: C.line2, background: C.panel2 }}>
                        <div className="font-mono text-[11px] font-bold tracking-wider" style={{ color: C.olive }}>{item.step}</div>
                        <div className="font-mono text-[14px] font-bold" style={{ color: C.amber }}>{item.table}</div>
                        <div className="font-mono text-[12px] mt-0.5" style={{ color: C.text2 }}>{item.fields}</div>
                      </div>
                    ))}
                  </div>
                  <SubLabel>Dedup fingerprint</SubLabel>
                  <div className="font-mono text-[13px] mb-1 break-all" style={{ color: C.text2 }}>
                    SHA-256(<span style={{ color: C.text }}>&quot;PDF+Tatmadaw | Sagaing | CLASH | 2026-06-01&quot;</span>)
                  </div>
                  <div className="font-mono text-[13px] font-bold" style={{ color: C.amber }}>= a7f3e9c2...d841f</div>
                  <p className="text-[15px] leading-relaxed mt-3" style={{ color: C.text2 }}>
                    Same clash from multiple outlets increases confidence instead of creating duplicate pins.
                  </p>
                </div>
                <Terminal file="upsert.sql" status="COMMITTED">
                  <div>hash = sha256(</div>
                  <div className="pl-3" style={{ color: C.text }}>&quot;PDF+Tatmadaw|Sagaing|CLASH|2026-06-01&quot;</div>
                  <div>)</div>
                  <div><span style={{ color: C.amber }}>a7f3e9...</span> <span style={{ color: C.green }}>NEW EVENT</span></div>
                  <div className="mt-2 pt-2 border-t" style={{ borderColor: C.line }}>
                    <div><span className="font-bold" style={{ color: C.amber }}>INSERT</span> ConflictEvent <span style={{ color: C.green }}>OK</span></div>
                    <div><span className="font-bold" style={{ color: C.amber }}>INSERT</span> AnalysedEvent <span style={{ color: C.green }}>OK</span></div>
                    <div className="pl-3">confidence = <span style={{ color: C.green }}>0.79</span></div>
                    <div className="mt-1"><span style={{ color: C.amber }}>RESULT:</span> <span style={{ color: C.text }}>Mapbox pin live</span></div>
                  </div>
                </Terminal>
              </div>
            </div>
          </div>

          {/* Chain of custody */}
          <div className="mt-10">
            <SubLabel>Chain of processing</SubLabel>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 border" style={{ borderColor: C.line2 }}>
              {[
                { label: '28 sources',    sub: 'RSS / Telegram' },
                { label: 'Keyword gate',  sub: 'regex filter' },
                { label: 'Llama 3.3 70B', sub: 'extract' },
                { label: 'DeepSeek',      sub: 'validate' },
                { label: 'Township DB',   sub: 'geocode' },
                { label: 'SHA-256',       sub: 'dedup' },
                { label: 'Mapbox GL',     sub: 'map' },
              ].map((item, i) => (
                <div
                  key={item.label}
                  className="px-3 py-3 border-r border-b lg:border-b-0"
                  style={{ borderColor: C.line, background: C.panel }}
                >
                  <div className="font-mono text-[11px] font-bold" style={{ color: C.olive }}>STEP {String(i + 1).padStart(2, '0')}</div>
                  <div className="font-mono text-[13px] font-bold" style={{ color: C.amber }}>{item.label}</div>
                  <div className="text-[12px]" style={{ color: C.text2 }}>{item.sub}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ── Glossary ── */}
      <section className="border-t py-14" style={{ borderColor: C.line }}>
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
          <Eyebrow>Annex A // Key terms</Eyebrow>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 border-t" style={{ borderColor: C.line }}>
            {GLOSSARY.map(g => (
              <div key={g.term} className="flex gap-4 py-3 border-b" style={{ borderColor: C.line }}>
                <span className="font-mono text-[12px] font-bold w-24 shrink-0 pt-0.5 tracking-wider" style={{ color: C.amber }}>
                  {g.term}
                </span>
                <span className="text-[14px] leading-relaxed" style={{ color: C.text2 }}>{g.def}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div
        className="text-center font-mono text-[11px] font-bold tracking-[0.3em] py-1.5"
        style={{ background: C.olive, color: C.bg }}
      >
        UNCLASSIFIED // OPEN SOURCE INTELLIGENCE // FOR PUBLIC RELEASE
      </div>
    </div>
  )
}
