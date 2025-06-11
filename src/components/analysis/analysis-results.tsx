// import { useEffect,useState } from "react"
// import { useDispatch, useSelector } from "react-redux"
// import { useNavigate } from "@tanstack/react-router"
// import { Button } from "../../components/ui/button"

// import { Checkbox } from "../../components/ui/checkbox"
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card"
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
// import { Badge } from "../../components/ui/badge"
// import { Download, FileJson, Clock, Calendar, User, ArrowLeft ,Map} from "lucide-react"
// import { toast } from "sonner"
// import type { AppDispatch, RootState } from "../../store"
// import { fetchAnalysisResults, fetchAnalysisResult, setCurrentResult } from "../../store/analysis/analysisSlice"
// // import {addLayerGroup, addLayer} from "../../store/map/layerSlice"

// export function AnalysisResults() {
//   const dispatch = useDispatch<AppDispatch>()
//   const navigate = useNavigate()
//   const { currentProject } = useSelector((state: RootState) => state.project)
//   const { results, currentResult, loading, error } = useSelector((state: RootState) => state.analysis)
//   // State for tracking which output files are selected for rendering
//   const [selectedOutputFiles, setSelectedOutputFiles] = useState<string[]>([])

//   // Fetch analysis results when component mounts
//   useEffect(() => {
//     if (currentProject?.id) {
//       dispatch(fetchAnalysisResults(currentProject.id))
//     }
//   }, [dispatch, currentProject?.id])

//   // Show error toast when error occurs
//   useEffect(() => {
//     if (error) {
//       toast.error("Error", {
//         description: error,
//       })
//     }
//   }, [error])

//   const handleViewResult = (resultId: string) => {
//     dispatch(fetchAnalysisResult(resultId))
//      // Reset selected output files when viewing a new result
//      setSelectedOutputFiles([])
//   }

//   const handleDownloadFile = (filePath: string) => {
//     // Extract file name from path
//     const fileName = filePath.split("/").pop() || "file"

//     // Construct download URL
//     const downloadUrl = `${import.meta.env.VITE_PUBLIC_BACKEND_API_URL}analysis/download?path=${encodeURIComponent(filePath)}`

//     // Create a temporary link and trigger download
//     const link = document.createElement("a")
//     link.href = downloadUrl
//     link.download = fileName
//     document.body.appendChild(link)
//     link.click()
//     document.body.removeChild(link)
//   }

//   const handleToggleRenderFile = (filePath: string) => {
//     setSelectedOutputFiles((prev) => {
//       if (prev.includes(filePath)) {
//         return prev.filter((path) => path !== filePath)
//       } else {
//         return [...prev, filePath]
//       }
//     })
//   }

//   const handleRenderOnMap = () => {
//     if (selectedOutputFiles.length === 0 || !currentResult) {
//       toast.error("Please select at least one file to render")
//       return
//     }

//     // Create a layer group for the analysis result
//     const groupId = `analysis-result-${currentResult.id}`
//     const groupName = `Analysis: ${currentResult.name}`

//     // dispatch(
//     //   addLayerGroup({
//     //     id: groupId,
//     //     name: groupName,
//     //     visible: true,
//     //     expanded: true,
//     //   }),
//     // )

//     // Add each selected file as a layer
//     selectedOutputFiles.forEach((filePath, index) => {
//       const fileName = filePath.split("/").pop() || `Result ${index + 1}`
//       const layerId = `analysis-layer-${currentResult.id}-${index}`

//       // dispatch(
//       //   addLayer({
//       //     id: layerId,
//       //     groupId: groupId,
//       //     name: fileName,
//       //     type: "geojson",
//       //     source: {
//       //       type: "geojson",
//       //       data: `${import.meta.env.VITE_PUBLIC_BACKEND_API_URL}analysis/geojson?path=${encodeURIComponent(filePath)}`,
//       //     },
//       //     visible: true,
//       //     style: {
//       //       fillColor: getRandomColor(),
//       //       fillOpacity: 0.6,
//       //       strokeColor: "#000000",
//       //       strokeWidth: 1,
//       //     },
//       //   }),
//       // )
//     })

//     // Navigate to the map view
//     navigate({ to: `/map/${currentProject?.id}` })

//     toast.success("Rendering analysis results on map", {
//       description: `Added ${selectedOutputFiles.length} layers to the map`,
//     })
//   }

//   // Helper function to generate random colors for layers
//   const getRandomColor = () => {
//     const colors = ["#FF5733", "#33FF57", "#3357FF", "#FF33A8", "#33A8FF", "#A833FF", "#FFD133", "#33FFD1"]
//     return colors[Math.floor(Math.random() * colors.length)]
//   }

//   const formatDate = (dateString: string) => {
//     return new Date(dateString).toLocaleString()
//   }

//   return (
//     <div className="container mx-auto py-8 px-4">
//       <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
//         <div>
//           <h1 className="text-3xl font-bold">Analysis Results</h1>
//           <p className="text-muted-foreground">View and download analysis results for {currentProject?.name}</p>
//         </div>
//         <Button variant="outline" onClick={() => navigate({ to: `/project/${currentProject?.id}/run-analysis` })}>
//           <ArrowLeft className="h-4 w-4 mr-2" /> Run New Analysis
//         </Button>
//       </div>

//       {!currentProject ? (
//         <Card>
//           <CardContent className="flex flex-col items-center justify-center p-10">
//             <p className="text-center mb-4">Select a project to view analysis results</p>
//             <Button onClick={() => navigate({ to: "/" })}>Go to Projects</Button>
//           </CardContent>
//         </Card>
//       ) : loading ? (
//         <Card>
//           <CardContent className="flex flex-col items-center justify-center p-10">
//             <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
//             <p className="text-center">Loading analysis results...</p>
//           </CardContent>
//         </Card>
//       ) : results.length === 0 ? (
//         <Card>
//           <CardContent className="flex flex-col items-center justify-center p-10">
//             <p className="text-center mb-4">No analysis results found for this project</p>
//             <Button onClick={() => navigate({ to: `/project/${currentProject.id}/run-analysis` })}>Run Analysis</Button>
//           </CardContent>
//         </Card>
//       ) : (
//         <div className="grid grid-cols-1 gap-6">
//           {/* Results List */}
//           <Card>
//             <CardHeader>
//               <CardTitle>Analysis History</CardTitle>
//               <CardDescription>Previous analysis runs for this project</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <Table>
//                 <TableHeader>
//                   <TableRow>
//                     <TableHead>Name</TableHead>
//                     <TableHead>Date</TableHead>
//                     <TableHead>Status</TableHead>
//                     <TableHead>Execution Time</TableHead>
//                     <TableHead>Actions</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {results.map((result) => (
//                     <TableRow key={result.id}>
//                       <TableCell>{result.name}</TableCell>
//                       <TableCell>{formatDate(result.generatedTimeDate)}</TableCell>
//                       <TableCell>
//                         <Badge
//                           variant={
//                             result.status === "completed"
//                               ? "success"
//                               : result.status === "failed"
//                                 ? "destructive"
//                                 : "default"
//                           }
//                         >
//                           {result.status}
//                         </Badge>
//                       </TableCell>
//                       <TableCell>{result.executionTime}</TableCell>
//                       <TableCell>
//                         <Button variant="outline" size="sm" onClick={() => handleViewResult(result.id)}>
//                           View Details
//                         </Button>
//                       </TableCell>
//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>
//             </CardContent>
//           </Card>

//           {/* Selected Result Details */}
//           {currentResult && (
//             <Card>
//               <CardHeader>
//                 <CardTitle>{currentResult.name}</CardTitle>
//                 <CardDescription>Analysis details and output files</CardDescription>
//               </CardHeader>
//               <CardContent className="space-y-6">
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//                   <div className="flex items-center gap-2">
//                     <Calendar className="h-4 w-4 text-muted-foreground" />
//                     <span className="text-sm">{formatDate(currentResult.generatedTimeDate)}</span>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <Clock className="h-4 w-4 text-muted-foreground" />
//                     <span className="text-sm">Execution Time: {currentResult.executionTime}</span>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <User className="h-4 w-4 text-muted-foreground" />
//                     <span className="text-sm">Requested By: {currentResult.requestedBy}</span>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <Badge
//                       variant={
//                         currentResult.status === "completed"
//                           ? "success"
//                           : currentResult.status === "failed"
//                             ? "destructive"
//                             : "default"
//                       }
//                     >
//                       {currentResult.status}
//                     </Badge>
//                   </div>
//                 </div>

//                 {currentResult.notes && (
//                   <div className="bg-muted p-4 rounded-md">
//                     <h3 className="text-sm font-medium mb-2">Notes</h3>
//                     <p className="text-sm text-muted-foreground">{currentResult.notes}</p>
//                   </div>
//                 )}

//                 <div>
//                   {/* <h3 className="text-sm font-medium mb-2">Output Files</h3> */}
//                   <div className="flex items-center justify-between mb-4">
//                     <h3 className="text-sm font-medium">Output Files</h3>
//                     {selectedOutputFiles.length > 0 && (
//                       <Button size="sm" onClick={handleRenderOnMap}>
//                         <Map className="h-4 w-4 mr-2" /> Render on Map
//                       </Button>
//                     )}
//                   </div>

//                   <div className="space-y-2">
//                     {currentResult.outputFiles.map((file, index) => (
//                       <div key={index} className="flex items-center justify-between bg-muted p-3 rounded-md">
//                         <div className="flex items-center gap-2">
//                         <Checkbox
//                             id={`render-file-${index}`}
//                             checked={selectedOutputFiles.includes(file)}
//                             onCheckedChange={() => handleToggleRenderFile(file)}
//                           />
//                           <label htmlFor={`render-file-${index}`} className="flex items-center gap-2 cursor-pointer">
//                           <FileJson className="h-4 w-4 text-muted-foreground" />
//                           <span className="text-sm">{file.split("/").pop()}</span>
//                           </label>
//                         </div>
//                         <Button variant="ghost" size="sm" onClick={() => handleDownloadFile(file)}>
//                           <Download className="h-4 w-4" />
//                         </Button>
//                       </div>
//                     ))}
//                   </div>
//                 </div>

//                 <div>
//                   <h3 className="text-sm font-medium mb-2">Input Configuration</h3>
//                   <pre className="bg-muted p-4 rounded-md overflow-auto max-h-96 text-xs">
//                     {JSON.stringify(currentResult.inputConfig, null, 2)}
//                   </pre>
//                 </div>
//               </CardContent>
//               <CardFooter>
//                 <Button variant="outline" onClick={() => dispatch(setCurrentResult(null))}>
//                   Back to Results List
//                 </Button>
//               </CardFooter>
//             </Card>
//           )}
//         </div>
//       )}
//     </div>
//   )
// }
