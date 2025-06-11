

import { useState } from "react"
import { X, Palette, Filter, ChevronRight, Sheet } from "lucide-react"
import { Button } from "../../ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs"
import { CardContent} from "../../ui/card"
import { Slider } from "../../ui/slider"
import { Label } from "../../ui/label"
import { Input } from "../../ui/input"
import { LayerFilter } from "./layer-filter"
import { AttributeTable } from "./attribute-table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../ui/dialog"
import { ScrollArea,ScrollBar } from "../../ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"
import { Separator } from "../../../components/ui/separator"


interface StylePanelProps {
  layer: any
  onClose: () => void
  onStyleChange: (style: any) => void
}

export function StylePanel({ layer, onClose, onStyleChange }: StylePanelProps) {
  const [activeTab, setActiveTab] = useState("style")
  const [style, _setStyle] = useState(layer.style)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [showAttributeTable, setShowAttributeTable] = useState(false)
  const [_size, setSize] = useState(layer?.style.size || 4)
  const [_color, setColor] = useState(layer?.style.color || `#${Math.floor(Math.random() * 16777215).toString(16)}`)
  const [_opacity, setOpacity] = useState(layer?.style.opacity || 0.9)
  const [_stroke, setStroke] = useState(layer?.style.stroke || `#${Math.floor(Math.random() * 16777215).toString(16)}`)
  const [strokeWidth, setStrokeWidth] = useState(layer?.style.strokeWidth || 1)


  // const handleStyleChange = (property: string, value: any) => {
  //   const updatedStyle = { ...style, [property]: value }
  //   setStyle(updatedStyle)
  //   onStyleChange(updatedStyle)
  // }

  const handleSizeChange = (value: number[]) => {
    const newSize = value[0]
    onStyleChange({ size: newSize })
    setSize(newSize)
  }

  const handleColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onStyleChange({ color: event.target.value })
    setColor(event.target.value)
  }

  const handleOpacityChange = (value: number[]) => {
    const newOpacity = value[0]
    onStyleChange({ opacity: newOpacity })
    setOpacity(newOpacity)
  }

  const handleStrokeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onStyleChange({ stroke: event.target.value })
    setStroke(event.target.value)
  }

  const handleStrokeWidthChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newStrokeWidth = Number.parseFloat(event.target.value)
    onStyleChange({ strokeWidth: newStrokeWidth })
    setStrokeWidth(newStrokeWidth)
  }

  if (!layer) return null

  const handleFilterChange = (filters: any[]) => {
    // Apply filters to the layer
    if (!layer.data || !layer.data.features) return

    // Create a deep copy of the original data
    const originalData = JSON.parse(JSON.stringify(layer.data))

    if (filters.length === 0) {
      // If no filters, restore original data
      onStyleChange({ ...style, filteredData: null })
      return
    }

    // Apply filters to features
    const filteredFeatures = originalData.features.filter((feature: any) => {
      if (!feature.properties) return false

      // Check if feature passes all filter conditions (AND logic)
      return filters.every((filter) => {
        const { field, operator, value, value2 } = filter
        const featureValue = feature.properties[field]

        // Handle null values
        if (featureValue === null || featureValue === undefined) {
          return operator === "is_null"
        }

        switch (operator) {
          case "==":
            return featureValue == value
          case "!=":
            return featureValue != value
          case ">":
            return featureValue > value
          case ">=":
            return featureValue >= value
          case "<":
            return featureValue < value
          case "<=":
            return featureValue <= value
          case "between":
            return featureValue >= value && featureValue <= value2
          case "contains":
            return String(featureValue).toLowerCase().includes(String(value).toLowerCase())
          case "starts_with":
            return String(featureValue).toLowerCase().startsWith(String(value).toLowerCase())
          case "ends_with":
            return String(featureValue).toLowerCase().endsWith(String(value).toLowerCase())
          case "is_null":
            return false // Already handled above
          case "is_not_null":
            return true // Already handled above
          default:
            return true
        }
      })
    })

    // Create filtered data object
    const filteredData = {
      ...originalData,
      features: filteredFeatures,
    }

    // Apply filtered data to the layer
    onStyleChange({ ...style, filteredData })
  }

  if (isCollapsed) {
    return (
      <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10">
        <Button
          variant="secondary"
          size="sm"
          className="h-24 w-8 rounded-l-md rounded-r-none shadow-md"
          onClick={() => setIsCollapsed(false)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <>
      <div className="w-80 bg-background rounded-lg border-l h-full">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="font-semibold break-words">{layer.name}</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-7 w-7" title="Close panel">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2 pt-2 pl-2 pb-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 flex-shrink-0"
            onClick={() => setShowAttributeTable(true)}
            title="Show attribute table"
          >
            <Sheet className="h-4 w-4" />
          </Button>
        </div>

        <Separator className="" />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full pt-2 pl-2 pr-2">
          <TabsList className="grid grid-cols-2 w-full justify-start p-3 pt-1">
            <TabsTrigger value="style" className="flex items-center gap-1">
              <Palette className="h-3.5 w-3.5" />
              <span>Style</span>
            </TabsTrigger>
            <TabsTrigger value="filter" className="flex items-center gap-1">
              <Filter className="h-3.5 w-3.5" />
              <span>Filter</span>
            </TabsTrigger>
          </TabsList>
          <Separator className="m4" />
          <CardContent className="pt-4 px-4">
            <TabsContent value="style" className="space-y-4 mt-0">
              <ScrollArea className="h-[calc(80vh-12rem)] pr-4">
                <div className="space-y-4 pb-4">
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select defaultValue="simple">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="simple">Simple</SelectItem>
                        <SelectItem value="categorized">Categorized</SelectItem>
                        <SelectItem value="graduated">Graduated</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {layer.geometryType === "Point" && (
                    <div className="space-y-2">
                      <Label>Size</Label>
                      <Slider defaultValue={[layer.style.size]} max={10} step={1} onValueChange={handleSizeChange} />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Color</Label>
                    <div className="flex gap-2">
                      <Input type="color" value={layer.style.color} className="w-12" onChange={handleColorChange} />
                      <Input value={layer.style.color} onChange={handleColorChange} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Opacity</Label>
                    <Slider defaultValue={[layer.style.opacity]} max={1} step={0.1} onValueChange={handleOpacityChange} />
                  </div>

                  <div className="space-y-2">
                    <Label>Stroke</Label>
                    <div className="flex gap-2">
                      <Input type="color" value={layer.style.stroke} className="w-12" onChange={handleStrokeChange} />
                      <Input value={layer.style.stroke} onChange={handleStrokeChange} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Stroke Width</Label>
                    <Input
                      type="number"
                      value={strokeWidth}
                      onChange={handleStrokeWidthChange}
                      min={0}
                      max={10}
                      step={0.5}
                    />
                  </div>
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </TabsContent>

            <TabsContent value="filter" className="mt-0">
              {/* <ScrollArea className="h-[calc(80vh-12rem)] pr-4"> */}
              <LayerFilter layer={layer} onFilterChange={handleFilterChange} />
              {/* </ScrollArea> */}
            </TabsContent>

          </CardContent>
        </Tabs>
      </div>

      {/* Attribute Table Dialog */}
      <Dialog open={showAttributeTable} onOpenChange={setShowAttributeTable}>
        <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{layer.name} - Attribute Table</DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-grow">
            <AttributeTable layer={layer} />
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  )
}
