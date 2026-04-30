'use client'

import { useEffect, useRef, useCallback } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import type { ProcessedEventDTO, ConflictEventDTO, GeoFeatureCollection } from '@/lib/types'
import { EVENT_TYPE_META, CONFLICT_EVENT_META } from '@/lib/types'

type AnyFeatureCollection = {
  type: 'FeatureCollection'
  features: Array<{ type: 'Feature'; geometry: { type: 'Point'; coordinates: [number, number] }; properties: Record<string, unknown> }>
}
import { format } from 'date-fns'

interface Props {
  events:          ProcessedEventDTO[]
  conflictEvents:  ConflictEventDTO[]
  showHeatmap:     boolean
  showConflict:    boolean
}

function toGeoJSON(events: ProcessedEventDTO[]): GeoFeatureCollection {
  return {
    type: 'FeatureCollection',
    features: events
      .filter(e => e.latitude !== null && e.longitude !== null)
      .map(e => ({
        type:     'Feature',
        geometry: { type: 'Point', coordinates: [e.longitude!, e.latitude!] },
        properties: e,
      })),
  }
}

function conflictToGeoJSON(events: ConflictEventDTO[]): AnyFeatureCollection {
  return {
    type: 'FeatureCollection',
    features: events
      .filter(e => e.lat !== null && e.lng !== null)
      .map(e => ({
        type:     'Feature',
        geometry: { type: 'Point', coordinates: [e.lng!, e.lat!] },
        properties: {
          ...e,
          // Stringify arrays for Mapbox GL property access
          actorsStr: e.actors.join(', '),
        },
      })),
  }
}

function popupHTML(p: ProcessedEventDTO): string {
  const meta   = EVENT_TYPE_META[p.type]
  const date   = format(new Date(p.date), 'dd MMM yyyy')
  const conf   = (p.confidence * 100).toFixed(0)
  const fatStr = p.fatalities > 0
    ? `<span style="color:#ef4444">${p.fatalities} fatalities</span>` : ''

  return `
    <div style="padding:14px 16px;font-size:0.8rem;line-height:1.5;max-width:300px">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
        <span style="font-size:1rem">${meta.icon}</span>
        <div>
          <div style="font-weight:700;color:#e2e8f0;font-size:0.85rem">${p.region}</div>
          <div style="color:#64748b;font-size:0.72rem;font-family:monospace">${date} · ${p.adminArea ?? ''}</div>
        </div>
      </div>
      <div style="background:rgba(255,255,255,0.04);border-radius:5px;padding:8px 10px;margin-bottom:10px;color:#cbd5e1;font-size:0.78rem">
        ${p.summary}
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px">
        <span style="background:${meta.color}22;color:${meta.color};border:1px solid ${meta.color}44;border-radius:4px;padding:2px 7px;font-size:0.68rem;font-weight:600">
          ${meta.label}
        </span>
        <span style="background:rgba(255,255,255,0.06);color:#94a3b8;border-radius:4px;padding:2px 7px;font-size:0.68rem">
          SEV ${p.severity}/5
        </span>
        <span style="background:rgba(255,255,255,0.06);color:#94a3b8;border-radius:4px;padding:2px 7px;font-size:0.68rem">
          CONF ${conf}%
        </span>
        ${fatStr ? `<span style="background:rgba(239,68,68,0.1);border-radius:4px;padding:2px 7px;font-size:0.68rem">${fatStr}</span>` : ''}
      </div>
      <div style="color:#475569;font-size:0.68rem;font-family:monospace">
        Source: ${p.source}
        ${p.sourceUrl ? `· <a href="${p.sourceUrl}" target="_blank" rel="noopener" style="color:#3b9fd8">link</a>` : ''}
      </div>
    </div>`
}

function conflictPopupHTML(p: ConflictEventDTO): string {
  const meta   = CONFLICT_EVENT_META[p.eventType]
  const date   = format(new Date(p.date), 'dd MMM yyyy')
  const conf   = (p.confidence * 100).toFixed(0)
  const fatStr = p.fatalities > 0
    ? `${p.fatalitiesMin === p.fatalitiesMax ? p.fatalities : `${p.fatalitiesMin}–${p.fatalitiesMax}`} KIA`
    : ''
  const actors = (p.actors ?? []).join(', ')

  return `
    <div style="padding:14px 16px;font-size:0.8rem;line-height:1.5;max-width:320px">
      <div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:10px">
        <span style="
          background:${meta.color}22;color:${meta.color};border:1px solid ${meta.color}55;
          border-radius:4px;padding:2px 6px;font-size:0.65rem;font-weight:700;
          font-family:monospace;white-space:nowrap;margin-top:2px
        ">${meta.label.toUpperCase()}</span>
        <div>
          <div style="font-weight:700;color:#e2e8f0;font-size:0.85rem">${p.region}</div>
          <div style="color:#64748b;font-size:0.72rem;font-family:monospace">
            ${date}${p.adminArea ? ' · ' + p.adminArea : ''}
          </div>
        </div>
      </div>
      <div style="background:rgba(255,255,255,0.04);border-radius:5px;padding:8px 10px;margin-bottom:10px;color:#cbd5e1;font-size:0.78rem">
        ${p.summary}
      </div>
      ${actors ? `
      <div style="margin-bottom:8px">
        <span style="color:#64748b;font-size:0.65rem;font-family:monospace;text-transform:uppercase;letter-spacing:0.05em">Actors</span>
        <div style="color:#94a3b8;font-size:0.72rem;margin-top:2px">${actors}</div>
      </div>` : ''}
      <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px">
        ${fatStr ? `<span style="background:rgba(239,68,68,0.12);color:#f87171;border-radius:4px;padding:2px 7px;font-size:0.68rem;font-weight:600">${fatStr}</span>` : ''}
        <span style="background:rgba(255,255,255,0.06);color:#94a3b8;border-radius:4px;padding:2px 7px;font-size:0.68rem">
          CONF ${conf}%
        </span>
        <span style="background:rgba(255,255,255,0.06);color:#64748b;border-radius:4px;padding:2px 7px;font-size:0.68rem">
          ${p.sourceName}
        </span>
      </div>
      <div style="color:#475569;font-size:0.68rem;font-family:monospace">
        ${p.sourceUrl ? `<a href="${p.sourceUrl}" target="_blank" rel="noopener" style="color:#3b9fd8">View source →</a>` : ''}
      </div>
    </div>`
}

// Mapbox match expression colors for all ConflictEventType values
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CONFLICT_COLOR_EXPR = [
  'match', ['get', 'eventType'],
  'CLASH',                 '#ef4444',
  'AIRSTRIKE',             '#f97316',
  'ARTILLERY_SHELLING',    '#fb923c',
  'AMBUSH',                '#dc2626',
  'SIEGE_SEIZED',          '#7c3aed',
  'RECAPTURED',            '#10b981',
  'WITHDRAWAL',            '#6b7280',
  'CEASEFIRE',             '#22c55e',
  'ARMED_MOBILIZATION',    '#3b82f6',
  'CIVILIAN_HARM',         '#b91c1c',
  'DISPLACEMENT',          '#f59e0b',
  'HUMANITARIAN_CRISIS',   '#06b6d4',
  'POLITICAL_DEVELOPMENT', '#8b5cf6',
  '#94a3b8',
// eslint-disable-next-line @typescript-eslint/no-explicit-any
] as any

export default function MapView({ events, conflictEvents, showHeatmap, showConflict }: Props) {
  const containerRef        = useRef<HTMLDivElement>(null)
  const mapRef              = useRef<mapboxgl.Map | null>(null)
  const conflictEventsRef   = useRef<ConflictEventDTO[]>(conflictEvents)

  // Keep ref current so the load callback can read the latest data
  useEffect(() => { conflictEventsRef.current = conflictEvents }, [conflictEvents])

  useEffect(() => {
    if (!containerRef.current) return

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!

    const map = new mapboxgl.Map({
      container:          containerRef.current,
      style:              'mapbox://styles/mapbox/satellite-streets-v12',
      center:             [96.0, 19.8],
      zoom:               5.6,
      minZoom:            4,
      maxZoom:            14,
      attributionControl: false,
    })

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right')
    map.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-right')

    map.on('load', () => {

      // ── ProcessedEvent source & layers ────────────────
      map.addSource('events', { type: 'geojson', data: toGeoJSON([]) })

      map.addLayer({
        id: 'risk-heatmap', type: 'heatmap', source: 'events',
        paint: {
          'heatmap-weight':    ['interpolate', ['linear'], ['get', 'severity'], 1, 0.2, 5, 1.0],
          'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 0.8, 9, 2.5],
          'heatmap-radius':    ['interpolate', ['linear'], ['zoom'], 0, 18, 9, 45],
          'heatmap-color': [
            'interpolate', ['linear'], ['heatmap-density'],
            0,   'rgba(0,0,0,0)',
            0.15,'rgba(29,111,168,0.4)',
            0.40,'rgba(245,158,11,0.55)',
            0.65,'rgba(249,115,22,0.65)',
            0.85,'rgba(239,68,68,0.75)',
            1.0, 'rgba(255,30,30,0.9)',
          ],
          'heatmap-opacity': 0.75,
        },
        layout: { visibility: 'none' },
      })

      map.addLayer({
        id: 'events-circles', type: 'circle', source: 'events',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['get', 'severity'], 1, 5, 3, 8, 5, 13],
          'circle-color': [
            'match', ['get', 'type'],
            'ARMED_CONFLICT',            EVENT_TYPE_META.ARMED_CONFLICT.color,
            'POLITICAL_UNREST',          EVENT_TYPE_META.POLITICAL_UNREST.color,
            'INFRASTRUCTURE_DISRUPTION', EVENT_TYPE_META.INFRASTRUCTURE_DISRUPTION.color,
            'HUMANITARIAN_ALERT',        EVENT_TYPE_META.HUMANITARIAN_ALERT.color,
            '#6b7280',
          ],
          'circle-opacity':        0.92,
          'circle-stroke-width':   2,
          'circle-stroke-color':   'rgba(255,255,255,0.7)',
          'circle-stroke-opacity': 1,
        },
      })

      map.addLayer({
        id: 'events-pulse', type: 'circle', source: 'events',
        filter: ['>=', ['get', 'severity'], 4],
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['get', 'severity'], 4, 18, 5, 26],
          'circle-color':  'rgba(239,68,68,0)',
          'circle-opacity': 0,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ef4444',
          'circle-stroke-opacity': ['interpolate', ['linear'], ['zoom'], 4, 0.6, 10, 0.3],
        },
      })

      // ── ConflictEvent source & layers ─────────────────
      // Seed with whatever data arrived before map load (avoids the race condition
      // where fetch resolves before the 'load' event fires)
      map.addSource('conflict-events', { type: 'geojson', data: conflictToGeoJSON(conflictEventsRef.current) })

      // Outer glow ring for lethal events
      map.addLayer({
        id: 'conflict-pulse', type: 'circle', source: 'conflict-events',
        filter: ['>', ['get', 'fatalities'], 0],
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['get', 'fatalities'], 1, 12, 20, 28],
          'circle-color':   'rgba(0,0,0,0)',
          'circle-opacity':  0,
          'circle-stroke-width':   2,
          'circle-stroke-color':   CONFLICT_COLOR_EXPR,
          'circle-stroke-opacity': 0.45,
        },
        layout: { visibility: 'visible' },
      })

      // Main filled circle — diamond shape via small radius + thick stroke
      map.addLayer({
        id: 'conflict-circles', type: 'circle', source: 'conflict-events',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['get', 'fatalities'], 0, 5, 50, 11],
          'circle-color':  CONFLICT_COLOR_EXPR,
          'circle-opacity': 0.88,
          'circle-stroke-width':   1.5,
          'circle-stroke-color':   'rgba(0,0,0,0.6)',
          'circle-stroke-opacity': 1,
        },
        layout: { visibility: 'visible' },
      })

      // ── ProcessedEvent popups ─────────────────────────
      map.on('click', 'events-circles', e => {
        const feature = e.features?.[0]
        if (!feature) return
        new mapboxgl.Popup({ maxWidth: '360px', closeButton: true, offset: 12 })
          .setLngLat(e.lngLat)
          .setHTML(popupHTML(feature.properties as ProcessedEventDTO))
          .addTo(map)
      })
      map.on('mouseenter', 'events-circles', () => { map.getCanvas().style.cursor = 'pointer' })
      map.on('mouseleave', 'events-circles', () => { map.getCanvas().style.cursor = '' })

      // ── ConflictEvent popups ──────────────────────────
      map.on('click', 'conflict-circles', e => {
        const feature = e.features?.[0]
        if (!feature) return
        const p = feature.properties as ConflictEventDTO
        new mapboxgl.Popup({ maxWidth: '380px', closeButton: true, offset: 12 })
          .setLngLat(e.lngLat)
          .setHTML(conflictPopupHTML(p))
          .addTo(map)
      })
      map.on('mouseenter', 'conflict-circles', () => { map.getCanvas().style.cursor = 'crosshair' })
      map.on('mouseleave', 'conflict-circles', () => { map.getCanvas().style.cursor = '' })
    })

    mapRef.current = map
    return () => { map.remove(); mapRef.current = null }
  }, [])

  // ── Update ProcessedEvent GeoJSON ─────────────────────
  useEffect(() => {
    const map = mapRef.current
    if (!map?.isStyleLoaded()) return
    const src = map.getSource('events') as mapboxgl.GeoJSONSource | undefined
    src?.setData(toGeoJSON(events))
  }, [events])

  // ── Update ConflictEvent GeoJSON ──────────────────────
  useEffect(() => {
    const map = mapRef.current
    if (!map?.isStyleLoaded()) return
    const src = map.getSource('conflict-events') as mapboxgl.GeoJSONSource | undefined
    src?.setData(conflictToGeoJSON(conflictEvents))
  }, [conflictEvents])

  // ── Toggle heatmap ────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current
    if (!map?.isStyleLoaded()) return
    const vis = showHeatmap ? 'visible' : 'none'
    if (map.getLayer('risk-heatmap')) map.setLayoutProperty('risk-heatmap', 'visibility', vis)
  }, [showHeatmap])

  // ── Toggle conflict-events layer ──────────────────────
  useEffect(() => {
    const map = mapRef.current
    if (!map?.isStyleLoaded()) return
    const vis = showConflict ? 'visible' : 'none'
    if (map.getLayer('conflict-circles')) map.setLayoutProperty('conflict-circles', 'visibility', vis)
    if (map.getLayer('conflict-pulse'))   map.setLayoutProperty('conflict-pulse',   'visibility', vis)
  }, [showConflict])

  return <div ref={containerRef} className="w-full h-full" />
}
