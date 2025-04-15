"use client"
import { X } from "lucide-react"
import { Button } from "../ui/button"
import { ScrollArea } from "../ui/scroll-area"

interface FeatureInfoProps {
  feature: any
  onClose: () => void
}

export function FeatureInfo({ feature, onClose }: FeatureInfoProps) {
  if (!feature) return null

  const properties = feature.properties || {}
  const propertyEntries = Object.entries(properties)

  return (
    <div className="w-80 bg-background border-l h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="font-semibold">Feature Information</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="h-[calc(100vh-16rem)] p-4">
        {propertyEntries.length > 0 ? (
          <div className="space-y-2">
            {propertyEntries.map(([key, value]) => (
              <div key={key} className="border-b pb-2">
                <div className="text-sm font-medium text-muted-foreground">{key}</div>
                <div className="text-sm break-words">{String(value)}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground">No properties available for this feature</div>
        )}
      </ScrollArea>
    </div>
  )
}

