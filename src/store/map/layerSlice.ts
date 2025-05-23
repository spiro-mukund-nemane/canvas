import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { LayerGroup, Layer, LayerStyle, FeatureInfo } from "../../components/map/map-types"
import { v4 as uuidv4 } from "uuid"

// Helper function to determine geometry type from GeoJSON
function detectGeometryType(geojson: any): "Point" | "Line" | "Polygon" {
  if (!geojson || !geojson.features || geojson.features.length === 0) {
    return "Point" // default
  }

  const firstFeature = geojson.features[0]
  const geometryType = firstFeature.geometry?.type

  if (geometryType?.includes("Point")) {
    return "Point"
  } else if (geometryType?.includes("Line")) {
    return "Line"
  } else if (geometryType?.includes("Polygon")) {
    return "Polygon"
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
        layerType?: "geojson" | "mbtiles"
        fileId?: string
      }>,
    ) => {
      const { geoJSON, fileName, mbtilesUrl, layerType = "geojson", fileId } = action.payload
      let newLayerId = ""

      // For MBTiles layers
      if (layerType === "mbtiles" && mbtilesUrl) {
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
      // For GeoJSON layers
      else if (geoJSON) {
        // Detect geometry type
        const geometryType = detectGeometryType(geoJSON)
        const mapLayerType = getMapLibreLayerType(geometryType)

        // Generate a random color
        const randomColor = getRandomColor()
        const randomStrokeColor = getRandomStrokeColor()

        // Create a new layer
        newLayerId = `layer-${uuidv4()}`
        const newLayer: Layer = {
          id: newLayerId,
          name: fileName.replace(/\.[^/.]+$/, ""),
          geometryType,
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
