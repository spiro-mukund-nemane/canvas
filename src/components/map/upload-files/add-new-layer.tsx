import type React from "react"
import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { uploadGeoFile } from "../../../store/map/uploadSlice"
import { Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog"
import { Button } from "../../ui/button"
import { Input } from "../../ui/input"
import { Label } from "../../ui/label"
import { Alert, AlertDescription } from "../../ui/alert"
import { AppDispatch, type RootState } from "../../../store"

interface AddNewLayerDialogProps {
  open: boolean
  setOpen: (value: boolean) => void
}

export function AddNewLayerDialog({ open, setOpen }: AddNewLayerDialogProps) {
  const dispatch = useDispatch<AppDispatch>()
  const { currentProject } = useSelector((state: RootState) => state.project)

  // Replace the file state with files array
  const [files, setFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Update handleFileChange to handle multiple files
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Convert FileList to array
      const fileArray = Array.from(e.target.files)
      setFiles(fileArray)
      setError(null)
    }
  }

  // Update handleUpload to handle multiple files
  const handleUpload = async () => {
    if (files.length === 0) {
      setError("Please select at least one file to upload")
      return
    }

    if (!currentProject) {
      setError("No project selected")
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      // @ts-ignore - dispatch returns Promise from the thunk
      await dispatch(
        uploadGeoFile({
          files,
          projectId: currentProject.id,
        }),
      )
      setOpen(false)
      setFiles([])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload file")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Layer</DialogTitle>
          <DialogDescription>Upload a geo file to add as a new layer on the map.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="layer-upload">Layer File</Label>
            {/* Update the input to accept multiple files */}
            <Input
              id="layer-upload"
              type="file"
              accept=".geojson,.json,.shp,.dbf,.shx,.prj,.gpkg,.mbtiles,.csv,.zip"
              onChange={handleFileChange}
              disabled={isUploading}
              multiple
            />
            <p className="text-xs text-muted-foreground">
              Supported formats: GeoJSON, Shapefile (with .shp, .dbf, .shx, .prj), GeoPackage, MBTiles, CSV. Maximum
              file size: 50MB
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isUploading}>
            Cancel
          </Button>
          {/* Update the button text to reflect multiple files */}
          <Button onClick={handleUpload} disabled={files.length === 0 || isUploading}>
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              `Add ${files.length > 0 ? files.length : ""} Layer${files.length !== 1 ? "s" : ""}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
