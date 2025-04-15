import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "../../components/ui/button"
import { FileIcon, Trash2, Plus, MoreHorizontal, Info, Check, X, Download } from "lucide-react"
import { Badge } from "../../components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Checkbox } from "../../components/ui/checkbox"
import { DataTable } from "../../components/ui/data-table"
import type { ColumnDef } from "@tanstack/react-table"
import { Search } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../components/ui/tooltip"
import { Switch } from "../../components/ui/switch"
import { Loader2 } from "lucide-react"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "../../store"
import {
  type FileEntry,
  uploadFile,
  deleteFile,
  updateFile,
  addTempFile,
  getFileMetadata,
  type ProcessedVersion,
  fetchFiles,
} from "../../store/file/fileSlice"
import { toast } from "sonner"

interface FileTableProps {
  files: FileEntry[]
  onToggleSelect: (id: number, selected: boolean) => void
  searchTerm: string
  setSearchTerm: (term: string) => void
  projectId: number
}

export function FileTable({ files, onToggleSelect, searchTerm, setSearchTerm, projectId }: FileTableProps) {
  console.log("FileTable received files:", files)
  const dispatch = useDispatch<AppDispatch>()
  const { loading } = useSelector((state: RootState) => state.file)

  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [fileLayerType, setFileLayerType] = useState("")
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [country, setCountry] = useState("")
  const [region, setRegion] = useState("")
  const [normalized, setNormalized] = useState(false)
  const [propertiesDialogOpen, setPropertiesDialogOpen] = useState(false)
  const [selectedFileForProperties, setSelectedFileForProperties] = useState<FileEntry | null>(null)
  const [processedVersionsDialogOpen, setProcessedVersionsDialogOpen] = useState(false)
  const [selectedFileVersions, setSelectedFileVersions] = useState<ProcessedVersion[]>([])

  // // Refresh files when component mounts
  // useEffect(() => {
  //   if (projectId && files.length === 0 && !loading) {
  //     // Only fetch if we haven't already fetched or if we're not currently loading
  //     const shouldFetch = !files.some((file) => file.status === "uploading")
  //     if (shouldFetch) {
  //       console.log("FileTable: No files found, fetching files for project:", projectId)
  //       dispatch(fetchFiles(projectId))
  //     }
  //   }
  // }, [dispatch, projectId, files.length, loading])
  
  // Refresh files when component mounts
  useEffect(() => {
    // We'll let the parent SelectFiles component handle fetching files
    // This component should not fetch files on its own to avoid infinite loops
    console.log("FileTable received files:", files)
  }, [files])

  const handleAddRow = () => {
    setFileLayerType("")
    setSelectedFiles([])
    setCountry("")
    setRegion("")
    setNormalized(false)
    setUploadDialogOpen(true)
  }

  // Helper function to get filename without extension
  const getFilenameWithoutExtension = (filename: string | undefined | null) => {
    if (!filename) return "Unnamed File"
    return filename.replace(/\.[^/.]+$/, "")
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      // Convert FileList to array
      const filesArray = Array.from(files)
      setSelectedFiles(filesArray)
    }
  }

  const isShapefile = (files: File[]) => {
    // Check if we have multiple files that could be a shapefile set
    if (files.length > 1) {
      const extensions = files.map((file) => file.name.split(".").pop()?.toLowerCase())
      // Check for common shapefile extensions
      return (
        extensions.includes("shp") ||
        extensions.includes("dbf") ||
        extensions.includes("shx") ||
        extensions.includes("prj")
      )
    }
    return false
  }

  const handleSaveFile = async () => {
    if (selectedFiles.length > 0 && fileLayerType) {
      // Get the main file (for display purposes)
      const mainFile = selectedFiles[0]

      // Create a temporary file entry with uploading status
      const tempId = Date.now()
      const tempFile: FileEntry = {
        id: tempId,
        name: mainFile.name,
        file_type: mainFile.name.split(".").pop() || "",
        size: `${(mainFile.size / 1024 / 1024).toFixed(2)}MB`,
        country,
        region,
        uploaded_by: "current_user",
        uploaded_at: new Date().toISOString(),
        feature_type: "",
        updated_at: new Date().toISOString(),
        file_layer_type: fileLayerType,
        normalized,
        file: mainFile,
        status: "uploading",
        selected: false,
      }

      console.log("Adding temp file:", tempFile)
      // Add the temporary file to the state
      dispatch(addTempFile(tempFile))

      try {
        console.log("Uploading file with data:", {
          projectId,
          files: selectedFiles,
          fileLayerType,
          country,
          region,
          normalized,
        })

        // Upload the file(s)
        const result = await dispatch(
          uploadFile({
            projectId,
            files: selectedFiles,
            fileLayerType,
            country,
            region,
            normalized,
          }),
        )

        console.log("Upload result:", result)

        toast.success("File uploaded", {
          description: `${mainFile.name} has been uploaded successfully.`,
        })

        // Refresh the file list
        dispatch(fetchFiles(projectId))
      } catch (error) {
        console.error("Upload error:", error)
        toast.error("File uploaded", {
          description: "There was an error uploading your file. Please try again.",
        })
      }

      setUploadDialogOpen(false)
    }
  }

  const handleRemoveFile = (id: number) => {
    dispatch(deleteFile(id))
  }

  const handleToggleNormalize = (id: number, normalized: boolean) => {
    dispatch(updateFile({ id, changes: { normalized } }))
  }

  const handleShowProperties = (file: FileEntry) => {
    setSelectedFileForProperties(file)
    // Fetch the latest metadata for this file
    dispatch(getFileMetadata(file.id))
    setPropertiesDialogOpen(true)
  }

  const handleShowProcessedVersions = (file: FileEntry) => {
    if (file.processed_versions && file.processed_versions.length > 0) {
      setSelectedFileVersions(file.processed_versions)
      setProcessedVersionsDialogOpen(true)
    } else {
      toast("No processed versions", { description: "This file doesn't have any processed versions yet." })
    }
  }

  const handleDownloadFile = (fileId: number) => {
    window.open(`${import.meta.env.VITE_PUBLIC_BACKEND_API_URL}files/${fileId}/download`, "_blank")
  }

  const handleDownloadProcessedVersion = (versionUrl: string) => {
    window.open(`${process.env.NEXT_PUBLIC_API_URL}${versionUrl}`, "_blank")
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const columns: ColumnDef<FileEntry>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex items-center justify-center">
            <Checkbox
              checked={row.original.selected}
              onCheckedChange={(checked) => {
                if (checked !== undefined) {
                  onToggleSelect(row.original.id, checked)
                }
              }}
              aria-label="Select row"
            />
          </div>
        )
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: "File Name",
      cell: ({ row }) => (
        <div className="flex items-center max-w-[200px]">
          <FileIcon className="h-4 w-4 mr-2 text-muted-foreground" />
          <span className="truncate" title={row.original.name || "Unnamed File"}>
            {getFilenameWithoutExtension(row.original.name)}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "file_layer_type",
      header: "Layer Type",
      cell: ({ row }) => (
        <Badge variant="outline" className="capitalize">
          {row.original.file_layer_type}
        </Badge>
      ),
    },
    {
      accessorKey: "file_type",
      header: "File Type",
      cell: ({ row }) => <span className="text-xs text-muted-foreground uppercase">{row.original.file_type}</span>,
    },
    {
      accessorKey: "size",
      header: "Size",
      cell: ({ row }) => <span className="text-xs">{row.original.size}</span>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status

        if (status === "uploading") {
          return (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              Uploading
            </Badge>
          )
        } else if (status === "uploaded") {
          return (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Uploaded
            </Badge>
          )
        } else if (status === "failed") {
          return (
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
              Failed
            </Badge>
          )
        } else if (status === "processing") {
          return (
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              Processing
            </Badge>
          )
        }

        return null
      },
    },
    {
      accessorKey: "normalized",
      header: "Normalized",
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  {row.original.normalized ? (
                    <Check className="h-5 w-5 text-green-600" />
                  ) : (
                    <X className="h-5 w-5 text-red-600" />
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{row.original.normalized ? "Normalized" : "Not normalized"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleShowProperties(row.original)}>
                <Info className="h-4 w-4 mr-2" />
                Properties
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDownloadFile(row.original.id)}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </DropdownMenuItem>
              {row.original.processed_versions && row.original.processed_versions.length > 0 && (
                <DropdownMenuItem onClick={() => handleShowProcessedVersions(row.original)}>
                  <FileIcon className="h-4 w-4 mr-2" />
                  Processed Versions ({row.original.processed_versions.length})
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => handleToggleNormalize(row.original.id, !row.original.normalized)}>
                {row.original.normalized ? (
                  <>
                    <X className="h-4 w-4 mr-2" />
                    Mark as Not Normalized
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Mark as Normalized
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleRemoveFile(row.original.id)} className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
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
        </div>
        <Button onClick={handleAddRow} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add File
        </Button>
      </div>

      <DataTable columns={columns} data={files || []} />

      {/* {files.length === 0 && !loading && (
        <div className="text-center py-8 text-muted-foreground">
          No files found. Click "Add File" to upload a new file.
        </div>
      )} */}

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New File</DialogTitle>
            <DialogDescription>Define a file type and upload the corresponding file.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="file-layer-type">Layer Type</Label>
              <Input
                id="file-layer-type"
                placeholder="e.g. roads, buildings, boundary"
                value={fileLayerType}
                onChange={(e) => setFileLayerType(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Enter the layer type for this file</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  placeholder="Enter country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="region">Region</Label>
                <Input
                  id="region"
                  placeholder="Enter region"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="normalized" checked={normalized} onCheckedChange={setNormalized} />
              <Label htmlFor="normalized">Normalized</Label>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="file-upload">File</Label>
              <Input
                id="file-upload"
                type="file"
                accept=".geojson,.json,.shp,.dbf,.shx,.prj,.gpkg,.csv"
                onChange={handleFileUpload}
                multiple={true} // Allow multiple files for shapefiles
              />
              <p className="text-xs text-muted-foreground">
                Supported formats: GeoJSON, Shapefile, GeoPackage, CSV. Maximum file size: 50MB
              </p>
              {isShapefile(selectedFiles) && (
                <div className="mt-2 p-2 bg-blue-50 text-blue-700 rounded-md">
                  <p className="text-xs">
                    <strong>Shapefile detected:</strong> {selectedFiles.length} files selected. All files will be
                    uploaded together.
                  </p>
                </div>
              )}
              {selectedFiles.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs font-medium">Selected files:</p>
                  <ul className="text-xs text-muted-foreground mt-1">
                    {selectedFiles.map((file, index) => (
                      <li key={index}>{file.name}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadDialogOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleSaveFile} disabled={selectedFiles.length === 0 || !fileLayerType || loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Add File"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Properties Dialog */}
      <Dialog open={propertiesDialogOpen} onOpenChange={setPropertiesDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>File Properties</DialogTitle>
            <DialogDescription>Detailed information about the file.</DialogDescription>
          </DialogHeader>
          {selectedFileForProperties && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">File Name</h3>
                  <p className="text-sm">{selectedFileForProperties.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">File Type</h3>
                  <p className="text-sm uppercase">{selectedFileForProperties.file_type}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Layer Type</h3>
                  <p className="text-sm capitalize">{selectedFileForProperties.file_layer_type}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Size</h3>
                  <p className="text-sm">{selectedFileForProperties.size}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Uploaded Date</h3>
                  <p className="text-sm">{formatDate(selectedFileForProperties.uploaded_at)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Last Updated</h3>
                  <p className="text-sm">{formatDate(selectedFileForProperties.updated_at)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Country</h3>
                  <p className="text-sm">{selectedFileForProperties.country || "N/A"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Region</h3>
                  <p className="text-sm">{selectedFileForProperties.region || "N/A"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Normalized</h3>
                  <p className="text-sm">{selectedFileForProperties.normalized ? "Yes" : "No"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                  <p className="text-sm capitalize">{selectedFileForProperties.status}</p>
                </div>
                {selectedFileForProperties.crs && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">CRS</h3>
                    <p className="text-sm">{selectedFileForProperties.crs}</p>
                  </div>
                )}
                {selectedFileForProperties.geometry_type && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Geometry Type</h3>
                    <p className="text-sm">{selectedFileForProperties.geometry_type}</p>
                  </div>
                )}
                {selectedFileForProperties.feature_count && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Feature Count</h3>
                    <p className="text-sm">{selectedFileForProperties.feature_count}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setPropertiesDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Processed Versions Dialog */}
      <Dialog open={processedVersionsDialogOpen} onOpenChange={setProcessedVersionsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Processed Versions</DialogTitle>
            <DialogDescription>Available processed versions of this file.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="border rounded-md">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-2 text-left">Name</th>
                    <th className="px-4 py-2 text-left">Type</th>
                    <th className="px-4 py-2 text-left">Method</th>
                    <th className="px-4 py-2 text-left">Created</th>
                    <th className="px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedFileVersions.map((version) => (
                    <tr key={version.id} className="border-b">
                      <td className="px-4 py-2">{version.name}</td>
                      <td className="px-4 py-2 capitalize">{version.processed_type}</td>
                      <td className="px-4 py-2">{version.processing_method}</td>
                      <td className="px-4 py-2">{formatDate(version.created_at)}</td>
                      <td className="px-4 py-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadProcessedVersion(version.geojson_url)}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setProcessedVersionsDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
