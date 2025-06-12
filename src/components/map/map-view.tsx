import { useState, useEffect, useRef, useCallback } from "react"
import {
  Map,
  NavigationControl,
  Source,
  GeolocateControl,
  Layer,
  type ViewStateChangeEvent,
  Popup,
} from "react-map-gl/maplibre"
import logo from "../../assets/spiroMapsLogo.png"
import "maplibre-gl/dist/maplibre-gl.css"
import maplibregl from "maplibre-gl"
import { LayerManager } from "./legend-panel/layer-manager"
import { useSelector, useDispatch } from "react-redux"
import type { RootState, AppDispatch } from "../../store"
import { setSelectedFeature, clearFitToLayer } from "../../store/map/layerSlice"
import { DistanceMeasureControl } from "./distance/distance"
import { FeaturePopup } from "./popup/feature-popup"
import type { MapRef } from 'react-map-gl/maplibre';

export default function MapComponent() {
  const dispatch = useDispatch<AppDispatch>()
  const { layerGroups, loading, selectedFeature, mapStyle, fitToLayerId } = useSelector(
    (state: RootState) => state.layer,
  )

  const [viewState, setViewState] = useState({
    longitude: 78.9629,
    latitude: 20.5937,
    zoom: 4,
  })

  // const mapRef = useRef<maplibregl.Map | null>(null)
  const mapRef = useRef<MapRef | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false)

  // Handle fitToLayer requests
  useEffect(() => {
    if (fitToLayerId && mapRef.current && mapLoaded) {
      const layer = layerGroups.flatMap((group) => group.layers).find((layer) => layer.id === fitToLayerId)

      if (layer?.data) {
        fitMapToLayer(layer.data)
      }

      // Clear the fit request after processing
      dispatch(clearFitToLayer())
    }
  }, [fitToLayerId, layerGroups, mapLoaded, dispatch])

  const fitMapToLayer = useCallback((geojson: any) => {
    if (!geojson || !geojson.features || geojson.features.length === 0 || !mapRef.current) {
      return
    }

    try {
      const bounds = new maplibregl.LngLatBounds()

      // Extend bounds with each feature
      geojson.features.forEach((feature: any) => {
        if (feature.geometry.type === "Point") {
          bounds.extend([feature.geometry.coordinates[0], feature.geometry.coordinates[1]])
        } else if (feature.geometry.type === "LineString") {
          feature.geometry.coordinates.forEach((coord: number[]) => {
            bounds.extend([coord[0], coord[1]])
          })
        } else if (feature.geometry.type === "Polygon") {
          feature.geometry.coordinates[0].forEach((coord: number[]) => {
            bounds.extend([coord[0], coord[1]])
          })
        } else if (feature.geometry.type === "MultiPolygon") {
          feature.geometry.coordinates.forEach((polygon: number[][][]) => {
            polygon[0].forEach((coord: number[]) => {
              bounds.extend([coord[0], coord[1]])
            })
          })
        }
      })

      // Check if bounds are valid before fitting
      if (!bounds.isEmpty()) {
        mapRef.current.fitBounds(bounds, { padding: 40 })
      }
    } catch (error) {
      console.error("Error fitting map to layer:", error)
    }
  }, [])

  const handleMapLoad = useCallback(
    (event: any) => {
      console.log("Map loaded")
      mapRef.current = event.target
      setMapLoaded(true)

      // Ensure the style is fully loaded
      mapRef.current?.once("styledata", () => {
        console.log("Map style fully loaded")
      })

      // Add click handler for features
      mapRef.current?.on("click", (e) => {
        if (!mapRef.current) return

        // Get all visible layers
        const visibleLayers = layerGroups
          .filter((group) => group.visible)
          .flatMap((group) => group.layers.filter((layer) => layer.visible))
          .map((layer) => layer.id)

        if (visibleLayers.length === 0) return

        // Validate that each layer exists in the map's style
        const existingLayers = visibleLayers.filter((layerId) => mapRef.current?.getLayer(layerId))

        if (existingLayers.length === 0) return

        // Query features at click point
        const features = mapRef.current.queryRenderedFeatures(e.point, {
          layers: existingLayers,
        })

        if (features.length > 0) {
          // Store the feature and click coordinates in Redux
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
    },
    [layerGroups, dispatch],
  )

  const renderLayers = useCallback(() => {
    return layerGroups
      .flatMap((group) =>
        group.visible
          ? group.layers.map((layer) => {
            if (!layer.visible) return null

            // Handle MBTiles layers
            if (layer.mbtilesUrl) {
              // Type-specific paint properties for MBTiles layers
              const getPaintProps = () => {
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
                    source-layer="default" // This might need to be adjusted based on your MBTiles structure
                    type={layer.mapLayerType as "circle" | "line" | "fill"} // Explicit type assertion
                    paint={getPaintProps()}
                  />
                </Source>
              )
            }

            // Handle GeoJSON layers
            if (layer.data) {
              // Type-specific paint properties for GeoJSON layers
              const getPaintProps = () => {
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

              // Use filtered data if available, otherwise use original data
              const sourceData = layer.style.filteredData || layer.data

              return (
                <Source key={layer.id} type="geojson" data={sourceData}>
                  <Layer
                    id={layer.id}
                    type={layer.mapLayerType as "circle" | "line" | "fill"} // Explicit type assertion
                    paint={getPaintProps()}
                  />
                </Source>
              )
            }

            return null
          })
          : [],
      )
      .filter(Boolean)
  }, [layerGroups])

  const getMapStyleUrl = () => {
    if (mapStyle === "dark") {
      return `${import.meta.env.VITE_SPIRO_MAPS_DARK_STYLE_API_URL}`
    } else {
      return `${import.meta.env.VITE_SPIRO_MAPS_LIGHT_STYLE_API_URL}?key=${import.meta.env.VITE_SPIRO_MAPS_STYLE_API_KEY}`
    }
  }

  const apiUrl = import.meta.env.VITE_SPIRO_MAPS_DIRECTIONS_API_URL
  const apiKey = import.meta.env.VITE_SPIRO_MAPS_DIRECTIONS_API_KEY

  return (
    <div style={{ height: "100vh" }}>
      {loading && (
        <div className="absolute inset-0 bg-black/10 z-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-md shadow-md">
            <div className="flex items-center gap-2">
              <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              <span>Loading map data...</span>
            </div>
          </div>
        </div>
      )}

      <Map
        ref={mapRef}
        mapStyle={getMapStyleUrl()}
        {...viewState}
        onMove={(evt: ViewStateChangeEvent) => setViewState(evt.viewState)}
        renderWorldCopies={false}
        attributionControl={false}
        onLoad={handleMapLoad}
      >
        <NavigationControl position="bottom-right" />
        <GeolocateControl position="bottom-right" />

        {/* Attribution */}
        {/* <AttributionControl
          compact={false}
          customAttribution={'<a href="https://www.spironet.com/">© Spiro</a>'}
          position={"bottom-right"}
        /> */}
        {/* <img className="absolute w-20 h-auto bottom-8 left-4" src={logo || "/placeholder.svg"} /> */}
        <img
          className="absolute w-20 h-auto bottom-8 left-4"
          src={logo}
          alt="Logo"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />


        {renderLayers()}

        {/* Distance and time calculator */}
        <DistanceMeasureControl mapRef={mapRef} apiUrl={apiUrl} apiKey={apiKey} />

        {/* Render popup at the clicked location */}
        {selectedFeature && (
          <Popup
            longitude={selectedFeature.coordinates[0]}
            latitude={selectedFeature.coordinates[1]}
            closeButton={true}
            closeOnClick={false}
            onClose={() => dispatch(setSelectedFeature(null))}
            anchor="bottom"
            className="feature-popup"
          >
            <FeaturePopup feature={selectedFeature.feature} maxHeight={250} />
          </Popup>
        )}
      </Map>
      {/* <LayerManager mapRef={mapRef} /> */}
      <LayerManager />
    </div>
  )
}
