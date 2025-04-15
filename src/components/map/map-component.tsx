"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import {
  Map,
  NavigationControl,
  Source,
  GeolocateControl,
  Layer,
  AttributionControl,
  type ViewStateChangeEvent,
  Popup,
} from "react-map-gl/maplibre"
import logo from "../../assets/spiroMapsLogo.png"
import "maplibre-gl/dist/maplibre-gl.css"
import maplibregl from "maplibre-gl"
import { LayerManager } from "./layer-manager"
import { useSelector, useDispatch } from "react-redux"
import type { RootState, AppDispatch } from "../../store"
import {
  loadSelectedFilesAsLayers,
  setSelectedFeature,toggleMapStyle
} from "../../store/map/layerSlice"

export default function MapComponent() {
  const dispatch = useDispatch<AppDispatch>()
  const { files } = useSelector((state: RootState) => state.file)
  const { layerGroups, loading, selectedLayerId, selectedFeature, mapStyle } = useSelector(
    (state: RootState) => state.layer,
  )

  const [viewState, setViewState] = useState({
    longitude: 78.9629,
    latitude: 20.5937,
    zoom: 4,
  })

  const mapRef = useRef<maplibregl.Map | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)

  // // Load layers from localStorage on component mount
  // useEffect(() => {
  //   // dispatch(loadLayersFromLocalStorage())

  //   // Load map style preference
  //   const savedMapStyle = localStorage.getItem("mapStyle")
  //   if (savedMapStyle && (savedMapStyle === "light" || savedMapStyle === "dark")) {
  //     dispatch(toggleMapStyle(savedMapStyle))
  //   }
  // }, [dispatch])

  // Load selected files as layers when component mounts or selection changes
  useEffect(() => {
    const selectedFiles = files.filter((file) => file.selected)
    console.log("Selected files for visualization:", selectedFiles)

    if (selectedFiles.length > 0 && mapLoaded) {
      console.log("Loading selected files as layers")
      const fileIds = selectedFiles.map((file) => file.id)
      dispatch(loadSelectedFilesAsLayers(fileIds))
    }
  }, [dispatch, files, mapLoaded])

  // // Save layers to localStorage when they change
  // useEffect(() => {
  //   if (layerGroups.length > 0) {
  //     dispatch(saveLayersToLocalStorage())
  //   }
  // }, [layerGroups, dispatch])

  // Fit map to layers when they change
  useEffect(() => {
    if (layerGroups.length > 0 && mapRef.current && !loading) {
      console.log("Layer groups updated:", layerGroups)
      // Find the first visible layer with data
      for (const group of layerGroups) {
        if (group.visible) {
          for (const layer of group.layers) {
            if (layer.visible && layer.data) {
              console.log("Fitting map to layer:", layer.name)
              fitMapToLayer(layer.data)
              return
            }
          }
        }
      }
    }
  }, [layerGroups, loading])

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

      // Add click handler for features
      mapRef.current.on("click", (e) => {
        if (!mapRef.current) return

        // Get all visible layers
        const visibleLayers = layerGroups
          .filter((group) => group.visible)
          .flatMap((group) => group.layers.filter((layer) => layer.visible))
          .map((layer) => layer.id)

        if (visibleLayers.length === 0) return

        // Query features at click point
        const features = mapRef.current.queryRenderedFeatures(e.point, {
          layers: visibleLayers,
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
              if (!layer.visible || !layer.data) return null

              const layerStyle = {
                // Circle (Point) style
                "circle-radius": layer.mapLayerType === "circle" ? layer.style.size : undefined,
                "circle-color": layer.mapLayerType === "circle" ? layer.style.color : undefined,
                "circle-opacity": layer.mapLayerType === "circle" ? layer.style.opacity : undefined,
                "circle-stroke-color": layer.mapLayerType === "circle" ? layer.style.stroke : undefined,
                "circle-stroke-width": layer.mapLayerType === "circle" ? layer.style.strokeWidth : undefined,

                // Line style
                "line-color": layer.mapLayerType === "line" ? layer.style.color : undefined,
                "line-width": layer.mapLayerType === "line" ? layer.style.strokeWidth : undefined,
                "line-opacity": layer.mapLayerType === "line" ? layer.style.opacity : undefined,

                // Fill (Polygon) style
                "fill-color": layer.mapLayerType === "fill" ? layer.style.color : undefined,
                "fill-opacity": layer.mapLayerType === "fill" ? layer.style.opacity : undefined,
                "fill-outline-color": layer.mapLayerType === "fill" ? layer.style.stroke : undefined,
              }

              // Remove undefined properties
              Object.keys(layerStyle).forEach((key) => layerStyle[key] === undefined && delete layerStyle[key])

              return (
                <Source key={layer.id} type="geojson" data={layer.data}>
                  <Layer id={layer.id} type={layer.mapLayerType} paint={layerStyle} />
                </Source>
              )
            })
          : [],
      )
      .filter(Boolean)
  }, [layerGroups])

  // Get the appropriate map style URL based on the current theme
  const getMapStyleUrl = () => {
    return mapStyle === "dark"
      ? "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
      : "https://api.spiromaps.com/maps/styles/streets/style.json?key=kuyMFvcwNAFH7TBdKA0B05qtlLC4wElN"
  }

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
        <img className="absolute w-20 h-auto bottom-8 left-4" src={logo} />
        
        {renderLayers()}

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
            <div className="p-2 max-w-xs">
              <h3 className="font-bold text-sm">{selectedFeature.feature.properties?.name || "Feature Information"}</h3>
              <table className="w-full text-xs mt-1">
                <tbody>
                  {Object.entries(selectedFeature.feature.properties || {}).map(([key, value]) => (
                    <tr key={key}>
                      <td className="font-medium text-muted-foreground pr-2">{key}</td>
                      <td>{String(value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Popup>
        )}
      </Map>

      <LayerManager />
    </div>
  )
}


