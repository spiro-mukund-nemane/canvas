import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { LayerGroup, Layer, LayerStyle, FeatureInfo } from "../../components/map/map-types"
import { v4 as uuidv4 } from "uuid"

// Helper function to determine geometry type from GeoJSON or TileJSON
function detectGeometryType(data: any, geometryType?: string): "Point" | "Line" | "Polygon" {
  // If geometry type is provided from API, use it
  if (geometryType) {
    if (geometryType.toLowerCase().includes("point")) return "Point"
    if (geometryType.toLowerCase().includes("line")) return "Line"
    if (geometryType.toLowerCase().includes("polygon")) return "Polygon"
  }

  // Fallback to GeoJSON detection
  if (data?.features && data.features.length > 0) {
    const firstFeature = data.features[0]
    const geomType = firstFeature.geometry?.type

    if (geomType?.includes("Point")) return "Point"
    if (geomType?.includes("Line")) return "Line"
    if (geomType?.includes("Polygon")) return "Polygon"
  }

  return "Point" // default fallback
}

// Helper function to map geometry type to MapLibre layer type
function getMapLibreLayerType(geometryType: "Point" | "Line" | "Polygon"): "circle" | "line" | "fill" {
  switch (geometryType) {
    case "Point":
      return "circle"
    case "Line":
      return "line"
    case "Polygon":
      return "fill"
    default:
      return "circle"
  }
}

// Generate a random color
function getRandomColor() {
  return `#${Math.floor(Math.random() * 16777215)
    .toString(16)
    .padEnd(6, "0")}`
}
function getRandomStrokeColor() {
  return `#${Math.floor(Math.random() * 16777215)
    .toString(16)
    .padEnd(6, "0")}`
}

interface LayerState {
  layerGroups: LayerGroup[]
  selectedLayerId: string | null
  loading: boolean
  error: string | null
  selectedFeature: FeatureInfo | null
  mapStyle: "light" | "dark"
  fitToLayerId: string | null
}

const initialState: LayerState = {
  layerGroups: [],
  selectedLayerId: null,
  loading: false,
  error: null,
  selectedFeature: null,
  mapStyle: "light",
  fitToLayerId: null,
}

const layerSlice = createSlice({
  name: "layer",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setLayerGroups: (state, action: PayloadAction<LayerGroup[]>) => {
      state.layerGroups = action.payload
    },
    setSelectedLayerId: (state, action: PayloadAction<string | null>) => {
      state.selectedLayerId = action.payload
    },
    toggleLayerVisibility: (state, action: PayloadAction<string>) => {
      const layerId = action.payload
      state.layerGroups = state.layerGroups.map((group) => ({
        ...group,
        layers: group.layers.map((layer) => (layer.id === layerId ? { ...layer, visible: !layer.visible } : layer)),
      }))
    },
    toggleGroupVisibility: (state, action: PayloadAction<string>) => {
      const groupId = action.payload
      state.layerGroups = state.layerGroups.map((group) => {
        if (group.id === groupId) {
          const newVisibility = !group.visible
          return {
            ...group,
            visible: newVisibility,
            layers: group.layers.map((layer) => ({ ...layer, visible: newVisibility })),
          }
        }
        return group
      })
    },
    updateLayerStyle: (state, action: PayloadAction<{ layerId: string; style: Partial<LayerStyle> }>) => {
      const { layerId, style } = action.payload
      state.layerGroups = state.layerGroups.map((group) => ({
        ...group,
        layers: group.layers.map((layer) =>
          layer.id === layerId ? { ...layer, style: { ...layer.style, ...style } } : layer,
        ),
      }))
    },
    deleteLayer: (state, action: PayloadAction<string>) => {
      const layerId = action.payload
      state.layerGroups = state.layerGroups
        .map((group) => ({
          ...group,
          layers: group.layers.filter((layer) => layer.id !== layerId),
        }))
        .filter((group) => group.layers.length > 0)

      if (state.selectedLayerId === layerId) {
        state.selectedLayerId = null
      }
    },
    deleteGroup: (state, action: PayloadAction<string>) => {
      const groupId = action.payload
      const groupToDelete = state.layerGroups.find((g) => g.id === groupId)

      if (groupToDelete && state.selectedLayerId) {
        const layerInGroup = groupToDelete.layers.find((l) => l.id === state.selectedLayerId)
        if (layerInGroup) {
          state.selectedLayerId = null
        }
      }

      state.layerGroups = state.layerGroups.filter((group) => group.id !== groupId)
    },
    createGroup: (state, action: PayloadAction<{ layerIds: string[]; groupName: string }>) => {
      const { layerIds, groupName } = action.payload

      // Find all layers that should be moved to the new group
      const layersToMove: Layer[] = []

      state.layerGroups = state.layerGroups
        .map((group) => {
          const remainingLayers = group.layers.filter((layer) => {
            if (layerIds.includes(layer.id)) {
              layersToMove.push(layer)
              return false
            }
            return true
          })

          return {
            ...group,
            layers: remainingLayers,
          }
        })
        .filter((group) => group.layers.length > 0)

      // Create the new group
      if (layersToMove.length > 0) {
        state.layerGroups.push({
          id: `group-${Date.now()}`,
          name: groupName,
          visible: true,
          layers: layersToMove,
        })
      }
    },
    renameGroup: (state, action: PayloadAction<{ groupId: string; newName: string }>) => {
      const { groupId, newName } = action.payload
      state.layerGroups = state.layerGroups.map((group) => (group.id === groupId ? { ...group, name: newName } : group))
    },
    renameLayer: (state, action: PayloadAction<{ layerId: string; newName: string }>) => {
      const { layerId, newName } = action.payload
      state.layerGroups = state.layerGroups.map((group) => ({
        ...group,
        layers: group.layers.map((layer) => (layer.id === layerId ? { ...layer, name: newName } : layer)),
      }))
    },
    reorderLayers: (state, action: PayloadAction<{ groupId: string; startIndex: number; endIndex: number }>) => {
      const { groupId, startIndex, endIndex } = action.payload
      const groupIndex = state.layerGroups.findIndex((g) => g.id === groupId)

      if (groupIndex !== -1) {
        const group = state.layerGroups[groupIndex]
        const layers = [...group.layers]
        const [removed] = layers.splice(startIndex, 1)
        layers.splice(endIndex, 0, removed)

        state.layerGroups[groupIndex] = {
          ...group,
          layers,
        }
      }
    },
    addUploadedLayer: (
      state,
      action: PayloadAction<{
        geoJSON?: any
        fileName: string
        mbtilesUrl?: string
        layerType?: "geojson" | "mbtiles" | "vector-tiles"| "project-tiles"
        tileJson?: any,
        fileId?: string
        geometryType?: string
      }>,
    ) => {
      const { geoJSON, fileName, mbtilesUrl,tileJson, layerType = "geojson", fileId,geometryType } = action.payload
      let newLayerId = ""

      // For Vector Tiles layers (new preferred method)
      if (layerType === "vector-tiles" && tileJson) {
        newLayerId = `layer-${uuidv4()}`

        // Detect geometry type from TileJSON or use provided type
        const detectedGeometryType = detectGeometryType(null, geometryType)
        const mapLayerType = getMapLibreLayerType(detectedGeometryType)

        const newLayer: Layer = {
          id: newLayerId,
          name: fileName.replace(/\.[^/.]+$/, ""),
          geometryType: detectedGeometryType,
          mapLayerType,
          visible: true,
          tileJson,
          style: {
            size: 6,
            color: getRandomColor(),
            opacity: 0.8,
            stroke: getRandomStrokeColor(),
            strokeWidth: 0.5,
          },
          fileId,
        }

        // Find or create the "Uploaded" group
        const uploadedGroupIndex = state.layerGroups.findIndex((g) => g.id === "uploaded")

        if (uploadedGroupIndex !== -1) {
          state.layerGroups[uploadedGroupIndex].layers.push(newLayer)
        } else {
          state.layerGroups.push({
            id: "uploaded",
            name: "Uploaded Layers",
            visible: true,
            layers: [newLayer],
          })
        }
      }
      // For Project composite tiles
      else if (layerType === "project-tiles" && tileJson) {
        newLayerId = `project-layer-${uuidv4()}`

        const newLayer: Layer = {
          id: newLayerId,
          name: fileName,
          geometryType: "Polygon", // Mixed geometry, default to polygon
          mapLayerType: "fill",
          visible: true,
          tileJson,
          style: {
            size: 6,
            color: getRandomColor(),
            opacity: 0.8,
            stroke: getRandomStrokeColor(),
            strokeWidth: 0.5,
          },
          fileId,
        }

        // Find or create the "Project Layers" group
        const projectGroupIndex = state.layerGroups.findIndex((g) => g.id === "project-layers")

        if (projectGroupIndex !== -1) {
          state.layerGroups[projectGroupIndex].layers.push(newLayer)
        } else {
          state.layerGroups.push({
            id: "project-layers",
            name: "Project Layers",
            visible: true,
            layers: [newLayer],
          })
        }
      }

      // For MBTiles layers
      else if (layerType === "mbtiles" && mbtilesUrl) {
        newLayerId = `layer-${uuidv4()}`
        const newLayer: Layer = {
          id: newLayerId,
          name: fileName.replace(/\.[^/.]+$/, ""),
          geometryType: "Polygon", // Default for vector tiles
          mapLayerType: "fill", // Default to fill, but could be any vector type
          visible: true,
          mbtilesUrl,
          style: {
            size: 6,
            color: getRandomColor(),
            opacity: 0.8,
            stroke: getRandomStrokeColor(),
            strokeWidth: 0.5,
          },
          fileId,
        }

        // Find or create the "Uploaded" group
        const uploadedGroupIndex = state.layerGroups.findIndex((g) => g.id === "uploaded")

        if (uploadedGroupIndex !== -1) {
          state.layerGroups[uploadedGroupIndex].layers.push(newLayer)
        } else {
          state.layerGroups.push({
            id: "uploaded",
            name: "Uploaded Layers",
            visible: true,
            layers: [newLayer],
          })
        }
      }
      // For GeoJSON layers (fallback)
      else if (geoJSON) {
        // Detect geometry type
        const detectedGeometryType = detectGeometryType(geoJSON,geometryType)
        const mapLayerType = getMapLibreLayerType(detectedGeometryType)

        // Generate a random color
        const randomColor = getRandomColor()
        const randomStrokeColor = getRandomStrokeColor()

        // Create a new layer
        newLayerId = `layer-${uuidv4()}`
        const newLayer: Layer = {
          id: newLayerId,
          name: fileName.replace(/\.[^/.]+$/, ""),
          geometryType: detectedGeometryType,
          mapLayerType,
          visible: true,
          data: geoJSON,
          style: {
            size: 6,
            color: randomColor,
            opacity: 0.8,
            stroke: randomStrokeColor,
            strokeWidth: 0.5,
          },
          fileId,
        }

        // Find or create the "Uploaded" group
        const uploadedGroupIndex = state.layerGroups.findIndex((g) => g.id === "uploaded")

        if (uploadedGroupIndex !== -1) {
          state.layerGroups[uploadedGroupIndex].layers.push(newLayer)
        } else {
          state.layerGroups.push({
            id: "uploaded",
            name: "Uploaded Layers",
            visible: true,
            layers: [newLayer],
          })
        }
      }
    },
    setSelectedFeature: (state, action: PayloadAction<FeatureInfo | null>) => {
      state.selectedFeature = action.payload
    },
    toggleMapStyle: (state) => {
      state.mapStyle = state.mapStyle === "light" ? "dark" : "light"
      // Save preference to localStorage
      localStorage.setItem("mapStyle", state.mapStyle)
    },
    setMapStyle: (state, action: PayloadAction<"light" | "dark">) => {
      state.mapStyle = action.payload
    },
    fitToLayer: (state, action: PayloadAction<string>) => {
      state.fitToLayerId = action.payload
    },
    clearFitToLayer: (state) => {
      state.fitToLayerId = null
    },
  },
})

export const {
  setLoading,
  setLayerGroups,
  setSelectedLayerId,
  toggleLayerVisibility,
  toggleGroupVisibility,
  updateLayerStyle,
  deleteLayer,
  deleteGroup,
  createGroup,
  renameGroup,
  renameLayer,
  reorderLayers,
  addUploadedLayer,
  setSelectedFeature,
  toggleMapStyle,
  setMapStyle,
  fitToLayer,
  clearFitToLayer,
} = layerSlice.actions

export default layerSlice.reducer
