'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'
import { C } from './palette'

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin)

const SOURCES = [
  { name: 'Irrawaddy',      kind: 'RSS' },
  { name: 'DVB',            kind: 'RSS' },
  { name: 'Myanmar Now',    kind: 'RSS' },
  { name: 'RFA Burma',      kind: 'RSS' },
  { name: 'BNI Multimedia', kind: 'RSS' },
  { name: 'Narinjara',      kind: 'RSS' },
  { name: 'Kachin News',    kind: 'RSS' },
  { name: 'BBC Burmese',    kind: 'RSS' },
  { name: 'Mizzima',        kind: 'RSS' },
  { name: '@theirrawaddy',  kind: 'TG'  },
  { name: 'Karen News',     kind: 'RSS' },
  { name: 'SHAN',           kind: 'RSS' },
  { name: 'Reuters',        kind: 'RSS' },
  { name: 'VOA Burmese',    kind: 'RSS' },
  { name: '+14 more',       kind: '··'  },
]

const W = 960
const ROW = 26
const TOP = 16
const H = TOP * 2 + ROW * (SOURCES.length - 1)
const SRC_X = 190
const HUB = { x: 560, y: H / 2 }
const OUT = { x: 790, y: H / 2 }

export default function SourceFlow() {
  const ref = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const svg = ref.current
    if (!svg) return
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: svg, start: 'top 80%', once: true } })
      tl.from('.sf-src', { x: -20, opacity: 0, duration: 0.4, stagger: 0.04, ease: 'power2.out' })
        .fromTo('.sf-line', { strokeDashoffset: (_i: number, el: SVGPathElement) => el.getTotalLength() },
          { strokeDashoffset: 0, duration: 0.8, stagger: 0.03, ease: 'power2.inOut' }, '-=0.4')
        .from('.sf-hub', { scale: 0.6, opacity: 0, transformOrigin: '50% 50%', duration: 0.5, ease: 'back.out(2)' }, '-=0.3')
        .fromTo('.sf-out-line', { strokeDashoffset: 300 }, { strokeDashoffset: 0, duration: 0.5 })
        .from('.sf-out', { opacity: 0, x: -10, duration: 0.4 })
        .add(() => {
          svg.querySelectorAll<SVGCircleElement>('.sf-packet').forEach((dot, i) => {
            const path = svg.querySelector<SVGPathElement>(`#${dot.dataset.path}`)
            if (!path) return
            gsap.to(dot, {
              motionPath: { path, align: path, alignOrigin: [0.5, 0.5] },
              onStart: () => { gsap.set(dot, { opacity: 1 }) },
              duration: 1.6 + (i % 4) * 0.3,
              repeat: -1,
              repeatDelay: (i % 3) * 0.6,
              delay: i * 0.17,
              ease: 'power1.in',
            })
          })
          gsap.to('.sf-hub-pulse', { attr: { 'stroke-opacity': 0 }, scale: 1.25, transformOrigin: '50% 50%', duration: 1.4, repeat: -1, ease: 'power1.out' })
        })
    })
    return () => mm.revert()
  }, [])

  return (
    <svg ref={ref} viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block" role="img"
      aria-label="Diagram: news and Telegram sources flowing into the ingest queue">
      {SOURCES.map((s, i) => {
        const y = TOP + i * ROW
        const d = `M${SRC_X},${y} C${SRC_X + 180},${y} ${HUB.x - 200},${HUB.y} ${HUB.x - 70},${HUB.y}`
        return (
          <g key={s.name}>
            <path id={`sf-p${i}`} className="sf-line" d={d} fill="none"
              stroke={s.kind === 'TG' ? C.green : C.olive} strokeOpacity={0.55} strokeWidth={1.2} strokeDasharray="1000" />
            <circle className="sf-packet" data-path={`sf-p${i}`} r={3} fill={s.kind === 'TG' ? C.green : C.amber} opacity={0} />
            <g className="sf-src">
              <rect x={6} y={y - 10} width={SRC_X - 6} height={20} fill={C.bg} stroke={C.line2} />
              <rect x={6} y={y - 10} width={34} height={20} fill={s.kind === 'TG' ? C.green : C.olive} />
              <text x={23} y={y + 4} textAnchor="middle" fontSize={11} fontWeight={800} fill={C.bg}
                style={{ fontFamily: 'var(--font-mono), monospace' }}>{s.kind}</text>
              <text x={48} y={y + 4.5} fontSize={13} fontWeight={600} fill={C.text}
                style={{ fontFamily: 'var(--font-mono), monospace' }}>{s.name}</text>
            </g>
          </g>
        )
      })}

      {/* hub */}
      <g className="sf-hub">
        <rect className="sf-hub-pulse" x={HUB.x - 70} y={HUB.y - 34} width={140} height={68} fill="none" stroke={C.amber} strokeOpacity={0.8} />
        <rect x={HUB.x - 70} y={HUB.y - 34} width={140} height={68} fill={C.bg} stroke={C.amber} strokeWidth={2} />
        <text x={HUB.x} y={HUB.y - 8} textAnchor="middle" fontSize={12} fontWeight={800} fill={C.amber} letterSpacing={2}
          style={{ fontFamily: 'var(--font-mono), monospace' }}>INGEST QUEUE</text>
        <text x={HUB.x} y={HUB.y + 20} textAnchor="middle" fontSize={24} fontWeight={800} fill={C.text}
          style={{ fontFamily: 'var(--font-mono), monospace' }}>312</text>
      </g>

      <path className="sf-out-line" d={`M${HUB.x + 70},${HUB.y} L${OUT.x - 8},${HUB.y}`} stroke={C.amber} strokeWidth={2} strokeDasharray="300" />
      <path d={`M${OUT.x - 14},${OUT.y - 7} L${OUT.x - 4},${OUT.y} L${OUT.x - 14},${OUT.y + 7}`} className="sf-out" fill="none" stroke={C.amber} strokeWidth={2} />
      <g className="sf-out">
        <rect x={OUT.x} y={OUT.y - 26} width={W - OUT.x - 6} height={52} fill={C.panel2} stroke={C.line2} />
        <text x={OUT.x + 12} y={OUT.y - 5} fontSize={11} fontWeight={800} fill={C.olive} letterSpacing={1.5}
          style={{ fontFamily: 'var(--font-mono), monospace' }}>NEXT: PHASE 02</text>
        <text x={OUT.x + 12} y={OUT.y + 14} fontSize={14} fontWeight={700} fill={C.text}
          style={{ fontFamily: 'var(--font-mono), monospace' }}>Keyword filter</text>
      </g>
    </svg>
  )
}
