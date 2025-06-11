
// import { useState, useEffect, useRef } from "react"
// import { useNavigate } from "@tanstack/react-router"
// import { useDispatch, useSelector } from "react-redux"
// import { Button } from "../../components/ui/button"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
// import { FileTable } from "./file-table"
// import type { AppDispatch, RootState } from "../../store"
// import { fetchFiles, updateFile } from "../../store/file/fileSlice"

// export function SelectFiles() {
//   const dispatch = useDispatch<AppDispatch>()
//   const navigate = useNavigate()
//   const { currentProject } = useSelector((state: RootState) => state.project)
//   const { files, loading, fetchedProjects } = useSelector((state: RootState) => state.file)
//   const [searchTerm, setSearchTerm] = useState("")

//   // Use a ref to track if we're currently fetching
//   const isFetchingRef = useRef(false)

//   // Fetch files only when component mounts or when project changes
//   useEffect(() => {
//     if (currentProject?.id && !isFetchingRef.current && !fetchedProjects.includes(currentProject.id)) {
//       console.log("SelectFiles: Fetching files for project:", currentProject.id)
//       isFetchingRef.current = true

//       dispatch(fetchFiles(currentProject.id)).finally(() => {
//         isFetchingRef.current = false
//       })
//     }
//   }, [dispatch, currentProject?.id, fetchedProjects])

//   // Add a debug log to see what files we have
//   useEffect(() => {
//     console.log("SelectFiles: Current files in state:", files)
//   }, [files])

//   const handleToggleSelect = (id: number, selected: boolean) => {
//     dispatch(updateFile({ id, changes: { selected } }))
//   }

//   const handleVisualize = () => {
//     // Navigate to the new map route instead of visualization
//     if (currentProject?.id) {
//       navigate({ to: `/map/${currentProject.id}` })
//     }
//   }

//   // Filter files based on search
//   const filteredFiles = files.filter((file) => {
//     const matchesSearch =
//       searchTerm === "" ||
//       (file.name && file.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
//       (file.file_layer_type && file.file_layer_type.toLowerCase().includes(searchTerm.toLowerCase()))

//     return matchesSearch
//   })

//   // Check if any files are selected
//   const hasSelectedFiles = files.some((file) => file.selected)

//   const isVisualizeDisabled = !hasSelectedFiles

//   return (
//     <div className="space-y-6">
//       {/* <div>
//         <h1 className="text-3xl font-bold">Files Management</h1>
//         <p className="text-muted-foreground">Upload and select files for analysis</p>
//       </div> */}

//       {currentProject ? (
//         <Card>
//           <CardHeader>
//             <CardTitle>File Management</CardTitle>
//             <CardDescription>Upload and manage files for {currentProject.name}</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <FileTable
//               files={filteredFiles}
//               onToggleSelect={handleToggleSelect}
//               searchTerm={searchTerm}
//               setSearchTerm={setSearchTerm}
//               projectId={currentProject.id}
//             />
//           </CardContent>
//         </Card>
//       ) : (
//         <Card>
//           <CardContent className="flex flex-col items-center justify-center p-10">
//             <p className="text-center mb-4">Create a project to start uploading files</p>
//             <Button onClick={() => navigate({ to: "/project/new" })}>Create Project</Button>
//           </CardContent>
//         </Card>
//       )}

//       {/* {currentProject && (
//         <div className="flex justify-between">
//           <div>{!hasSelectedFiles && <p className="text-amber-600">Please select at least one file to proceed</p>}</div>
//           <Button onClick={handleVisualize} disabled={isVisualizeDisabled} className="gap-2">
//             Visualize Data
//             <ArrowRight className="h-4 w-4" />
//           </Button>
//         </div>
//       )} */}
//     </div>
//   )
// }
