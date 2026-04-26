import { useRef, useEffect, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { MAPBOX_STYLE, NYC_CENTER, NYC_ZOOM, AREA_BOUNDS, ALLOWED_NEIGHBORHOODS, NTA_GEOJSON_URL } from '../utils/mapConfig'

export default function NeighborhoodMap({ onNeighborhoodSelect, selectedId }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const hoveredIdRef = useRef(null)
  const selectedIdRef = useRef(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const token = import.meta.env.VITE_MAPBOX_TOKEN
    if (!token) {
      setError('VITE_MAPBOX_TOKEN is not set — add it to frontend/.env')
      setLoading(false)
      return
    }

    mapboxgl.accessToken = token

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: MAPBOX_STYLE,
      center: NYC_CENTER,
      zoom: NYC_ZOOM,
      minZoom: 12,
      maxZoom: 15,
      maxBounds: AREA_BOUNDS,
    })

    mapRef.current = map
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right')

    map.on('load', async () => {
      try {
        const res = await fetch(NTA_GEOJSON_URL)
        if (!res.ok) throw new Error('GeoJSON fetch failed')
        const geojson = await res.json()

        map.addSource('neighborhoods', {
          type: 'geojson',
          data: geojson,
          generateId: true,
        })

        map.addLayer({
          id: 'neighborhoods-fill',
          type: 'fill',
          source: 'neighborhoods',
          filter: ['in', ['get', 'NTAName'], ['literal', ALLOWED_NEIGHBORHOODS]],
          paint: {
            'fill-color': [
              'case',
              ['boolean', ['feature-state', 'selected'], false], '#22c55e',
              ['boolean', ['feature-state', 'hovered'], false], 'rgba(34,197,94,0.28)',
              'rgba(34,197,94,0.07)',
            ],
            'fill-opacity': 0.9,
          },
        })

        map.addLayer({
          id: 'neighborhoods-border',
          type: 'line',
          source: 'neighborhoods',
          filter: ['in', ['get', 'NTAName'], ['literal', ALLOWED_NEIGHBORHOODS]],
          paint: {
            'line-color': [
              'case',
              ['boolean', ['feature-state', 'selected'], false], '#22c55e',
              'rgba(34,197,94,0.35)',
            ],
            'line-width': [
              'case',
              ['boolean', ['feature-state', 'selected'], false], 2,
              0.7,
            ],
          },
        })

        setLoading(false)

        map.on('mousemove', 'neighborhoods-fill', (e) => {
          if (!e.features.length) return
          map.getCanvas().style.cursor = 'pointer'

          const id = e.features[0].id
          if (hoveredIdRef.current !== null && hoveredIdRef.current !== id) {
            map.setFeatureState({ source: 'neighborhoods', id: hoveredIdRef.current }, { hovered: false })
          }
          hoveredIdRef.current = id
          map.setFeatureState({ source: 'neighborhoods', id: id }, { hovered: true })
        })

        map.on('mouseleave', 'neighborhoods-fill', () => {
          map.getCanvas().style.cursor = ''
          if (hoveredIdRef.current !== null) {
            map.setFeatureState({ source: 'neighborhoods', id: hoveredIdRef.current }, { hovered: false })
            hoveredIdRef.current = null
          }
        })

        map.on('click', 'neighborhoods-fill', (e) => {
          if (!e.features.length) return

          const feature = e.features[0]
          const id = feature.id
          const props = feature.properties

          if (selectedIdRef.current !== null) {
            map.setFeatureState({ source: 'neighborhoods', id: selectedIdRef.current }, { selected: false })
          }

          selectedIdRef.current = id
          map.setFeatureState({ source: 'neighborhoods', id: id }, { selected: true })

          onNeighborhoodSelect?.({
            id,
            name: props.ntaname ?? props.NTAName ?? 'Unknown',
            borough: props.boroname ?? props.BoroName ?? '',
            code: props.ntacode ?? props.NTACode ?? '',
          })
        })

        // Click on empty area to deselect
        map.on('click', (e) => {
          const features = map.queryRenderedFeatures(e.point, { layers: ['neighborhoods-fill'] })
          if (!features.length && selectedIdRef.current !== null) {
            map.setFeatureState({ source: 'neighborhoods', id: selectedIdRef.current }, { selected: false })
            selectedIdRef.current = null
            onNeighborhoodSelect?.(null)
          }
        })

      } catch (err) {
        setError('Failed to load NYC neighborhood data.')
        setLoading(false)
      }
    })

    return () => map.remove()
  }, [])

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-950 text-red-400 text-sm px-8 text-center">
        {error}
      </div>
    )
  }

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-950 gap-3">
          <div className="w-6 h-6 border-2 border-eco-green border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-400 text-sm">Loading neighborhoods…</span>
        </div>
      )}
    </div>
  )
}
