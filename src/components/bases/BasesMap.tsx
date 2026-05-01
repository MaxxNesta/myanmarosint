'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { BASES, STATUS_COLORS, STATUS_LABELS, type MilitaryBase } from '@/lib/bases-data'


const INSIGNIA_URL =
  'https://upload.wikimedia.org/wikipedia/commons/a/ae/Shoulder_sleeve_insignia_of_Myanmar_Infantry_Corps_with_shape.svg'

const STATUS_SHORT: Record<string, string> = {
  OPERATIONAL: 'OPS',
  CONTESTED:   'CNTST',
  SEIZED_PDF:  'PDF',
  SEIZED_EAO:  'EAO',
  UNKNOWN:     'UNK',
}

const SHADOW = '0 1px 4px rgba(0,0,0,1),0 0 12px rgba(0,0,0,0.9)'

interface Props {
  selected:   number | null
  onSelect:   (id: number) => void
  visibleIds: Set<number>
}

function buildMarkerEl(base: MilitaryBase): HTMLElement {
  const color = STATUS_COLORS[base.status]
  const num   = base.regimentEn  // e.g. "LIB 15"
  const short = STATUS_SHORT[base.status]

  // Ambient glow on insignia at rest
  const imgGlow = `drop-shadow(0 0 4px ${color}cc) drop-shadow(0 0 2px ${color}88) brightness(1.1)`

  const wrap = document.createElement('div')
  wrap.style.cssText =
    'display:flex;align-items:center;gap:4px;cursor:pointer;' +
    'transition:transform 0.15s ease;'

  wrap.innerHTML = `
    <div style="position:relative;flex-shrink:0;width:16px;height:16px">
      <img
        src="${INSIGNIA_URL}"
        width="16" height="16"
        style="object-fit:contain;display:block;filter:${imgGlow};transition:filter 0.15s ease"
        alt="${base.regimentEn}"
        onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"
      />
      <!-- Fallback if SVG fails to load -->
      <span style="
        display:none;position:absolute;inset:0;
        align-items:center;justify-content:center;
        font-family:monospace;font-size:8px;font-weight:900;
        color:${color};
        text-shadow:0 0 6px ${color},0 0 3px ${color};
      ">${base.id}</span>
    </div>

    <div style="line-height:1.25;user-select:none">
      <div style="
        font-family:'Courier New',monospace;
        font-size:10.5px;font-weight:700;letter-spacing:0.04em;
        color:#f1f5f9;
        text-shadow:${SHADOW};
        white-space:nowrap;
      ">${num}</div>
      <div style="
        font-family:'Courier New',monospace;
        font-size:8px;font-weight:600;letter-spacing:0.06em;
        color:${color};
        text-shadow:${SHADOW};
        white-space:nowrap;
      ">${short}</div>
    </div>`

  return wrap
}

function popupHTML(b: MilitaryBase): string {
  const color     = STATUS_COLORS[b.status]
  const statusLbl = STATUS_LABELS[b.status]
  return `
    <div style="padding:14px 16px;font-size:0.8rem;min-width:250px;max-width:310px">
      <div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:12px">
        <img src="${INSIGNIA_URL}" width="20" height="20"
             style="object-fit:contain;flex-shrink:0;filter:drop-shadow(0 0 5px ${color})"
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
      maxZoom:   20,
      attributionControl: false,
    })
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right')
    map.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-right')

    function applyMarkerSizes(zoom: number) {
      const t        = Math.max(0, Math.min(1, (zoom - 4) / (20 - 4)))
      const size     = Math.round(8 + 8 * t)               // 8px → 16px
      const nameFs   = +(8   + 2.5 * t).toFixed(1)         // 8px → 10.5px
      const shortFs  = +(6   + 2   * t).toFixed(1)         // 6px → 8px
      const gap      = Math.round(2 + 2 * t)               // 2px → 4px
      const showText = zoom >= 6.5

      markersRef.current.forEach(marker => {
        const el       = marker.getElement()
        const iconWrap = el.children[0] as HTMLElement | null
        const textWrap = el.children[1] as HTMLElement | null

        el.style.gap = `${gap}px`

        if (iconWrap) {
          iconWrap.style.width  = `${size}px`
          iconWrap.style.height = `${size}px`
          const img = iconWrap.querySelector('img') as HTMLImageElement | null
          if (img) { img.width = size; img.height = size }
        }

        if (textWrap) {
          textWrap.style.display = showText ? '' : 'none'
          const nameEl  = textWrap.children[0] as HTMLElement | null
          const shortEl = textWrap.children[1] as HTMLElement | null
          if (nameEl)  nameEl.style.fontSize  = `${nameFs}px`
          if (shortEl) shortEl.style.fontSize = `${shortFs}px`
        }
      })
    }

    map.on('load', () => {
      BASES.forEach(base => {
        const el     = buildMarkerEl(base)
        const popup  = new mapboxgl.Popup({ offset: 8, maxWidth: '320px', closeButton: true })
          .setHTML(popupHTML(base))
        const marker = new mapboxgl.Marker({ element: el, anchor: 'left' })
          .setLngLat([base.lng, base.lat])
          .setPopup(popup)
          .addTo(map)

        el.addEventListener('click', () => onSelect(base.id))
        markersRef.current.set(base.id, marker)
      })
      applyMarkerSizes(map.getZoom())
      map.on('zoom', () => applyMarkerSizes(map.getZoom()))
      setReady(true)
    })

    mapRef.current = map

    const ro = new ResizeObserver(() => { map.resize() })
    if (containerRef.current) ro.observe(containerRef.current)

    return () => {
      ro.disconnect()
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
      const base   = BASES.find(b => b.id === id)!
      const color  = STATUS_COLORS[base.status]
      const el     = marker.getElement()
      const img    = el.querySelector('img') as HTMLImageElement | null
      const active = id === selected

      el.style.transform = active ? 'scale(1.25)' : 'scale(1)'
      el.style.zIndex    = active ? '10' : '1'

      // Intensify the insignia glow when selected; restore ambient glow otherwise
      if (img) {
        img.style.filter = active
          ? `drop-shadow(0 0 8px ${color}) drop-shadow(0 0 3px ${color}) brightness(1.35)`
          : `drop-shadow(0 0 4px ${color}cc) drop-shadow(0 0 2px ${color}88) brightness(1.1)`
      }

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

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  )
}
