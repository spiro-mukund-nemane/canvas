import type React from "react"

import { useState} from "react"
import {
  ChevronDown,
  Share2,
 Route,X,
} from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip"
import { Avatar, AvatarFallback } from "../ui/avatar"
import { Button } from "../ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { Input } from "../ui/input"
import { Separator } from "../ui/separator"
import StyleSwitcher from "./style-switcher"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog"
import { Label } from "../ui/label"
import { Loader2 } from "lucide-react"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "../../store"
import { addUploadedLayer } from "../../store/map/layerSlice"
// import { useNavigate } from "@tanstack/react-router"
import {useApiKeyNavigate} from '../../lib/apiKeyNav'
// import {updateFile } from "../../store/file/fileSlice"
// import { toggleMeasuring, cancelMeasuring } from '../../store/map/measurementSlice'
import { toggleMeasuring} from '../../store/map/measurementSlice'




export default function Header() {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useApiKeyNavigate()
  // const { currentProject } = useSelector((state: RootState) => state.project)
  // const { files, loading } = useSelector((state: RootState) => state.file)
  const isMeasuring = useSelector((state: RootState) => state.measurement.isMeasuring);
  const [_selectFilesDialogOpen, setSelectFilesDialogOpen] = useState(false)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  // const [searchTerm, setSearchTerm] = useState("")
  // const [isMeasuring, setIsMeasuring] = useState(false);

  // // Fetch files when component mounts or project changes
  // useEffect(() => {
  //   if (currentProject?.id) {
  //     dispatch(fetchFiles(currentProject.id))
  //   }
  // }, [dispatch, currentProject?.id])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      setSelectedFile(files[0])
    }
  }

  const handleUpload = () => {
    if (!selectedFile) return

    setIsUploading(true)

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const geoJSON = JSON.parse(content)

        dispatch(
          addUploadedLayer({
            geoJSON,
            fileName: selectedFile.name,
          }),
        )

        setUploadDialogOpen(false)
        setSelectedFile(null)
      } catch (error) {
        console.error("Error parsing GeoJSON:", error)
        alert("Invalid GeoJSON file")
      } finally {
        setIsUploading(false)
      }
    }

    reader.onerror = () => {
      alert("Error reading file")
      setIsUploading(false)
    }

    reader.readAsText(selectedFile)
  }

  // const handleBackToProject = () => {
  //   if (currentProject?.id) {
  //     navigate({ to: `/project/${currentProject.id}/files` })
  //   } else {
  //     navigate({ to: "/" })
  //   }
  // }
  const handleBackToProject = () => {
    navigate({ to: `/` })
  }

  // const handleToggleSelect = (id: number, selected: boolean) => {
  //   dispatch(updateFile({ id, changes: { selected } }))
  // }

  // const handleApplySelection = () => {
  //   const selectedFiles = files.filter((file) => file.selected)
  //   if (selectedFiles.length > 0) {
  //     dispatch(loadSelectedFilesAsLayers(selectedFiles))
  //   }
  //   setSelectFilesDialogOpen(false)
  // }

  // Filter files based on search
  // const filteredFiles = files.filter((file) => {
  //   const matchesSearch =
  //     searchTerm === "" ||
  //     (file.name && file.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
  //     (file.file_layer_type && file.file_layer_type.toLowerCase().includes(searchTerm.toLowerCase()))

  //   return matchesSearch
  // })

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-[64px] flex items-center justify-between gap-4 border-b bg-background px-4 py-2">
      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 font-serif text-2xl">
              Spiro <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuItem onClick={() => navigate({ to: "/" })}>Home</DropdownMenuItem>
            <DropdownMenuItem onClick={handleBackToProject}>Back to project</DropdownMenuItem>
            <DropdownMenuItem>
              Quick actions <span className="ml-auto text-xs">Ctrl+K</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setSelectFilesDialogOpen(true)}>Add files</DropdownMenuItem>
            <DropdownMenuItem>Run analysis</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Help and account</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Separator orientation="vertical" className="h-6" />
        {/* <div className="flex items-center gap-2">
          <span>{currentProject?.name || "General"}</span>
        </div> */}
        {/* <Button variant="ghost" size="sm" className="gap-2">
          Project <ChevronRight className="h-4 w-4" />
        </Button>
        <span>{currentProject?.name || "General"}</span> */}
      </div>

      <div className="flex items-center gap-5">
        <div className="absolute left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2">
          <div className="flex items-center gap-1">
            {/* Draw Tools Dropdown */}
            {/* <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MapPin className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>
                  <MapPin className="mr-2 h-4 w-4" /> Pin
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <LineIcon className="mr-2 h-4 w-4" /> Line
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Square className="mr-2 h-4 w-4" /> Polygon
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Circle className="mr-2 h-4 w-4" /> Circle
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Square className="mr-2 h-4 w-4" /> Rectangle
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Pencil className="mr-2 h-4 w-4" /> Freehand
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu> */}

            {/* Layer Transformation Dropdown */}
            {/* <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MapIcon className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>
                  <Square className="mr-2 h-4 w-4" /> Bounds
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Circle className="mr-2 h-4 w-4" /> Buffer
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <MapPin className="mr-2 h-4 w-4" /> Centroid
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Layers className="mr-2 h-4 w-4" /> Dissolve
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Scissors className="mr-2 h-4 w-4" /> Clip
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <MousePointer className="mr-2 h-4 w-4" /> Count points
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Layers className="mr-2 h-4 w-4" /> Intersect
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Layers className="mr-2 h-4 w-4" /> Join
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu> */}

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={isMeasuring ? "destructive" : "default"}
                    size='lg'
                    onClick={() => dispatch(toggleMeasuring())}
                    className="items-center bg-white text-black hover:bg-white"
                  >
                    {isMeasuring ? <X size={18} /> : <Route size={18} />}
                  </Button>
                </TooltipTrigger>
                {/* <TooltipContent className="bg-white text-black border border-gray-300 hover:bg-gray-100">
                      <p>{isMeasuring ? 'Cancel' : 'Distance and Time Measurement'}</p>
                    </TooltipContent> */}
                <TooltipContent className="rounded-md border">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{isMeasuring ? 'Cancel' : 'Distance Measurement'}</p>
                  </div>
                </TooltipContent>

              </Tooltip>
            </TooltipProvider>

          </div>
        </div>

        <div className="flex items-center gap-2">
          <StyleSwitcher />

          {/* <Button variant="ghost" size="icon">
            <Search className="h-5 w-5" />
          </Button> */}

          {/* <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MessageCircle className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="space-y-4 p-4">
                <h2 className="text-lg font-semibold">Comments</h2>
                <p className="text-muted-foreground">Click on the map to leave a comment</p>
              </div>
            </DropdownMenuContent>
          </DropdownMenu> */}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Share2 className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="space-y-4 p-4">
                <h2 className="text-lg font-semibold">Share</h2>
                <Input placeholder="Add collaborators" />
                <Button className="w-full">Invite</Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Avatar className="h-10 w-10 bg-orange-500">
          <AvatarFallback>M</AvatarFallback>
        </Avatar>
      </div>

      {/* Select Files Dialog */}
      {/* <Dialog open={selectFilesDialogOpen} onOpenChange={setSelectFilesDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Select Files to Visualize</DialogTitle>
            <DialogDescription>Choose files from your project to add to the map.</DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search files..."
                  className="w-[200px] pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" size="sm" onClick={() => setUploadDialogOpen(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Upload New File
              </Button>
            </div>

            <ScrollArea className="h-[400px] border rounded-md">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span>Loading files...</span>
                </div>
              ) : filteredFiles.length > 0 ? (
                <div className="p-2">
                  {filteredFiles.map((file) => (
                    <div key={file.id} className="flex items-center p-2 hover:bg-accent/20 rounded-md">
                      <Checkbox
                        checked={file.selected}
                        onCheckedChange={(checked) => handleToggleSelect(file.id, !!checked)}
                        className="mr-3"
                      />
                      <div className="flex-1">
                        <div className="font-medium">{file.name}</div>
                        <div className="text-xs text-muted-foreground flex gap-2">
                          <span>{file.file_layer_type}</span>
                          <span>•</span>
                          <span>{file.file_type}</span>
                          <span>•</span>
                          <span>{file.size}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                  <FileIcon className="h-10 w-10 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">
                    {searchTerm ? "No files match your search" : "No files available in this project"}
                  </p>
                  {!searchTerm && (
                    <Button variant="outline" className="mt-4" onClick={() => setUploadDialogOpen(true)}>
                      Upload Files
                    </Button>
                  )}
                </div>
              )}
            </ScrollArea>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectFilesDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleApplySelection}>Apply Selection</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog> */}

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload New File</DialogTitle>
            <DialogDescription>Upload a GeoJSON file to add to the map visualization.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="file-upload">GeoJSON File</Label>
              <Input id="file-upload" type="file" accept=".geojson,.json" onChange={handleFileChange} />
              <p className="text-xs text-muted-foreground">Supported format: GeoJSON. Maximum file size: 50MB</p>

              {selectedFile && (
                <div className="mt-2 p-2 bg-blue-50 text-blue-700 rounded-md">
                  <p className="text-xs">
                    <strong>Selected file:</strong> {selectedFile.name}
                  </p>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadDialogOpen(false)} disabled={isUploading}>
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={!selectedFile || isUploading}>
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Upload"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  )
}

// FileIcon component for the empty state
// function FileIcon(props: React.SVGProps<SVGSVGElement>) {
//   return (
//     <svg
//       {...props}
//       xmlns="http://www.w3.org/2000/svg"
//       width="24"
//       height="24"
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="2"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//     >
//       <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
//       <polyline points="14 2 14 8 20 8" />
//     </svg>
//   )
// }

