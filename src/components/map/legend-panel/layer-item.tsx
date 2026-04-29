'use client'

import React, { useState } from "react"
import { Eye, EyeOff, GripVertical, Pencil, X, MapPin, Ellipsis } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { useDispatch } from "react-redux"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import type { GeometryType } from "@/lib/map-types"
import { fitToLayer } from "@/lib/slices/layerSlice"

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
  selectedLayerId: string | null
  /** Kept for API compatibility but dispatch is handled internally */
  onFitToLayer?: (layerId: string) => void
}

export const LayerItem = React.memo(function LayerItem({
  layer,
  onLayerVisibilityChange,
  onLayerClick,
  onRenameLayer,
  onDeleteLayer,
  selected,
  onSelect,
  dragHandleProps,
  selectedLayerId,
}: LayerItemProps) {
  const [isHovered, setIsHovered] = useState(false)
  const dispatch = useDispatch()

  const handleRename = () => {
    const newName = prompt("Enter new layer name:", layer.name)
    if (newName && newName !== layer.name) {
      onRenameLayer(layer.id, newName)
    }
  }

  const handleFitToLayer = () => {
    dispatch(fitToLayer(layer.id))
  }

  const isSelected = layer.id === selectedLayerId

  return (
    /**
     * FIX: ContextMenuContent must be a direct child of ContextMenu, not nested
     * inside other elements. The correct structure is:
     *   <ContextMenu>
     *     <ContextMenuTrigger>…trigger element…</ContextMenuTrigger>
     *     <ContextMenuContent>…items…</ContextMenuContent>
     *   </ContextMenu>
     */
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          className={`flex items-center gap-2 p-1 text-sm rounded-sm ${
            isSelected ? "bg-blue-100 text-black font-semibold" : "hover:bg-gray-100"
          }`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div {...dragHandleProps} className="cursor-grab">
            <GripVertical className="h-3 w-3 text-muted-foreground" />
          </div>

          <div
            className={`transition-opacity duration-200 ${isHovered ? "opacity-100" : "opacity-0"}`}
          >
            <Checkbox
              checked={selected}
              className="h-3 w-3 border-gray-600 bg-white"
              onCheckedChange={(checked) => onSelect(layer.id, checked as boolean)}
            />
          </div>

          <div
            className="cursor-pointer text-sm truncate max-w-[160px]"
            onClick={() => onLayerClick(layer.id)}
            title={layer.name}
          >
            {layer.name}
          </div>

          <div className="flex-grow" />

          <div
            className={`transition-opacity duration-200 flex ${isHovered ? "opacity-100" : "opacity-0"}`}
          >
            <Button variant="ghost" size="icon" className="h-6 w-6 p-0" title="More">
              <Ellipsis className="h-3 w-3" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => onLayerVisibilityChange(layer.id)}
              className="h-6 w-6 p-0"
              title={layer.visible ? "Hide layer" : "Show layer"}
            >
              {layer.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
            </Button>
          </div>
        </div>
      </ContextMenuTrigger>

      <ContextMenuContent>
        <ContextMenuItem onClick={handleRename}>
          <Pencil className="h-4 w-4 mr-2" />
          Rename Layer
        </ContextMenuItem>
        <ContextMenuItem onClick={handleFitToLayer}>
          <MapPin className="h-4 w-4 mr-2" />
          Fit to Layer
        </ContextMenuItem>
        <ContextMenuItem className="text-destructive" onClick={() => onDeleteLayer(layer.id)}>
          <X className="h-4 w-4 mr-2" />
          Delete Layer
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
})
