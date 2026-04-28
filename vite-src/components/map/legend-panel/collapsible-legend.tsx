import React, { useState } from "react"
import { ChevronRight, FolderPlus, Upload, Layers2 } from "lucide-react"
import { Button } from "../../ui/button"
import { ScrollArea} from "../../ui/scroll-area"
import { Separator } from "../../ui/separator"
import { DragDropContext } from "@hello-pangea/dnd"
import { AddNewLayerDialog } from "../upload-files/add-new-layer"
import { LayerGroupItem } from "./layer-group-item"
import type { LayerGroup } from "../map-types"
// import { useLayerContext } from "./layer-context"

interface CollapsibleLegendProps {
  groups: LayerGroup[]
  onLayerVisibilityChange: (layerId: string) => void
  onGroupVisibilityChange: (groupId: string) => void
  onLayerClick: (layerId: string) => void
  onFileUpload: (file: File) => void
  onDeleteLayer: (layerId: string) => void
  onDeleteGroup: (groupId: string) => void
  onCreateGroup: (layerIds: string[], groupName: string) => void
  onRenameGroup: (groupId: string, newName: string) => void
  onRenameLayer?: (layerId: string, newName: string) => void
  selectedLayerId: string | null
  onReorderLayers: (groupId: string, startIndex: number, endIndex: number) => void
  onFitToLayer: (layerId: string) => void
}

export function CollapsibleLegend({
  groups,
  onLayerVisibilityChange,
  onGroupVisibilityChange,
  onLayerClick,
  onFileUpload,
  onDeleteLayer,
  onDeleteGroup,
  onCreateGroup,
  onRenameGroup,
  onRenameLayer = () => {},
  onReorderLayers,
  onFitToLayer,
  selectedLayerId,
}: CollapsibleLegendProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [selectedLayers, setSelectedLayers] = useState<string[]>([])
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [uploadLayerDialogOpen, setUploadLayerDialogOpen] = useState(false)
  // const { fitMapToLayer } = useLayerContext()

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      onFileUpload(file)
    }
    if (event.target) {
      event.target.value = ""
    }
  }

  const handleCreateGroup = () => {
    if (selectedLayers.length > 0) {
      const groupName = prompt("Enter group name:")
      if (groupName) {
        onCreateGroup(selectedLayers, groupName)
        setSelectedLayers([])
      }
    }
  }

  const handleLayerSelect = React.useCallback((layerId: string, selected: boolean) => {
    setSelectedLayers((prev) => (selected ? [...prev, layerId] : prev.filter((id) => id !== layerId)))
  }, [])

  const handleDragEnd = (result: any) => {
    if (!result.destination) {
      return
    }

    const { source, destination } = result
    const groupId = source.droppableId

    if (source.index !== destination.index) {
      onReorderLayers(groupId, source.index, destination.index)
    }
  }

  return (
    <div className={`transition-all duration-300 ${isCollapsed ? "w-12" : "w-80"}`}>
      <div className="rounded-lg border bg-background shadow-lg overflow-hidden">
        <div className="flex items-center justify-between p-4">
          {!isCollapsed && <h2 className="text-lg font-semibold">Legend</h2>}
          <div className={`flex items-center gap-1 ${isCollapsed ? "justify-center w-full" : ""}`}>
            {!isCollapsed && (
              <>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".geojson,application/json"
                  className="hidden"
                />

                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setUploadLayerDialogOpen(true)}>
                  <Layers2 className="h-4 w-4" />
                  <span className="sr-only">Upload Layer</span>
                </Button>
                <AddNewLayerDialog open={uploadLayerDialogOpen} setOpen={setUploadLayerDialogOpen} />

                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="h-4 w-4" />
                  <span className="sr-only">Upload GeoJSON</span>
                </Button>

                {selectedLayers.length > 0 && (
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCreateGroup}>
                    <FolderPlus className="h-4 w-4" />
                    <span className="sr-only">Create Group</span>
                  </Button>
                )}
              </>
            )}
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsCollapsed(!isCollapsed)}>
              <ChevronRight className={`h-4 w-4 transition-transform ${isCollapsed ? "" : "rotate-180"}`} />
              <span className="sr-only">Toggle legend</span>
            </Button>
          </div>
        </div>
        {!isCollapsed && <Separator />}
        {!isCollapsed && (
          <div>
            <ScrollArea className="h-[calc(100vh-16rem)]">
              {groups.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  <Upload className="h-8 w-8 mx-auto mb-2" />
                  <p>Upload a GeoFiles to add layer</p>
                </div>
              ) : (
                <DragDropContext onDragEnd={handleDragEnd}>
                  <div className="space-y-1 p-2">
                    {groups.map((group) => (
                      <LayerGroupItem
                        key={group.id}
                        group={group}
                        onLayerVisibilityChange={onLayerVisibilityChange}
                        onGroupVisibilityChange={onGroupVisibilityChange}
                        onLayerClick={onLayerClick}
                        onDeleteLayer={onDeleteLayer}
                        onDeleteGroup={onDeleteGroup}
                        onRenameGroup={onRenameGroup}
                        onRenameLayer={onRenameLayer}
                        selectedLayers={selectedLayers}
                        onLayerSelect={handleLayerSelect}
                        selectedLayerId={selectedLayerId}
                        onFitToLayer={onFitToLayer}
                      />
                    ))}
                  </div>
                </DragDropContext>
              )}
              {/* <ScrollBar orientation="horizontal" /> */}
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  )
}
