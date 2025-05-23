import React, { useState } from "react"
import { Circle, Minus, Square, Eye, EyeOff, GripVertical, Pencil, X, MapPin,Ellipsis } from "lucide-react"
import { Checkbox } from "../../ui/checkbox"
import { Button } from "../../ui/button"
import {useDispatch} from 'react-redux'
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "../../ui/context-menu"
import type { GeometryType } from "../map-types"
import { fitToLayer } from "../../../store/map/layerSlice"
// import { useLayerContext } from "./layer-context"

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
}

const GeometryIcon = React.memo(({ type }: { type: GeometryType }) => {
  switch (type) {
    case "Point":
      return <Circle className="h-3 w-3 text-blue-400" />
    case "Line":
      return <Minus className="h-4 w-4 text-purple-800" />
    case "Polygon":
      return <Square className="h-3 w-3 text-orange-500" />
    default:
      return null
  }
})

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
  // const { fitMapToLayer } = useLayerContext()

  const handleRename = () => {
    const newName = prompt("Enter new layer name:", layer.name)
    if (newName && newName !== layer.name) {
      onRenameLayer(layer.id, newName)
    }
  }

  const handleFitToLayer = () => {
    dispatch(fitToLayer(layer.id))
  }

  return (
    <ContextMenu>
      <div
        className={`flex items-center gap-2 p-1 text-sm ${
          layer.id === selectedLayerId ? "bg-blue-100 text-black font-semibold rounded-sm" : "hover:bg-gray-100"
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div {...dragHandleProps} className="cursor-grab">
          <GripVertical className="h-3 w-3 text-muted-foreground" />
        </div>

        <div className={`transition-opacity duration-200 ${isHovered ? "opacity-100" : "opacity-0"}`}>
          <Checkbox
            checked={selected}
            className="h-3 w-3 border-gray-600 bg-white"
            onCheckedChange={(checked) => onSelect(layer.id, checked as boolean)}
          />
        </div>

        {/* <GeometryIcon type={layer.geometryType} /> */}

        <ContextMenuTrigger>
          <div
            className="cursor-pointer text-sm truncate max-w-[160px]"
            onClick={() => onLayerClick(layer.id)}
            title={layer.name}
          >
            {layer.name}
          </div>
        </ContextMenuTrigger>

        <div className="flex-grow"></div>

        <div className={`transition-opacity duration-200 flex ${isHovered ? "opacity-100" : "opacity-0"}`}>
          {/* <Button
            variant="ghost"
            size="icon"
            onClick={handleFitToLayer}
            className="h-6 w-6 p-0"
            title="Fit map to layer"
          >
            <MapPin className="h-3 w-3" />
          </Button> */}

          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 p-0"
            title="More"
          >
          {<Ellipsis className="h-3 w-3"/>}
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
      </div>
    </ContextMenu>
  )
})
