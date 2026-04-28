import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { addUploadedLayer } from "./layerSlice"

interface UploadState {
  isUploading: boolean
  error: string | null
}

const initialState: UploadState = {
  isUploading: false,
  error: null,
}

const baseUrl = import.meta.env.VITE_PUBLIC_BACKEND_API_URL;
const apiKey = import.meta.env.VITE_PUBLIC_BACKEND_API_KEY;
const isProd = import.meta.env.MODE === "production";

const withKey = (url: string) => isProd ? `${url}?key=${apiKey}` : url;

// Async thunk for uploading geo files
export const uploadGeoFile = createAsyncThunk(
  "upload/uploadGeoFile",
  async ({ files, projectId }: { files: File | File[]; projectId: string }, { dispatch, rejectWithValue }) => {
    try {
      // Create FormData for file upload
      const formData = new FormData()

      // Add the project_id to the FormData
      formData.append("project_id", projectId)

      // Handle both single file and array of files
      if (Array.isArray(files)) {
        // Add each file to the FormData with the field name 'files'
        files.forEach((file) => {
          formData.append("files", file)
        })
      } else {
        // Add the single file with the field name 'files'
        formData.append("files", files)
      }

      // Make API request to backend using the new endpoint
      const response = await fetch(withKey(`${baseUrl}files/upload`), {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Upload failed with status: ${response.status}`)
      }

      // Parse response data
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || "Upload failed")
      }

      // Get the file_id from the response
      const fileId = data.file_id
      const displayName = data.display_name || "Uploaded Layer"

      // If it's an MBTiles file, add it directly
      const geometryType = data.details?.geometry_type || "Unknown"
      // Try to fetch TileJSON first
      try{
        const tileJsonResponse = await fetch(withKey(`${baseUrl}tilejson/${fileId}`))

        if (tileJsonResponse.ok){
          const tileJson = await tileJsonResponse.json()

        // Add the layer using vector tiles
        dispatch(
          addUploadedLayer({
            tileJson,
            fileName: displayName,
            layerType: "vector-tiles",
            fileId,
            geometryType,
          }),
        )
        return data
      }
      } catch (tileError){
        console.warn("Failed to fetch TileJSON, falling back to GEOJSON:", tileError)
      }

      // Fallback to GeoJSON if TileJSON fails

      // For other geo files, fetch the GeoJSON data
      try{
      const geoJsonResponse = await fetch(withKey(`${baseUrl}files/geojson/by-id/${fileId}`))

      if (!geoJsonResponse.ok) {
        throw new Error(`Failed to fetch GeoJSON data: ${geoJsonResponse.status}`)
      }

      const geoJSON = await geoJsonResponse.json()

      // Add the layer with the GeoJSON data
      dispatch(
        addUploadedLayer({
          geoJSON,
          fileName: displayName,
          fileId,
          geometryType,
        }),
      )
    } catch (geoJsonError){
      throw new Error (`Failed to fetch both TileJSON and GeoJSON: ${geoJsonError}`)
    }

      return data
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message)
      }
      return rejectWithValue("An unknown error occurred")
    }
  },
)


// New thunk to load all project layers when opening a project
export const loadProjectLayers = createAsyncThunk(
  "upload/loadProjectLayers",
  async (projectId: string, { dispatch, rejectWithValue }) => {
    try {
      // Try to fetch composite TileJSON for the entire project
      const tileJsonResponse = await fetch(
        `${import.meta.env.VITE_PUBLIC_BACKEND_API_URL}tilejson/project/${projectId}`,
      )

      if (tileJsonResponse.ok) {
        const tileJson = await tileJsonResponse.json()

        // Add composite project layer
        dispatch(
          addUploadedLayer({
            tileJson,
            fileName: `Project ${projectId}`,
            layerType: "project-tiles",
            fileId: projectId,
            geometryType: "Mixed",
          }),
        )
        return { success: true, type: "composite" }
      }

      // If composite tiles are not available, we could fetch individual files
      // This would require a separate API endpoint to list project files
      console.warn("Composite project tiles not available")
      return { success: false, message: "Composite project tiles not available" }
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message)
      }
      return rejectWithValue("An unknown error occurred")
    }
  },
)

const uploadSlice = createSlice({
  name: "upload",
  initialState,
  reducers: {
    resetUploadState: (state) => {
      state.isUploading = false
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadGeoFile.pending, (state) => {
        state.isUploading = true
        state.error = null
      })
      .addCase(uploadGeoFile.fulfilled, (state) => {
        state.isUploading = false
      })
      .addCase(uploadGeoFile.rejected, (state, action) => {
        state.isUploading = false
        state.error = (action.payload as string) || "Upload failed"
      })
      .addCase(loadProjectLayers.pending, (state) => {
        state.isUploading = true
        state.error = null
      })
      .addCase(loadProjectLayers.fulfilled, (state) => {
        state.isUploading = false
      })
      .addCase(loadProjectLayers.rejected, (state, action) => {
        state.isUploading = false
        state.error = (action.payload as string) || "Failed to load project layers"
      })
  },
})

export const { resetUploadState } = uploadSlice.actions
export default uploadSlice.reducer
