// import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"

// export interface ProcessedVersion {
//   id: number
//   name: string
//   processed_type: string
//   processing_method: string
//   simplify_tolerance: number
//   processing_time: string
//   created_at: string
//   geojson_url: string
// }

// export interface FileMetadata {
//   id: number
//   name: string
//   file_type: string
//   size: string
//   country: string
//   region: string
//   uploaded_by: string
//   uploaded_at: string
//   feature_type: string
//   updated_at: string
//   file_layer_type: string
//   normalized: boolean
//   crs?: string
//   geometry_type?: string
//   feature_count?: number
//   processed_versions?: ProcessedVersion[]
//   geojson?: any // Store GeoJSON data
// }

// export interface FileEntry extends FileMetadata {
//   file?: File
//   selected: boolean
//   status: "uploading" | "uploaded" | "failed" | "processing"
// }

// interface FileState {
//   files: FileEntry[]
//   loading: boolean
//   error: string | null
//   fetchedProjects: number[] // Track which projects have had their files fetched
// }

// const initialState: FileState = {
//   files: [],
//   loading: false,
//   error: null,
//   fetchedProjects: [], // Initialize as empty array
// }

// // Async thunks
// export const fetchFiles = createAsyncThunk("file/fetchFiles", async (projectId: number) => {
//   console.log(`Fetching files for project ID: ${projectId}`)
//   const response = await fetch(`${import.meta.env.VITE_PUBLIC_BACKEND_API_URL}files?project_id=${projectId}`)
//   if (!response.ok) {
//     throw new Error(`Failed to fetch files: ${response.status} ${response.statusText}`)
//   }
//   const data = await response.json()
//   console.log("API response for files:", data)

//   // Transform the API response to match our FileEntry structure
//   const files: FileEntry[] = []

//   // Handle different possible response structures
//   const fileArray = Array.isArray(data) ? data : data.files && Array.isArray(data.files) ? data.files : []

//   fileArray.forEach((file: any) => {
//     files.push({
//       id: file.id || Date.now() + Math.random(),
//       name: file.name || file.filename || "Unnamed File",
//       file_type: file.file_type || file.fileType || (file.name ? file.name.split(".").pop() : "unknown"),
//       size: file.size || "Unknown",
//       country: file.country || "",
//       region: file.region || "",
//       uploaded_by: file.uploaded_by || "current_user",
//       uploaded_at: file.uploaded_at || new Date().toISOString(),
//       feature_type: file.feature_type || "",
//       updated_at: file.updated_at || new Date().toISOString(),
//       file_layer_type: file.file_layer_type || file.layerType || "default",
//       normalized: file.normalized || false,
//       selected: false,
//       status: "uploaded",
//     })
//   })

//   console.log("Transformed files:", files)
//   return files
// })

// export const uploadFile = createAsyncThunk(
//   "file/uploadFile",
//   async ({
//     projectId,
//     files,
//     fileLayerType,
//     country,
//     region,
//     normalized,
//   }: {
//     projectId: number
//     files: File[]
//     fileLayerType: string
//     country: string
//     region: string
//     normalized: boolean
//   }) => {
//     const formData = new FormData()

//     // Add all files to the form data
//     files.forEach((file) => {
//       formData.append("files", file)
//     })

//     formData.append("project_id", projectId.toString())
//     formData.append("file_layer_type", fileLayerType)
//     formData.append("country", country)
//     formData.append("region", region)
//     formData.append("normalized", normalized.toString())

//     const response = await fetch(`${import.meta.env.VITE_PUBLIC_BACKEND_API_URL}files/upload`, {
//       method: "POST",
//       body: formData,
//     })

//     if (!response.ok) {
//       throw new Error("Failed to upload file")
//     }

//     return await response.json()
//   },
// )

// export const deleteFile = createAsyncThunk("file/deleteFile", async (fileId: number) => {
//   const response = await fetch(`${import.meta.env.VITE_PUBLIC_BACKEND_API_URL}files/${fileId}`, {
//     method: "DELETE",
//   })
//   if (!response.ok) {
//     throw new Error("Failed to delete file")
//   }
//   return fileId
// })

// export const getFileMetadata = createAsyncThunk("file/getFileMetadata", async (fileId: number) => {
//   const response = await fetch(`${import.meta.env.VITE_PUBLIC_BACKEND_API_URL}files/${fileId}/metadata`)
//   if (!response.ok) {
//     throw new Error("Failed to get file metadata")
//   }
//   const data = await response.json()
//   return { fileId, metadata: data }
// })

// export const getFileGeoJSON = createAsyncThunk("file/getFileGeoJSON", async (fileId: number) => {
//   const response = await fetch(`${import.meta.env.VITE_PUBLIC_BACKEND_API_URL}files/${fileId}/geojson`)
//   if (!response.ok) {
//     throw new Error("Failed to get file GeoJSON")
//   }
//   const data = await response.json()
//   return { fileId, geojson: data }
// })

// const fileSlice = createSlice({
//   name: "file",
//   initialState,
//   reducers: {
//     addTempFile: (state, action: PayloadAction<FileEntry>) => {
//       state.files.push(action.payload)
//     },
//     updateFile: (state, action: PayloadAction<{ id: number; changes: Partial<FileEntry> }>) => {
//       const { id, changes } = action.payload
//       const fileIndex = state.files.findIndex((file) => file.id === id)
//       if (fileIndex !== -1) {
//         state.files[fileIndex] = { ...state.files[fileIndex], ...changes }
//       }
//     },
//     removeTempFile: (state, action: PayloadAction<number>) => {
//       state.files = state.files.filter((file) => file.id !== action.payload)
//     },
//     setSelectedFiles: (state, action: PayloadAction<number[]>) => {
//       state.files.forEach((file) => {
//         file.selected = action.payload.includes(file.id)
//       })
//     },
//     clearSelectedFiles: (state) => {
//       state.files.forEach((file) => {
//         file.selected = false
//       })
//     },
//     // Add this new action to reset the fetchedProjects array
//     resetFetchedProjects: (state) => {
//       state.fetchedProjects = []
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       // Fetch Files
//       .addCase(fetchFiles.pending, (state) => {
//         state.loading = true
//         state.error = null
//       })
//       .addCase(fetchFiles.fulfilled, (state, action) => {
//         state.loading = false
//         state.files = action.payload

//         // Add the project ID to fetchedProjects if not already there
//         const projectId = action.meta.arg
//         if (!state.fetchedProjects.includes(projectId)) {
//           state.fetchedProjects.push(projectId)
//         }
//       })
//       .addCase(fetchFiles.rejected, (state, action) => {
//         state.loading = false
//         state.error = action.error.message || "Failed to fetch files"
//       })
//       // Upload File
//       .addCase(uploadFile.fulfilled, (state, action) => {
//         // Find and replace temp file if it exists
//         const tempIndex = state.files.findIndex(
//           (file) => file.name === action.payload.name && file.status === "uploading",
//         )

//         if (tempIndex !== -1) {
//           state.files[tempIndex] = {
//             ...state.files[tempIndex],
//             ...action.payload,
//             status: "uploaded",
//           }
//         } else {
//           state.files.push({
//             ...action.payload,
//             selected: false,
//             status: "uploaded",
//           })
//         }
//       })
//       // Delete File
//       .addCase(deleteFile.fulfilled, (state, action) => {
//         state.files = state.files.filter((file) => file.id !== action.payload)
//       })
//       // Get File Metadata
//       .addCase(getFileMetadata.fulfilled, (state, action) => {
//         const { fileId, metadata } = action.payload
//         const fileIndex = state.files.findIndex((file) => file.id === fileId)
//         if (fileIndex !== -1) {
//           state.files[fileIndex] = { ...state.files[fileIndex], ...metadata }
//         }
//       })
//       // Get File GeoJSON
//       .addCase(getFileGeoJSON.fulfilled, (state, action) => {
//         const { fileId, geojson } = action.payload
//         const fileIndex = state.files.findIndex((file) => file.id === fileId)
//         if (fileIndex !== -1) {
//           state.files[fileIndex] = {
//             ...state.files[fileIndex],
//             geojson,
//           }
//         }
//       })
//   },
// })

// export const { addTempFile, updateFile, removeTempFile, setSelectedFiles, clearSelectedFiles, resetFetchedProjects } =
//   fileSlice.actions

// export default fileSlice.reducer
