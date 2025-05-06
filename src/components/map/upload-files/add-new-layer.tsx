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

interface AddNewLayerDialogProps {
  open: boolean
  setOpen: (value: boolean) => void
}

export function AddNewLayerDialog({ open, setOpen }: AddNewLayerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Layer</DialogTitle>
          <DialogDescription>
            Define a layer type and upload the corresponding file.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-2">
          <Label htmlFor="layer-upload">Layer</Label>
          <Input
            id="layer-upload"
            type="file"
            accept=".geojson,.json,.shp,.dbf,.shx,.prj,.gpkg,.csv"
            multiple
          />
          <p className="text-xs text-muted-foreground">
            Supported formats: GeoJSON, Shapefile, GeoPackage, CSV. Maximum file size: 50MB
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button disabled>
            Add File
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
