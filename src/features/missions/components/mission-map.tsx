import { useEffect, useRef, useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SpinnerGap } from '@phosphor-icons/react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import type { Mission } from '../types'
import {
  getStatutAffichage,
  statutAffichageMarkerColors,
  statutAffichageLabels,
  statutRdvLabels,
  sensLabels,
} from '../types'
import { formatDate, formatTime } from 'src/lib/formatters'
import { MapStyleSwitcher, MAP_STYLES, type MapStyleId } from 'src/components/shared/map-style-switcher'

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || ''

const SOURCE_ID = 'missions'
const CLUSTER_LAYER = 'mission-clusters'
const CLUSTER_COUNT_LAYER = 'mission-cluster-count'
const UNCLUSTERED_LAYER = 'mission-points'

interface Props {
  missions: Mission[]
}

function buildGeoJSON(missions: Mission[]): GeoJSON.FeatureCollection {
  const features: GeoJSON.Feature[] = []
  for (const m of missions) {
    // Try to parse lat/lng from the adresse field
    // The mission.adresse is a string, and we need coordinates from the lot's batiment
    // For now, we use a heuristic: if the lot has geocoded coordinates, the API would include them
    // We'll add lat/lng as optional fields; missions without coordinates are skipped
    const lat = (m as any).latitude
    const lng = (m as any).longitude
    if (!lat || !lng) continue

    const affichage = getStatutAffichage(m)
    const color = statutAffichageMarkerColors[affichage]

    features.push({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [lng, lat] },
      properties: {
        id: m.id,
        reference: m.reference,
        lot_designation: m.lot_designation,
        batiment_designation: m.batiment_designation,
        adresse: m.adresse || '',
        date_planifiee: m.date_planifiee,
        heure_debut: m.heure_debut || '',
        statut: m.statut,
        statut_affichage: affichage,
        statut_rdv: m.statut_rdv,
        technicien_nom: m.technicien ? `${m.technicien.prenom} ${m.technicien.nom}` : '',
        edl_types: JSON.stringify(m.edl_types),
        color,
      },
    })
  }
  return { type: 'FeatureCollection', features }
}

export function MissionMap({ missions }: Props) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const popupRef = useRef<mapboxgl.Popup | null>(null)
  const navigate = useNavigate()
  const navigateRef = useRef(navigate)
  navigateRef.current = navigate
  const [mapStyle, setMapStyle] = useState<MapStyleId>('light')
  const [mapReady, setMapReady] = useState(false)

  const geoMissions = missions.filter(m => (m as any).latitude && (m as any).longitude)

  const setupLayers = useCallback((map: mapboxgl.Map, geojson: GeoJSON.FeatureCollection) => {
    // Remove existing layers/source
    if (map.getLayer(CLUSTER_COUNT_LAYER)) map.removeLayer(CLUSTER_COUNT_LAYER)
    if (map.getLayer(CLUSTER_LAYER)) map.removeLayer(CLUSTER_LAYER)
    if (map.getLayer(UNCLUSTERED_LAYER)) map.removeLayer(UNCLUSTERED_LAYER)
    if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID)

    map.addSource(SOURCE_ID, {
      type: 'geojson',
      data: geojson,
      cluster: true,
      clusterMaxZoom: 14,
      clusterRadius: 50,
    })

    // Cluster circles
    map.addLayer({
      id: CLUSTER_LAYER,
      type: 'circle',
      source: SOURCE_ID,
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': [
          'step',
          ['get', 'point_count'],
          '#60a5fa',
          10, '#3b82f6',
          30, '#2563eb',
        ],
        'circle-radius': [
          'step',
          ['get', 'point_count'],
          18,
          10, 24,
          30, 30,
        ],
        'circle-stroke-width': 3,
        'circle-stroke-color': '#ffffff',
      },
    })

    // Cluster count
    map.addLayer({
      id: CLUSTER_COUNT_LAYER,
      type: 'symbol',
      source: SOURCE_ID,
      filter: ['has', 'point_count'],
      layout: {
        'text-field': ['get', 'point_count_abbreviated'],
        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
        'text-size': 13,
      },
      paint: { 'text-color': '#ffffff' },
    })

    // Individual points
    map.addLayer({
      id: UNCLUSTERED_LAYER,
      type: 'circle',
      source: SOURCE_ID,
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-color': ['get', 'color'],
        'circle-radius': 10,
        'circle-stroke-width': 3,
        'circle-stroke-color': '#ffffff',
      },
    })
  }, [])

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return
    if (!mapboxgl.accessToken) return

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [2.3522, 48.8566],
      zoom: 11,
    })

    // setMapReady ne déclenche un re-render que via state — cf overlay de chargement
    map.on('load', () => setMapReady(true))
    map.on('error', (e) => { console.error('[map]', e.error); setMapReady(true) })

    map.addControl(new mapboxgl.NavigationControl(), 'top-right')
    map.addControl(new mapboxgl.FullscreenControl(), 'top-right')
    map.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
        showUserHeading: true,
      }),
      'top-right',
    )
    map.addControl(new mapboxgl.ScaleControl({ maxWidth: 150, unit: 'metric' }), 'bottom-left')

    // Pin icon SVG
    const pinSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 256 256" fill="currentColor"><path d="M235.33,104l-53.47,53.65c4.56,12.67,6.44,33.89-13.19,60.9a8,8,0,0,1-5.71,3.41l-.69,0a8,8,0,0,1-5.65-2.34L116,179l-46.34,46.35a8,8,0,0,1-11.32-11.32L104.69,167.6,64,127.71a8,8,0,0,1,1.1-12.37c27-19.64,48.21-17.76,60.89-13.19L179.62,48.5a8,8,0,0,1,11.31,0L235.33,92.7A8,8,0,0,1,235.33,104Z"/></svg>`

    // Status tab config
    const statusTabs = [
      { key: 'all', label: 'Tout', color: '#6b7280' },
      { key: 'a_traiter', label: 'À traiter', color: '#f97316' },
      { key: 'prete', label: 'Prête', color: '#10b981' },
      { key: 'terminee', label: 'Terminée', color: '#9ca3af' },
      { key: 'annulee', label: 'Annulée', color: '#ef4444' },
    ]

    // Sort missions: closest to today first
    function sortByDateProximity(features: any[]) {
      const now = Date.now()
      return [...features].sort((a, b) => {
        const da = Math.abs(new Date(a.properties?.date_planifiee).getTime() - now)
        const db = Math.abs(new Date(b.properties?.date_planifiee).getTime() - now)
        return da - db
      })
    }

    // Build single mission card HTML
    function singleMissionHtml(props: any) {
      const dateStr = props?.date_planifiee ? formatDate(props.date_planifiee) : ''
      const timeStr = props?.heure_debut ? ` a ${formatTime(props.heure_debut)}` : ''
      const statusLabel = props?.statut_affichage ? statutAffichageLabels[props.statut_affichage as keyof typeof statutAffichageLabels] : ''
      const techStr = props?.technicien_nom || 'Non assigne'
      const color = props?.color ?? '#9ca3af'
      return `
        <div class="immo-mission-card" onclick="window.__missionMapNav__('${props?.id}','${props?.reference ?? ''}')" style="font-family: 'Satoshi', sans-serif; padding: 2px 0; min-width: 200px; cursor: pointer;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
            <div style="display: flex; align-items: center; gap: 6px;">
              <div style="width: 8px; height: 8px; border-radius: 50%; background: ${color}; flex-shrink: 0;"></div>
              <span style="font-size: 12px; font-weight: 600; color: #6366f1;">${props?.reference ?? ''}</span>
            </div>
            <button onclick="event.stopPropagation(); window.__missionMapPin__()" class="immo-pin-btn" title="Epingler" style="background: none; border: none; cursor: pointer; color: #9ca3af; padding: 2px; border-radius: 4px; display: flex; align-items: center; justify-content: center;">
              ${pinSvg}
            </button>
          </div>
          <div style="font-size: 13px; font-weight: 600; color: #111827; margin-bottom: 2px;">${props?.lot_designation ?? ''}</div>
          <div style="font-size: 11px; color: #6b7280; margin-bottom: 6px;">${props?.adresse ?? props?.batiment_designation ?? ''}</div>
          <div style="display: flex; align-items: center; gap: 8px; font-size: 11px;">
            <span style="color: #374151;">${dateStr}${timeStr}</span>
            <span style="background: #f0f0f0; padding: 1px 6px; border-radius: 4px;">${statusLabel}</span>
            <span style="color: #6b7280;">${techStr}</span>
          </div>
        </div>`
    }

    // Build mission row for multi-mission list
    function missionRowHtml(p: any) {
      const dateStr = p?.date_planifiee ? formatDate(p.date_planifiee) : ''
      const timeStr = p?.heure_debut ? ` a ${formatTime(p.heure_debut)}` : ''
      const statusLabel = p?.statut_affichage ? statutAffichageLabels[p.statut_affichage as keyof typeof statutAffichageLabels] : ''
      const color = p?.color ?? '#9ca3af'
      return `
        <div class="immo-mission-row" data-tab="${(() => { const a = p?.statut_affichage ?? ''; return (a === 'terminee' || a === 'annulee' || a === 'prete') ? a : 'a_traiter' })()}" onclick="window.__missionMapNav__('${p?.id}','${p?.reference ?? ''}')" style="display: flex; align-items: center; gap: 8px; padding: 7px 4px; cursor: pointer; border-radius: 6px;">
          <div style="width: 8px; height: 8px; border-radius: 50%; background: ${color}; flex-shrink: 0;"></div>
          <div style="flex: 1; min-width: 0;">
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="font-size: 11px; font-weight: 600; color: #6366f1;">${p?.reference ?? ''}</span>
              <span style="font-size: 11px; background: #f0f0f0; padding: 1px 5px; border-radius: 4px; white-space: nowrap;">${statusLabel}</span>
            </div>
            <div style="font-size: 11px; color: #374151; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 1px;">${p?.lot_designation ?? ''} — ${dateStr}${timeStr}</div>
          </div>
        </div>`
    }

    // Build multi-mission card with status tabs, sorted by date proximity
    function multiMissionHtml(featuresList: any[]) {
      const sorted = sortByDateProximity(featuresList)
      const first = sorted[0].properties
      const addrStr = first?.adresse ?? first?.batiment_designation ?? ''

      // Count per tab — regrouper les 5 statuts d'affichage "en attente" dans a_traiter
      const counts: Record<string, number> = { all: sorted.length }
      for (const f of sorted) {
        const a = f.properties?.statut_affichage ?? ''
        const tab = (a === 'terminee' || a === 'annulee' || a === 'prete') ? a : 'a_traiter'
        counts[tab] = (counts[tab] || 0) + 1
      }

      // Tabs: only show tabs that have missions
      const tabs = statusTabs
        .filter(t => t.key === 'all' || (counts[t.key] ?? 0) > 0)
        .map(t => {
          const cnt = t.key === 'all' ? '' : ` (${counts[t.key]})`
          return `<button class="immo-tab" data-tab="${t.key}" onclick="event.stopPropagation(); window.__missionMapTab__('${t.key}')" style="font-size: 11px; font-weight: 500; padding: 3px 8px; border-radius: 5px; border: none; cursor: pointer; white-space: nowrap; background: ${t.key === 'all' ? '#f0f0f0' : 'transparent'}; color: ${t.key === 'all' ? '#111827' : '#6b7280'};">${t.label}${cnt}</button>`
        }).join('')

      const rows = sorted.map(f => missionRowHtml(f.properties)).join('')

      return `
        <div style="font-family: 'Satoshi', sans-serif; padding: 2px 0; min-width: 260px; max-width: 360px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <div>
              <div style="font-size: 13px; font-weight: 600; color: #111827;">${sorted.length} missions</div>
              <div style="font-size: 11px; color: #6b7280;">${addrStr}</div>
            </div>
            <button onclick="event.stopPropagation(); window.__missionMapPin__()" class="immo-pin-btn" title="Epingler" style="background: none; border: none; cursor: pointer; color: #9ca3af; padding: 2px; border-radius: 4px; display: flex; align-items: center; justify-content: center;">
              ${pinSvg}
            </button>
          </div>
          <div class="immo-tabs-bar" style="display: flex; gap: 2px; padding: 3px; background: #fafafa; border-radius: 7px; margin-bottom: 6px; overflow-x: auto;">${tabs}</div>
          <div class="immo-mission-list" style="max-height: 240px; overflow-y: auto;">${rows}</div>
        </div>`
    }

    // Popup state
    let isPinned = false
    let hideTimeout: ReturnType<typeof setTimeout> | null = null
    let isMouseInPopup = false

    function attachPopupHoverListeners() {
      const el = popupRef.current?.getElement()
      if (!el) return
      el.addEventListener('mouseenter', () => {
        isMouseInPopup = true
        if (hideTimeout) { clearTimeout(hideTimeout); hideTimeout = null }
      })
      el.addEventListener('mouseleave', () => {
        isMouseInPopup = false
        if (!isPinned) {
          hideTimeout = setTimeout(() => {
            if (!isMouseInPopup && !isPinned) removePopup()
          }, 100)
        }
      })
    }

    function showHoverPopup(lngLat: [number, number], html: string) {
      if (isPinned) return
      if (hideTimeout) { clearTimeout(hideTimeout); hideTimeout = null }
      if (popupRef.current) popupRef.current.remove()
      isMouseInPopup = false
      popupRef.current = new mapboxgl.Popup({ offset: 15, closeButton: false, className: 'immo-popup', maxWidth: '380px' })
        .setLngLat(lngLat)
        .setHTML(html)
        .addTo(map)
      attachPopupHoverListeners()
    }

    function scheduleHidePopup() {
      if (isPinned) return
      hideTimeout = setTimeout(() => {
        if (!isMouseInPopup && !isPinned) removePopup()
      }, 200)
    }

    function removePopup() {
      if (popupRef.current) {
        popupRef.current.remove()
        popupRef.current = null
      }
      isMouseInPopup = false
    }

    function pinPopup(lngLat: [number, number], html: string) {
      if (hideTimeout) { clearTimeout(hideTimeout); hideTimeout = null }
      if (popupRef.current) popupRef.current.remove()
      isPinned = true
      isMouseInPopup = false
      popupRef.current = new mapboxgl.Popup({ offset: 15, closeButton: false, className: 'immo-popup immo-popup-pinned', maxWidth: '380px' })
        .setLngLat(lngLat)
        .setHTML(html)
        .addTo(map)
      // Style pin button as active
      const el = popupRef.current.getElement()
      const pinBtn = el?.querySelector('.immo-pin-btn') as HTMLElement | null
      if (pinBtn) {
        pinBtn.style.color = '#6366f1'
        pinBtn.title = 'Epingle'
      }
    }

    // Global functions
    ;(window as any).__missionMapNav__ = (id: string, ref?: string) => {
      navigateRef.current(`/app/missions/${id}`, { state: { breadcrumbs: [{ label: 'Missions', href: '/app/missions' }, { label: ref || 'Mission' }] } })
    }

    let lastHoverCoords: [number, number] | null = null
    let lastHoverHtml = ''

    ;(window as any).__missionMapPin__ = () => {
      if (lastHoverCoords) pinPopup(lastHoverCoords, lastHoverHtml)
    }

    ;(window as any).__missionMapTab__ = (tabKey: string) => {
      const popup = popupRef.current?.getElement()
      if (!popup) return
      // Update active tab style
      popup.querySelectorAll('.immo-tab').forEach((btn) => {
        const el = btn as HTMLElement
        if (el.dataset.tab === tabKey) {
          el.style.background = '#f0f0f0'
          el.style.color = '#111827'
        } else {
          el.style.background = 'transparent'
          el.style.color = '#6b7280'
        }
      })
      // Show/hide rows
      popup.querySelectorAll('.immo-mission-row').forEach((row) => {
        const el = row as HTMLElement
        el.style.display = (tabKey === 'all' || el.dataset.tab === tabKey) ? 'flex' : 'none'
      })
    }

    // Cluster click: épingle le popup multi-missions (identique au hover mais persistant).
    // Le bouton zoom reste disponible via shift+click comme raccourci avancé.
    map.on('click', CLUSTER_LAYER, (e) => {
      const features = map.queryRenderedFeatures(e.point, { layers: [CLUSTER_LAYER] })
      if (!features.length) return
      const clusterId = features[0].properties?.cluster_id
      const source = map.getSource(SOURCE_ID) as mapboxgl.GeoJSONSource
      const geometry = features[0].geometry as GeoJSON.Point
      const coords = geometry.coordinates as [number, number]
      const pointCount = features[0].properties?.point_count ?? 20

      // Shift+click → zoom (raccourci pour les power-users)
      if (e.originalEvent.shiftKey) {
        source.getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err) return
          map.easeTo({ center: coords, zoom: zoom ?? (map.getZoom() + 2) })
        })
        return
      }

      // Click normal → épingle le popup multi-missions
      source.getClusterLeaves(clusterId, Math.min(pointCount, 50), 0, (err, leaves) => {
        if (err || !leaves?.length) return
        const html = multiMissionHtml(leaves)
        lastHoverCoords = coords
        lastHoverHtml = html
        pinPopup(coords, html)
      })
    })

    // Point hover: show card (with delay before hiding)
    map.on('mouseenter', UNCLUSTERED_LAYER, (e) => {
      map.getCanvas().style.cursor = 'pointer'
      if (hideTimeout) { clearTimeout(hideTimeout); hideTimeout = null }
      const features = map.queryRenderedFeatures(e.point, { layers: [UNCLUSTERED_LAYER] })
      if (!features.length) return
      const geometry = features[0].geometry as GeoJSON.Point
      const coords = geometry.coordinates as [number, number]

      const html = features.length > 1
        ? multiMissionHtml(features)
        : singleMissionHtml(features[0].properties)
      lastHoverCoords = coords
      lastHoverHtml = html
      showHoverPopup(coords, html)
    })

    map.on('mouseleave', UNCLUSTERED_LAYER, () => {
      map.getCanvas().style.cursor = ''
      scheduleHidePopup()
    })

    // Click on point: pin the popup
    map.on('click', UNCLUSTERED_LAYER, (e) => {
      const features = map.queryRenderedFeatures(e.point, { layers: [UNCLUSTERED_LAYER] })
      if (!features.length) return
      const geometry = features[0].geometry as GeoJSON.Point
      const coords = geometry.coordinates as [number, number]

      const html = features.length > 1
        ? multiMissionHtml(features)
        : singleMissionHtml(features[0].properties)
      lastHoverCoords = coords
      lastHoverHtml = html
      pinPopup(coords, html)
    })

    // Click on empty map: unpin
    map.on('click', (e) => {
      const pointFeatures = map.queryRenderedFeatures(e.point, { layers: [UNCLUSTERED_LAYER, CLUSTER_LAYER] })
      if (pointFeatures.length === 0 && isPinned) {
        isPinned = false
        removePopup()
      }
    })

    // Hover cluster : fetch les leaves et affiche le popup multi-missions (non épinglé).
    // Même UX qu'un point unique multi-missions. Clic = épinglage (handler plus haut).
    map.on('mouseenter', CLUSTER_LAYER, (e) => {
      map.getCanvas().style.cursor = 'pointer'
      if (hideTimeout) { clearTimeout(hideTimeout); hideTimeout = null }
      const features = map.queryRenderedFeatures(e.point, { layers: [CLUSTER_LAYER] })
      if (!features.length) return
      const clusterId = features[0].properties?.cluster_id
      const geometry = features[0].geometry as GeoJSON.Point
      const coords = geometry.coordinates as [number, number]
      const source = map.getSource(SOURCE_ID) as mapboxgl.GeoJSONSource
      const pointCount = features[0].properties?.point_count ?? 20
      // Cap à 50 pour éviter un popup trop long dans un gros cluster
      source.getClusterLeaves(clusterId, Math.min(pointCount, 50), 0, (err, leaves) => {
        if (err || !leaves?.length) return
        const html = multiMissionHtml(leaves)
        lastHoverCoords = coords
        lastHoverHtml = html
        showHoverPopup(coords, html)
      })
    })
    map.on('mouseleave', CLUSTER_LAYER, () => {
      map.getCanvas().style.cursor = ''
      scheduleHidePopup()
    })

    mapRef.current = map

    return () => {
      if (hideTimeout) clearTimeout(hideTimeout)
      if (popupRef.current) popupRef.current.remove()
      delete (window as any).__missionMapNav__
      delete (window as any).__missionMapPin__
      delete (window as any).__missionMapTab__
      map.remove()
      mapRef.current = null
      setMapReady(false)
    }
  }, [setupLayers])

  // Handle map style change
  const handleStyleChange = useCallback((styleId: MapStyleId, styleUrl: string) => {
    setMapStyle(styleId)
    const map = mapRef.current
    if (!map) return

    map.setStyle(styleUrl)
    map.once('style.load', () => {
      const geojson = buildGeoJSON(missions)
      setupLayers(map, geojson)
    })
  }, [missions, setupLayers])

  // Update data
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const geojson = buildGeoJSON(missions)

    const applyData = () => {
      const source = map.getSource(SOURCE_ID) as mapboxgl.GeoJSONSource | undefined
      if (source) {
        source.setData(geojson)
      } else {
        setupLayers(map, geojson)
      }

      if (geojson.features.length > 0) {
        const bounds = new mapboxgl.LngLatBounds()
        for (const f of geojson.features) {
          const coords = (f.geometry as GeoJSON.Point).coordinates as [number, number]
          bounds.extend(coords)
        }
        map.fitBounds(bounds, { padding: 60, maxZoom: 15, duration: 500 })
      }
    }

    if (map.isStyleLoaded()) {
      applyData()
    } else {
      map.once('load', applyData)
    }
  }, [missions, setupLayers])

  if (!mapboxgl.accessToken) {
    return (
      <div className="border border-border/60 rounded-2xl h-[600px] flex items-center justify-center text-muted-foreground bg-muted/30">
        <p className="text-sm">Token Mapbox non configuré</p>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-2xl border-0 shadow-elevation-raised overflow-hidden">
      <div className="relative">
        <div ref={mapContainer} className="h-[600px] w-full" />
        {!mapReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/30 pointer-events-none transition-opacity duration-300">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <SpinnerGap className="h-4 w-4 animate-spin" />
              Chargement de la carte...
            </div>
          </div>
        )}
        <MapStyleSwitcher currentStyle={mapStyle} onChange={handleStyleChange} />
      </div>
      <div className="flex items-center justify-between px-4 py-2.5 bg-muted/30 text-xs text-muted-foreground border-t border-border/60">
        {/* Legend */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#3b82f6' }} />
            <span>Planifiée</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#f97316' }} />
            <span>Actions en attente</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#10b981' }} />
            <span>Confirmée</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#9ca3af' }} />
            <span>Terminée</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ef4444' }} />
            <span>Annulée</span>
          </div>
        </div>
        {/* Counter */}
        <span className="text-muted-foreground/60">
          {geoMissions.length} mission{geoMissions.length !== 1 ? 's' : ''} affichee{geoMissions.length !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  )
}
