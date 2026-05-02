'use client'

import { useEffect, useRef, useCallback } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import type { Campaign, TownControlEvent, ActorId, MyanmarCity } from '@/lib/operations-types'
import { ACTORS } from '@/lib/operations-data'
import type { ConflictEventDTO } from '@/lib/types'

interface Props {
  currentDate: Date
  campaigns: Campaign[]
  controlEvents: TownControlEvent[]
  incidents: ConflictEventDTO[]
  actorFilter: Set<ActorId>
}

const IMPORTANCE_WIDTH: Record<string, number> = {
  CRITICAL: 5, HIGH: 3.5, MEDIUM: 2.5, LOW: 1.5,
}

const EVENT_TYPE_WEIGHT: Record<string, number> = {
  AIRSTRIKE: 3, ARTILLERY_SHELLING: 2.5, CLASH: 2,
  SIEGE_SEIZED: 3, DEFAULT: 1,
}

function townSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function getTownControlAt(
  townId: string,
  date: Date,
  events: TownControlEvent[],
): { actor: ActorId; contested: boolean } {
  const relevant = events
    .filter(e => e.townId === townId && new Date(e.date) <= date)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  if (!relevant.length) return { actor: 'MILITARY', contested: false }
  return { actor: relevant[0].actor, contested: relevant[0].contested ?? false }
}

// Popup HTML for a clicked town
function townPopupHTML(
  city: MyanmarCity,
  actor: ActorId,
  contested: boolean,
  recentIncidents: ConflictEventDTO[],
): string {
  const a = ACTORS[actor] ?? ACTORS.UNKNOWN
  const statusLabel = contested ? '⚡ CONTESTED' : `● ${a.shortName} CONTROL`
  const incidentRows = recentIncidents.slice(0, 4).map(e =>
    `<div style="font-size:0.7rem;color:#94a3b8;padding:2px 0;border-bottom:1px solid rgba(255,255,255,0.04)">
       <span style="color:#64748b">${String(e.date).slice(0,10)}</span>
       <span style="margin-left:6px">${e.eventType.replace(/_/g,' ')}</span>
       ${e.fatalities ? `<span style="color:#ef4444;margin-left:6px">${e.fatalities} KIA</span>` : ''}
     </div>`
  ).join('')
  return `
    <div style="padding:12px 14px;min-width:200px;font-family:'Courier New',monospace">
      <div style="font-size:0.85rem;font-weight:700;color:#e2e8f0;margin-bottom:4px">${city.name}</div>
      <div style="display:inline-block;padding:2px 8px;border-radius:4px;font-size:0.68rem;font-weight:700;
                  background:${a.color}20;color:${a.color};border:1px solid ${a.color}44;margin-bottom:8px">
        ${statusLabel}
      </div>
      ${recentIncidents.length > 0 ? `
        <div style="font-size:0.65rem;color:#475569;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px">
          Recent Incidents
        </div>
        ${incidentRows}` : ''}
    </div>`
}

// Popup HTML for a clicked campaign
function campaignPopupHTML(campaign: Campaign, fromCity: MyanmarCity, toCity: MyanmarCity): string {
  const a = ACTORS[campaign.actor] ?? ACTORS.UNKNOWN
  const statusIcon = campaign.status === 'completed' ? '✓' : campaign.status === 'ongoing' ? '▶' : '✕'
  return `
    <div style="padding:12px 14px;min-width:220px;font-family:'Courier New',monospace">
      <div style="font-size:0.75rem;font-weight:700;color:#e2e8f0;margin-bottom:6px">${campaign.name}</div>
      <div style="display:inline-block;padding:2px 8px;border-radius:4px;font-size:0.65rem;font-weight:700;
                  background:${a.color}20;color:${a.color};border:1px solid ${a.color}44;margin-bottom:8px">
        ${a.shortName}
      </div>
      <div style="font-size:0.7rem;color:#94a3b8;margin-bottom:4px">
        ${fromCity.name} → ${toCity.name}
      </div>
      <div style="font-size:0.7rem;color:#64748b">
        ${statusIcon} ${campaign.status.toUpperCase()}
        &nbsp;·&nbsp; ${campaign.startDate}${campaign.endDate ? ' → ' + campaign.endDate : ''}
      </div>
      ${campaign.casualties ? `<div style="font-size:0.7rem;color:#ef4444;margin-top:4px">${campaign.casualties} casualties</div>` : ''}
      ${campaign.description ? `<div style="font-size:0.68rem;color:#64748b;margin-top:6px;line-height:1.4">${campaign.description}</div>` : ''}
    </div>`
}

const EMPTY_FC: GeoJSON.FeatureCollection = { type: 'FeatureCollection', features: [] }

export default function OperationsMap({
  currentDate, campaigns, controlEvents, incidents, actorFilter,
}: Props) {
  const containerRef      = useRef<HTMLDivElement>(null)
  const mapRef            = useRef<mapboxgl.Map | null>(null)
  const townsRef          = useRef<MyanmarCity[]>([])
  const animFrameRef      = useRef<number>(0)
  const readyRef          = useRef(false)
  const townsLoadedRef    = useRef(false)
  const dashStepRef       = useRef(0)
  const pulseTimeRef      = useRef(0)

  // Keep latest props accessible in stable callbacks
  const currentDateRef  = useRef(currentDate)
  const campaignsRef    = useRef(campaigns)
  const controlEventsRef = useRef(controlEvents)
  const incidentsRef    = useRef(incidents)
  const actorFilterRef  = useRef(actorFilter)
  useEffect(() => { currentDateRef.current  = currentDate  }, [currentDate])
  useEffect(() => { campaignsRef.current    = campaigns    }, [campaigns])
  useEffect(() => { controlEventsRef.current = controlEvents }, [controlEvents])
  useEffect(() => { incidentsRef.current    = incidents    }, [incidents])
  useEffect(() => { actorFilterRef.current  = actorFilter  }, [actorFilter])

  const updateMap = useCallback(() => {
    const map = mapRef.current
    if (!map || !readyRef.current || !townsLoadedRef.current) return

    const date     = currentDateRef.current
    const towns    = townsRef.current
    const camps    = campaignsRef.current
    const ctrlEvts = controlEventsRef.current
    const evts     = incidentsRef.current
    const filter   = actorFilterRef.current

    // ── Town features ──────────────────────────────────────────────────
    const townFeatures: GeoJSON.Feature[] = towns.map(town => {
      const { actor, contested } = getTownControlAt(town.id, date, ctrlEvts)
      const a = ACTORS[actor] ?? ACTORS.UNKNOWN
      return {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [town.lng, town.lat] },
        properties: {
          id:        town.id,
          name:      town.name,
          actor,
          color:     filter.size === 0 || filter.has(actor) ? a.color : '#1e293b',
          contested: contested && (filter.size === 0 || filter.has(actor)),
          visible:   filter.size === 0 || filter.has(actor),
        },
      }
    })

    // ── Campaign features ──────────────────────────────────────────────
    const campaignFeatures: GeoJSON.Feature[] = []
    for (const c of camps) {
      if (new Date(c.startDate) > date) continue
      if (filter.size > 0 && !filter.has(c.actor)) continue

      const from = towns.find(t => t.id === c.fromTownId)
      const to   = towns.find(t => t.id === c.toTownId)
      if (!from || !to) continue

      const waypoints = (c.waypointTownIds ?? [])
        .map(wid => towns.find(t => t.id === wid))
        .filter(Boolean) as MyanmarCity[]

      const coords = [
        [from.lng, from.lat],
        ...waypoints.map(t => [t.lng, t.lat]),
        [to.lng, to.lat],
      ]

      const isCompleted = c.status === 'completed' || (!!c.endDate && new Date(c.endDate) <= date)
      const a = ACTORS[c.actor] ?? ACTORS.UNKNOWN

      campaignFeatures.push({
        type: 'Feature',
        geometry: { type: 'LineString', coordinates: coords },
        properties: {
          id:        c.id,
          name:      c.name,
          actor:     c.actor,
          color:     a.color,
          ongoing:   !isCompleted,
          width:     IMPORTANCE_WIDTH[c.strategicImportance] ?? 2,
          importance: c.strategicImportance,
          fromId:    c.fromTownId,
          toId:      c.toTownId,
        },
      })
    }

    // ── Incident features ──────────────────────────────────────────────
    const incidentFeatures: GeoJSON.Feature[] = evts
      .filter(e => {
        if (e.lat == null || e.lng == null) return false
        return new Date(e.date as string) <= date
      })
      .map(e => {
        const ageDays = (date.getTime() - new Date(e.date as string).getTime()) / 86400000
        const recency = Math.max(0, 1 - ageDays / 365) // fade over 1 year
        const wKey = e.eventType as string
        const weight = (EVENT_TYPE_WEIGHT[wKey] ?? 1) + Math.min(5, (e.fatalities ?? 0) / 5)
        return {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [e.lng!, e.lat!] },
          properties: {
            id:        e.id,
            type:      e.eventType,
            fatalities: e.fatalities ?? 0,
            date:      String(e.date).slice(0, 10),
            recency,
            weight:    weight * recency,
          },
        } as GeoJSON.Feature
      })

    // ── Push to map sources ────────────────────────────────────────────
    const tSrc = map.getSource('towns-source') as mapboxgl.GeoJSONSource | undefined
    const cSrc = map.getSource('campaigns-source') as mapboxgl.GeoJSONSource | undefined
    const iSrc = map.getSource('incidents-source') as mapboxgl.GeoJSONSource | undefined
    tSrc?.setData({ type: 'FeatureCollection', features: townFeatures })
    cSrc?.setData({ type: 'FeatureCollection', features: campaignFeatures })
    iSrc?.setData({ type: 'FeatureCollection', features: incidentFeatures })
  }, [])

  // Re-render whenever any input changes
  useEffect(() => {
    updateMap()
  }, [currentDate, campaigns, controlEvents, incidents, actorFilter, updateMap])

  // Map init — runs once
  useEffect(() => {
    if (!containerRef.current) return
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!

    const map = new mapboxgl.Map({
      container:          containerRef.current,
      style:              'mapbox://styles/mapbox/dark-v11',
      center:             [96.5, 19.5],
      zoom:               5.5,
      minZoom:            4,
      maxZoom:            18,
      attributionControl: false,
    })

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right')
    map.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-right')

    // ── Load cities ────────────────────────────────────────────────────
    fetch('/data/myanmar-cities.json')
      .then(r => r.json())
      .then((data: { features: Array<{ properties: { NAME: string }; geometry: { coordinates: [number, number] } }> }) => {
        townsRef.current = data.features.map(f => ({
          id:   townSlug(f.properties.NAME),
          name: f.properties.NAME,
          lng:  f.geometry.coordinates[0],
          lat:  f.geometry.coordinates[1],
        }))
        townsLoadedRef.current = true
        if (readyRef.current) updateMap()
      })
      .catch(console.error)

    // ── On map load: add sources + layers ─────────────────────────────
    map.on('load', () => {
      // Custom dark tint for tactical feel
      if (map.getLayer('land')) {
        map.setPaintProperty('land', 'background-color', '#0a0e14')
      }

      // Sources
      map.addSource('incidents-source',  { type: 'geojson', data: EMPTY_FC })
      map.addSource('campaigns-source',  { type: 'geojson', data: EMPTY_FC, lineMetrics: true })
      map.addSource('towns-source',      { type: 'geojson', data: EMPTY_FC })

      // ── 1. Incident heatmap ──────────────────────────────────────────
      map.addLayer({
        id:     'incidents-heat',
        type:   'heatmap',
        source: 'incidents-source',
        maxzoom: 10,
        paint:  {
          'heatmap-weight':     ['interpolate', ['linear'], ['get', 'weight'], 0, 0, 6, 1],
          'heatmap-intensity':  ['interpolate', ['linear'], ['zoom'], 4, 0.6, 9, 2],
          'heatmap-radius':     ['interpolate', ['linear'], ['zoom'], 4, 20, 9, 40],
          'heatmap-opacity':    ['interpolate', ['linear'], ['zoom'], 7, 0.5, 10, 0],
          'heatmap-color': [
            'interpolate', ['linear'], ['heatmap-density'],
            0,   'rgba(0,0,0,0)',
            0.15, 'rgba(220,38,38,0.08)',
            0.4,  'rgba(220,38,38,0.25)',
            0.7,  'rgba(239,68,68,0.50)',
            1,   'rgba(239,68,68,0.75)',
          ],
        },
      })

      // ── 2. Campaign glow (blurred thick line behind main line) ───────
      map.addLayer({
        id:     'campaigns-glow',
        type:   'line',
        source: 'campaigns-source',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint:  {
          'line-color':   ['get', 'color'],
          'line-width':   ['*', ['get', 'width'], 4],
          'line-opacity': 0.15,
          'line-blur':    6,
        },
      })

      // ── 3. Campaign main line ────────────────────────────────────────
      map.addLayer({
        id:     'campaigns-line',
        type:   'line',
        source: 'campaigns-source',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint:  {
          'line-color':   ['get', 'color'],
          'line-width':   ['get', 'width'],
          'line-opacity': 0.85,
        },
      })

      // ── 4. Ongoing campaign animated flow overlay ────────────────────
      map.addLayer({
        id:     'campaigns-animated',
        type:   'line',
        source: 'campaigns-source',
        filter: ['==', ['get', 'ongoing'], true],
        layout: { 'line-cap': 'butt', 'line-join': 'round' },
        paint:  {
          'line-color':      ['get', 'color'],
          'line-width':      ['get', 'width'],
          'line-opacity':    0.9,
          'line-dasharray':  [0, 4, 3],
        },
      })

      // ── 5. Campaign arrowhead (▶ at line center) ─────────────────────
      map.addLayer({
        id:     'campaigns-arrows',
        type:   'symbol',
        source: 'campaigns-source',
        layout: {
          'symbol-placement':        'line-center',
          'text-field':              '▶',
          'text-size':               14,
          'text-rotation-alignment': 'map',
          'text-allow-overlap':      true,
          'text-ignore-placement':   true,
        },
        paint: {
          'text-color':       ['get', 'color'],
          'text-halo-color':  'rgba(0,0,0,0.8)',
          'text-halo-width':  1.5,
          'text-opacity':     0.95,
        },
      })

      // ── 6. Incident glow ─────────────────────────────────────────────
      map.addLayer({
        id:     'incidents-glow',
        type:   'circle',
        source: 'incidents-source',
        minzoom: 6,
        paint:  {
          'circle-radius':  ['interpolate', ['linear'], ['zoom'], 6, 8, 12, 20],
          'circle-color':   '#ef4444',
          'circle-opacity': ['*', ['get', 'recency'], 0.12],
          'circle-blur':    1,
        },
      })

      // ── 7. Incident markers ──────────────────────────────────────────
      map.addLayer({
        id:     'incidents-circle',
        type:   'circle',
        source: 'incidents-source',
        minzoom: 6,
        paint:  {
          'circle-radius':       ['interpolate', ['linear'], ['zoom'], 6, 2.5, 12, 5],
          'circle-color':        '#ef4444',
          'circle-opacity':      ['*', ['get', 'recency'], 0.7],
          'circle-stroke-width': 0.5,
          'circle-stroke-color': '#fca5a5',
          'circle-stroke-opacity': ['*', ['get', 'recency'], 0.4],
        },
      })

      // ── 8. Contested town pulse glow ─────────────────────────────────
      map.addLayer({
        id:     'towns-pulse',
        type:   'circle',
        source: 'towns-source',
        filter: ['==', ['get', 'contested'], true],
        paint:  {
          'circle-radius':  18,
          'circle-color':   ['get', 'color'],
          'circle-opacity': 0.2,
          'circle-blur':    1,
        },
      })

      // ── 9. Town base circle ──────────────────────────────────────────
      map.addLayer({
        id:     'towns-circle',
        source: 'towns-source',
        type:   'circle',
        paint:  {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 4, 4, 8, 7, 12, 11],
          'circle-color':  ['get', 'color'],
          'circle-opacity': [
            'case',
            ['get', 'visible'],
            0.9,
            0.2,
          ],
          'circle-stroke-width': ['interpolate', ['linear'], ['zoom'], 4, 1, 8, 1.5],
          'circle-stroke-color': 'rgba(0,0,0,0.6)',
        },
      })

      // ── 10. Town label ───────────────────────────────────────────────
      map.addLayer({
        id:     'towns-label',
        type:   'symbol',
        source: 'towns-source',
        minzoom: 6,
        layout: {
          'text-field':             ['get', 'name'],
          'text-font':              ['DIN Offc Pro Bold', 'Arial Unicode MS Bold'],
          'text-size':              ['interpolate', ['linear'], ['zoom'], 6, 9, 10, 12],
          'text-offset':            [0, 1.4],
          'text-anchor':            'top',
          'text-allow-overlap':     false,
          'text-ignore-placement':  false,
        },
        paint: {
          'text-color':       ['get', 'color'],
          'text-halo-color':  'rgba(0,0,0,0.9)',
          'text-halo-width':  1.5,
          'text-opacity':     ['case', ['get', 'visible'], 0.9, 0.25],
        },
      })

      readyRef.current = true
      if (townsLoadedRef.current) updateMap()

      // ── Animation loop ───────────────────────────────────────────────
      const DASH_SEQ = [
        [0, 4, 3], [0.5, 4, 2.5], [1, 4, 2],
        [1.5, 4, 1.5], [2, 4, 1], [2.5, 4, 0.5],
        [3, 4, 0], [0, 0.5, 3, 3.5], [0, 1, 3, 3], [0, 2, 3, 2],
      ]
      let dashStep = 0
      let lastDashTime = 0

      function animate(time: number) {
        // Dash animation (80ms per step)
        if (time - lastDashTime > 80) {
          dashStep = (dashStep + 1) % DASH_SEQ.length
          try {
            map.setPaintProperty('campaigns-animated', 'line-dasharray', DASH_SEQ[dashStep])
          } catch { /* map may be gone */ }
          lastDashTime = time
        }

        // Pulse animation for contested towns
        pulseTimeRef.current = time
        const pulse = 0.15 + 0.12 * Math.sin(time / 700)
        const pRad  = 18  + 5   * Math.sin(time / 700)
        try {
          map.setPaintProperty('towns-pulse', 'circle-opacity', pulse)
          map.setPaintProperty('towns-pulse', 'circle-radius',  pRad)
        } catch { /* map may be gone */ }

        animFrameRef.current = requestAnimationFrame(animate)
      }
      animFrameRef.current = requestAnimationFrame(animate)
    })

    // ── Click: towns ──────────────────────────────────────────────────
    map.on('click', 'towns-circle', e => {
      const feature = e.features?.[0]
      if (!feature) return
      const props = feature.properties as {
        id: string; name: string; actor: ActorId; contested: boolean
      }
      const city = townsRef.current.find(t => t.id === props.id)
      if (!city) return

      const date = currentDateRef.current
      const recentIncidents = incidentsRef.current.filter(evt => {
        if (evt.lat == null || evt.lng == null) return false
        const dist = Math.hypot((evt.lng ?? 0) - city.lng, (evt.lat ?? 0) - city.lat)
        const ageDays = (date.getTime() - new Date(evt.date as string).getTime()) / 86400000
        return dist < 0.5 && ageDays < 90
      })

      new mapboxgl.Popup({ offset: 8, maxWidth: '280px', closeButton: true })
        .setLngLat(e.lngLat)
        .setHTML(townPopupHTML(city, props.actor, props.contested, recentIncidents))
        .addTo(map)
    })

    // ── Click: campaigns ──────────────────────────────────────────────
    map.on('click', 'campaigns-line', e => {
      const feature = e.features?.[0]
      if (!feature) return
      const props = feature.properties as { id: string }
      const campaign = campaignsRef.current.find(c => c.id === props.id)
      if (!campaign) return
      const towns = townsRef.current
      const fromCity = towns.find(t => t.id === campaign.fromTownId)
      const toCity   = towns.find(t => t.id === campaign.toTownId)
      if (!fromCity || !toCity) return

      new mapboxgl.Popup({ offset: 8, maxWidth: '280px', closeButton: true })
        .setLngLat(e.lngLat)
        .setHTML(campaignPopupHTML(campaign, fromCity, toCity))
        .addTo(map)
    })

    // Cursor changes
    map.on('mouseenter', 'towns-circle',   () => { map.getCanvas().style.cursor = 'pointer' })
    map.on('mouseleave', 'towns-circle',   () => { map.getCanvas().style.cursor = '' })
    map.on('mouseenter', 'campaigns-line', () => { map.getCanvas().style.cursor = 'pointer' })
    map.on('mouseleave', 'campaigns-line', () => { map.getCanvas().style.cursor = '' })

    mapRef.current = map

    return () => {
      readyRef.current = false
      cancelAnimationFrame(animFrameRef.current)
      map.remove()
      mapRef.current = null
    }
  }, [updateMap])

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  )
}
