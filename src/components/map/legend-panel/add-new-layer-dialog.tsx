'use client'

import type React from "react"
import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { addUploadedLayer } from "@/lib/slices/layerSlice"
import { Loader2 } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AppDispatch, type RootState } from "@/lib/store"

interface AddNewLayerDialogProps {
  open: boolean
  setOpen: (value: boolean) => void
}

export function AddNewLayerDialog({ open, setOpen }: AddNewLayerDialogProps) {
  const dispatch = useDispatch<AppDispatch>()

  const [files, setFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(Array.from(e.target.files))
      setError(null)
    }
  }

  const handleUpload = async () => {
    if (files.length === 0) return

    setIsUploading(true)
    setError(null)

    try {
      for (const file of files) {
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const content = e.target?.result as string
            const geoJSON = JSON.parse(content)

            dispatch(
              addUploadedLayer({
                geoJSON,
                fileName: file.name,
              }),
            )
          } catch (err) {
            setError(`Failed to parse ${file.name}`)
            console.error("Error parsing GeoJSON:", err)
          }
        }
        reader.readAsText(file)
      }

      setFiles([])
      setOpen(false)
    } catch (err) {
      setError("Failed to upload files")
      console.error("Upload error:", err)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Layer</DialogTitle>
          <DialogDescription>
            Upload GeoJSON files to add layers to the map.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="layer-upload">GeoJSON File</Label>
            <Input
              id="layer-upload"
              type="file"
              accept=".geojson,.json"
              onChange={handleFileChange}
              disabled={isUploading}
              multiple
            />
            <p className="text-xs text-muted-foreground">
              Supported formats: .geojson, .json (client-side only)
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isUploading}
          >
            Cancel
          </Button>

          <Button
            onClick={handleUpload}
            disabled={files.length === 0 || isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              `Add ${files.length} Layer${files.length !== 1 ? "s" : ""}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
