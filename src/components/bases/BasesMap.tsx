'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { BASES, THREAT_COLORS, type MilitaryBase } from '@/lib/bases-data'

interface Props {
  selected:   number | null
  onSelect:   (id: number) => void
  filterRegion: string
}

function markerEl(base: MilitaryBase, active: boolean): HTMLElement {
  const color  = THREAT_COLORS[base.threat]
  const num    = base.regimentEn.replace('LIB ', '')
  const size   = active ? 38 : 32

  const el = document.createElement('div')
  el.style.cssText = `
    width:${size}px;height:${size}px;cursor:pointer;
    transition:transform 0.15s ease,filter 0.15s ease;
    filter:${active ? 'drop-shadow(0 0 8px ' + color + ')' : 'none'};
    transform:${active ? 'scale(1.25)' : 'scale(1)'};
  `
  el.innerHTML = `
    <svg viewBox="0 0 40 44" xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size + 4}">
      <defs>
        <filter id="sh${base.id}"><feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-opacity="0.6"/></filter>
      </defs>
      <!-- Shield shape -->
      <path d="M20 2 L38 8 L38 24 Q38 36 20 42 Q2 36 2 24 L2 8 Z"
            fill="${color}" fill-opacity="0.92"
            stroke="rgba(255,255,255,0.55)" stroke-width="1.5"
            filter="url(#sh${base.id})"/>
      <!-- Inner shield line -->
      <path d="M20 5 L35 10 L35 24 Q35 34 20 39 Q5 34 5 24 L5 10 Z"
            fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="0.8"/>
      <!-- Star / rank pip -->
      <text x="20" y="22" text-anchor="middle" dominant-baseline="middle"
            font-family="monospace" font-size="10" font-weight="bold" fill="white" opacity="0.9">
        ${num}
      </text>
      <!-- Crossed swords icon at bottom -->
      <text x="20" y="33" text-anchor="middle" dominant-baseline="middle"
            font-size="7" fill="rgba(255,255,255,0.7)">✦</text>
    </svg>`
  return el
}

function popupHTML(b: MilitaryBase): string {
  const threatClr = THREAT_COLORS[b.threat]
  const statusBg  = b.status === 'ACTIVE' ? '#166534' : b.status === 'CONTESTED' ? '#78350f' : '#1e293b'
  return `
    <div style="padding:14px 16px;font-size:0.8rem;min-width:240px;max-width:300px">
      <div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:10px">
        <div style="
          width:36px;height:36px;border-radius:3px;
          background:${threatClr}22;border:1px solid ${threatClr}55;
          display:flex;align-items:center;justify-content:center;
          font-size:0.75rem;font-weight:700;color:${threatClr};font-family:monospace;shrink:0">
          ${b.regimentEn.replace('LIB ','')}
        </div>
        <div>
          <div style="font-weight:700;color:#e2e8f0;font-size:0.88rem;font-family:monospace">${b.regimentEn}</div>
          <div style="color:#94a3b8;font-size:0.72rem;font-family:monospace">${b.regimentMm}</div>
        </div>
      </div>

      <div style="display:grid;gap:4px;margin-bottom:10px">
        <div style="background:rgba(255,255,255,0.04);border-radius:4px;padding:6px 8px">
          <div style="color:#64748b;font-size:0.65rem;font-family:monospace;text-transform:uppercase;letter-spacing:0.05em">Location</div>
          <div style="color:#cbd5e1;font-size:0.78rem;margin-top:2px">${b.locationEn}</div>
          <div style="color:#64748b;font-size:0.7rem">${b.locationMm}</div>
        </div>
        <div style="background:rgba(255,255,255,0.04);border-radius:4px;padding:6px 8px">
          <div style="color:#64748b;font-size:0.65rem;font-family:monospace;text-transform:uppercase;letter-spacing:0.05em">Region</div>
          <div style="color:#cbd5e1;font-size:0.78rem;margin-top:2px">${b.region}</div>
        </div>
      </div>

      <div style="display:flex;gap:6px;flex-wrap:wrap">
        <span style="background:${threatClr}20;color:${threatClr};border:1px solid ${threatClr}44;
                     border-radius:4px;padding:2px 8px;font-size:0.67rem;font-weight:700;font-family:monospace">
          ● ${b.threat} THREAT
        </span>
        <span style="background:${statusBg};color:${b.status==='ACTIVE'?'#86efac':b.status==='CONTESTED'?'#fcd34d':'#94a3b8'};
                     border-radius:4px;padding:2px 8px;font-size:0.67rem;font-weight:600;font-family:monospace">
          ${b.status}
        </span>
        <span style="background:rgba(255,255,255,0.06);color:#94a3b8;
                     border-radius:4px;padding:2px 8px;font-size:0.67rem;font-family:monospace">
          ${b.type}
        </span>
      </div>
    </div>`
}

export default function BasesMap({ selected, onSelect, filterRegion }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef       = useRef<mapboxgl.Map | null>(null)
  const markersRef   = useRef<Map<number, { marker: mapboxgl.Marker; el: HTMLElement }>>(new Map())
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!containerRef.current) return
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style:     'mapbox://styles/mapbox/satellite-streets-v12',
      center:    [96.5, 19.5],
      zoom:      5.2,
      minZoom:   4,
      maxZoom:   14,
      attributionControl: false,
    })

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right')
    map.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-right')

    map.on('load', () => {
      BASES.forEach(base => {
        const el     = markerEl(base, false)
        const marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
          .setLngLat([base.lng, base.lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 6, maxWidth: '320px', closeButton: true })
              .setHTML(popupHTML(base))
          )
          .addTo(map)

        el.addEventListener('click', () => onSelect(base.id))
        markersRef.current.set(base.id, { marker, el })
      })
      setReady(true)
    })

    mapRef.current = map
    return () => {
      map.remove()
      mapRef.current = null
      markersRef.current.clear()
      setReady(false)
    }
  }, [onSelect])

  // Highlight selected marker
  useEffect(() => {
    if (!ready) return
    markersRef.current.forEach(({ el }, id) => {
      const base   = BASES.find(b => b.id === id)!
      const active = id === selected
      const color  = THREAT_COLORS[base.threat]
      el.style.filter    = active ? `drop-shadow(0 0 8px ${color})` : 'none'
      el.style.transform = active ? 'scale(1.3)' : 'scale(1)'
      el.style.zIndex    = active ? '10' : '1'
    })
    if (selected && mapRef.current) {
      const base = BASES.find(b => b.id === selected)
      if (base) {
        mapRef.current.flyTo({ center: [base.lng, base.lat], zoom: Math.max(mapRef.current.getZoom(), 7), duration: 800 })
        markersRef.current.get(selected)?.marker.togglePopup()
      }
    }
  }, [selected, ready])

  // Filter visibility by region
  useEffect(() => {
    if (!ready) return
    markersRef.current.forEach(({ marker }, id) => {
      const base = BASES.find(b => b.id === id)!
      const show = !filterRegion || base.region === filterRegion
      const el   = marker.getElement()
      el.style.display = show ? '' : 'none'
    })
  }, [filterRegion, ready])

  return <div ref={containerRef} className="w-full h-full" />
}
