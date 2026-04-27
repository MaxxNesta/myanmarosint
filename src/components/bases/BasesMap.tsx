'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { BASES, STATUS_COLORS, STATUS_LABELS, type MilitaryBase } from '@/lib/bases-data'

const INSIGNIA_URL =
  'https://upload.wikimedia.org/wikipedia/commons/a/ae/Shoulder_sleeve_insignia_of_Myanmar_Infantry_Corps_with_shape.svg'

interface Props {
  selected:   number | null
  onSelect:   (id: number) => void
  visibleIds: Set<number>
}

// Build a DOM element for a Mapbox custom marker
function buildMarkerEl(base: MilitaryBase): HTMLElement {
  const color = STATUS_COLORS[base.status]
  const num   = base.regimentEn.replace('LIB ', '')

  const wrap = document.createElement('div')
  wrap.style.cssText =
    'display:flex;flex-direction:column;align-items:center;cursor:pointer;' +
    'transition:transform 0.15s ease;'

  wrap.innerHTML = `
    <!-- Badge circle -->
    <div style="
      width:38px;height:38px;border-radius:50%;
      border:3px solid ${color};
      background:#0a1628;
      box-shadow:0 0 10px ${color}66,0 3px 8px rgba(0,0,0,0.7);
      display:flex;align-items:center;justify-content:center;
      overflow:hidden;position:relative;
    ">
      <img
        src="${INSIGNIA_URL}"
        width="28" height="28"
        style="object-fit:contain;display:block"
        onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"
        alt="${base.regimentEn}"
      />
      <!-- Fallback: regiment number -->
      <span style="
        display:none;position:absolute;inset:0;
        align-items:center;justify-content:center;
        font-family:monospace;font-size:11px;font-weight:bold;color:${color};
      ">${num}</span>
    </div>
    <!-- Number label -->
    <div style="
      margin-top:2px;
      background:${color};color:white;
      border-radius:2px;padding:1px 5px;
      font-size:8px;font-family:monospace;font-weight:bold;
      white-space:nowrap;box-shadow:0 1px 4px rgba(0,0,0,0.5);
    ">${num}</div>
    <!-- Pointer -->
    <div style="
      width:0;height:0;
      border-left:4px solid transparent;
      border-right:4px solid transparent;
      border-top:5px solid ${color};
    "></div>`
  return wrap
}

function popupHTML(b: MilitaryBase): string {
  const color     = STATUS_COLORS[b.status]
  const statusLbl = STATUS_LABELS[b.status]
  return `
    <div style="padding:14px 16px;font-size:0.8rem;min-width:250px;max-width:310px">
      <div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:12px">
        <img src="${INSIGNIA_URL}" width="36" height="36"
             style="object-fit:contain;border:1px solid rgba(255,255,255,0.15);border-radius:50%;background:#0a1628;padding:3px;flex-shrink:0"
             onerror="this.style.display='none'" />
        <div>
          <div style="font-weight:700;color:#e2e8f0;font-size:0.9rem;font-family:monospace">${b.regimentEn}</div>
          <div style="color:#64748b;font-size:0.72rem;font-family:monospace">${b.regimentMm}</div>
        </div>
      </div>

      <div style="background:rgba(255,255,255,0.04);border-radius:5px;padding:8px 10px;margin-bottom:10px">
        <div style="color:#64748b;font-size:0.65rem;font-family:monospace;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px">Location</div>
        <div style="color:#cbd5e1;font-size:0.8rem">${b.locationEn}</div>
        <div style="color:#64748b;font-size:0.7rem;margin-top:2px">${b.locationMm}</div>
        <div style="color:#94a3b8;font-size:0.72rem;margin-top:4px">${b.region}</div>
      </div>

      <div style="display:flex;flex-wrap:wrap;gap:6px">
        <span style="
          background:${color}20;color:${color};border:1px solid ${color}44;
          border-radius:4px;padding:2px 8px;font-size:0.68rem;font-weight:700;font-family:monospace">
          ● ${statusLbl.toUpperCase()}
        </span>
        <span style="
          background:rgba(255,255,255,0.06);color:#94a3b8;
          border-radius:4px;padding:2px 8px;font-size:0.68rem;font-family:monospace">
          ${b.type}
        </span>
        <span style="
          background:rgba(255,255,255,0.06);color:#94a3b8;
          border-radius:4px;padding:2px 8px;font-size:0.68rem;font-family:monospace">
          ${b.threat} THREAT
        </span>
      </div>
    </div>`
}

export default function BasesMap({ selected, onSelect, visibleIds }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef       = useRef<mapboxgl.Map | null>(null)
  const markersRef   = useRef<Map<number, mapboxgl.Marker>>(new Map())
  const [ready, setReady] = useState(false)

  // Initialise map and markers once
  useEffect(() => {
    if (!containerRef.current) return
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style:     'mapbox://styles/mapbox/satellite-streets-v12',
      center:    [96.5, 19.5],
      zoom:      5.2,
      minZoom:   4,
      maxZoom:   15,
      attributionControl: false,
    })
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right')
    map.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-right')

    map.on('load', () => {
      BASES.forEach(base => {
        const el     = buildMarkerEl(base)
        const popup  = new mapboxgl.Popup({ offset: 8, maxWidth: '320px', closeButton: true })
          .setHTML(popupHTML(base))
        const marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
          .setLngLat([base.lng, base.lat])
          .setPopup(popup)
          .addTo(map)

        el.addEventListener('click', () => onSelect(base.id))
        markersRef.current.set(base.id, marker)
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

  // Layer visibility — show/hide markers based on visibleIds
  useEffect(() => {
    if (!ready) return
    markersRef.current.forEach((marker, id) => {
      marker.getElement().style.display = visibleIds.has(id) ? '' : 'none'
    })
  }, [visibleIds, ready])

  // Highlight selected marker and fly to it
  useEffect(() => {
    if (!ready) return
    markersRef.current.forEach((marker, id) => {
      const base  = BASES.find(b => b.id === id)!
      const color = STATUS_COLORS[base.status]
      const el    = marker.getElement()
      const active = id === selected

      el.style.transform = active ? 'scale(1.3)' : 'scale(1)'
      el.style.filter    = active ? `drop-shadow(0 0 8px ${color})` : 'none'
      el.style.zIndex    = active ? '10' : '1'

      if (active && mapRef.current) {
        mapRef.current.flyTo({
          center:   [base.lng, base.lat],
          zoom:     Math.max(mapRef.current.getZoom(), 7.5),
          duration: 700,
        })
        marker.togglePopup()
      }
    })
  }, [selected, ready])

  return <div ref={containerRef} className="w-full h-full" />
}
