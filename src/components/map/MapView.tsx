'use client'

import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import type { ProcessedEventDTO, GeoFeatureCollection } from '@/lib/types'
import { EVENT_TYPE_META } from '@/lib/types'
import { format } from 'date-fns'

interface Props {
  events:      ProcessedEventDTO[]
  showHeatmap: boolean
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

function popupHTML(p: ProcessedEventDTO): string {
  const meta    = EVENT_TYPE_META[p.type]
  const date    = format(new Date(p.date), 'dd MMM yyyy')
  const conf    = (p.confidence * 100).toFixed(0)
  const fatStr  = p.fatalities > 0 ? `<span style="color:#ef4444">${p.fatalities} fatalities</span>` : ''

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

export default function MapView({ events, showHeatmap }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef       = useRef<mapboxgl.Map | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!

    const map = new mapboxgl.Map({
      container:    containerRef.current,
      style:        'mapbox://styles/mapbox/dark-v11',
      center:       [96.0, 19.8],
      zoom:         5.6,
      minZoom:      4,
      maxZoom:      14,
      attributionControl: false,
    })

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right')
    map.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-right')

    map.on('load', () => {
      // ── Event source ────────────────────────────────
      map.addSource('events', { type: 'geojson', data: toGeoJSON([]) })

      // ── Heatmap layer ────────────────────────────────
      map.addLayer({
        id:     'risk-heatmap',
        type:   'heatmap',
        source: 'events',
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

      // ── Circle markers ────────────────────────────────
      map.addLayer({
        id:     'events-circles',
        type:   'circle',
        source: 'events',
        paint: {
          'circle-radius': [
            'interpolate', ['linear'], ['get', 'severity'],
            1, 5, 3, 8, 5, 13,
          ],
          'circle-color': [
            'match', ['get', 'type'],
            'ARMED_CONFLICT',            EVENT_TYPE_META.ARMED_CONFLICT.color,
            'POLITICAL_UNREST',          EVENT_TYPE_META.POLITICAL_UNREST.color,
            'INFRASTRUCTURE_DISRUPTION', EVENT_TYPE_META.INFRASTRUCTURE_DISRUPTION.color,
            'HUMANITARIAN_ALERT',        EVENT_TYPE_META.HUMANITARIAN_ALERT.color,
            '#6b7280',
          ],
          'circle-opacity':        0.88,
          'circle-stroke-width':   1.5,
          'circle-stroke-color':   'rgba(255,255,255,0.25)',
          'circle-stroke-opacity': 0.8,
        },
      })

      // ── Pulse layer for high-severity events ─────────
      map.addLayer({
        id:     'events-pulse',
        type:   'circle',
        source: 'events',
        filter: ['>=', ['get', 'severity'], 4],
        paint: {
          'circle-radius':  ['interpolate', ['linear'], ['get', 'severity'], 4, 18, 5, 26],
          'circle-color':   'rgba(239,68,68,0)',
          'circle-opacity': 0,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ef4444',
          'circle-stroke-opacity': [
            'interpolate', ['linear'], ['zoom'], 4, 0.6, 10, 0.3,
          ],
        },
      })

      // ── Popups ───────────────────────────────────────
      map.on('click', 'events-circles', e => {
        const feature = e.features?.[0]
        if (!feature) return
        const props = feature.properties as ProcessedEventDTO

        new mapboxgl.Popup({ maxWidth: '360px', closeButton: true, offset: 12 })
          .setLngLat(e.lngLat)
          .setHTML(popupHTML(props))
          .addTo(map)
      })

      map.on('mouseenter', 'events-circles', () => {
        map.getCanvas().style.cursor = 'pointer'
      })
      map.on('mouseleave', 'events-circles', () => {
        map.getCanvas().style.cursor = ''
      })
    })

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  // ── Update GeoJSON when events change ─────────────
  useEffect(() => {
    const map = mapRef.current
    if (!map?.isStyleLoaded()) return
    const src = map.getSource('events') as mapboxgl.GeoJSONSource | undefined
    src?.setData(toGeoJSON(events))
  }, [events])

  // ── Toggle heatmap visibility ──────────────────────
  useEffect(() => {
    const map = mapRef.current
    if (!map?.isStyleLoaded()) return
    const vis = showHeatmap ? 'visible' : 'none'
    if (map.getLayer('risk-heatmap')) {
      map.setLayoutProperty('risk-heatmap', 'visibility', vis)
    }
  }, [showHeatmap])

  return <div ref={containerRef} className="w-full h-full" />
}
