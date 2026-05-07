'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import type React from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import MapboxDraw from '@mapbox/mapbox-gl-draw'
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'
import turfCircle from '@turf/circle'
import turfLength from '@turf/length'
import turfArea from '@turf/area'
import type { Campaign, TownControlEvent, ActorId, MyanmarCity } from '@/lib/operations-types'
import { ACTORS } from '@/lib/operations-data'
import type { ConflictEventDTO } from '@/lib/types'

interface Props {
  currentDate:      Date
  campaigns:        Campaign[]
  controlEvents:    TownControlEvent[]
  incidents:        ConflictEventDTO[]
  actorFilter:      Set<ActorId>
  operationOverlay: GeoJSON.FeatureCollection | null
  flyToTown:        string | null
  canvasRef?:       React.MutableRefObject<(() => HTMLCanvasElement | null) | null>
}

interface TownshipEntry {
  pcode: string
  name:  string
  state: string
  dist:  string
  lat:   number
  lng:   number
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

function townPopupHTML(
  city: MyanmarCity,
  actor: ActorId,
  contested: boolean,
  recentIncidents: ConflictEventDTO[],
  history: TownControlEvent[],
): string {
  const a = ACTORS[actor] ?? ACTORS.UNKNOWN
  const statusLabel = contested ? '⚡ CONTESTED' : `● ${a.shortName} CONTROL`
  const statusColor = contested ? '#ef4444' : a.color

  const historyRows = history.slice().reverse().slice(0, 4).map(ev => {
    const ea = ACTORS[ev.actor] ?? ACTORS.UNKNOWN
    return `<div style="display:flex;align-items:center;gap:6px;padding:2px 0;border-bottom:1px solid rgba(255,255,255,0.04)">
      <span style="width:6px;height:6px;border-radius:50%;background:${ea.color};flex-shrink:0"></span>
      <span style="font-size:0.65rem;color:#94a3b8;flex:1">${ea.shortName}${ev.contested ? ' ⚡' : ''}</span>
      <span style="font-size:0.62rem;color:#475569">${ev.date}</span>
    </div>`
  }).join('')

  const incidentRows = recentIncidents.slice(0, 3).map(e =>
    `<div style="font-size:0.65rem;color:#94a3b8;padding:2px 0;border-bottom:1px solid rgba(255,255,255,0.04)">
       <span style="color:#475569">${String(e.date).slice(0,10)}</span>
       <span style="margin-left:6px">${e.eventType.replace(/_/g,' ')}</span>
       ${e.fatalities ? `<span style="color:#ef4444;margin-left:6px">${e.fatalities} KIA</span>` : ''}
     </div>`
  ).join('')

  return `
    <div style="padding:10px 12px;min-width:210px;max-width:260px;font-family:'Courier New',monospace">
      <div style="font-size:0.85rem;font-weight:700;color:#e2e8f0;margin-bottom:4px">${city.name}</div>
      <div style="display:inline-block;padding:2px 8px;border-radius:4px;font-size:0.65rem;font-weight:700;
                  background:${statusColor}22;color:${statusColor};border:1px solid ${statusColor}44;margin-bottom:8px">
        ${statusLabel}
      </div>
      ${history.length > 0 ? `
        <div style="font-size:0.6rem;color:#334155;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:3px">Control History</div>
        ${historyRows}
        <div style="margin-top:6px"></div>` : ''}
      ${recentIncidents.length > 0 ? `
        <div style="font-size:0.6rem;color:#334155;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:3px">Recent Incidents</div>
        ${incidentRows}` : ''}
    </div>`
}

function townshipPopupHTML(
  ts: TownshipEntry,
  actor: ActorId,
  contested: boolean,
  incidentCount30d: number,
  incidentCount90d: number,
  history: TownControlEvent[],
  activeConflict = false,
): string {
  const a = ACTORS[actor] ?? ACTORS.UNKNOWN
  const statusLabel = contested
    ? '⚡ CONTESTED'
    : activeConflict
      ? `⚔ ACTIVE FIGHTING · ${a.shortName}`
      : `● ${a.shortName} CONTROL`
  const statusColor = contested ? '#ef4444' : activeConflict ? '#c2410c' : a.color

  const historyRows = history.slice().reverse().slice(0, 4).map(ev => {
    const ea = ACTORS[ev.actor] ?? ACTORS.UNKNOWN
    return `<div style="display:flex;align-items:center;gap:6px;padding:2px 0;border-bottom:1px solid rgba(255,255,255,0.04)">
      <span style="width:6px;height:6px;border-radius:50%;background:${ea.color};flex-shrink:0"></span>
      <span style="font-size:0.65rem;color:#94a3b8;flex:1">${ea.shortName}${ev.contested ? ' ⚡' : ''}</span>
      <span style="font-size:0.62rem;color:#475569">${ev.date}</span>
    </div>`
  }).join('')

  return `
    <div style="padding:10px 12px;min-width:215px;max-width:270px;font-family:'Courier New',monospace">
      <div style="font-size:0.62rem;color:#334155;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:2px">Township</div>
      <div style="font-size:0.88rem;font-weight:700;color:#e2e8f0;margin-bottom:1px">${ts.name}</div>
      <div style="font-size:0.65rem;color:#475569;margin-bottom:7px">${ts.dist} · ${ts.state}</div>
      <div style="display:inline-block;padding:2px 8px;border-radius:4px;font-size:0.65rem;font-weight:700;
                  background:${statusColor}22;color:${statusColor};border:1px solid ${statusColor}44;margin-bottom:8px">
        ${statusLabel}
      </div>
      ${history.length > 0 ? `
        <div style="font-size:0.6rem;color:#334155;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:3px">Control History</div>
        ${historyRows}
        <div style="margin-top:6px"></div>` : ''}
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:5px">
        <div style="background:rgba(255,255,255,0.04);border-radius:4px;padding:5px 7px;text-align:center">
          <div style="font-size:1rem;font-weight:700;color:${incidentCount30d > 5 ? '#ef4444' : incidentCount30d > 0 ? '#f59e0b' : '#334155'}">${incidentCount30d}</div>
          <div style="font-size:0.58rem;color:#334155;text-transform:uppercase;letter-spacing:0.05em">30-day</div>
        </div>
        <div style="background:rgba(255,255,255,0.04);border-radius:4px;padding:5px 7px;text-align:center">
          <div style="font-size:1rem;font-weight:700;color:#475569">${incidentCount90d}</div>
          <div style="font-size:0.58rem;color:#334155;text-transform:uppercase;letter-spacing:0.05em">90-day</div>
        </div>
      </div>
    </div>`
}

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

const MAP_STYLES = {
  dark:      'mapbox://styles/mapbox/dark-v11',
  light:     'mapbox://styles/mapbox/light-v11',
  satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
} as const
type MapStyleKey = keyof typeof MAP_STYLES

export default function OperationsMap({
  currentDate, campaigns, controlEvents, incidents, actorFilter, operationOverlay, flyToTown, canvasRef,
}: Props) {
  const [mapStyle, setMapStyle] = useState<MapStyleKey>('dark')
  const mapStyleRef   = useRef<MapStyleKey>('dark')
  const initLayersRef = useRef<(() => void) | null>(null)
  const isFirstStyle  = useRef(true)
  useEffect(() => { mapStyleRef.current = mapStyle }, [mapStyle])

  type DrawMode = 'none' | 'point' | 'line_string' | 'polygon' | 'circle' | 'pen'
  const [drawMode,    setDrawMode]    = useState<DrawMode>('none')
  const [measurement, setMeasurement] = useState<string | null>(null)
  const [drawOpen,    setDrawOpen]    = useState(false)
  const drawRef        = useRef<MapboxDraw | null>(null)
  const drawModeRef    = useRef<DrawMode>('none')
  const circleCenterRef  = useRef<[number, number] | null>(null)
  const circleActiveRef  = useRef(false)
  const penPointsRef     = useRef<[number, number][]>([])
  const penActiveRef     = useRef(false)
  useEffect(() => { drawModeRef.current = drawMode }, [drawMode])

  const updateMeasurement = useCallback(() => {
    const draw = drawRef.current
    if (!draw) return
    const sel = draw.getSelected()
    if (!sel.features.length) { setMeasurement(null); return }
    const f = sel.features[0]
    if (f.geometry.type === 'LineString') {
      const km = turfLength(f as GeoJSON.Feature<GeoJSON.LineString>, { units: 'kilometers' })
      setMeasurement(`Distance: ${km.toFixed(2)} km`)
    } else if (f.geometry.type === 'Polygon') {
      const sqkm = turfArea(f as GeoJSON.Feature<GeoJSON.Polygon>) / 1_000_000
      setMeasurement(`Area: ${sqkm.toFixed(2)} km²`)
    } else if (f.geometry.type === 'Point') {
      const [lng, lat] = (f.geometry as GeoJSON.Point).coordinates
      setMeasurement(`${lat.toFixed(4)}°N  ${lng.toFixed(4)}°E`)
    }
  }, [])

  const containerRef        = useRef<HTMLDivElement>(null)
  const mapRef              = useRef<mapboxgl.Map | null>(null)
  const townsRef            = useRef<MyanmarCity[]>([])
  const townshipIndexRef    = useRef<TownshipEntry[]>([])
  const townshipsGeoJSONRef = useRef<GeoJSON.FeatureCollection | null>(null)
  const animFrameRef        = useRef<number>(0)
  const readyRef            = useRef(false)
  const townsLoadedRef      = useRef(false)
  const townshipsLoadedRef  = useRef(false)
  const lastBattleComputeRef    = useRef<number>(0)
  const conflictTownshipsRef    = useRef<Set<string>>(new Set())

  // Keep latest props accessible in stable callbacks
  const currentDateRef       = useRef(currentDate)
  const campaignsRef         = useRef(campaigns)
  const controlEventsRef     = useRef(controlEvents)
  const incidentsRef         = useRef(incidents)
  const actorFilterRef       = useRef(actorFilter)
  const operationOverlayRef  = useRef(operationOverlay)
  useEffect(() => { currentDateRef.current      = currentDate      }, [currentDate])
  useEffect(() => { campaignsRef.current        = campaigns        }, [campaigns])
  useEffect(() => { controlEventsRef.current    = controlEvents    }, [controlEvents])
  useEffect(() => { incidentsRef.current        = incidents        }, [incidents])
  useEffect(() => { actorFilterRef.current      = actorFilter      }, [actorFilter])
  useEffect(() => { operationOverlayRef.current = operationOverlay }, [operationOverlay])

  // Fly to a town by id when requested from the operations panel
  useEffect(() => {
    if (!flyToTown || !readyRef.current) return
    const town = townsRef.current.find(t => t.id === flyToTown)
    if (!town) return
    mapRef.current?.flyTo({ center: [town.lng, town.lat], zoom: 11, duration: 1200, essential: true })
  }, [flyToTown])

  // Update op-overlay source whenever the overlay changes
  useEffect(() => {
    if (!readyRef.current) return
    const src = mapRef.current?.getSource('op-overlay') as mapboxgl.GeoJSONSource | undefined
    src?.setData(operationOverlay ?? EMPTY_FC)
  }, [operationOverlay])

  const updateMap = useCallback(() => {
    const map = mapRef.current
    if (!map || !readyRef.current || !townsLoadedRef.current) return

    const date     = currentDateRef.current
    const towns    = townsRef.current
    const camps    = campaignsRef.current
    const ctrlEvts = controlEventsRef.current
    const evts     = incidentsRef.current
    const filter   = actorFilterRef.current

    // ── Township fill colors via feature-state ─────────────────────────
    if (townshipsLoadedRef.current) {
      for (const ts of townshipIndexRef.current) {
        const townId = townSlug(ts.name)
        const { actor, contested } = getTownControlAt(townId, date, ctrlEvts)
        const a = ACTORS[actor] ?? ACTORS.UNKNOWN
        const visible = filter.size === 0 || filter.has(actor)
        const hasConflict = conflictTownshipsRef.current.has(ts.pcode)
        let fillColor: string
        if (!visible)        fillColor = '#1e293b'
        else if (contested)  fillColor = '#dc2626'         // formal contested control
        else if (hasConflict) fillColor = '#c2410c'        // active fighting, no capture yet
        else                 fillColor = a.color
        map.setFeatureState(
          { source: 'townships-source', id: ts.pcode },
          { color: fillColor, conflict: hasConflict },
        )
      }

      // ── Battle twinkling + active-conflict detection (throttled) ────────
      const now = Date.now()
      if (now - lastBattleComputeRef.current > 800) {
        lastBattleComputeRef.current = now
        const newConflictSet = new Set<string>()
        const battleFeatures: GeoJSON.Feature[] = []
        for (const ts of townshipIndexRef.current) {
          const hasBattle = evts.some(ev => {
            if (ev.lat == null || ev.lng == null) return false
            const ageDays = (date.getTime() - new Date(ev.date as string).getTime()) / 86400000
            if (ageDays > 30 || ageDays < 0) return false
            return Math.hypot(ev.lng - ts.lng, ev.lat - ts.lat) < 0.6
          })
          if (hasBattle) {
            newConflictSet.add(ts.pcode)
            const townId = townSlug(ts.name)
            const { actor } = getTownControlAt(townId, date, ctrlEvts)
            const a = ACTORS[actor] ?? ACTORS.UNKNOWN
            battleFeatures.push({
              type: 'Feature',
              geometry: { type: 'Point', coordinates: [ts.lng, ts.lat] },
              properties: { color: a.color, name: ts.name },
            })
          }
        }
        const bSrc = map.getSource('battle-source') as mapboxgl.GeoJSONSource | undefined
        bSrc?.setData({ type: 'FeatureCollection', features: battleFeatures })
        conflictTownshipsRef.current = newConflictSet
      }
    }

    // ── Town point features ────────────────────────────────────────────
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
        const recency = Math.max(0, 1 - ageDays / 365)
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

  useEffect(() => {
    updateMap()
  }, [currentDate, campaigns, controlEvents, incidents, actorFilter, updateMap])

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

    map.addControl(new mapboxgl.NavigationControl({ showCompass: true }), 'top-right')
    map.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-right')

    // ── Load cities ────────────────────────────────────────────────────
    fetch('/data/myanmar-cities.json')
      .then(r => r.json())
      .then((data: { features: Array<{ properties: Record<string, unknown>; geometry?: { coordinates: [number, number] } }> }) => {
        townsRef.current = data.features
          .map(f => {
            const p = f.properties
            const name = String(p.Town ?? p.NAME ?? '')
            if (!name) return null
            const lng = p.Longitude != null ? parseFloat(String(p.Longitude)) : (f.geometry?.coordinates[0] ?? 0)
            const lat = p.Latitude  != null ? parseFloat(String(p.Latitude))  : (f.geometry?.coordinates[1] ?? 0)
            if (!lng || !lat) return null
            return { id: townSlug(name), name, lng, lat }
          })
          .filter(Boolean) as MyanmarCity[]
        townsLoadedRef.current = true
        if (readyRef.current) updateMap()
      })
      .catch(console.error)

    // ── Load township index for feature-state ──────────────────────────
    fetch('/data/myanmar-townships.geojson')
      .then(r => r.json())
      .then((data: { features: Array<{ properties: Record<string, unknown>; geometry: GeoJSON.Geometry }> }) => {
        townshipIndexRef.current = data.features
          .map(f => {
            const p = f.properties
            const pcode = String(p.TS_PCODE ?? '')
            const name  = String(p.TS ?? '')
            if (!pcode || !name) return null
            // Compute rough centroid from polygon rings
            let sumLng = 0, sumLat = 0, count = 0
            const geom = f.geometry
            const rings: number[][][] = geom.type === 'Polygon'
              ? [geom.coordinates[0] as number[][]]
              : geom.type === 'MultiPolygon'
                ? (geom.coordinates as number[][][][]).map(p => p[0])
                : []
            for (const ring of rings) {
              for (const c of ring) { sumLng += c[0]; sumLat += c[1]; count++ }
            }
            const lng = count > 0 ? sumLng / count : 0
            const lat = count > 0 ? sumLat / count : 0
            return { pcode, name, state: String(p.ST ?? ''), dist: String(p.DT ?? ''), lng, lat }
          })
          .filter(Boolean) as TownshipEntry[]

        townshipsGeoJSONRef.current = data as GeoJSON.FeatureCollection

        // If map is already loaded, set source immediately; otherwise map.on('load') will do it
        const src = map.getSource('townships-source') as mapboxgl.GeoJSONSource | undefined
        if (src) {
          src.setData(data as GeoJSON.FeatureCollection)
          townshipsLoadedRef.current = true
          if (readyRef.current) updateMap()
        }
      })
      .catch(console.error)

    function initLayers() {
      if (mapStyleRef.current === 'dark' && map.getLayer('land')) {
        map.setPaintProperty('land', 'background-color', '#0a0e14')
      }

      // Sources
      map.addSource('townships-source', {
        type:      'geojson',
        data:      EMPTY_FC,
        promoteId: 'TS_PCODE',
      })
      map.addSource('battle-source',    { type: 'geojson', data: EMPTY_FC })
      map.addSource('incidents-source', { type: 'geojson', data: EMPTY_FC })
      map.addSource('campaigns-source', { type: 'geojson', data: EMPTY_FC, lineMetrics: true })
      map.addSource('towns-source',     { type: 'geojson', data: EMPTY_FC })
      map.addSource('op-overlay',       { type: 'geojson', data: operationOverlayRef.current ?? EMPTY_FC })

      // ── 0a. Township fill (actor-colored, semi-transparent) ──────────
      map.addLayer({
        id:     'townships-fill',
        type:   'fill',
        source: 'townships-source',
        paint:  {
          'fill-color':   ['coalesce', ['feature-state', 'color'], '#1e293b'],
          'fill-opacity': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            0.22,
            0.07,
          ],
        },
      })

      // ── 0b. Township borders ─────────────────────────────────────────
      map.addLayer({
        id:     'townships-border',
        type:   'line',
        source: 'townships-source',
        paint:  {
          'line-color':   ['coalesce', ['feature-state', 'color'], '#334155'],
          'line-width':   ['interpolate', ['linear'], ['zoom'], 4, 0.3, 8, 0.8, 12, 1.5],
          'line-opacity': 0.40,
        },
      })

      // ── 0c. Operation overlay — territory polygon ────────────────────
      map.addLayer({
        id:     'op-overlay-fill',
        type:   'fill',
        source: 'op-overlay',
        paint:  {
          'fill-color':   ['get', 'overlayColor'],
          'fill-opacity': 0.18,
        },
      })
      map.addLayer({
        id:     'op-overlay-line',
        type:   'line',
        source: 'op-overlay',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint:  {
          'line-color':     ['get', 'overlayColor'],
          'line-width':     2,
          'line-opacity':   0.75,
          'line-dasharray': [4, 2],
        },
      })

      // ── 0d. Battle township outer glow ──────────────────────────────
      map.addLayer({
        id:     'battle-glow',
        type:   'circle',
        source: 'battle-source',
        paint:  {
          'circle-radius':  ['interpolate', ['linear'], ['zoom'], 4, 11, 8, 19, 12, 28],
          'circle-color':   ['get', 'color'],
          'circle-opacity': 0.0,
          'circle-blur':    0.7,
        },
      })

      // ── 0d. Battle township inner pulse ─────────────────────────────
      map.addLayer({
        id:     'battle-pulse',
        type:   'circle',
        source: 'battle-source',
        paint:  {
          'circle-radius':         ['interpolate', ['linear'], ['zoom'], 4, 5, 8, 9, 12, 13],
          'circle-color':          ['get', 'color'],
          'circle-opacity':        0.0,
          'circle-stroke-width':   2,
          'circle-stroke-color':   ['get', 'color'],
          'circle-stroke-opacity': 0.0,
        },
      })

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
            0,    'rgba(0,0,0,0)',
            0.15, 'rgba(220,38,38,0.08)',
            0.4,  'rgba(220,38,38,0.25)',
            0.7,  'rgba(239,68,68,0.50)',
            1,    'rgba(239,68,68,0.75)',
          ],
        },
      })

      // ── 2. Campaign glow ─────────────────────────────────────────────
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

      // ── 4. Ongoing campaign animated flow ────────────────────────────
      map.addLayer({
        id:     'campaigns-animated',
        type:   'line',
        source: 'campaigns-source',
        filter: ['==', ['get', 'ongoing'], true],
        layout: { 'line-cap': 'butt', 'line-join': 'round' },
        paint:  {
          'line-color':     ['get', 'color'],
          'line-width':     ['get', 'width'],
          'line-opacity':   0.9,
          'line-dasharray': [0, 4, 3],
        },
      })

      // ── 5. Incident glow ─────────────────────────────────────────────
      map.addLayer({
        id:     'incidents-glow',
        type:   'circle',
        source: 'incidents-source',
        minzoom: 6,
        filter: ['>', ['get', 'recency'], 0.75],  // last ~90 days only
        paint:  {
          'circle-radius':  ['interpolate', ['linear'], ['zoom'], 6, 4, 12, 10],
          'circle-color':   '#ef4444',
          'circle-opacity': ['*', ['get', 'recency'], 0.12],
          'circle-blur':    1,
        },
      })

      // ── 6. Incident markers ──────────────────────────────────────────
      map.addLayer({
        id:     'incidents-circle',
        type:   'circle',
        source: 'incidents-source',
        minzoom: 6,
        filter: ['>', ['get', 'recency'], 0.75],  // last ~90 days only
        paint:  {
          'circle-radius':         ['interpolate', ['linear'], ['zoom'], 6, 1.5, 12, 3],
          'circle-color':          '#ef4444',
          'circle-opacity':        ['*', ['get', 'recency'], 0.8],
          'circle-stroke-width':   0.5,
          'circle-stroke-color':   '#fca5a5',
          'circle-stroke-opacity': ['*', ['get', 'recency'], 0.5],
        },
      })

      // ── 7. Contested town pulse glow ─────────────────────────────────
      map.addLayer({
        id:     'towns-pulse',
        type:   'circle',
        source: 'towns-source',
        filter: ['==', ['get', 'contested'], true],
        paint:  {
          'circle-radius':  9,
          'circle-color':   ['get', 'color'],
          'circle-opacity': 0.2,
          'circle-blur':    1,
        },
      })

      // ── 8. Town base circle ──────────────────────────────────────────
      map.addLayer({
        id:     'towns-circle',
        source: 'towns-source',
        type:   'circle',
        paint:  {
          'circle-radius':  ['interpolate', ['linear'], ['zoom'], 4, 2, 8, 3.5, 12, 5.5],
          'circle-color':   ['get', 'color'],
          'circle-opacity': ['case', ['get', 'visible'], 0.9, 0.2],
          'circle-stroke-width': ['interpolate', ['linear'], ['zoom'], 4, 1, 8, 1.5],
          'circle-stroke-color': 'rgba(0,0,0,0.6)',
        },
      })

      // ── 9. Town label ────────────────────────────────────────────────
      map.addLayer({
        id:     'towns-label',
        type:   'symbol',
        source: 'towns-source',
        minzoom: 6,
        layout: {
          'text-field':            ['get', 'name'],
          'text-font':             ['DIN Offc Pro Bold', 'Arial Unicode MS Bold'],
          'text-size':             ['interpolate', ['linear'], ['zoom'], 6, 9, 10, 12],
          'text-offset':           [0, 1.0],
          'text-anchor':           'top',
          'text-allow-overlap':    false,
          'text-ignore-placement': false,
        },
        paint: {
          'text-color':      ['get', 'color'],
          'text-halo-color': 'rgba(0,0,0,0.9)',
          'text-halo-width': 1.5,
          'text-opacity':    ['case', ['get', 'visible'], 0.9, 0.25],
        },
      })

      // ── Pen preview (draw tool) ──────────────────────────────────────
      map.addSource('pen-preview-source', { type: 'geojson', data: EMPTY_FC })
      map.addLayer({
        id: 'pen-preview-line', type: 'line', source: 'pen-preview-source',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': '#e879f9', 'line-width': 2.5, 'line-opacity': 0.9 },
      })
      map.addLayer({
        id: 'pen-preview-fill', type: 'fill', source: 'pen-preview-source',
        filter: ['==', '$type', 'Polygon'],
        paint: { 'fill-color': '#e879f9', 'fill-opacity': 0.10 },
      })

      // ── Circle preview (draw tool) ───────────────────────────────────
      map.addSource('circle-preview-source', { type: 'geojson', data: EMPTY_FC })
      map.addLayer({
        id: 'circle-preview-fill', type: 'fill', source: 'circle-preview-source',
        paint: { 'fill-color': '#06b6d4', 'fill-opacity': 0.15 },
      })
      map.addLayer({
        id: 'circle-preview-line', type: 'line', source: 'circle-preview-source',
        paint: { 'line-color': '#06b6d4', 'line-width': 1.5, 'line-dasharray': [3, 2] },
      })

      readyRef.current = true
      if (townsLoadedRef.current) updateMap()

      // If township GeoJSON already fetched before map loaded, set it now
      if (townshipsGeoJSONRef.current) {
        const tsSrc = map.getSource('townships-source') as mapboxgl.GeoJSONSource | undefined
        tsSrc?.setData(townshipsGeoJSONRef.current)
        townshipsLoadedRef.current = true
        updateMap()
      }

      // ── Animation loop ───────────────────────────────────────────────
      function animate(time: number) {
        // Contested town pulse
        const pulse = 0.15 + 0.12 * Math.sin(time / 700)
        const pRad  = 9   + 2.5 * Math.sin(time / 700)

        // Battle township twinkle (faster, sharper rhythm)
        const t         = time / 900
        const glowOp    = 0.08 + 0.10 * (0.5 + 0.5 * Math.sin(t))
        const innerOp   = 0.25 + 0.30 * (0.5 + 0.5 * Math.sin(t + 1))
        const strokeOp  = 0.55 + 0.35 * (0.5 + 0.5 * Math.sin(t + 0.5))

        try {
          map.setPaintProperty('towns-pulse',  'circle-opacity', pulse)
          map.setPaintProperty('towns-pulse',  'circle-radius',  pRad)
          map.setPaintProperty('battle-glow',  'circle-opacity', glowOp)
          map.setPaintProperty('battle-pulse', 'circle-opacity', innerOp)
          map.setPaintProperty('battle-pulse', 'circle-stroke-opacity', strokeOp)
        } catch { /* map removed */ }
        animFrameRef.current = requestAnimationFrame(animate)
      }
      animFrameRef.current = requestAnimationFrame(animate)
    }

    initLayersRef.current = initLayers
    map.on('load', initLayers)

    // ── Township hover ────────────────────────────────────────────────
    let hoveredPcode: string | null = null

    map.on('mousemove', 'townships-fill', e => {
      if (!e.features?.length) return
      if (hoveredPcode) {
        map.setFeatureState({ source: 'townships-source', id: hoveredPcode }, { hover: false })
      }
      hoveredPcode = e.features[0].id as string
      map.setFeatureState({ source: 'townships-source', id: hoveredPcode }, { hover: true })
      map.getCanvas().style.cursor = 'pointer'
    })

    map.on('mouseleave', 'townships-fill', () => {
      if (hoveredPcode) {
        map.setFeatureState({ source: 'townships-source', id: hoveredPcode }, { hover: false })
        hoveredPcode = null
      }
      map.getCanvas().style.cursor = ''
    })

    // ── Click: township ───────────────────────────────────────────────
    map.on('click', 'townships-fill', e => {
      // Don't fire if a town circle is also under the click
      const townHits = map.queryRenderedFeatures(e.point, { layers: ['towns-circle'] })
      if (townHits.length > 0) return

      const feature = e.features?.[0]
      if (!feature) return

      const props = feature.properties as { TS: string; ST: string; DT: string; TS_PCODE: string }
      const tsEntry = townshipIndexRef.current.find(t => t.pcode === props.TS_PCODE)
      const ts: TownshipEntry = tsEntry ?? { pcode: props.TS_PCODE, name: props.TS, state: props.ST, dist: props.DT, lat: 0, lng: 0 }

      const date = currentDateRef.current
      const { actor, contested } = getTownControlAt(townSlug(ts.name), date, controlEventsRef.current)

      // Count incidents roughly within the state/region
      const evts = incidentsRef.current
      const count30 = evts.filter(ev => {
        if (ev.lat == null || ev.lng == null) return false
        const ageDays = (date.getTime() - new Date(ev.date as string).getTime()) / 86400000
        return ageDays <= 30 && ev.region === ts.state
      }).length
      const count90 = evts.filter(ev => {
        if (ev.lat == null || ev.lng == null) return false
        const ageDays = (date.getTime() - new Date(ev.date as string).getTime()) / 86400000
        return ageDays <= 90 && ev.region === ts.state
      }).length

      new mapboxgl.Popup({ offset: 8, maxWidth: '300px', closeButton: true })
        .setLngLat(e.lngLat)
        .setHTML(townshipPopupHTML(ts, actor, contested, count30, count90,
          controlEventsRef.current
            .filter(ev => townSlug(ts.name) === ev.townId)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
          conflictTownshipsRef.current.has(ts.pcode),
        ))
        .addTo(map)
    })

    // ── Click: towns ──────────────────────────────────────────────────
    map.on('click', 'towns-circle', e => {
      const feature = e.features?.[0]
      if (!feature) return
      const props = feature.properties as { id: string; name: string; actor: ActorId; contested: boolean }
      const city = townsRef.current.find(t => t.id === props.id)
      if (!city) return

      const date = currentDateRef.current
      const recentIncidents = incidentsRef.current.filter(evt => {
        if (evt.lat == null || evt.lng == null) return false
        const dist    = Math.hypot((evt.lng ?? 0) - city.lng, (evt.lat ?? 0) - city.lat)
        const ageDays = (date.getTime() - new Date(evt.date as string).getTime()) / 86400000
        return dist < 0.5 && ageDays < 90
      })

      new mapboxgl.Popup({ offset: 8, maxWidth: '280px', closeButton: true })
        .setLngLat(e.lngLat)
        .setHTML(townPopupHTML(city, props.actor, props.contested, recentIncidents,
          controlEventsRef.current
            .filter(ev => ev.townId === city.id)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        ))
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

    // Cursor for town + campaign layers
    map.on('mouseenter', 'towns-circle',   () => { map.getCanvas().style.cursor = 'pointer' })
    map.on('mouseleave', 'towns-circle',   () => { map.getCanvas().style.cursor = '' })
    map.on('mouseenter', 'campaigns-line', () => { map.getCanvas().style.cursor = 'pointer' })
    map.on('mouseleave', 'campaigns-line', () => { map.getCanvas().style.cursor = '' })

    mapRef.current = map
    if (canvasRef) canvasRef.current = () => mapRef.current?.getCanvas() ?? null

    // ── MapboxDraw ──────────────────────────────────────────────────────
    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {},
      styles: [
        { id: 'gl-draw-polygon-fill',          type: 'fill',   filter: ['all', ['==', '$type', 'Polygon'],    ['!=', 'mode', 'static']], paint: { 'fill-color': '#f97316', 'fill-opacity': 0.15 } },
        { id: 'gl-draw-polygon-stroke',        type: 'line',   filter: ['all', ['==', '$type', 'Polygon'],    ['!=', 'mode', 'static']], layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': '#f97316', 'line-width': 2 } },
        { id: 'gl-draw-line',                  type: 'line',   filter: ['all', ['==', '$type', 'LineString'], ['!=', 'mode', 'static']], layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': '#22c55e', 'line-width': 2.5, 'line-dasharray': [0.5, 2] } },
        { id: 'gl-draw-point-outer',           type: 'circle', filter: ['all', ['==', '$type', 'Point'],      ['!=', 'mode', 'static']], paint: { 'circle-radius': 7, 'circle-color': '#f59e0b' } },
        { id: 'gl-draw-point-inner',           type: 'circle', filter: ['all', ['==', '$type', 'Point'],      ['!=', 'mode', 'static']], paint: { 'circle-radius': 4, 'circle-color': '#fff' } },
        { id: 'gl-draw-polygon-fill-static',   type: 'fill',   filter: ['all', ['==', '$type', 'Polygon'],    ['==', 'mode', 'static']], paint: { 'fill-color': '#f97316', 'fill-opacity': 0.10 } },
        { id: 'gl-draw-polygon-stroke-static', type: 'line',   filter: ['all', ['==', '$type', 'Polygon'],    ['==', 'mode', 'static']], paint: { 'line-color': '#f97316', 'line-width': 1.5 } },
        { id: 'gl-draw-line-static',           type: 'line',   filter: ['all', ['==', '$type', 'LineString'], ['==', 'mode', 'static']], paint: { 'line-color': '#22c55e', 'line-width': 2 } },
        { id: 'gl-draw-point-static',          type: 'circle', filter: ['all', ['==', '$type', 'Point'],      ['==', 'mode', 'static']], paint: { 'circle-radius': 5, 'circle-color': '#f59e0b' } },
        // vertex + midpoint handles
        { id: 'gl-draw-vertex-outer',  type: 'circle', filter: ['all', ['==', 'meta', 'vertex'],   ['==', '$type', 'Point']], paint: { 'circle-radius': 6, 'circle-color': '#fff', 'circle-stroke-width': 2, 'circle-stroke-color': '#f97316' } },
        { id: 'gl-draw-midpoint',      type: 'circle', filter: ['all', ['==', 'meta', 'midpoint'], ['==', '$type', 'Point']], paint: { 'circle-radius': 3, 'circle-color': '#f97316' } },
      ],
    })
    map.addControl(draw)
    drawRef.current = draw

    // Draw events → measurements
    const onDrawEvent = () => updateMeasurement()
    map.on('draw.create',          onDrawEvent)
    map.on('draw.update',          onDrawEvent)
    map.on('draw.selectionchange', onDrawEvent)
    map.on('draw.delete',          () => setMeasurement(null))

    // Circle mode: click-drag to set center + radius
    let circleMouseDown = false
    map.on('mousedown', (e: mapboxgl.MapMouseEvent) => {
      if (drawModeRef.current !== 'circle') return
      e.preventDefault()
      circleCenterRef.current = [e.lngLat.lng, e.lngLat.lat]
      circleMouseDown = true
      circleActiveRef.current = true
      map.dragPan.disable()
    })
    map.on('mousemove', (e: mapboxgl.MapMouseEvent) => {
      if (!circleMouseDown || !circleCenterRef.current) return
      const [cx, cy] = circleCenterRef.current
      const radiusKm = Math.max(0.1, Math.sqrt(
        Math.pow((e.lngLat.lng - cx) * Math.cos(cy * Math.PI / 180) * 111.32, 2) +
        Math.pow((e.lngLat.lat - cy) * 110.574, 2)
      ))
      const preview = turfCircle([cx, cy], radiusKm, { steps: 64, units: 'kilometers' })
      const src = map.getSource('circle-preview-source') as mapboxgl.GeoJSONSource | undefined
      src?.setData(preview)
      setMeasurement(`Radius: ${radiusKm.toFixed(1)} km  ·  Area: ${(Math.PI * radiusKm * radiusKm).toFixed(1)} km²`)
    })
    map.on('mouseup', (e: mapboxgl.MapMouseEvent) => {
      if (!circleMouseDown || !circleCenterRef.current) return
      const [cx, cy] = circleCenterRef.current
      const radiusKm = Math.max(0.1, Math.sqrt(
        Math.pow((e.lngLat.lng - cx) * Math.cos(cy * Math.PI / 180) * 111.32, 2) +
        Math.pow((e.lngLat.lat - cy) * 110.574, 2)
      ))
      const circle = turfCircle([cx, cy], radiusKm, { steps: 64, units: 'kilometers' })
      draw.add(circle)
      const src = map.getSource('circle-preview-source') as mapboxgl.GeoJSONSource | undefined
      src?.setData(EMPTY_FC)
      circleMouseDown = false
      circleActiveRef.current = false
      circleCenterRef.current = null
      map.dragPan.enable()
    })

    // Pen freehand drawing
    map.on('mousedown', (e: mapboxgl.MapMouseEvent) => {
      if (drawModeRef.current !== 'pen') return
      e.preventDefault()
      penPointsRef.current = [[e.lngLat.lng, e.lngLat.lat]]
      penActiveRef.current = true
      map.dragPan.disable()
    })
    map.on('mousemove', (e: mapboxgl.MapMouseEvent) => {
      if (!penActiveRef.current) return
      penPointsRef.current.push([e.lngLat.lng, e.lngLat.lat])
      const pts = penPointsRef.current
      const penSrc = map.getSource('pen-preview-source') as mapboxgl.GeoJSONSource | undefined
      if (pts.length >= 2) {
        penSrc?.setData({ type: 'Feature', geometry: { type: 'LineString', coordinates: pts }, properties: {} })
      }
    })
    map.on('mouseup', () => {
      if (!penActiveRef.current) return
      penActiveRef.current = false
      map.dragPan.enable()
      const pts = penPointsRef.current
      const penSrc = map.getSource('pen-preview-source') as mapboxgl.GeoJSONSource | undefined
      penSrc?.setData(EMPTY_FC)
      penPointsRef.current = []
      if (pts.length < 3) return
      // Close and add as polygon if the path is long enough, else as linestring
      const closed = [...pts, pts[0]]
      draw.add({
        type: 'Feature',
        geometry: { type: 'Polygon', coordinates: [closed] },
        properties: {},
      })
      const areaSqkm = turfArea({ type: 'Feature', geometry: { type: 'Polygon', coordinates: [closed] }, properties: {} }) / 1_000_000
      setMeasurement(`Freehand area: ${areaSqkm.toFixed(2)} km²`)
    })

    return () => {
      readyRef.current = false
      cancelAnimationFrame(animFrameRef.current)
      map.remove()
      mapRef.current = null
      if (canvasRef) canvasRef.current = null
    }
  }, [updateMap])

  useEffect(() => {
    if (isFirstStyle.current) { isFirstStyle.current = false; return }
    const map = mapRef.current
    if (!map) return
    readyRef.current = false
    cancelAnimationFrame(animFrameRef.current)
    map.setStyle(MAP_STYLES[mapStyle])
    map.once('style.load', () => { initLayersRef.current?.() })
  }, [mapStyle])

  useEffect(() => {
    const draw = drawRef.current
    const map  = mapRef.current
    if (!draw || !map) return
    map.getCanvas().style.cursor = drawMode === 'none' ? '' : 'crosshair'
    if (drawMode === 'none' || drawMode === 'circle' || drawMode === 'pen') {
      draw.changeMode('simple_select')
    } else {
      draw.changeMode(`draw_${drawMode}` as Parameters<typeof draw.changeMode>[0])
    }
  }, [drawMode])

  const deleteAllDrawings = useCallback(() => {
    drawRef.current?.deleteAll()
    const src = mapRef.current?.getSource('circle-preview-source') as mapboxgl.GeoJSONSource | undefined
    src?.setData(EMPTY_FC)
    setMeasurement(null)
    setDrawMode('none')
  }, [])

  const DRAW_TOOLS: { mode: DrawMode | 'trash'; icon: string; label: string }[] = [
    { mode: 'none',        icon: '↖',  label: 'Select'       },
    { mode: 'point',       icon: '⊙',  label: 'Point'        },
    { mode: 'line_string', icon: '╱',  label: 'Line'         },
    { mode: 'polygon',     icon: '⬡',  label: 'Polygon'      },
    { mode: 'circle',      icon: '◯',  label: 'Circle'       },
    { mode: 'pen',         icon: '✍',  label: 'Freehand pen' },
    { mode: 'trash',       icon: '✕',  label: 'Clear all'    },
  ]

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />

      {/* ── Draw toolbar (left side) ─────────────────────────────────── */}
      <div className="absolute left-3 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-0.5">
        {/* Toggle button */}
        <button
          onClick={() => setDrawOpen(v => !v)}
          title="Drawing tools"
          className={`w-8 h-8 flex items-center justify-center rounded border text-[11px] transition-colors mb-1 ${
            drawOpen
              ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
              : 'bg-black/70 border-white/[0.10] text-slate-400 hover:text-slate-200 backdrop-blur'
          }`}
        >
          ✏
        </button>

        {drawOpen && (
          <>
            {DRAW_TOOLS.map(({ mode, icon, label }) => (
              <button
                key={mode}
                onClick={() => mode === 'trash' ? deleteAllDrawings() : setDrawMode(mode as DrawMode)}
                title={label}
                className={`w-8 h-8 flex items-center justify-center rounded border text-[13px] transition-colors ${
                  mode !== 'trash' && drawMode === (mode as DrawMode)
                    ? 'bg-cyan-500/25 border-cyan-400/60 text-cyan-300'
                    : mode === 'trash'
                      ? 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
                      : 'bg-black/70 border-white/[0.08] text-slate-400 hover:text-slate-200 backdrop-blur'
                }`}
              >
                {icon}
              </button>
            ))}
          </>
        )}
      </div>

      {/* ── Measurement readout ──────────────────────────────────────── */}
      {measurement && (
        <div className="absolute left-14 bottom-14 z-20 px-2.5 py-1.5 bg-black/80 backdrop-blur border border-cyan-500/30 rounded text-[10px] font-mono text-cyan-300 pointer-events-none">
          {measurement}
        </div>
      )}

      {/* ── Style toggle (bottom-right) ──────────────────────────────── */}
      <div className="absolute bottom-8 right-2 z-10 flex flex-col gap-1">
        {(['dark', 'light', 'satellite'] as const).map(s => (
          <button
            key={s}
            onClick={() => setMapStyle(s)}
            className={`px-2 py-1 text-[9px] font-mono rounded border transition-colors ${
              mapStyle === s
                ? 'bg-white/15 border-white/30 text-white'
                : 'bg-black/70 border-white/[0.08] text-slate-500 hover:text-slate-300 backdrop-blur'
            }`}
          >
            {s === 'dark' ? '🌑 Dark' : s === 'light' ? '☀ Light' : '🛰 Sat'}
          </button>
        ))}
      </div>
    </div>
  )
}
