'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import MapboxDraw from '@mapbox/mapbox-gl-draw'
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'
import { area as turfArea, center as turfCenter, booleanPointInPolygon, point as turfPoint } from '@turf/turf'
import { BASES, STATUS_COLORS, STATUS_LABELS, type MilitaryBase } from '@/lib/bases-data'
import type { AreaSelection } from '@/lib/analyze-types'

export type { AreaSelection }

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

// Custom blue draw styles for tactical military look
const DRAW_STYLES = [
  { id: 'draw-poly-fill',          type: 'fill',   filter: ['all', ['==', '$type', 'Polygon']],                                                        paint: { 'fill-color': '#3b82f6', 'fill-opacity': 0.15 } },
  { id: 'draw-poly-fill-active',   type: 'fill',   filter: ['all', ['==', '$type', 'Polygon'], ['==', 'active', 'true']],                               paint: { 'fill-color': '#60a5fa', 'fill-opacity': 0.22 } },
  { id: 'draw-poly-stroke',        type: 'line',   filter: ['all', ['==', '$type', 'Polygon'], ['==', 'active', 'false']], layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': '#60a5fa', 'line-width': 2, 'line-dasharray': [4, 2] } },
  { id: 'draw-poly-stroke-active', type: 'line',   filter: ['all', ['==', '$type', 'Polygon'], ['==', 'active', 'true']],  layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': '#93c5fd', 'line-width': 2.5 } },
  { id: 'draw-line-active',        type: 'line',   filter: ['all', ['==', '$type', 'LineString'], ['==', 'active', 'true']], layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': '#93c5fd', 'line-width': 2.5, 'line-dasharray': [0.5, 2] } },
  { id: 'draw-vertex-halo',        type: 'circle', filter: ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point']],                                 paint: { 'circle-radius': 7, 'circle-color': '#1e3a5f' } },
  { id: 'draw-vertex',             type: 'circle', filter: ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point']],                                 paint: { 'circle-radius': 4, 'circle-color': '#93c5fd' } },
  { id: 'draw-midpoint',           type: 'circle', filter: ['all', ['==', 'meta', 'midpoint'], ['==', '$type', 'Point']],                               paint: { 'circle-radius': 3, 'circle-color': '#60a5fa', 'circle-opacity': 0.9 } },
]

interface Props {
  selected:        number | null
  onSelect:        (id: number) => void
  visibleIds:      Set<number>
  sidebarOpen?:    boolean
  clearSignal?:    number
  onAreaSelected?: (sel: AreaSelection | null) => void
}

function buildMarkerEl(base: MilitaryBase): HTMLElement {
  const color = STATUS_COLORS[base.status]
  const num   = base.regimentEn
  const short = STATUS_SHORT[base.status]

  const imgGlow = `drop-shadow(0 0 4px ${color}cc) drop-shadow(0 0 2px ${color}88) brightness(1.1)`

  const wrap = document.createElement('div')
  wrap.style.cssText =
    'display:flex;align-items:center;gap:4px;cursor:pointer;' +
    'transition:transform 0.15s ease;touch-action:manipulation;'

  wrap.innerHTML = `
    <div style="position:relative;flex-shrink:0;width:16px;height:16px">
      <img
        src="${INSIGNIA_URL}"
        width="16" height="16"
        style="object-fit:contain;display:block;filter:${imgGlow};transition:filter 0.15s ease"
        alt="${base.regimentEn}"
        onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"
      />
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

export default function BasesMap({ selected, onSelect, visibleIds, sidebarOpen, clearSignal, onAreaSelected }: Props) {
  const containerRef      = useRef<HTMLDivElement>(null)
  const mapRef            = useRef<mapboxgl.Map | null>(null)
  const markersRef        = useRef<Map<number, mapboxgl.Marker>>(new Map())
  const drawRef           = useRef<InstanceType<typeof MapboxDraw> | null>(null)
  const onAreaSelectedRef = useRef(onAreaSelected)
  const [ready, setReady] = useState(false)

  useEffect(() => { onAreaSelectedRef.current = onAreaSelected }, [onAreaSelected])

  // Clear drawn polygon when parent signals it
  useEffect(() => {
    if (clearSignal && drawRef.current) {
      drawRef.current.deleteAll()
    }
  }, [clearSignal])

  // Resize when sidebar toggles
  useEffect(() => {
    const t = setTimeout(() => mapRef.current?.resize(), 320)
    return () => clearTimeout(t)
  }, [sidebarOpen])

  // Initialise map, markers, and draw control
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
      clickTolerance: 8,
    })
    map.addControl(new mapboxgl.NavigationControl({ showCompass: true }), 'top-right')
    map.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-right')

    // Draw control with custom amber military styling
    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: { polygon: true, trash: true },
      styles: DRAW_STYLES,
    })
    map.addControl(draw, 'top-right')
    drawRef.current = draw

    function computeArea() {
      if (!drawRef.current) return
      const data = drawRef.current.getAll()
      if (!data.features.length) {
        onAreaSelectedRef.current?.(null)
        return
      }
      const feat = data.features[0]
      if (!feat || feat.geometry.type !== 'Polygon') return

      type PolygonFeature = { type: 'Feature'; geometry: { type: 'Polygon'; coordinates: number[][][] }; properties: Record<string, unknown> }
      const poly = feat as PolygonFeature

      const area_km2 = turfArea(poly) / 1_000_000
      const centerPt = turfCenter(poly)
      const center   = centerPt.geometry.coordinates as [number, number]

      const basesInside = BASES.filter(b => {
        try { return booleanPointInPolygon(turfPoint([b.lng, b.lat]), poly) }
        catch { return false }
      })

      onAreaSelectedRef.current?.({ bases: basesInside, area_km2, center, polygon: poly })
    }

    map.on('draw.create', computeArea)
    map.on('draw.update', computeArea)
    map.on('draw.delete', () => { onAreaSelectedRef.current?.(null) })

    // On mobile, double-tap to finish polygon conflicts with map double-click zoom
    map.on('draw.modechange', ({ mode }: { mode: string }) => {
      if (mode.startsWith('draw_')) map.doubleClickZoom.disable()
      else map.doubleClickZoom.enable()
    })

    function applyMarkerSizes(zoom: number) {
      const t       = Math.max(0, Math.min(1, (zoom - 4) / (20 - 4)))
      const size    = Math.round(8 + 8 * t)
      const nameFs  = +(8   + 2.5 * t).toFixed(1)
      const shortFs = +(6   + 2   * t).toFixed(1)
      const gap     = Math.round(2 + 2 * t)
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
      // Tint satellite imagery darker + greener (military tactical look)
      if (map.getLayer('satellite')) {
        map.setPaintProperty('satellite', 'raster-brightness-max', 0.60)
        map.setPaintProperty('satellite', 'raster-brightness-min', 0.04)
        map.setPaintProperty('satellite', 'raster-saturation',     -0.20)
        map.setPaintProperty('satellite', 'raster-contrast',        0.15)
        map.setPaintProperty('satellite', 'raster-hue-rotate',      30)   // shift toward green
      }

      // Terrain + dark green hillshade
      map.addSource('mapbox-dem', {
        type: 'raster-dem',
        url:  'mapbox://mapbox.mapbox-terrain-dem-v1',
        tileSize: 512,
        maxzoom: 14,
      })
      map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.0 })
      const beforeLayer = map.getLayer('road-label') ? 'road-label' : undefined
      map.addLayer({
        id:     'hillshade',
        type:   'hillshade',
        source: 'mapbox-dem',
        paint: {
          'hillshade-shadow-color':            '#0d1f0d',
          'hillshade-highlight-color':         '#1e3d1e',
          'hillshade-accent-color':            '#162b16',
          'hillshade-illumination-direction':  315,
          'hillshade-exaggeration':            0.55,
        },
      }, beforeLayer)

      BASES.forEach(base => {
        const el     = buildMarkerEl(base)
        const popup  = new mapboxgl.Popup({ offset: 8, maxWidth: '320px', closeButton: true })
          .setHTML(popupHTML(base))
        const marker = new mapboxgl.Marker({ element: el, anchor: 'left' })
          .setLngLat([base.lng, base.lat])
          .setPopup(popup)
          .addTo(map)

        el.addEventListener('click', () => onSelect(base.id))
        // On mobile, touchend is more reliable than click on Mapbox overlays
        el.addEventListener('touchend', (e) => {
          e.preventDefault()   // prevent synthetic click (avoids double-fire)
          e.stopPropagation()  // prevent map touch handler from consuming it
          onSelect(base.id)
          marker.togglePopup()
        })
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
      if (drawRef.current) {
        try { map.removeControl(drawRef.current) } catch { /* ignore */ }
      }
      map.remove()
      mapRef.current  = null
      drawRef.current = null
      markersRef.current.clear()
      setReady(false)
    }
  }, [onSelect])

  // Layer visibility
  useEffect(() => {
    if (!ready) return
    markersRef.current.forEach((marker, id) => {
      marker.getElement().style.display = visibleIds.has(id) ? '' : 'none'
    })
  }, [visibleIds, ready])

  // Highlight selected marker
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
