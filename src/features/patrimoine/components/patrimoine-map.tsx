import { useEffect, useRef, useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SpinnerGap } from '@phosphor-icons/react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import type { Batiment } from '../types'
import { formatBatimentLabel } from '../labels'
import { MapStyleSwitcher, MAP_STYLES, type MapStyleId } from 'src/components/shared/map-style-switcher'

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || ''

function getMarkerColor(bat: Batiment): string {
  if (bat.missions_a_venir > 0) return '#2563eb' // blue
  if (bat.derniere_mission) {
    const monthsAgo = (Date.now() - new Date(bat.derniere_mission).getTime()) / (1000 * 60 * 60 * 24 * 30)
    if (monthsAgo < 6) return '#16a34a' // green
  }
  return '#9ca3af' // gray
}

const typeLabels: Record<string, string> = {
  immeuble: 'Immeuble', maison: 'Maison', local_commercial: 'Local commercial', mixte: 'Mixte', autre: 'Autre',
}

function buildGeoJSON(batiments: Batiment[]): GeoJSON.FeatureCollection {
  const features: GeoJSON.Feature[] = []
  for (const bat of batiments) {
    const adr = bat.adresse_principale
    if (!adr?.latitude || !adr?.longitude) continue
    features.push({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [adr.longitude, adr.latitude] },
      properties: {
        id: bat.id,
        designation: formatBatimentLabel(bat),
        type: bat.type,
        type_label: typeLabels[bat.type] || bat.type,
        rue: adr.rue,
        code_postal: adr.code_postal,
        ville: adr.ville,
        nb_lots: bat.nb_lots,
        missions_a_venir: bat.missions_a_venir,
        derniere_mission: bat.derniere_mission || '',
        color: getMarkerColor(bat),
      },
    })
  }
  return { type: 'FeatureCollection', features }
}

interface Props {
  batiments: Batiment[]
}

const SOURCE_ID = 'batiments'
const CLUSTER_LAYER = 'clusters'
const CLUSTER_COUNT_LAYER = 'cluster-count'
const UNCLUSTERED_LAYER = 'unclustered-point'

export function PatrimoineMap({ batiments }: Props) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const popupRef = useRef<mapboxgl.Popup | null>(null)
  const navigate = useNavigate()
  const [mapStyle, setMapStyle] = useState<MapStyleId>('light')
  const [mapReady, setMapReady] = useState(false)

  // Keep navigate stable in a ref so we can use it in map event handlers
  const navigateRef = useRef(navigate)
  navigateRef.current = navigate

  const setupLayers = useCallback((map: mapboxgl.Map, geojson: GeoJSON.FeatureCollection) => {
    // Remove existing source/layers if present (for hot-reload safety)
    if (map.getLayer(CLUSTER_COUNT_LAYER)) map.removeLayer(CLUSTER_COUNT_LAYER)
    if (map.getLayer(CLUSTER_LAYER)) map.removeLayer(CLUSTER_LAYER)
    if (map.getLayer(UNCLUSTERED_LAYER)) map.removeLayer(UNCLUSTERED_LAYER)
    if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID)

    // Add GeoJSON source with clustering
    map.addSource(SOURCE_ID, {
      type: 'geojson',
      data: geojson,
      cluster: true,
      clusterMaxZoom: 14,
      clusterRadius: 50,
    })

    // Layer 1: Cluster circles
    map.addLayer({
      id: CLUSTER_LAYER,
      type: 'circle',
      source: SOURCE_ID,
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': [
          'step',
          ['get', 'point_count'],
          '#60a5fa', // blue-400 for small clusters
          10,
          '#3b82f6', // blue-500 for medium
          30,
          '#2563eb', // blue-600 for large
        ],
        'circle-radius': [
          'step',
          ['get', 'point_count'],
          18, // small
          10,
          24, // medium
          30,
          30, // large
        ],
        'circle-stroke-width': 3,
        'circle-stroke-color': '#ffffff',
      },
    })

    // Layer 2: Cluster count labels
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
      paint: {
        'text-color': '#ffffff',
      },
    })

    // Layer 3: Unclustered individual points (colored by status)
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

  // Initialize map once
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return
    if (!mapboxgl.accessToken) return

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [2.3522, 48.8566],
      zoom: 11,
    })

    // State map (le ref n'entraîne pas de re-render, on utilise un state pour l'overlay)
    map.on('load', () => setMapReady(true))
    map.on('error', (e) => { console.error('[patrimoine-map]', e.error); setMapReady(true) })

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

    // Build single building card HTML
    function singleBatimentHtml(props: any) {
      const color = props?.color ?? '#9ca3af'
      const missionsHtml = props?.missions_a_venir > 0
        ? `<span style="color: #2563eb; font-weight: 500;">${props.missions_a_venir} mission(s) a venir</span>`
        : '<span style="color: #9ca3af;">Aucune mission</span>'
      return `
        <div class="immo-mission-card" onclick="window.__batMapNav__('${props?.id}','${(props?.designation ?? '').replace(/'/g, "\\'")}')" style="font-family: 'Satoshi', sans-serif; padding: 2px 0; min-width: 210px; cursor: pointer;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
            <div style="display: flex; align-items: center; gap: 6px;">
              <div style="width: 8px; height: 8px; border-radius: 50%; background: ${color}; flex-shrink: 0;"></div>
              <span style="font-size: 11px; background: #f0f0f0; padding: 1px 6px; border-radius: 4px;">${props?.type_label ?? ''}</span>
            </div>
            <button onclick="event.stopPropagation(); window.__batMapPin__()" class="immo-pin-btn" title="Epingler" style="background: none; border: none; cursor: pointer; color: #9ca3af; padding: 2px; border-radius: 4px; display: flex; align-items: center; justify-content: center;">
              ${pinSvg}
            </button>
          </div>
          <div style="font-size: 13px; font-weight: 600; color: #111827; margin-bottom: 2px;">${props?.designation ?? ''}</div>
          <div style="font-size: 11px; color: #6b7280; margin-bottom: 6px;">${props?.rue ?? ''}, ${props?.code_postal ?? ''} ${props?.ville ?? ''}</div>
          <div style="display: flex; align-items: center; gap: 10px; font-size: 11px;">
            <span style="color: #374151; font-weight: 500;">${props?.nb_lots ?? 0} lot${(props?.nb_lots ?? 0) > 1 ? 's' : ''}</span>
            ${missionsHtml}
          </div>
        </div>`
    }

    // Build multi-building card HTML (cluster at same location)
    function multiBatimentHtml(featuresList: any[]) {
      // Adresses uniques sur l'ensemble du cluster — si toutes identiques, header partagé.
      const addrOf = (p: any) => `${p?.rue ?? ''}, ${p?.code_postal ?? ''} ${p?.ville ?? ''}`.trim()
      const uniqueAddrs = Array.from(new Set(featuresList.map(f => addrOf(f.properties))))
      const allSame = uniqueAddrs.length <= 1
      const headerSubline = allSame
        ? (uniqueAddrs[0] || '')
        : `${uniqueAddrs.length} adresses différentes`

      const rows = featuresList.map((f) => {
        const p = f.properties
        const color = p?.color ?? '#9ca3af'
        const missionsTag = p?.missions_a_venir > 0
          ? `<span style="font-size: 11px; color: #2563eb; font-weight: 500;">${p.missions_a_venir} mission(s)</span>`
          : ''
        // Adresse de la carte : on l'affiche sur chaque ligne quand le cluster
        // mélange plusieurs adresses, sinon redondant avec le header.
        const addrLine = !allSame
          ? `<div style="margin-top: 2px; font-size: 11px; color: #6b7280;">${addrOf(p) || '—'}</div>`
          : ''
        return `
          <div class="immo-mission-row" onclick="window.__batMapNav__('${p?.id}','${(p?.designation ?? '').replace(/'/g, "\\'")}')" style="display: flex; align-items: flex-start; gap: 8px; padding: 7px 4px; cursor: pointer; border-radius: 6px;">
            <div style="width: 8px; height: 8px; border-radius: 50%; background: ${color}; flex-shrink: 0; margin-top: 4px;"></div>
            <div style="flex: 1; min-width: 0;">
              <div style="display: flex; align-items: center; gap: 6px;">
                <span style="font-size: 11px; font-weight: 600; color: #111827;">${p?.designation ?? ''}</span>
                <span style="font-size: 11px; background: #f0f0f0; padding: 1px 5px; border-radius: 4px;">${p?.type_label ?? ''}</span>
              </div>
              ${addrLine}
              <div style="display: flex; align-items: center; gap: 8px; margin-top: 2px; font-size: 11px; color: #6b7280;">
                <span>${p?.nb_lots ?? 0} lots</span>
                ${missionsTag}
              </div>
            </div>
          </div>`
      }).join('')
      return `
        <div style="font-family: 'Satoshi', sans-serif; padding: 2px 0; min-width: 250px; max-width: 340px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
            <div>
              <div style="font-size: 13px; font-weight: 600; color: #111827;">${featuresList.length} batiments</div>
              <div style="font-size: 11px; color: #6b7280;">${headerSubline}</div>
            </div>
            <button onclick="event.stopPropagation(); window.__batMapPin__()" class="immo-pin-btn" title="Epingler" style="background: none; border: none; cursor: pointer; color: #9ca3af; padding: 2px; border-radius: 4px; display: flex; align-items: center; justify-content: center;">
              ${pinSvg}
            </button>
          </div>
          <div style="max-height: 240px; overflow-y: auto; margin-top: 6px; border-top: 1px solid #f0f0f0; padding-top: 4px;">${rows}</div>
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
      const el = popupRef.current.getElement()
      const pinBtn = el?.querySelector('.immo-pin-btn') as HTMLElement | null
      if (pinBtn) { pinBtn.style.color = '#6366f1'; pinBtn.title = 'Epingle' }
    }

    // Global functions
    let lastHoverCoords: [number, number] | null = null
    let lastHoverHtml = ''

    ;(window as any).__batMapNav__ = (id: string, name?: string) => {
      navigateRef.current(`/app/patrimoine/batiments/${id}`, { state: { breadcrumbs: [{ label: 'Parc immobilier', href: '/app/patrimoine' }, { label: name || 'Bâtiment' }] } })
    }
    ;(window as any).__batMapPin__ = () => {
      if (lastHoverCoords) pinPopup(lastHoverCoords, lastHoverHtml)
    }

    // Cluster click: épingle le popup multi-bâtiments par défaut. Shift+click = zoom.
    map.on('click', CLUSTER_LAYER, (e) => {
      const features = map.queryRenderedFeatures(e.point, { layers: [CLUSTER_LAYER] })
      if (!features.length) return
      const clusterId = features[0].properties?.cluster_id
      const source = map.getSource(SOURCE_ID) as mapboxgl.GeoJSONSource
      const geometry = features[0].geometry as GeoJSON.Point
      const coords = geometry.coordinates as [number, number]
      const pointCount = features[0].properties?.point_count ?? 20

      if (e.originalEvent.shiftKey) {
        source.getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err) return
          map.easeTo({ center: coords, zoom: zoom ?? (map.getZoom() + 2) })
        })
        return
      }

      source.getClusterLeaves(clusterId, Math.min(pointCount, 50), 0, (err, leaves) => {
        if (err || !leaves?.length) return
        const html = multiBatimentHtml(leaves)
        lastHoverCoords = coords
        lastHoverHtml = html
        pinPopup(coords, html)
      })
    })

    // Point hover: show card with delay persistence
    map.on('mouseenter', UNCLUSTERED_LAYER, (e) => {
      map.getCanvas().style.cursor = 'pointer'
      if (hideTimeout) { clearTimeout(hideTimeout); hideTimeout = null }
      const features = map.queryRenderedFeatures(e.point, { layers: [UNCLUSTERED_LAYER] })
      if (!features.length) return
      const geometry = features[0].geometry as GeoJSON.Point
      const coords = geometry.coordinates as [number, number]

      const html = features.length > 1
        ? multiBatimentHtml(features)
        : singleBatimentHtml(features[0].properties)
      lastHoverCoords = coords
      lastHoverHtml = html
      showHoverPopup(coords, html)
    })

    map.on('mouseleave', UNCLUSTERED_LAYER, () => {
      map.getCanvas().style.cursor = ''
      scheduleHidePopup()
    })

    // Click point: pin popup
    map.on('click', UNCLUSTERED_LAYER, (e) => {
      const features = map.queryRenderedFeatures(e.point, { layers: [UNCLUSTERED_LAYER] })
      if (!features.length) return
      const geometry = features[0].geometry as GeoJSON.Point
      const coords = geometry.coordinates as [number, number]

      const html = features.length > 1
        ? multiBatimentHtml(features)
        : singleBatimentHtml(features[0].properties)
      lastHoverCoords = coords
      lastHoverHtml = html
      pinPopup(coords, html)
    })

    // Click empty map: unpin
    map.on('click', (e) => {
      const pointFeatures = map.queryRenderedFeatures(e.point, { layers: [UNCLUSTERED_LAYER, CLUSTER_LAYER] })
      if (pointFeatures.length === 0 && isPinned) {
        isPinned = false
        removePopup()
      }
    })

    // Cluster hover : affiche le popup multi-bâtiments (non épinglé).
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
      source.getClusterLeaves(clusterId, Math.min(pointCount, 50), 0, (err, leaves) => {
        if (err || !leaves?.length) return
        const html = multiBatimentHtml(leaves)
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
      delete (window as any).__batMapNav__
      delete (window as any).__batMapPin__
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
      const geojson = buildGeoJSON(batiments)
      setupLayers(map, geojson)
    })
  }, [batiments, setupLayers])

  // Update data when batiments change
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const geojson = buildGeoJSON(batiments)

    const applyData = () => {
      const source = map.getSource(SOURCE_ID) as mapboxgl.GeoJSONSource | undefined
      if (source) {
        // Source already exists, just update data
        source.setData(geojson)
      } else {
        // First load: set up layers
        setupLayers(map, geojson)
      }

      // Fit bounds to data
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
  }, [batiments, setupLayers])

  const geoBatiments = batiments.filter(b => b.adresse_principale?.latitude && b.adresse_principale?.longitude)

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
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#2563eb' }} />
            <span>Mission a venir</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#16a34a' }} />
            <span>Mission recente (&lt;6 mois)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#9ca3af' }} />
            <span>Aucune mission</span>
          </div>
        </div>
        <span className="text-muted-foreground/60">
          {geoBatiments.length} batiment{geoBatiments.length !== 1 ? 's' : ''} affiche{geoBatiments.length !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  )
}
