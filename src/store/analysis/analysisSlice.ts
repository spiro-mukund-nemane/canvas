// import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
// import type { FileEntry } from "../file/fileSlice"

// export interface NormalizationConfig {
//   [key: string]: number | null | undefined // Allow for dynamic keys
// }

// export interface WeightsConfig {
//   population_score: number
//   roads_score: number
//   landuse_score: number
//   building_score: number
//   pois_score: number
//   transport_score: number
//   traffic_score: number
//   [key: string]: number // Allow for dynamic keys
// }

// export interface IsochroneConfig {
//   api: string
//   isochroneDistance: number[]
//   overlapPercentage: number
//   maxScoreValue: number
//   sortAttribute: string
// }

// export interface AnalysisConfig {
//   normalization: NormalizationConfig
//   boundaryShape?: number | null
//   outputFolder: string
//   divideBoundaryByAttribute?: string
//   generateIsochrone: boolean
//   saveIntermediateOutput: boolean
//   weights: WeightsConfig
//   isochroneConfig: IsochroneConfig
// }

// export interface OutputFile {
//   path: string
//   name: string
//   type: string
// }

// export interface AnalysisResult {
//   id: string
//   name: string
//   generatedTimeDate: string
//   status: "pending" | "completed" | "failed"
//   outputFiles: string[]
//   inputConfig: any
//   executionTime: string
//   requestedBy: string
//   notes?: string
// }

// interface AnalysisState {
//   config: AnalysisConfig
//   loading: boolean
//   error: string | null
//   success: boolean
//   availableFiles: Record<string, FileEntry[]> // Files categorized by layer type
//   currentStep: number
//   results: AnalysisResult[]
//   currentResult: AnalysisResult | null
// }

// const initialState: AnalysisState = {
//   config: {
//     normalization: {},
//     outputFolder: "./data/output/",
//     generateIsochrone: false,
//     saveIntermediateOutput: true,
//     weights: {
//       population_score: 25,
//       roads_score: 20,
//       landuse_score: 10,
//       building_score: 15,
//       pois_score: 10,
//       transport_score: 10,
//       traffic_score: 10,
//     },
//     isochroneConfig: {
//       api: "http://localhost:8002/isochrone",
//       isochroneDistance: [2.5, 3.5],
//       overlapPercentage: 20,
//       maxScoreValue: 2,
//       sortAttribute: "combined_score",
//     },
//   },
//   loading: false,
//   error: null,
//   success: false,
//   availableFiles: {},
//   currentStep: 1,
//   results: [],
//   currentResult: null,
// }

// // Async thunk to fetch files for a project
// export const fetchProjectFiles = createAsyncThunk(
//   "analysis/fetchProjectFiles",
//   async (projectId: number, { rejectWithValue }) => {
//     try {
//       const response = await fetch(`${import.meta.env.VITE_PUBLIC_BACKEND_API_URL}files?project_id=${projectId}`)
//       if (!response.ok) {
//         throw new Error(`Error ${response.status}: ${response.statusText}`)
//       }
//       return await response.json()
//     } catch (error) {
//       return rejectWithValue((error as Error).message)
//     }
//   },
// )

// // Async thunk to run the analysis
// export const runAnalysis = createAsyncThunk(
//   "analysis/runAnalysis",
//   async (config: AnalysisConfig, { rejectWithValue }) => {
//     try {
//       // Send the config directly to the backend
//       const response = await fetch(`${import.meta.env.VITE_PUBLIC_BACKEND_API_URL}run-analysis`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(config),
//       })

//       if (!response.ok) {
//         throw new Error(`Error ${response.status}: ${response.statusText}`)
//       }

//       return await response.json()
//     } catch (error) {
//       return rejectWithValue((error as Error).message)
//     }
//   },
// )

// // Async thunk to fetch analysis results
// export const fetchAnalysisResults = createAsyncThunk(
//   "analysis/fetchAnalysisResults",
//   async (projectId: number, { rejectWithValue }) => {
//     try {
//       const response = await fetch(
//         `${import.meta.env.VITE_PUBLIC_BACKEND_API_URL}projects/${projectId}/analysis-results`,
//       )
//       if (!response.ok) {
//         throw new Error(`Error ${response.status}: ${response.statusText}`)
//       }
//       return await response.json()
//     } catch (error) {
//       return rejectWithValue((error as Error).message)
//     }
//   },
// )

// // Async thunk to fetch a specific analysis result
// export const fetchAnalysisResult = createAsyncThunk(
//   "analysis/fetchAnalysisResult",
//   async (resultId: string, { rejectWithValue }) => {
//     try {
//       const response = await fetch(`${import.meta.env.VITE_PUBLIC_BACKEND_API_URL}analysis-results/${resultId}`)
//       if (!response.ok) {
//         throw new Error(`Error ${response.status}: ${response.statusText}`)
//       }
//       return await response.json()
//     } catch (error) {
//       return rejectWithValue((error as Error).message)
//     }
//   },
// )

// // Async thunk to categorize files by layer type
// export const categorizeFilesByLayerType = createAsyncThunk(
//   "analysis/categorizeFilesByLayerType",
//   async (projectId: number, { getState, dispatch }) => {
//     // First fetch all files
//     await dispatch(fetchProjectFiles(projectId))

//     const state = getState() as any
//     const files = state.file.files as FileEntry[]

//     // Group files by layer type
//     const categorizedFiles: Record<string, FileEntry[]> = {}

//     files.forEach((file) => {
//       const layerType = file.file_layer_type.toLowerCase()
//       if (!categorizedFiles[layerType]) {
//         categorizedFiles[layerType] = []
//       }
//       categorizedFiles[layerType].push(file)
//     })

//     return categorizedFiles
//   },
// )

// const analysisSlice = createSlice({
//   name: "analysis",
//   initialState,
//   reducers: {
//     setNormalizationFile: (state, action: PayloadAction<{ layerType: string; fileId: number | null }>) => {
//       const { layerType, fileId } = action.payload
//       state.config.normalization = {
//         ...state.config.normalization,
//         [layerType]: fileId,
//       }
//     },
//     addNormalizationLayer: (state, action: PayloadAction<{ layerType: string; fileId: number | null }>) => {
//       const { layerType, fileId } = action.payload
//       state.config.normalization = {
//         ...state.config.normalization,
//         [layerType]: fileId,
//       }
//     },
//     removeNormalizationLayer: (state, action: PayloadAction<string>) => {
//       const layerType = action.payload
//       const { [layerType]: _, ...rest } = state.config.normalization
//       state.config.normalization = rest
//     },
//     setBoundaryShape: (state, action: PayloadAction<number | null>) => {
//       state.config.boundaryShape = action.payload
//     },
//     setOutputFolder: (state, action: PayloadAction<string>) => {
//       state.config.outputFolder = action.payload
//     },
//     setDivideBoundaryByAttribute: (state, action: PayloadAction<string>) => {
//       state.config.divideBoundaryByAttribute = action.payload
//     },
//     setGenerateIsochrone: (state, action: PayloadAction<boolean>) => {
//       state.config.generateIsochrone = action.payload
//     },
//     setSaveIntermediateOutput: (state, action: PayloadAction<boolean>) => {
//       state.config.saveIntermediateOutput = action.payload
//     },
//     setWeight: (state, action: PayloadAction<{ key: string; value: number }>) => {
//       const { key, value } = action.payload
//       state.config.weights[key] = value
//     },
//     setIsochroneConfig: (state, action: PayloadAction<Partial<IsochroneConfig>>) => {
//       state.config.isochroneConfig = {
//         ...state.config.isochroneConfig,
//         ...action.payload,
//       }
//     },
//     setCurrentStep: (state, action: PayloadAction<number>) => {
//       state.currentStep = action.payload
//     },
//     nextStep: (state) => {
//       if (state.currentStep < 3) {
//         state.currentStep += 1
//       }
//     },
//     prevStep: (state) => {
//       if (state.currentStep > 1) {
//         state.currentStep -= 1
//       }
//     },
//     setCurrentResult: (state, action: PayloadAction<string | null>) => {
//       if (action.payload === null) {
//         state.currentResult = null
//       } else {
//         state.currentResult = state.results.find((result) => result.id === action.payload) || null
//       }
//     },
//     resetAnalysisState: (state) => {
//       state.loading = false
//       state.error = null
//       state.success = false
//     },
//     resetAnalysisConfig: (state) => {
//       state.config = initialState.config
//       state.currentStep = 1
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       // Fetch Project Files
//       .addCase(fetchProjectFiles.pending, (state) => {
//         state.loading = true
//       })
//       .addCase(fetchProjectFiles.fulfilled, (state) => {
//         state.loading = false
//       })
//       .addCase(fetchProjectFiles.rejected, (state, action) => {
//         state.loading = false
//         state.error = (action.payload as string) || "Failed to fetch files"
//       })
//       // Run Analysis
//       .addCase(runAnalysis.pending, (state) => {
//         state.loading = true
//         state.error = null
//         state.success = false
//       })
//       .addCase(runAnalysis.fulfilled, (state, action) => {
//         state.loading = false
//         state.success = true

//         // Add the new result to the results array
//         const result = action.payload as AnalysisResult
//         state.results = [result, ...state.results]
//         state.currentResult = result
//       })
//       .addCase(runAnalysis.rejected, (state, action) => {
//         state.loading = false
//         state.error = (action.payload as string) || "Failed to run analysis"
//       })
//       // Fetch Analysis Results
//       .addCase(fetchAnalysisResults.pending, (state) => {
//         state.loading = true
//       })
//       .addCase(fetchAnalysisResults.fulfilled, (state, action) => {
//         state.loading = false
//         state.results = action.payload
//       })
//       .addCase(fetchAnalysisResults.rejected, (state, action) => {
//         state.loading = false
//         state.error = (action.payload as string) || "Failed to fetch analysis results"
//       })
//       // Fetch Analysis Result
//       .addCase(fetchAnalysisResult.pending, (state) => {
//         state.loading = true
//       })
//       .addCase(fetchAnalysisResult.fulfilled, (state, action) => {
//         state.loading = false
//         state.currentResult = action.payload

//         // Update the result in the results array if it exists
//         const index = state.results.findIndex((result) => result.id === action.payload.id)
//         if (index !== -1) {
//           state.results[index] = action.payload
//         } else {
//           state.results.push(action.payload)
//         }
//       })
//       .addCase(fetchAnalysisResult.rejected, (state, action) => {
//         state.loading = false
//         state.error = (action.payload as string) || "Failed to fetch analysis result"
//       })
//       // Categorize Files
//       .addCase(categorizeFilesByLayerType.fulfilled, (state, action) => {
//         state.availableFiles = action.payload
//       })
//   },
// })

// export const {
//   setNormalizationFile,
//   addNormalizationLayer,
//   removeNormalizationLayer,
//   setBoundaryShape,
//   setOutputFolder,
//   setDivideBoundaryByAttribute,
//   setGenerateIsochrone,
//   setSaveIntermediateOutput,
//   setWeight,
//   setIsochroneConfig,
//   setCurrentStep,
//   nextStep,
//   prevStep,
//   setCurrentResult,
//   resetAnalysisState,
//   resetAnalysisConfig,
// } = analysisSlice.actions

// export default analysisSlice.reducer
