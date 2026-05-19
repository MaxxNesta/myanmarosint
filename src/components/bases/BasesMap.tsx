'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import MapboxDraw from '@mapbox/mapbox-gl-draw'
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'
import { area as turfArea, center as turfCenter, booleanPointInPolygon, point as turfPoint } from '@turf/turf'
import { BASES, STATUS_COLORS, STATUS_LABELS, type MilitaryBase } from '@/lib/bases-data'
import { REGIONAL_COMMANDS, type RegionalCommand } from '@/lib/rmc-data'
import { LIGHT_INF_DIVS, type LightInfDiv } from '@/lib/lid-data'
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
  glowEnabled?:    boolean
  showRmc?:        boolean
  showLid?:        boolean
}

function buildMarkerEl(base: MilitaryBase): HTMLElement {
  const color = STATUS_COLORS[base.status]
  const num   = base.regimentEn
  const short = STATUS_SHORT[base.status]

  const imgGlow = `brightness(1.0)`

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

const RMC_GOLD = '#d4a849'
const RMC_SHADOW = '0 1px 5px rgba(0,0,0,1),0 0 14px rgba(0,0,0,0.95)'

function buildRmcMarkerEl(rmc: RegionalCommand): HTMLElement {
  const wrap = document.createElement('div')
  wrap.style.cssText =
    'display:flex;align-items:center;gap:5px;cursor:pointer;' +
    'transition:transform 0.15s ease;touch-action:manipulation;z-index:5;'

  wrap.innerHTML = `
    <div style="
      position:relative;flex-shrink:0;width:32px;height:32px;
      display:flex;align-items:center;justify-content:center;
    ">
      <img
        src="${rmc.insignia}"
        width="26" height="26"
        style="object-fit:contain;display:block;
          filter:brightness(1.05);transition:filter 0.15s ease"
        alt="${rmc.name}"
        onerror="this.style.display='none'"
      />
    </div>
    <div style="line-height:1.3;user-select:none">
      <div style="
        font-family:'Courier New',monospace;
        font-size:11px;font-weight:800;letter-spacing:0.05em;
        color:${RMC_GOLD};
        text-shadow:${RMC_SHADOW};
        white-space:nowrap;
      ">${rmc.abbr}</div>
      <div style="
        font-family:'Courier New',monospace;
        font-size:8px;font-weight:500;letter-spacing:0.04em;
        color:#94a3b8;
        text-shadow:${RMC_SHADOW};
        white-space:nowrap;
      ">${rmc.hq.toUpperCase()}</div>
    </div>`

  return wrap
}

function buildLidMarkerEl(lid: LightInfDiv): HTMLElement {
  const wrap = document.createElement('div')
  wrap.style.cssText =
    'display:flex;align-items:center;gap:5px;cursor:pointer;' +
    'transition:transform 0.15s ease;touch-action:manipulation;z-index:4;'

  wrap.innerHTML = `
    <div style="
      position:relative;flex-shrink:0;width:32px;height:32px;
      display:flex;align-items:center;justify-content:center;
    ">
      <img
        src="${lid.insignia}"
        width="26" height="26"
        style="object-fit:contain;display:block;
          filter:brightness(1.05);transition:filter 0.15s ease"
        alt="${lid.name}"
        onerror="this.style.display='none'"
      />
    </div>
    <div style="line-height:1.3;user-select:none">
      <div style="
        font-family:'Courier New',monospace;
        font-size:11px;font-weight:800;letter-spacing:0.05em;
        color:${RMC_GOLD};
        text-shadow:${RMC_SHADOW};
        white-space:nowrap;
      ">LID-${lid.num}</div>
      <div style="
        font-family:'Courier New',monospace;
        font-size:8px;font-weight:500;letter-spacing:0.04em;
        color:#94a3b8;
        text-shadow:${RMC_SHADOW};
        white-space:nowrap;
      ">${lid.loc.toUpperCase()}</div>
    </div>`

  return wrap
}

function lidPopupHTML(lid: LightInfDiv): string {
  return `
    <div style="padding:14px 16px;font-size:0.8rem;min-width:250px;max-width:310px">
      <div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:12px">
        <img src="${lid.insignia}" width="28" height="28"
             style="object-fit:contain;flex-shrink:0;filter:drop-shadow(0 0 5px ${RMC_GOLD}88)"
             onerror="this.style.display='none'" />
        <div>
          <div style="font-weight:700;color:#e2e8f0;font-size:0.9rem;font-family:monospace">${lid.name}</div>
          <div style="color:#64748b;font-size:0.72rem;font-family:monospace">Light Infantry Division</div>
        </div>
      </div>
      <div style="background:rgba(255,255,255,0.04);border-radius:5px;padding:8px 10px;margin-bottom:10px">
        <div style="display:flex;gap:8px;margin-bottom:5px">
          <span style="color:#64748b;font-size:0.65rem;font-family:monospace;text-transform:uppercase;letter-spacing:0.05em;min-width:28px">HQ</span>
          <span style="color:#cbd5e1;font-size:0.75rem">${lid.loc}</span>
        </div>
        <div style="display:flex;gap:8px;margin-bottom:5px">
          <span style="color:#64748b;font-size:0.65rem;font-family:monospace;text-transform:uppercase;letter-spacing:0.05em;min-width:28px">CMD</span>
          <span style="color:#94a3b8;font-size:0.72rem">${lid.cmd}</span>
        </div>
        <div style="display:flex;gap:8px">
          <span style="color:#64748b;font-size:0.65rem;font-family:monospace;text-transform:uppercase;letter-spacing:0.05em;min-width:28px">EST</span>
          <span style="color:#94a3b8;font-size:0.72rem">${lid.est}</span>
        </div>
      </div>
      <span style="
        background:${RMC_GOLD}20;color:${RMC_GOLD};border:1px solid ${RMC_GOLD}44;
        border-radius:4px;padding:2px 8px;font-size:0.68rem;font-weight:700;font-family:monospace">
        ▣ LID-${lid.num} · ${lid.regiments} REGIMENTS
      </span>
    </div>`
}

function rmcPopupHTML(rmc: RegionalCommand): string {
  return `
    <div style="padding:14px 16px;font-size:0.8rem;min-width:250px;max-width:310px">
      <div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:12px">
        <img src="${rmc.insignia}" width="28" height="28"
             style="object-fit:contain;flex-shrink:0;filter:drop-shadow(0 0 5px ${RMC_GOLD}88)"
             onerror="this.style.display='none'" />
        <div>
          <div style="font-weight:700;color:#e2e8f0;font-size:0.9rem;font-family:monospace">${rmc.name}</div>
          <div style="color:#64748b;font-size:0.72rem;font-family:monospace">${rmc.burmese}</div>
        </div>
      </div>
      <div style="background:rgba(255,255,255,0.04);border-radius:5px;padding:8px 10px;margin-bottom:10px">
        <div style="display:flex;gap:8px;margin-bottom:5px">
          <span style="color:#64748b;font-size:0.65rem;font-family:monospace;text-transform:uppercase;letter-spacing:0.05em;min-width:28px">HQ</span>
          <span style="color:#cbd5e1;font-size:0.75rem">${rmc.hq}</span>
        </div>
        <div style="display:flex;gap:8px">
          <span style="color:#64748b;font-size:0.65rem;font-family:monospace;text-transform:uppercase;letter-spacing:0.05em;min-width:28px">AOR</span>
          <span style="color:#94a3b8;font-size:0.72rem">${rmc.region}</span>
        </div>
      </div>
      <span style="
        background:${RMC_GOLD}20;color:${RMC_GOLD};border:1px solid ${RMC_GOLD}44;
        border-radius:4px;padding:2px 8px;font-size:0.68rem;font-weight:700;font-family:monospace">
        ▣ ${rmc.abbr} · REGIONAL COMMAND
      </span>
    </div>`
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

export default function BasesMap({ selected, onSelect, visibleIds, sidebarOpen, clearSignal, onAreaSelected, glowEnabled = false, showRmc = true, showLid = true }: Props) {
  const containerRef      = useRef<HTMLDivElement>(null)
  const mapRef            = useRef<mapboxgl.Map | null>(null)
  const markersRef        = useRef<Map<number, mapboxgl.Marker>>(new Map())
  const rmcMarkersRef     = useRef<Map<string, mapboxgl.Marker>>(new Map())
  const lidMarkersRef     = useRef<Map<number, mapboxgl.Marker>>(new Map())
  const drawRef           = useRef<InstanceType<typeof MapboxDraw> | null>(null)
  const onAreaSelectedRef = useRef(onAreaSelected)
  const glowEnabledRef    = useRef(glowEnabled)
  const [ready, setReady] = useState(false)

  useEffect(() => { onAreaSelectedRef.current = onAreaSelected }, [onAreaSelected])
  useEffect(() => { glowEnabledRef.current = glowEnabled }, [glowEnabled])

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

      // RMC markers — larger scale (1.75× IB/LIB)
      const rmcSize   = Math.round(20 + 14 * t)
      const rmcAbbrFs = +(10 + 2 * t).toFixed(1)
      const rmcHqFs   = +(7.5 + 1.5 * t).toFixed(1)
      const rmcGap    = Math.round(4 + 2 * t)

      rmcMarkersRef.current.forEach(marker => {
        const el      = marker.getElement()
        const iconBox = el.children[0] as HTMLElement | null
        const textBox = el.children[1] as HTMLElement | null

        el.style.gap = `${rmcGap}px`

        if (iconBox) {
          const boxSize = rmcSize + 6
          iconBox.style.width  = `${boxSize}px`
          iconBox.style.height = `${boxSize}px`
          const img = iconBox.querySelector('img') as HTMLImageElement | null
          if (img) { img.width = rmcSize; img.height = rmcSize }
        }

        if (textBox) {
          textBox.style.display = showText ? '' : 'none'
          const abbrEl = textBox.children[0] as HTMLElement | null
          const hqEl   = textBox.children[1] as HTMLElement | null
          if (abbrEl) abbrEl.style.fontSize = `${rmcAbbrFs}px`
          if (hqEl)   hqEl.style.fontSize   = `${rmcHqFs}px`
        }
      })

      // LID markers — same scale as RMC
      lidMarkersRef.current.forEach(marker => {
        const el      = marker.getElement()
        const iconBox = el.children[0] as HTMLElement | null
        const textBox = el.children[1] as HTMLElement | null

        el.style.gap = `${rmcGap}px`

        if (iconBox) {
          const boxSize = rmcSize + 6
          iconBox.style.width  = `${boxSize}px`
          iconBox.style.height = `${boxSize}px`
          const img = iconBox.querySelector('img') as HTMLImageElement | null
          if (img) { img.width = rmcSize; img.height = rmcSize }
        }

        if (textBox) {
          textBox.style.display = showText ? '' : 'none'
          const nameEl = textBox.children[0] as HTMLElement | null
          const locEl  = textBox.children[1] as HTMLElement | null
          if (nameEl) nameEl.style.fontSize = `${rmcAbbrFs}px`
          if (locEl)  locEl.style.fontSize  = `${rmcHqFs}px`
        }
      })
    }

    map.on('load', () => {
      // Dim all countries except Myanmar (ISO 'MM')
      map.addSource('country-mask', {
        type: 'vector',
        url: 'mapbox://mapbox.country-boundaries-v1',
      })
      map.addLayer({
        id:           'non-myanmar-dim',
        type:         'fill',
        source:       'country-mask',
        'source-layer': 'country_boundaries',
        filter:       ['!=', ['get', 'iso_3166_1'], 'MM'],
        paint: {
          'fill-color':   '#000000',
          'fill-opacity': 0.55,
        },
      })

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
      // LID markers
      LIGHT_INF_DIVS.forEach(lid => {
        const el     = buildLidMarkerEl(lid)
        const popup  = new mapboxgl.Popup({ offset: 10, maxWidth: '320px', closeButton: true })
          .setHTML(lidPopupHTML(lid))
        const marker = new mapboxgl.Marker({ element: el, anchor: 'left' })
          .setLngLat([lid.lng, lid.lat])
          .setPopup(popup)
          .addTo(map)

        el.addEventListener('click', () => marker.togglePopup())
        el.addEventListener('touchend', (e) => {
          e.preventDefault()
          e.stopPropagation()
          marker.togglePopup()
        })
        lidMarkersRef.current.set(lid.num, marker)
      })

      // RMC markers — rendered above base markers (z-index via style)
      REGIONAL_COMMANDS.forEach(rmc => {
        const el     = buildRmcMarkerEl(rmc)
        const popup  = new mapboxgl.Popup({ offset: 10, maxWidth: '320px', closeButton: true })
          .setHTML(rmcPopupHTML(rmc))
        const marker = new mapboxgl.Marker({ element: el, anchor: 'left' })
          .setLngLat([rmc.lng, rmc.lat])
          .setPopup(popup)
          .addTo(map)

        el.addEventListener('click', () => marker.togglePopup())
        el.addEventListener('touchend', (e) => {
          e.preventDefault()
          e.stopPropagation()
          marker.togglePopup()
        })
        rmcMarkersRef.current.set(rmc.id, marker)
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
      rmcMarkersRef.current.clear()
      lidMarkersRef.current.clear()
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

  // RMC visibility toggle
  useEffect(() => {
    if (!ready) return
    rmcMarkersRef.current.forEach((marker: mapboxgl.Marker) => {
      marker.getElement().style.display = showRmc ? '' : 'none'
    })
  }, [showRmc, ready])

  // LID visibility toggle
  useEffect(() => {
    if (!ready) return
    lidMarkersRef.current.forEach((marker: mapboxgl.Marker) => {
      marker.getElement().style.display = showLid ? '' : 'none'
    })
  }, [showLid, ready])

  // Glow toggle — apply/remove drop-shadow on all non-selected markers
  useEffect(() => {
    if (!ready) return
    markersRef.current.forEach((marker, id) => {
      if (id === selected) return
      const base  = BASES.find(b => b.id === id)!
      const color = STATUS_COLORS[base.status]
      const img   = marker.getElement().querySelector('img') as HTMLImageElement | null
      if (img) {
        img.style.filter = glowEnabled
          ? `drop-shadow(0 0 4px ${color}cc) drop-shadow(0 0 2px ${color}88) brightness(1.1)`
          : `brightness(1.0)`
      }
    })
  }, [glowEnabled, ready, selected])

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
          : glowEnabledRef.current
            ? `drop-shadow(0 0 4px ${color}cc) drop-shadow(0 0 2px ${color}88) brightness(1.1)`
            : `brightness(1.0)`
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
