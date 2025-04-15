import * as React from "react"
import { ChevronRight, Circle, FolderPlus, Minus, Pencil, Square, Upload, X, Eye, EyeOff, GripVertical } from 'lucide-react'
import { Button } from "../../components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../../components/ui/collapsible"
import { ScrollArea, ScrollBar} from "../../components/ui/scroll-area"
import { Separator } from "../../components/ui/separator"
import { Checkbox } from "../../components/ui/checkbox"
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "../../components/ui/context-menu"
import type { LayerGroup, GeometryType } from "./map-types"
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

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
  onReorderLayers: (groupId: string, startIndex: number, endIndex: number) => void
}

const GeometryIcon = React.memo(({ type }: { type: GeometryType }) => {
  switch (type) {
    case "Point":
      return <Circle className="h-3 w-3 text-blue-400" />
    case "Line":
      return <Minus className="h-3 w-3 text-purple-800" />
    case "Polygon":
      return <Square className="h-3 w-3 text-orange-500" />
    default:
      return null
  }
});

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
}: CollapsibleLegendProps) {
  const [isOpen, setIsOpen] = React.useState(true)
  const [selectedLayers, setSelectedLayers] = React.useState<string[]>([])
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      onFileUpload(file)
    }
    // Reset input
    if (event.target) {
      event.target.value = ""
    }
  }

  const handleCreateGroup = () => {
    if (selectedLayers.length > 0) {
      const groupName = prompt("Enter group name:")
      if (groupName) {
        onCreateGroup(selectedLayers, groupName)
        setSelectedLayers([]) // Clear selection after creating group
      }
    }
  }

  const handleLayerSelect = React.useCallback((layerId: string, selected: boolean) => {
    setSelectedLayers((prev) => 
      selected ? [...prev, layerId] : prev.filter((id) => id !== layerId)
    );
  }, []);
  
  const handleDragEnd = (result: any) => {
    // Dropped outside the list
    if (!result.destination) {
      return;
    }
    
    const { source, destination } = result;
    const groupId = source.droppableId;
    
    // If the item was dropped in a different position
    if (source.index !== destination.index) {
      onReorderLayers(groupId, source.index, destination.index);
    }
  };

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="w-80 rounded-lg border bg-background shadow-lg transition-[height] duration-300 overflow-hidden pointer-events-auto"
    >
      <div className="flex items-center justify-between p-4">
        <h2 className="text-lg font-semibold">Legend</h2>
        <div className="flex items-center gap-1">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".geojson,application/json"
            className="hidden"
          />
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
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ChevronRight className={`h-4 w-4 transition-transform ${isOpen ? "rotate-90" : ""}`} />
              <span className="sr-only">Toggle legend</span>
            </Button>
          </CollapsibleTrigger>
        </div>
      </div>
      <Separator />
      <CollapsibleContent>
        <ScrollArea className="h-[calc(100vh-16rem)]">
          {groups.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <Upload className="h-8 w-8 mx-auto mb-2" />
              <p>Upload a GeoJSON file to add layers</p>
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
                  />
                ))}
              </div>
            </DragDropContext>
          )}
          <ScrollBar orientation="horizontal"/>
        </ScrollArea>
      </CollapsibleContent>
    </Collapsible>
  )
}

interface LayerGroupItemProps {
  group: LayerGroup
  onLayerVisibilityChange: (layerId: string) => void
  onGroupVisibilityChange: (groupId: string) => void
  onLayerClick: (layerId: string) => void
  onRenameLayer: (layerId: string, newName: string) => void
  onDeleteLayer: (layerId: string) => void
  onDeleteGroup: (groupId: string) => void
  onRenameGroup: (groupId: string, newName: string) => void
  selectedLayers: string[]
  onLayerSelect: (layerId: string, selected: boolean) => void
}

const LayerGroupItem = React.memo(function LayerGroupItem({
  group,
  onLayerVisibilityChange,
  onGroupVisibilityChange,
  onLayerClick,
  onRenameLayer,
  onDeleteLayer,
  onDeleteGroup,
  onRenameGroup,
  selectedLayers,
  onLayerSelect,
}: LayerGroupItemProps) {
  const [isGroupOpen, setIsGroupOpen] = React.useState(true)

  const handleRename = () => {
    const newName = prompt("Enter new group name:", group.name)
    if (newName && newName !== group.name) {
      onRenameGroup(group.id, newName)
    }
  }

  return (
    <ContextMenu>
      <Collapsible open={isGroupOpen} onOpenChange={setIsGroupOpen} className="border rounded-lg bg-background/50">
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between p-2 cursor-pointer">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={group.visible}
                className="h-3 w-3"
                onCheckedChange={() => onGroupVisibilityChange(group.id)}
              />
              
              {/* Wrap only the group name inside the ContextMenuTrigger */}
              <ContextMenuTrigger>
                <span className="font-medium">{group.name}</span>
              </ContextMenuTrigger>
            </div>
            <ChevronRight className={`h-4 w-4 transition-transform ${isGroupOpen ? "rotate-90" : ""}`} />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Droppable droppableId={group.id}>
            {(provided) => (
              <div 
                className="pl-6 space-y-1"
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {group.layers.map((layer, index) => (
                  <Draggable key={layer.id} draggableId={layer.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                      >
                        <LayerItem
                          layer={layer}
                          onLayerVisibilityChange={onLayerVisibilityChange}
                          onLayerClick={onLayerClick}
                          onDeleteLayer={onDeleteLayer}
                          onRenameLayer={onRenameLayer}
                          selected={selectedLayers.includes(layer.id)}
                          onSelect={onLayerSelect}
                          dragHandleProps={provided.dragHandleProps}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </CollapsibleContent>
      </Collapsible>
      
      {/* Context Menu Content */}
      <ContextMenuContent>
        <ContextMenuItem onClick={handleRename}>
          <Pencil className="h-4 w-4 mr-2" />
          Rename Group
        </ContextMenuItem>
        <ContextMenuItem className="text-destructive" onClick={() => onDeleteGroup(group.id)}>
          <X className="h-4 w-4 mr-2" />
          Delete Group
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
});

interface LayerItemProps {
  layer: {
    id: string
    name: string
    visible: boolean
    geometryType: GeometryType
  }
  onLayerVisibilityChange: (layerId: string) => void
  onLayerClick: (layerId: string) => void
  onRenameLayer: (layerId: string, newName: string) => void
  onDeleteLayer: (layerId: string) => void
  selected: boolean
  onSelect: (layerId: string, selected: boolean) => void
  dragHandleProps: any
}

const LayerItem = React.memo(function LayerItem({
  layer,
  onLayerVisibilityChange,
  onLayerClick,
  onRenameLayer,
  onDeleteLayer,
  selected,
  onSelect,
  dragHandleProps
}: LayerItemProps) {
  const handleRename = () => {
    const newName = prompt("Enter new layer name:", layer.name)
    if (newName && newName !== layer.name) {
      onRenameLayer(layer.id, newName)
    }
  }

  return (
    <ContextMenu>
      <div className="flex items-center gap-2 p-1 hover:bg-accent/50 rounded-sm">
        <div {...dragHandleProps} className="cursor-grab">
          <GripVertical className="h-3 w-3 text-muted-foreground" />
        </div>
        <Checkbox
          checked={selected}
          className="h-3 w-3"
          onCheckedChange={(checked) => onSelect(layer.id, checked as boolean)}
        />
        <GeometryIcon type={layer.geometryType} />
        <ContextMenuTrigger>
          <span className="cursor-pointer text-sm" onClick={() => onLayerClick(layer.id)}>
            {layer.name}
          </span>
        </ContextMenuTrigger>

        {/* Push everything to the left and keep the eye button at the end */}
        <div className="flex-grow"></div>

        <Button variant="ghost" size="icon" onClick={() => onLayerVisibilityChange(layer.id)} className="h-6 w-6 p-0">
          {layer.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
        </Button>

        <ContextMenuContent>
          <ContextMenuItem onClick={handleRename}>
            <Pencil className="h-4 w-4 mr-2" />
            Rename Layer
          </ContextMenuItem>
          <ContextMenuItem className="text-destructive" onClick={() => onDeleteLayer(layer.id)}>
            <X className="h-4 w-4 mr-2" />
            Delete Layer
          </ContextMenuItem>
        </ContextMenuContent>
      </div>
    </ContextMenu>
  )
});











