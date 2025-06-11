import { configureStore } from "@reduxjs/toolkit"
import projectReducer from "./project/projectSlice"
// import fileReducer from "./file/fileSlice"
import layerReducer from "./map/layerSlice"
import measurementReducer from "./map/measurementSlice";
// import analysisReducer from './analysis/analysisSlice'

// Configure the Redux store
const store = configureStore({
  reducer: {
    project: projectReducer,
    // file: fileReducer,
    layer: layerReducer,
    // analysis: analysisReducer,
    measurement: measurementReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ["file/uploadFile", "file/addTempFile", "layer/setSelectedFeature"],
        // Ignore these field paths in all actions
        ignoredActionPaths: ["payload.file", "payload.files", "payload.feature", "meta.arg.file", "meta.arg.files"],
        // Ignore these paths in the state
        ignoredPaths: ["file.files", "file.files.file", "layer.selectedFeature"],
      },
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store
