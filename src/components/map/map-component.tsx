'use client'

import { useState, useEffect, useRef, useCallback } from "react"
import {
  Map,
  NavigationControl,
  Source,
  GeolocateControl,
  Layer,
  type ViewStateChangeEvent,
} from "react-map-gl/maplibre"
import "maplibre-gl/dist/maplibre-gl.css"
import maplibregl from "maplibre-gl"
import { LayerManager } from "./legend-panel/layer-manager"
import { useSelector, useDispatch } from "react-redux"
import type { RootState, AppDispatch } from "@/lib/store"
import { setSelectedFeature, clearFitToLayer } from "@/lib/slices/layerSlice"
import type { LayerGroup } from "@/lib/map-types"
import type { MapRef } from "react-map-gl/maplibre"

// ---------------------------------------------------------------------------
// Paint-props helpers — eliminates duplication across all three layer sources
// ---------------------------------------------------------------------------

function getPaintProps(layer: { mapLayerType: string; style: any }) {
  switch (layer.mapLayerType) {
    case "circle":
      return {
        "circle-radius": layer.style.size,
        "circle-color": layer.style.color,
        "circle-opacity": layer.style.opacity,
        "circle-stroke-color": layer.style.stroke,
        "circle-stroke-width": layer.style.strokeWidth,
      }
    case "line":
      return {
        "line-color": layer.style.color,
        "line-width": layer.style.strokeWidth,
        "line-opacity": layer.style.opacity,
      }
    case "fill":
      return {
        "fill-color": layer.style.color,
        "fill-opacity": layer.style.opacity,
        "fill-outline-color": layer.style.stroke,
      }
    default:
      return {}
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function MapComponent() {
  const dispatch = useDispatch<AppDispatch>()
  const { layerGroups, loading, mapStyle, fitToLayerId } = useSelector(
    (state: RootState) => state.layer,
  )

  const [viewState, setViewState] = useState({
    longitude: 73.8567,
    latitude: 18.5204,
    zoom: 12,
  })

  // react-map-gl sets this ref automatically via the `ref` prop — no need to
  // manually assign it inside onLoad.
  const mapRef = useRef<MapRef | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)

  /**
   * FIX: Keep a stable ref to layerGroups so the click handler registered once
   * in handleMapLoad always sees the latest groups without being re-registered.
   */
  const layerGroupsRef = useRef<LayerGroup[]>(layerGroups)
  useEffect(() => { layerGroupsRef.current = layerGroups }, [layerGroups])

  // Handle fitToLayer requests
  useEffect(() => {
    if (!fitToLayerId || !mapRef.current || !mapLoaded) return

    const layer = layerGroups.flatMap((g) => g.layers).find((l) => l.id === fitToLayerId)

    if (layer?.data) {
      fitMapToLayer(layer.data)
    } else if (layer?.tileJson?.bounds?.length === 4) {
      const [west, south, east, north] = layer.tileJson.bounds
      mapRef.current.fitBounds([west, south, east, north], { padding: 40 })
    }

    dispatch(clearFitToLayer())
  }, [fitToLayerId, layerGroups, mapLoaded, dispatch])

  const fitMapToLayer = useCallback((geojson: any) => {
    if (!geojson?.features?.length || !mapRef.current) return

    try {
      const bounds = new maplibregl.LngLatBounds()

      for (const feature of geojson.features) {
        const { type, coordinates } = feature.geometry
        if (type === "Point") {
          bounds.extend(coordinates as [number, number])
        } else if (type === "LineString") {
          for (const coord of coordinates) bounds.extend(coord as [number, number])
        } else if (type === "Polygon") {
          for (const coord of coordinates[0]) bounds.extend(coord as [number, number])
        } else if (type === "MultiPolygon") {
          for (const polygon of coordinates)
            for (const coord of polygon[0]) bounds.extend(coord as [number, number])
        }
      }

      if (!bounds.isEmpty()) {
        mapRef.current.fitBounds(bounds, { padding: 40 })
      }
    } catch (error) {
      console.error("Error fitting map to layer:", error)
    }
  }, [])

  const handleMapLoad = useCallback(() => {
    setMapLoaded(true)

    // Register click handler once. Uses layerGroupsRef so it always reads
    // the latest layer list without the handler needing to be re-registered.
    mapRef.current?.on("click", (e) => {
      const map = mapRef.current
      if (!map) return

      const visibleLayerIds = layerGroupsRef.current
        .filter((g) => g.visible)
        .flatMap((g) => g.layers.filter((l) => l.visible).map((l) => l.id))
        .filter((id) => map.getLayer(id)) // only layers already in the style

      if (visibleLayerIds.length === 0) return

      const features = map.queryRenderedFeatures(e.point, { layers: visibleLayerIds })

      if (features.length > 0) {
        dispatch(
          setSelectedFeature({
            feature: features[0],
            coordinates: e.lngLat.toArray() as [number, number],
          }),
        )
      } else {
        dispatch(setSelectedFeature(null))
      }
    })
  }, [dispatch])

  const renderLayers = useCallback(() => {
    return layerGroups
      .flatMap((group) => {
        if (!group.visible) return []

        return group.layers.map((layer) => {
          if (!layer.visible) return null

          const paint = getPaintProps(layer)

          // Vector Tiles (preferred)
          if (layer.tileJson) {
            const tileUrls: string[] = layer.tileJson.tiles ?? []
            if (tileUrls.length === 0) return null

            // Prefer the first vector_layers entry; fall back to the layer name itself
            const sourceLayer: string =
              layer.tileJson.vector_layers?.[0]?.id ?? layer.name ?? "default"

            return (
              <Source
                key={layer.id}
                id={`source-${layer.id}`}
                type="vector"
                tiles={tileUrls}
                minzoom={layer.tileJson.minzoom ?? 0}
                maxzoom={layer.tileJson.maxzoom ?? 22}
              >
                <Layer
                  id={layer.id}
                  source-layer={sourceLayer}
                  type={layer.mapLayerType as "circle" | "line" | "fill"}
                  paint={paint}
                />
              </Source>
            )
          }

          // MBTiles
          if (layer.mbtilesUrl) {
            return (
              <Source
                key={layer.id}
                id={`source-${layer.id}`}
                type="vector"
                tiles={[layer.mbtilesUrl]}
                minzoom={0}
                maxzoom={22}
              >
                <Layer
                  id={layer.id}
                  source-layer="default"
                  type={layer.mapLayerType as "circle" | "line" | "fill"}
                  paint={paint}
                />
              </Source>
            )
          }

          // GeoJSON
          if (layer.data) {
            const sourceData = layer.style.filteredData ?? layer.data
            return (
              <Source key={layer.id} id={`source-${layer.id}`} type="geojson" data={sourceData}>
                <Layer
                  id={layer.id}
                  type={layer.mapLayerType as "circle" | "line" | "fill"}
                  paint={paint}
                />
              </Source>
            )
          }

          return null
        })
      })
      .filter(Boolean)
  }, [layerGroups])

  const mapStyleUrl =
    mapStyle === "dark"
      ? process.env.NEXT_PUBLIC_DARK_STYLE_API_URL || ""
      : process.env.NEXT_PUBLIC_LIGHT_STYLE_API_URL || ""

  return (
    <div style={{ height: "100vh" }}>
      {loading && (
        <div className="absolute inset-0 bg-black/10 z-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-md shadow-md flex items-center gap-2">
            <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full" />
            <span>Loading map data...</span>
          </div>
        </div>
      )}

      <Map
        ref={mapRef}
        mapStyle={mapStyleUrl}
        {...viewState}
        onMove={(evt: ViewStateChangeEvent) => setViewState(evt.viewState)}
        renderWorldCopies={false}
        attributionControl={false}
        onLoad={handleMapLoad}
      >
        <NavigationControl position="bottom-right" />
        <GeolocateControl position="bottom-right" />
        {renderLayers()}
      </Map>

      <LayerManager />
    </div>
  )
}
