'use client'

import React, { useState } from "react"
import { ChevronRight, Pencil, X } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Droppable, Draggable } from "@hello-pangea/dnd"
import { LayerItem } from "./layer-item"
import type { LayerGroup } from "@/lib/map-types"

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
  selectedLayerId: string | null
  onFitToLayer: (layerId: string) => void
}

export const LayerGroupItem = React.memo(function LayerGroupItem({
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
  selectedLayerId,
  onFitToLayer,
}: LayerGroupItemProps) {
  const [isGroupOpen, setIsGroupOpen] = useState(true)

  const handleRename = () => {
    const newName = prompt("Enter new group name:", group.name)
    if (newName && newName !== group.name) {
      onRenameGroup(group.id, newName)
    }
  }

  return (
    /**
     * FIX: Previously ContextMenuContent was nested inside <Collapsible>, which
     * breaks Radix UI's portal-based positioning. ContextMenuContent must be a
     * sibling of ContextMenuTrigger — both direct children of ContextMenu.
     */
    <ContextMenu>
      <Collapsible
        open={isGroupOpen}
        onOpenChange={setIsGroupOpen}
        className="border rounded-lg bg-background/50"
      >
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between p-2 cursor-pointer">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={group.visible}
                className="h-3 w-3"
                onCheckedChange={() => onGroupVisibilityChange(group.id)}
                // Stop the collapsible toggle from firing when clicking the checkbox
                onClick={(e) => e.stopPropagation()}
              />
              {/* ContextMenuTrigger wraps only the text label */}
              <ContextMenuTrigger asChild>
                <span className="font-medium select-none">{group.name}</span>
              </ContextMenuTrigger>
            </div>
            <ChevronRight
              className={`h-4 w-4 transition-transform ${isGroupOpen ? "rotate-90" : ""}`}
            />
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <Droppable droppableId={group.id}>
            {(provided:any) => (
              <div
                className="pl-6 space-y-1"
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {group.layers.map((layer, index) => (
                  <Draggable key={layer.id} draggableId={layer.id} index={index}>
                    {(provided:any) => (
                      <div ref={provided.innerRef} {...provided.draggableProps}>
                        <LayerItem
                          layer={layer}
                          onLayerVisibilityChange={onLayerVisibilityChange}
                          onLayerClick={onLayerClick}
                          onDeleteLayer={onDeleteLayer}
                          onRenameLayer={onRenameLayer}
                          selected={selectedLayers.includes(layer.id)}
                          onSelect={onLayerSelect}
                          dragHandleProps={provided.dragHandleProps}
                          selectedLayerId={selectedLayerId}
                          onFitToLayer={onFitToLayer}
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

      {/* Must be outside <Collapsible> — direct child of <ContextMenu> */}
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
  )
})
