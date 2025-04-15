// import { type Epic, ofType } from "redux-observable"
// import { from, of } from "rxjs"
// import { catchError, filter, map, mergeMap, switchMap, takeUntil } from "rxjs/operators"
// import type { RootState } from "../index"
// import {
//   fetchFiles,
//   uploadFile,
//   deleteFile,
//   getFileMetadata,
//   getFileGeoJSON,
//   setFiles,
//   setFileLoading,
//   setFileError,
//   addTempFile,
//   updateFile,
//   removeFile,
//   updateFileMetadata,
//   updateFileGeoJSON,
// } from "./fileSlice"

// // Epic for fetching files
// const fetchFilesEpic: Epic<any, any, RootState> = (action$) =>
//   action$.pipe(
//     ofType(fetchFiles.type),
//     switchMap((action) => {
//       const projectId = action.payload

//       // Set loading state to true
//       return of(setFileLoading(true)).pipe(
//         mergeMap(() => {
//           console.log(`Fetching files for project ID: ${projectId}`)

//           return from(
//             fetch(`${import.meta.env.VITE_PUBLIC_BACKEND_API_URL}files?project_id=${projectId}`).then((response) => {
//               if (!response.ok) {
//                 throw new Error(`Failed to fetch files: ${response.status} ${response.statusText}`)
//               }
//               return response.json()
//             }),
//           ).pipe(
//             map((data) => {
//               console.log("API response for files:", data)

//               // Transform the API response to match our FileEntry structure
//               const files = []

//               // Handle different possible response structures
//               const fileArray = Array.isArray(data) ? data : data.files && Array.isArray(data.files) ? data.files : []

//               fileArray.forEach((file: any) => {
//                 files.push({
//                   id: file.id || Date.now() + Math.random(),
//                   name: file.name || file.filename || "Unnamed File",
//                   file_type: file.file_type || file.fileType || (file.name ? file.name.split(".").pop() : "unknown"),
//                   size: file.size || "Unknown",
//                   country: file.country || "",
//                   region: file.region || "",
//                   uploaded_by: file.uploaded_by || "current_user",
//                   uploaded_at: new Date().toISOString(),
//                   feature_type: file.feature_type || "",
//                   updated_at: new Date().toISOString(),
//                   file_layer_type: file.file_layer_type || file.layerType || "default",
//                   normalized: file.normalized || false,
//                   selected: false,
//                   status: "uploaded",
//                 })
//               })

//               console.log("Transformed files:", files)
//               return of(setFiles(files), setFileLoading(false))
//             }),
//             mergeMap((actions) => actions), // Flatten the observable of actions
//             catchError((error) => {
//               console.error("Error fetching files:", error)
//               return of(setFileError(error.toString()), setFileLoading(false))
//             }),
//           )
//         }),
//       )
//     }),
//   )

// // Epic for uploading files
// const uploadFileEpic: Epic<any, any, RootState> = (action$) =>
//   action$.pipe(
//     ofType(uploadFile.type),
//     mergeMap((action) => {
//       const { projectId, files, fileLayerType, country, region, normalized } = action.payload

//       // Get the main file (for display purposes)
//       const mainFile = files[0]

//       // Create a temporary file entry with uploading status
//       const tempId = Date.now()
//       const tempFile = {
//         id: tempId,
//         name: mainFile.name,
//         file_type: mainFile.name.split(".").pop() || "",
//         size: `${(mainFile.size / 1024 / 1024).toFixed(2)}MB`,
//         country,
//         region,
//         uploaded_by: "current_user",
//         uploaded_at: new Date().toISOString(),
//         feature_type: "",
//         updated_at: new Date().toISOString(),
//         file_layer_type: fileLayerType,
//         normalized,
//         file: mainFile,
//         status: "uploading",
//         selected: false,
//       }

//       console.log("Adding temp file:", tempFile)

//       // First add the temporary file to the state
//       return of(addTempFile(tempFile)).pipe(
//         mergeMap(() => {
//           const formData = new FormData()

//           // Add all files to the form data
//           files.forEach((file) => {
//             formData.append("files", file)
//           })

//           formData.append("project_id", projectId.toString())
//           formData.append("file_layer_type", fileLayerType)
//           formData.append("country", country)
//           formData.append("region", region)
//           formData.append("normalized", normalized.toString())

//           return from(
//             fetch(`${import.meta.env.VITE_PUBLIC_BACKEND_API_URL}files/upload`, {
//               method: "POST",
//               body: formData,
//             }).then((response) => {
//               if (!response.ok) {
//                 throw new Error("Failed to upload file")
//               }
//               return response.json()
//             }),
//           ).pipe(
//             map((data) => {
//               return updateFile({
//                 id: tempId,
//                 changes: {
//                   ...data,
//                   status: "uploaded",
//                 },
//               })
//             }),
//             catchError((error) => {
//               console.error("Upload error:", error)
//               return of(updateFile({ id: tempId, changes: { status: "failed" } }), setFileError(error.toString()))
//             }),
//             takeUntil(
//               action$.pipe(
//                 ofType(uploadFile.type),
//                 filter((cancelAction) => cancelAction.payload.tempId === tempId),
//               ),
//             ),
//           )
//         }),
//       )
//     }),
//   )

// // Epic for deleting files
// const deleteFileEpic: Epic<any, any, RootState> = (action$) =>
//   action$.pipe(
//     ofType(deleteFile.type),
//     mergeMap((action) => {
//       const fileId = action.payload
//       return from(
//         fetch(`${import.meta.env.VITE_PUBLIC_BACKEND_API_URL}files/${fileId}`, {
//           method: "DELETE",
//         }).then((response) => {
//           if (!response.ok) {
//             throw new Error("Failed to delete file")
//           }
//           return fileId
//         }),
//       ).pipe(
//         map((fileId) => removeFile(fileId)),
//         catchError((error) => of(setFileError(error.toString()))),
//       )
//     }),
//   )

// // Epic for getting file metadata
// const getFileMetadataEpic: Epic<any, any, RootState> = (action$) =>
//   action$.pipe(
//     ofType(getFileMetadata.type),
//     mergeMap((action) => {
//       const fileId = action.payload
//       return from(
//         fetch(`${import.meta.env.VITE_PUBLIC_BACKEND_API_URL}files/${fileId}/metadata`).then((response) => {
//           if (!response.ok) {
//             throw new Error("Failed to get file metadata")
//           }
//           return response.json()
//         }),
//       ).pipe(
//         map((data) => updateFileMetadata({ fileId, metadata: data })),
//         catchError((error) => of(setFileError(error.toString()))),
//       )
//     }),
//   )

// // Epic for getting file GeoJSON
// const getFileGeoJSONEpic: Epic<any, any, RootState> = (action$) =>
//   action$.pipe(
//     ofType(getFileGeoJSON.type),
//     mergeMap((action) => {
//       const fileId = action.payload
//       return from(
//         fetch(`${import.meta.env.VITE_PUBLIC_BACKEND_API_URL}files/${fileId}/geojson`).then((response) => {
//           if (!response.ok) {
//             throw new Error("Failed to get file GeoJSON")
//           }
//           return response.json()
//         }),
//       ).pipe(
//         map((data) => updateFileGeoJSON({ fileId, geojson: data })),
//         catchError((error) => of(setFileError(error.toString()))),
//       )
//     }),
//   )

// export const fileEpics = [fetchFilesEpic, uploadFileEpic, deleteFileEpic, getFileMetadataEpic, getFileGeoJSONEpic]
