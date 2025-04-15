"use client"

import type React from "react"
import { useState } from "react"
import { X } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { ScrollArea,ScrollBar } from "../../components/ui/scroll-area"
import { Label } from "../../components/ui/label"
import { Slider } from "../../components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import type { Layer } from "./map-types"

interface StylePanelProps {
  layer: Layer | null
  onClose: () => void
  onStyleChange: (style: Partial<Layer["style"]>) => void
}

export function StylePanel({ layer, onClose, onStyleChange }: StylePanelProps) {
  const [size, setSize] = useState(layer?.style.size || 4)
  const [color, setColor] = useState(layer?.style.color || `#${Math.floor(Math.random() * 16777215).toString(16)}`)
  const [opacity, setOpacity] = useState(layer?.style.opacity || 0.9)
  const [stroke, setStroke] = useState(layer?.style.stroke || `#${Math.floor(Math.random() * 16777215).toString(16)}`)
  const [strokeWidth, setStrokeWidth] = useState(layer?.style.strokeWidth || 1)

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

  return (
    <div className="w-80 bg-background border-l h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="font-semibold">{layer.name}</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Tabs defaultValue="style" className="w-full">
        <TabsList className="w-full justify-start px-4 pt-2">
          <TabsTrigger value="style">Style</TabsTrigger>
          <TabsTrigger value="filter">Filter</TabsTrigger>
          <TabsTrigger value="data">Data</TabsTrigger>
        </TabsList>

        <TabsContent value="style" className="p-4 space-y-6">
          <ScrollArea className="h-[calc(80vh-12rem)] pr-4">
            <div className="space-y-4">
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
            <ScrollBar orientation="horizontal"/>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="filter" className="p-4">
          <div className="text-center text-muted-foreground">Filter options coming soon</div>
        </TabsContent>

        <TabsContent value="data" className="p-4">
          <div className="text-center text-muted-foreground">Data options coming soon</div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

