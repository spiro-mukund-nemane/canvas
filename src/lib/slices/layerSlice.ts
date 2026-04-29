import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { LayerGroup, Layer, LayerStyle, FeatureInfo } from "@/lib/map-types"
import { v4 as uuidv4 } from "uuid"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function detectGeometryType(data: any, geometryType?: string): "Point" | "Line" | "Polygon" {
  if (geometryType) {
    const g = geometryType.toLowerCase()
    if (g.includes("point")) return "Point"
    if (g.includes("line")) return "Line"
    if (g.includes("polygon")) return "Polygon"
  }

  const geomType = data?.features?.[0]?.geometry?.type
  if (geomType?.includes("Point")) return "Point"
  if (geomType?.includes("Line")) return "Line"
  if (geomType?.includes("Polygon")) return "Polygon"

  return "Point"
}

function getMapLibreLayerType(geometryType: "Point" | "Line" | "Polygon"): "circle" | "line" | "fill" {
  switch (geometryType) {
    case "Point": return "circle"
    case "Line": return "line"
    case "Polygon": return "fill"
  }
}

/** FIX: was `.padEnd` which pads the right side — use `.padStart` to zero-pad on the left */
function getRandomColor(): string {
  return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0")}`
}

function buildDefaultStyle(): LayerStyle {
  return {
    size: 6,
    color: getRandomColor(),
    opacity: 0.8,
    stroke: getRandomColor(),
    strokeWidth: 0.5,
  }
}

/**
 * Find the group by id and push the layer into it, or create the group if missing.
 * Mutates `layerGroups` (safe inside Immer reducers).
 */
function upsertLayerIntoGroup(
  layerGroups: LayerGroup[],
  groupId: string,
  groupName: string,
  newLayer: Layer,
) {
  const idx = layerGroups.findIndex((g) => g.id === groupId)
  if (idx !== -1) {
    layerGroups[idx].layers.push(newLayer)
  } else {
    layerGroups.push({ id: groupId, name: groupName, visible: true, layers: [newLayer] })
  }
}

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

interface LayerState {
  layerGroups: LayerGroup[]
  selectedLayerId: string | null
  loading: boolean
  error: string | null
  selectedFeature: FeatureInfo | null
  /** "light" | "dark" — persisted to localStorage via middleware, NOT inside the reducer */
  mapStyle: "light" | "dark"
  fitToLayerId: string | null
}

const initialState: LayerState = {
  layerGroups: [],
  selectedLayerId: null,
  loading: false,
  error: null,
  selectedFeature: null,
  // Read persisted preference on init; fallback to "light"
  mapStyle: (typeof localStorage !== "undefined"
    ? (localStorage.getItem("mapStyle") as "light" | "dark") ?? "light"
    : "light"),
  fitToLayerId: null,
}

// ---------------------------------------------------------------------------
// Slice
// ---------------------------------------------------------------------------

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
      for (const group of state.layerGroups) {
        const layer = group.layers.find((l) => l.id === layerId)
        if (layer) { layer.visible = !layer.visible; break }
      }
    },

    toggleGroupVisibility: (state, action: PayloadAction<string>) => {
      const group = state.layerGroups.find((g) => g.id === action.payload)
      if (!group) return
      group.visible = !group.visible
      for (const layer of group.layers) layer.visible = group.visible
    },

    updateLayerStyle: (state, action: PayloadAction<{ layerId: string; style: Partial<LayerStyle> }>) => {
      const { layerId, style } = action.payload
      for (const group of state.layerGroups) {
        const layer = group.layers.find((l) => l.id === layerId)
        if (layer) { Object.assign(layer.style, style); break }
      }
    },

    deleteLayer: (state, action: PayloadAction<string>) => {
      const layerId = action.payload
      state.layerGroups = state.layerGroups
        .map((g) => ({ ...g, layers: g.layers.filter((l) => l.id !== layerId) }))
        .filter((g) => g.layers.length > 0)
      if (state.selectedLayerId === layerId) state.selectedLayerId = null
    },

    deleteGroup: (state, action: PayloadAction<string>) => {
      const groupId = action.payload
      const group = state.layerGroups.find((g) => g.id === groupId)
      if (group?.layers.some((l) => l.id === state.selectedLayerId)) {
        state.selectedLayerId = null
      }
      state.layerGroups = state.layerGroups.filter((g) => g.id !== groupId)
    },

    createGroup: (state, action: PayloadAction<{ layerIds: string[]; groupName: string }>) => {
      const { layerIds, groupName } = action.payload
      const layersToMove: Layer[] = []

      state.layerGroups = state.layerGroups
        .map((g) => {
          const remaining: Layer[] = []
          for (const layer of g.layers) {
            if (layerIds.includes(layer.id)) layersToMove.push(layer)
            else remaining.push(layer)
          }
          return { ...g, layers: remaining }
        })
        .filter((g) => g.layers.length > 0)

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
      const group = state.layerGroups.find((g) => g.id === action.payload.groupId)
      if (group) group.name = action.payload.newName
    },

    renameLayer: (state, action: PayloadAction<{ layerId: string; newName: string }>) => {
      const { layerId, newName } = action.payload
      for (const group of state.layerGroups) {
        const layer = group.layers.find((l) => l.id === layerId)
        if (layer) { layer.name = newName; break }
      }
    },

    reorderLayers: (state, action: PayloadAction<{ groupId: string; startIndex: number; endIndex: number }>) => {
      const { groupId, startIndex, endIndex } = action.payload
      const group = state.layerGroups.find((g) => g.id === groupId)
      if (!group) return
      const [removed] = group.layers.splice(startIndex, 1)
      group.layers.splice(endIndex, 0, removed)
    },

    addUploadedLayer: (
      state,
      action: PayloadAction<{
        geoJSON?: any
        fileName: string
        mbtilesUrl?: string
        layerType?: "geojson" | "mbtiles" | "vector-tiles" | "project-tiles"
        tileJson?: any
        fileId?: string
        geometryType?: string
      }>,
    ) => {
      const { geoJSON, fileName, mbtilesUrl, tileJson, layerType = "geojson", fileId, geometryType } = action.payload
      const baseName = fileName.replace(/\.[^/.]+$/, "")

      if (layerType === "vector-tiles" && tileJson) {
        const detectedGeometryType = detectGeometryType(null, geometryType)
        const newLayer: Layer = {
          id: `layer-${uuidv4()}`,
          name: baseName,
          geometryType: detectedGeometryType,
          mapLayerType: getMapLibreLayerType(detectedGeometryType),
          visible: true,
          tileJson,
          style: buildDefaultStyle(),
          fileId,
        }
        upsertLayerIntoGroup(state.layerGroups, "uploaded", "Uploaded Layers", newLayer)
      } else if (layerType === "project-tiles" && tileJson) {
        const newLayer: Layer = {
          id: `project-layer-${uuidv4()}`,
          name: fileName,
          geometryType: "Polygon",
          mapLayerType: "fill",
          visible: true,
          tileJson,
          style: buildDefaultStyle(),
          fileId,
        }
        upsertLayerIntoGroup(state.layerGroups, "project-layers", "Project Layers", newLayer)
      } else if (layerType === "mbtiles" && mbtilesUrl) {
        const newLayer: Layer = {
          id: `layer-${uuidv4()}`,
          name: baseName,
          geometryType: "Polygon",
          mapLayerType: "fill",
          visible: true,
          mbtilesUrl,
          style: buildDefaultStyle(),
          fileId,
        }
        upsertLayerIntoGroup(state.layerGroups, "uploaded", "Uploaded Layers", newLayer)
      } else if (geoJSON) {
        const detectedGeometryType = detectGeometryType(geoJSON, geometryType)
        const newLayer: Layer = {
          id: `layer-${uuidv4()}`,
          name: baseName,
          geometryType: detectedGeometryType,
          mapLayerType: getMapLibreLayerType(detectedGeometryType),
          visible: true,
          data: geoJSON,
          style: buildDefaultStyle(),
          fileId,
        }
        upsertLayerIntoGroup(state.layerGroups, "uploaded", "Uploaded Layers", newLayer)
      }
    },

    setSelectedFeature: (state, action: PayloadAction<FeatureInfo | null>) => {
      state.selectedFeature = action.payload
    },

    /**
     * FIX: Removed localStorage.setItem — side-effects must not live in reducers.
     * Persist from a Redux listener middleware or a useEffect in a component instead:
     *   store.subscribe(() => localStorage.setItem("mapStyle", store.getState().layer.mapStyle))
     */
    toggleMapStyle: (state) => {
      state.mapStyle = state.mapStyle === "light" ? "dark" : "light"
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

// ---------------------------------------------------------------------------
// Add this to your store setup to persist mapStyle without a side-effect in the reducer:
//
//   import { layerSlice } from './layerSlice'
//   store.subscribe(() => {
//     localStorage.setItem("mapStyle", store.getState().layer.mapStyle)
//   })
// ---------------------------------------------------------------------------
