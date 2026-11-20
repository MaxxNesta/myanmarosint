'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'
import { BASES, STATUS_COLORS, STATUS_LABELS, type MilitaryBase } from '@/lib/bases-data'
import { REGIONAL_COMMANDS, type RegionalCommand } from '@/lib/rmc-data'
import { LIGHT_INF_DIVS, type LightInfDiv } from '@/lib/lid-data'
import { MAP_W, MAP_H, STATE_PATHS, project } from '@/lib/home-map-paths'
import { C } from './palette'

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin)

/* Same insignia the /bases map uses for IB and LIB markers */
const INFANTRY_INSIGNIA =
  'https://upload.wikimedia.org/wikipedia/commons/a/ae/Shoulder_sleeve_insignia_of_Myanmar_Infantry_Corps_with_shape.svg'

/* Office of the Commander-in-Chief, Naypyidaw */
const GHQ = { name: 'GHQ Naypyidaw', lat: 19.745, lng: 96.129 }

type Layer = 'IB' | 'LIB' | 'LID' | 'RMC' | 'LINKS'

type Focus =
  | { kind: 'base'; item: MilitaryBase }
  | { kind: 'lid';  item: LightInfDiv }
  | { kind: 'rmc';  item: RegionalCommand }
  | { kind: 'ghq' }
  | null

interface Box { x: number; y: number; w: number; h: number }
const FULL: Box = { x: -10, y: -10, w: MAP_W + 20, h: MAP_H + 20 }

function curve(a: [number, number], b: [number, number], bend = 0.18) {
  const mx = (a[0] + b[0]) / 2
  const my = (a[1] + b[1]) / 2
  const dx = b[0] - a[0]
  const dy = b[1] - a[1]
  return `M${a[0].toFixed(1)},${a[1].toFixed(1)} Q${(mx - dy * bend).toFixed(1)},${(my + dx * bend).toFixed(1)} ${b[0].toFixed(1)},${b[1].toFixed(1)}`
}

const kindOf = (b: MilitaryBase): 'IB' | 'LIB' => (b.regimentEn.startsWith('LIB') ? 'LIB' : 'IB')

export default function TheatreMap() {
  const rootRef = useRef<HTMLDivElement>(null)
  const svgRef  = useRef<SVGSVGElement>(null)
  const view    = useRef<Box>({ ...FULL })
  const drag    = useRef<{ x: number; y: number; box: Box } | null>(null)

  const [layers, setLayers] = useState<Record<Layer, boolean>>({ IB: true, LIB: true, LID: true, RMC: true, LINKS: true })
  const [focus, setFocus]   = useState<Focus>(null)
  const [pinned, setPinned] = useState<string | null>(null) // RMC id that is zoomed
  const [stateName, setStateName] = useState<string | null>(null)

  /* ── Pre-project everything once ── */
  const ghqPt = useMemo(() => project(GHQ.lng, GHQ.lat), [])
  const rmcs  = useMemo(() => REGIONAL_COMMANDS.map(r => ({ r, p: project(r.lng, r.lat) })), [])
  const lids  = useMemo(() => LIGHT_INF_DIVS.map(l => ({ l, p: project(l.lng, l.lat) })), [])
  const bases = useMemo(
    () => BASES.filter(b => b.lat > 9 && b.lat < 29 && b.lng > 92 && b.lng < 102)
               .map(b => ({ b, k: kindOf(b), p: project(b.lng, b.lat) })),
    [],
  )
  const links = useMemo(() => {
    const out: { id: string; d: string; tier: 1 | 2; rmc: string }[] = []
    rmcs.forEach(({ r, p }) => out.push({ id: `g-${r.id}`, d: curve(ghqPt, p, 0.12), tier: 1, rmc: r.id }))
    lids.forEach(({ l, p }) => {
      const parent = rmcs.find(x => x.r.name === l.cmd)
      if (parent) out.push({ id: `l-${l.num}`, d: curve(parent.p, p, 0.22), tier: 2, rmc: parent.r.id })
    })
    return out
  }, [rmcs, lids, ghqPt])

  const counts = useMemo(() => ({
    IB:  bases.filter(x => x.k === 'IB').length,
    LIB: bases.filter(x => x.k === 'LIB').length,
    LID: lids.length,
    RMC: rmcs.length,
    LINKS: links.length,
  }), [bases, lids, rmcs, links])

  /* ── viewBox tweening ── */
  const applyView = () => {
    const v = view.current
    svgRef.current?.setAttribute('viewBox', `${v.x} ${v.y} ${v.w} ${v.h}`)
  }
  const tweenTo = (target: Box, duration = 0.9) => {
    gsap.to(view.current, { ...target, duration, ease: 'power3.inOut', onUpdate: applyView, overwrite: true })
  }
  const zoomBy = (factor: number) => {
    const v = view.current
    const w = Math.min(FULL.w * 1.2, Math.max(60, v.w * factor))
    const h = w * (FULL.h / FULL.w)
    tweenTo({ x: v.x + (v.w - w) / 2, y: v.y + (v.h - h) / 2, w, h }, 0.5)
  }
  const resetView = () => {
    setPinned(null)
    setFocus(null)
    tweenTo(FULL)
  }

  const zoomToRmc = (r: RegionalCommand) => {
    const pts = [project(r.lng, r.lat), ...lids.filter(x => x.l.cmd === r.name).map(x => x.p)]
    const xs = pts.map(p => p[0]); const ys = pts.map(p => p[1])
    const pad = 70
    let w = Math.max(...xs) - Math.min(...xs) + pad * 2
    let h = Math.max(...ys) - Math.min(...ys) + pad * 2
    const ratio = FULL.h / FULL.w
    if (h / w < ratio) h = w * ratio; else w = h / ratio
    const cx = (Math.max(...xs) + Math.min(...xs)) / 2
    const cy = (Math.max(...ys) + Math.min(...ys)) / 2
    setPinned(r.id)
    setFocus({ kind: 'rmc', item: r })
    tweenTo({ x: cx - w / 2, y: cy - h / 2, w, h })
  }

  /* ── Drag to pan ── */
  const onPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if ((e.target as Element).closest('[data-node]')) return
    drag.current = { x: e.clientX, y: e.clientY, box: { ...view.current } }
    ;(e.currentTarget as SVGSVGElement).setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!drag.current || !svgRef.current) return
    gsap.killTweensOf(view.current)
    const rect = svgRef.current.getBoundingClientRect()
    const s = drag.current.box.w / rect.width
    view.current.x = drag.current.box.x - (e.clientX - drag.current.x) * s
    view.current.y = drag.current.box.y - (e.clientY - drag.current.y) * s
    applyView()
  }
  const onPointerUp = () => { drag.current = null }

  /* ── Intro + ambient animation ── */
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: root, start: 'top 75%', once: true },
        defaults: { ease: 'power2.out' },
      })
      tl.from('.tm-state', { opacity: 0, duration: 0.6, stagger: 0.03 })
        .from('.tm-ghq', { scale: 0, transformOrigin: '50% 50%', duration: 0.5, ease: 'back.out(2)' }, '-=0.2')
        .fromTo('.tm-link', { strokeDashoffset: (_i: number, el: SVGPathElement) => el.getTotalLength() },
          { strokeDashoffset: 0, duration: 1.1, stagger: 0.04 }, '-=0.1')
        .from('.tm-rmc', { scale: 0, transformOrigin: '50% 50%', duration: 0.45, stagger: 0.05, ease: 'back.out(2.2)' }, '-=1.1')
        .from('.tm-lid', { scale: 0, transformOrigin: '50% 50%', duration: 0.4, stagger: 0.05, ease: 'back.out(2.2)' }, '-=0.6')
        .from('.tm-base', { opacity: 0, duration: 0.5, stagger: { amount: 1.2, from: 'random' } }, '-=0.6')
        .add(() => {
          // signal packets travelling GHQ → command → division
          root.querySelectorAll<SVGCircleElement>('.tm-packet').forEach((dot, i) => {
            const path = root.querySelector<SVGPathElement>(`#${dot.dataset.path}`)
            if (!path) return
            gsap.to(dot, {
              motionPath: { path, align: path, alignOrigin: [0.5, 0.5] },
              onStart: () => { gsap.set(dot, { opacity: 1 }) },
              duration: 2.4 + (i % 5) * 0.35,
              repeat: -1,
              ease: 'none',
              delay: (i % 7) * 0.3,
            })
          })
        })
      gsap.to('.tm-ghq-ring', { attr: { r: 26 }, opacity: 0, duration: 1.8, repeat: -1, ease: 'power1.out' })
    })
    return () => mm.revert()
  }, [])

  /* Dim links/nodes outside the pinned command */
  const dimLink  = (rmc: string) => pinned !== null && pinned !== rmc
  const dimLid   = (l: LightInfDiv) => pinned !== null && rmcs.find(x => x.r.id === pinned)?.r.name !== l.cmd
  const toggle   = (k: Layer) => setLayers(s => ({ ...s, [k]: !s[k] }))
  const nodeSize = 1 // scale hook for future use

  return (
    <div ref={rootRef} className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] border" style={{ borderColor: C.line2, background: C.panel }}>
      {/* ── Map ── */}
      <div className="relative min-w-0 border-b lg:border-b-0 lg:border-r" style={{ borderColor: C.line }}>
        <div className="flex items-center justify-between px-3 py-2 border-b font-mono text-[11px] tracking-wider uppercase" style={{ borderColor: C.line, background: C.panel2, color: C.text2 }}>
          <span>GRID: MMR{' // '}{stateName ?? 'Theatre overview'}</span>
          <span style={{ color: C.green }}>{pinned ? 'SECTOR LOCK' : 'LIVE OVERLAY'}</span>
        </div>

        {/* Controls */}
        <div className="absolute right-3 top-12 z-10 flex flex-col gap-1">
          {[
            { label: '+', act: () => zoomBy(0.7), aria: 'Zoom in' },
            { label: '−', act: () => zoomBy(1.4), aria: 'Zoom out' },
          ].map(b => (
            <button key={b.aria} onClick={b.act} aria-label={b.aria}
              className="w-8 h-8 font-mono text-[16px] font-bold border transition-colors hover:bg-[#f2b33d] hover:text-[#0b0d09]"
              style={{ borderColor: C.amber, color: C.amber, background: C.bg }}>
              {b.label}
            </button>
          ))}
          <button onClick={resetView} className="h-8 px-1 font-mono text-[10px] font-bold border transition-colors hover:bg-[#f2b33d] hover:text-[#0b0d09]"
            style={{ borderColor: C.amber, color: C.amber, background: C.bg }}>
            RESET
          </button>
        </div>

        <svg
          ref={svgRef}
          viewBox={`${FULL.x} ${FULL.y} ${FULL.w} ${FULL.h}`}
          className="block w-full h-[540px] lg:h-[760px] touch-pan-y lg:touch-none cursor-grab active:cursor-grabbing select-none"
          preserveAspectRatio="xMidYMid meet"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
          role="img"
          aria-label="Interactive map of Myanmar showing Tatmadaw command network, light infantry divisions and infantry battalions"
        >
          <defs>
            <pattern id="tm-grid" width="25" height="25" patternUnits="userSpaceOnUse">
              <path d="M25 0H0V25" fill="none" stroke={C.olive} strokeOpacity="0.08" strokeWidth="0.6" />
            </pattern>
            <clipPath id="tm-clip-rmc"><circle r="11" /></clipPath>
            <clipPath id="tm-clip-lid"><circle r="8" /></clipPath>
          </defs>
          <rect x={-500} y={-500} width={MAP_W + 1000} height={MAP_H + 1000} fill="url(#tm-grid)" />

          {/* States */}
          <g>
            {STATE_PATHS.map(s => (
              <path
                key={s.name}
                className="tm-state transition-[fill] duration-200"
                d={s.d}
                fill={stateName === s.name ? '#232a1b' : '#171c12'}
                stroke={C.olive}
                strokeOpacity={0.55}
                strokeWidth={0.8}
                vectorEffect="non-scaling-stroke"
                onMouseEnter={() => setStateName(s.name)}
                onMouseLeave={() => setStateName(n => (n === s.name ? null : n))}
              />
            ))}
          </g>

          {/* Bases (IB / LIB) */}
          <g
            onMouseOver={e => {
              const id = (e.target as Element).closest('[data-base]')?.getAttribute('data-base')
              if (!id) return
              const hit = bases.find(x => String(x.b.id) + x.k === id)
              if (hit) setFocus({ kind: 'base', item: hit.b })
            }}
          >
            {bases.map(({ b, k, p }) => (
                <g key={`${k}-${b.id}-${p[0]}`} display={layers[k] ? undefined : 'none'} className="tm-base" data-node data-base={String(b.id) + k}
                   transform={`translate(${p[0].toFixed(1)},${p[1].toFixed(1)})`}
                   opacity={pinned ? 0.35 : 1} style={{ cursor: 'pointer' }}>
                  <circle r={3.6 * nodeSize} fill={C.bg} stroke={STATUS_COLORS[b.status]} strokeWidth={1.1} />
                  <image href={INFANTRY_INSIGNIA} x={-2.6} y={-2.6} width={5.2} height={5.2} />
                </g>
            ))}
          </g>

          {/* Command links */}
          {(
            <g fill="none" display={layers.LINKS ? undefined : 'none'}>
              {links.map(l => (
                <path
                  key={l.id}
                  id={`tm-${l.id}`}
                  className="tm-link"
                  d={l.d}
                  stroke={l.tier === 1 ? C.amber : C.olive}
                  strokeWidth={l.tier === 1 ? 1.3 : 1.1}
                  strokeOpacity={dimLink(l.rmc) ? 0.12 : 0.85}
                  strokeDasharray="2000"
                  vectorEffect="non-scaling-stroke"
                />
              ))}
              {links.map(l => (
                <circle key={`p-${l.id}`} className="tm-packet" data-path={`tm-${l.id}`} r={l.tier === 1 ? 2.2 : 1.8}
                  fill={l.tier === 1 ? C.amber : C.green} opacity={0} />
              ))}
            </g>
          )}

          {/* LIDs */}
          {lids.map(({ l, p }) => (
            <g key={l.num} data-node display={layers.LID ? undefined : 'none'} transform={`translate(${p[0].toFixed(1)},${p[1].toFixed(1)})`}
               opacity={dimLid(l) ? 0.25 : 1} style={{ cursor: 'pointer' }}
               onMouseEnter={() => setFocus({ kind: 'lid', item: l })}
               onClick={() => setFocus({ kind: 'lid', item: l })}>
              <g className="tm-lid">
                <rect x={-9} y={-9} width={18} height={18} fill={C.bg} stroke={C.olive} strokeWidth={1.2} />
                <image href={l.insignia} x={-7.5} y={-7.5} width={15} height={15} />
              </g>
            </g>
          ))}

          {/* Regional commands */}
          {rmcs.map(({ r, p }) => (
            <g key={r.id} data-node display={layers.RMC ? undefined : 'none'} transform={`translate(${p[0].toFixed(1)},${p[1].toFixed(1)})`}
               opacity={pinned && pinned !== r.id ? 0.35 : 1} style={{ cursor: 'pointer' }}
               onMouseEnter={() => !pinned && setFocus({ kind: 'rmc', item: r })}
               onClick={() => zoomToRmc(r)}>
              <g className="tm-rmc">
                <circle r={13} fill={C.bg} stroke={pinned === r.id ? C.text : C.amber} strokeWidth={1.6} />
                <image href={r.insignia} x={-10} y={-10} width={20} height={20} />
                {pinned === r.id && (
                  <text y={-17} textAnchor="middle" fontSize={9} fontWeight={700} fill={C.text}
                    style={{ fontFamily: 'var(--font-mono), monospace', paintOrder: 'stroke' }} stroke={C.bg} strokeWidth={3}>
                    {r.hq.toUpperCase()}
                  </text>
                )}
              </g>
            </g>
          ))}

          {/* GHQ */}
          <g data-node transform={`translate(${ghqPt[0].toFixed(1)},${ghqPt[1].toFixed(1)})`} style={{ cursor: 'pointer' }}
             onMouseEnter={() => !pinned && setFocus({ kind: 'ghq' })}>
            <circle className="tm-ghq-ring" r={8} fill="none" stroke={C.amber} strokeWidth={1.2} />
            <g className="tm-ghq">
              <rect x={-7} y={-7} width={14} height={14} fill={C.amber} transform="rotate(45)" />
              <rect x={-3} y={-3} width={6} height={6} fill={C.bg} transform="rotate(45)" />
            </g>
          </g>
        </svg>

        <p className="px-3 py-2 border-t font-mono text-[11px]" style={{ borderColor: C.line, color: C.text2 }}>
          Drag to pan. Click a regional command to lock its sector. Hover any unit for details.
        </p>
      </div>

      {/* ── Side panel ── */}
      <div className="flex flex-col">
        <div className="p-4 border-b" style={{ borderColor: C.line }}>
          <p className="font-mono text-[11px] font-bold tracking-[0.16em] uppercase mb-3" style={{ color: C.olive }}>Overlay layers</p>
          <div className="grid grid-cols-1 gap-1.5">
            {([
              { k: 'RMC',   label: 'Regional Commands',       icon: REGIONAL_COMMANDS[0].insignia },
              { k: 'LID',   label: 'Light Infantry Divisions', icon: LIGHT_INF_DIVS[0].insignia },
              { k: 'LIB',   label: 'Light Infantry Battalions', icon: INFANTRY_INSIGNIA },
              { k: 'IB',    label: 'Infantry Battalions',     icon: INFANTRY_INSIGNIA },
              { k: 'LINKS', label: 'Chain of command links',  icon: null },
            ] as { k: Layer; label: string; icon: string | null }[]).map(o => (
              <button
                key={o.k}
                onClick={() => toggle(o.k)}
                aria-pressed={layers[o.k]}
                className="flex items-center gap-3 px-2.5 py-2 border text-left transition-colors"
                style={{
                  borderColor: layers[o.k] ? C.amber : C.line,
                  background: layers[o.k] ? '#f2b33d14' : 'transparent',
                }}
              >
                <span className="w-7 h-7 shrink-0 flex items-center justify-center border" style={{ borderColor: C.line2, background: C.bg }}>
                  {o.icon
                    ? <img src={o.icon} alt="" width={22} height={22} className="w-[22px] h-[22px] object-contain" />
                    : <span className="block w-5 h-[2px]" style={{ background: C.amber }} />}
                </span>
                <span className="flex-1 text-[13px] font-semibold" style={{ color: layers[o.k] ? C.text : C.muted }}>{o.label}</span>
                <span className="font-mono text-[12px] font-bold tabular-nums" style={{ color: layers[o.k] ? C.amber : C.muted }}>
                  {counts[o.k]}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 border-b" style={{ borderColor: C.line }}>
          <p className="font-mono text-[11px] font-bold tracking-[0.16em] uppercase mb-2" style={{ color: C.olive }}>Battalion status ring</p>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
            {(Object.keys(STATUS_COLORS) as (keyof typeof STATUS_COLORS)[]).map(s => (
              <div key={s} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full border-2 shrink-0" style={{ borderColor: STATUS_COLORS[s] }} />
                <span className="font-mono text-[12px]" style={{ color: C.text2 }}>{STATUS_LABELS[s]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 flex-1 min-h-[220px]">
          <p className="font-mono text-[11px] font-bold tracking-[0.16em] uppercase mb-3" style={{ color: C.olive }}>Unit dossier</p>
          <Dossier focus={focus} lidCount={(name: string) => LIGHT_INF_DIVS.filter(l => l.cmd === name).length} />
        </div>
      </div>
    </div>
  )
}

function Row({ k, v, color }: { k: string; v: string | number; color?: string }) {
  return (
    <div className="flex justify-between gap-3 py-1.5 border-b" style={{ borderColor: C.line }}>
      <span className="font-mono text-[11px] uppercase tracking-wider" style={{ color: C.olive }}>{k}</span>
      <span className="text-[13px] font-semibold text-right" style={{ color: color ?? C.text }}>{v}</span>
    </div>
  )
}

function Dossier({ focus, lidCount }: { focus: Focus; lidCount: (n: string) => number }) {
  if (!focus) {
    return (
      <p className="text-[14px] leading-relaxed" style={{ color: C.text2 }}>
        Hover a marker to open its dossier. Amber links run from GHQ Naypyidaw to each regional command; olive links run from each command to its light infantry divisions.
      </p>
    )
  }
  const head = (img: string | null, title: string, sub: string) => (
    <div className="flex items-center gap-3 mb-3">
      <div className="w-16 h-16 shrink-0 flex items-center justify-center border" style={{ borderColor: C.amber, background: C.bg }}>
        {img
          ? <img src={img} alt="" width={52} height={52} className="w-[52px] h-[52px] object-contain" />
          : <span className="block w-7 h-7 rotate-45" style={{ background: C.amber }} />}
      </div>
      <div className="min-w-0">
        <div className="font-mono text-[15px] font-bold leading-tight" style={{ color: C.text }}>{title}</div>
        <div className="text-[13px] leading-snug" style={{ color: C.text2 }}>{sub}</div>
      </div>
    </div>
  )
  if (focus.kind === 'ghq') {
    return (
      <div>
        {head(null, 'GHQ NAYPYIDAW', 'Office of the Commander-in-Chief')}
        <Row k="Subordinate" v={`${REGIONAL_COMMANDS.length} regional commands`} />
        <Row k="Divisions" v={`${LIGHT_INF_DIVS.length} LIDs`} />
      </div>
    )
  }
  if (focus.kind === 'rmc') {
    const r = focus.item
    return (
      <div>
        {head(r.insignia, r.name.toUpperCase(), r.burmese)}
        <Row k="HQ" v={r.hq} />
        <Row k="Area" v={r.region} />
        <Row k="Abbr" v={r.abbr} />
        <Row k="LIDs attached" v={lidCount(r.name)} />
      </div>
    )
  }
  if (focus.kind === 'lid') {
    const l = focus.item
    return (
      <div>
        {head(l.insignia, `LID ${l.num}`, l.name)}
        <Row k="HQ" v={l.loc} />
        <Row k="Command" v={l.cmd} />
        <Row k="Established" v={l.est} />
        <Row k="Regiments" v={l.regiments} />
      </div>
    )
  }
  const b = focus.item
  return (
    <div>
      {head(INFANTRY_INSIGNIA, b.regimentEn, b.regimentMm)}
      <Row k="Location" v={b.locationEn} />
      <Row k="Region" v={b.region} />
      <Row k="Status" v={STATUS_LABELS[b.status]} color={STATUS_COLORS[b.status]} />
      <Row k="Coords" v={`${b.lat.toFixed(3)}°N ${b.lng.toFixed(3)}°E`} />
    </div>
  )
}
