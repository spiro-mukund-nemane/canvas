import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import type { LayerGroup, Layer, LayerStyle } from "../../components/map/map-types"
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

export interface FeatureInfo {
  feature: any
  coordinates: [number, number]
}

interface LayerState {
  layerGroups: LayerGroup[]
  selectedLayerId: string | null
  loading: boolean
  error: string | null
  selectedFeature: FeatureInfo | null
  mapStyle: "light" | "dark"
  selectedFileIds: number[]
}

const initialState: LayerState = {
  layerGroups: [],
  selectedLayerId: null,
  loading: false,
  error: null,
  selectedFeature: null,
  mapStyle: "light",
  selectedFileIds: [],
}

// Async thunks
export const fetchFileGeoJSON = createAsyncThunk("layer/fetchFileGeoJSON", async (fileId: number, { getState }) => {
  const response = await fetch(`${import.meta.env.VITE_PUBLIC_BACKEND_API_URL}files/${fileId}/geojson`)
  if (!response.ok) {
    throw new Error(`Failed to fetch GeoJSON: ${response.status} ${response.statusText}`)
  }
  const geoJSON = await response.json()

  // Find the file in the state to get its name
  const state = getState() as any
  const file = state.file.files.find((f: any) => f.id === fileId)
  const fileName = file?.name || `File ${fileId}`

  return { fileId, geoJSON, fileName }
})

export const loadSelectedFilesAsLayers = createAsyncThunk(
  "layer/loadSelectedFilesAsLayers",
  async (fileIds: number[], { dispatch }) => {
    dispatch(setLoading(true))

    try {
      // Create an array of promises to fetch GeoJSON for each file
      const promises = fileIds.map((fileId) => dispatch(fetchFileGeoJSON(fileId)))

      // Wait for all promises to resolve
      await Promise.all(promises)

      return fileIds
    } finally {
      dispatch(setLoading(false))
    }
  },
)

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
    addUploadedLayer: (state, action: PayloadAction<{ geoJSON: any; fileName: string }>) => {
      const { geoJSON, fileName } = action.payload

      // Detect geometry type
      const geometryType = detectGeometryType(geoJSON)
      const mapLayerType = getMapLibreLayerType(geometryType)

      // Generate a random color
      const randomColor = getRandomColor()
      const randomStrokeColor = getRandomStrokeColor()

      // Create a new layer
      const newLayer: Layer = {
        id: `layer-${uuidv4()}`,
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
    setSelectedFileIds: (state, action: PayloadAction<number[]>) => {
      state.selectedFileIds = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch File GeoJSON
      .addCase(fetchFileGeoJSON.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchFileGeoJSON.fulfilled, (state, action) => {
        const { fileId, geoJSON, fileName } = action.payload

        // Detect geometry type
        const geometryType = detectGeometryType(geoJSON)
        const mapLayerType = getMapLibreLayerType(geometryType)

        // Generate a random color
         // Generate a random color
      const randomColor = getRandomColor()
      const randomStrokeColor = getRandomStrokeColor()


        // Create a new layer
        const newLayer: Layer = {
          id: `layer-${fileId}`,
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

        // Find or create the "Selected Files" group
        const selectedFilesGroupIndex = state.layerGroups.findIndex((g) => g.id === "selected-files")

        if (selectedFilesGroupIndex !== -1) {
          // Check if layer with this fileId already exists
          const existingLayerIndex = state.layerGroups[selectedFilesGroupIndex].layers.findIndex(
            (layer) => layer.fileId === fileId,
          )

          if (existingLayerIndex !== -1) {
            // Update existing layer
            state.layerGroups[selectedFilesGroupIndex].layers[existingLayerIndex] = newLayer
          } else {
            // Add new layer at the beginning of the array (so it renders on top)
            state.layerGroups[selectedFilesGroupIndex].layers.unshift(newLayer)
          }
        } else {
          // Create new group with this layer
          state.layerGroups.push({
            id: "selected-files",
            name: "Selected Files",
            visible: true,
            layers: [newLayer],
          })
        }
      })
      .addCase(fetchFileGeoJSON.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to fetch GeoJSON"
      })
      // Load Selected Files As Layers
      .addCase(loadSelectedFilesAsLayers.pending, (state) => {
        state.loading = true
      })
      .addCase(loadSelectedFilesAsLayers.fulfilled, (state, action) => {
        state.loading = false
        state.selectedFileIds = action.payload
      })
      .addCase(loadSelectedFilesAsLayers.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to load selected files"
      })
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
  setSelectedFileIds,
} = layerSlice.actions

export default layerSlice.reducer
