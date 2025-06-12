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
      const response = await fetch(`${import.meta.env.VITE_PUBLIC_BACKEND_API_URL}files/upload?key=${import.meta.env.VITE_PUBLIC_BACKEND_API_KEY}`, {
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
      if (displayName.toLowerCase().endsWith(".mbtiles")) {
        dispatch(
          addUploadedLayer({
            mbtilesUrl: `${import.meta.env.VITE_PUBLIC_BACKEND_API_URL}files/mbtiles/${fileId}?key=${import.meta.env.VITE_PUBLIC_BACKEND_API_KEY}`,
            fileName: displayName,
            layerType: "mbtiles",
            fileId,
          }),
        )
        return data
      }

      // For other geo files, fetch the GeoJSON data
      const geoJsonResponse = await fetch(`${import.meta.env.VITE_PUBLIC_BACKEND_API_URL}files/geojson/by-id/${fileId}?key=${import.meta.env.VITE_PUBLIC_BACKEND_API_KEY}`)

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
        }),
      )

      return data
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
  },
})

export const { resetUploadState } = uploadSlice.actions
export default uploadSlice.reducer
