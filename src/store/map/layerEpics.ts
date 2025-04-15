// import { type Epic, ofType } from "redux-observable"
// import { from, of } from "rxjs"
// import { catchError, mergeMap, withLatestFrom } from "rxjs/operators"
// import type { RootState } from "../index"
// import { fetchFileGeoJSON, loadSelectedFilesAsLayers, addLayerFromGeoJSON } from "./layerSlice"

// // Epic for fetching GeoJSON for a file
// const fetchFileGeoJSONEpic: Epic<any, any, RootState> = (action$, state$) =>
//   action$.pipe(
//     ofType(fetchFileGeoJSON.type),
//     mergeMap((action) => {
//       const fileId = action.payload
//       return from(
//         fetch(`${import.meta.env.VITE_PUBLIC_BACKEND_API_URL}files/${fileId}/geojson`).then((response) => {
//           if (!response.ok) {
//             throw new Error(`Failed to fetch GeoJSON: ${response.status} ${response.statusText}`)
//           }
//           return response.json()
//         // })
//       ).pipe(
//         withLatestFrom(state$),
//         mergeMap(([geoJSON, state]) => {
//           // Find the file in the state to get its name
//           const file = state.file.files.find((f) => f.id === fileId)
//           const fileName = file?.name || `File ${fileId}`

//           return of(addLayerFromGeoJSON({ fileId, geoJSON, fileName }))
//         }),
//         catchError((error) => {
//           console.error(`Error fetching GeoJSON for file ${fileId}:`, error)
//           return of({ type: "layer/fetchFileGeoJSON/error", payload: { fileId, error: error.toString() } })
//         }),
//       )
//     }),
//   )

// // Epic for loading selected files as layers
// const loadSelectedFilesAsLayersEpic: Epic<any, any, RootState> = (action$, state$) =>
//   action$.pipe(
//     ofType(loadSelectedFilesAsLayers.type),
//     mergeMap((action) => {
//       const fileIds = action.payload

//       // Create an array of actions to fetch GeoJSON for each file
//       const fetchActions = fileIds.map((fileId) => fetchFileGeoJSON(fileId))

//       return of(...fetchActions)
//     }),
//   )

// export const layerEpics = [fetchFileGeoJSONEpic, loadSelectedFilesAsLayersEpic]
